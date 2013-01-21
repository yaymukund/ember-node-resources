var _ = require('lodash'),
    util = require('../util');

// Response with the object in res.locals.response.
//
// Requires:
//   res.locals.response
//
// Renders JSON.
exports.respond = function(req, res) {
  res.json(res.locals.response || {});
};

// Renders the resource object.
//
// Requires:
//   res.locals.resource
//   res.locals.resourceId
//
// Sets:
//   res.locals.response
exports.renderResource = function(req, res, next) {
  try {
    var renderedResource =
      this.render(res.locals.resource, res.locals.resourceId);

  } catch(err) {
    next(err);
    return;
  }

  res.locals.response = {};
  res.locals.response[this.resourceName] = renderedResource;

  next();
};

// Requires:
//   res.locals.resources
//   res.locals.resourceIds
//
// Sets:
//   res.locals.response
exports.renderResources = function(req, res, next) {
  var renderedResources = [],
      data = _.zip(res.locals.resources, res.locals.resourceIds);

  try {
    data.forEach(function(data) {
      renderedResources.push(this.render(data[0], data[1]));
    }, this);

  } catch(err) {
    next(err);
    return;
  }

  res.locals.response = {};
  res.locals.response[this.resourceName + 's'] = renderedResources;

  next();
};

// Reserve an ID for a new resource.
exports.createId = function(req, res, next) {
  var key = this.resourceName + ':id';
  this.db.incr(key, function(err, id) {
    res.locals.resourceId = id;
    next(err);
  });
};

// Requires:
//   req.params.id
//
// Sets:
//   res.locals.resourceId
exports.getResourceId = function(req, res, next) {
  try {
    res.locals.resourceId = this.validateId(req.params.id);
    next();
  } catch(err) { next(err); }
};

// Requires:
//   req.query.ids
//
// Sets:
//   res.locals.resourceIds
exports.getResourceIds = function(req, res, next) {
  if (!_.isArray(req.query.ids)) {
    next(new Error('Could not find IDs to retrieve.'));
  }

  try {
    res.locals.resourceIds = req.query.ids.map(this.validateId);
    next();
  } catch(err) { next(err); }
};

// Only allow certain options to modify the body.
//
// Requires:
//   Nothing.
//
// Sets:
//   res.locals.resource
exports.validateBody = function(req, res, next) {
  var resource = req.body[this.resourceName];
  res.locals.unsavedResource = _.pick(resource, Object.keys(this.properties));
  next();
};

// Add updated_at timestamp to a resource.
//
// Requires:
//   res.locals.resource
//
// Sets:
//   res.locals.resource.updated_at
exports.updateTimestamp = function(req, res, next) {
  if (this.timestamps) {
    res.locals.unsavedResource.updated_at = util.transforms.date.serialize(new Date());
  }

  next();
};

// Add created_at timestamp to a resource.
//
// Requires:
//   res.locals.resource
//
// Sets:
//   res.locals.resource.created_at
exports.createTimestamp = function(req, res, next) {
  if (this.timestamps) {
    res.locals.unsavedResource.created_at = util.transforms.date.serialize(new Date());
  }

  next();
};

// Create a resource.
//
// Requires:
//   res.locals.resourceId
//   res.locals.unsavedResource
//
// Sets:
//   res.locals.resource
//
// Deletes:
//   res.locals.unsavedResource
exports.create = function(req, res, next) {
  this.deserialize(res.locals.unsavedResource);

  this.db.multi()
    .hmset(this.keyFor(res.locals.resourceId), res.locals.unsavedResource)
    .sadd('ids:' + this.resourceName, res.locals.resourceId)
    .exec(function(err, replies) {
      res.locals.resource = res.locals.unsavedResource;
      delete res.locals.unsavedResource;
      next(err);
    });
};

// Fetch the requested resource.
//
// Requires:
//   res.locals.resourceId
//
// Sets:
//   res.locals.resource
exports.show = function(req, res, next) {
  var key = this.keyFor(res.locals.resourceId);

  this.db.hgetall(key, function(err, savedResource) {
    if (_.isNull(savedResource)) {
      next(new Error('Could not find resource with key "'+key+'"'));
      return
    }

    res.locals.resource = savedResource;
    next(err);
  });
};

// Requires:
//   res.locals.resourceIds
//
// Sets:
//   res.locals.resources
exports.showMany = function(req, res, next) {
  var keys = res.locals.resourceIds.map(this.keyFor),
      multi = this.db.multi();

  keys.forEach(function(key) { multi.hgetall(key); });

  multi.exec(function(err, resources) {
    var nullKeys = [];

    Object.keys(resources).forEach(function(i) {
      if (_.isNull(resources[i])) {
        nullKeys.push(keys[i]);
      }
    });

    if (nullKeys.length > 0) {
      var msg = 'Could not find resources '+nullKeys.join(', ');
      next(new Error(msg));
      return;
    }

    res.locals.resources = resources;
    next(err);
  });
};

// Update the requested resource.
//
// Requires:
//   res.locals.resourceId
//   res.locals.unsavedResource
//
// Sets:
//   Nothing.
//
// Deletes:
//   res.locals.unsavedResource
exports.update = function(req, res, next) {
  this.serialize(res.locals.unsavedResource);
  res.locals.resource = res.locals.unsavedResource;

  var key = this.keyFor(res.locals.resourceId);
  this.db.hmset(key, res.locals.unsavedResource, function(err) {
    delete res.locals.unsavedResource;
    next(err);
  });
};

// Destroys the specified resource.
//
// Requires:
//   res.locals.resourceId
//
// Sets:
//   Nothing.
exports.destroy = function(req, res, next) {
  this.db.multi()
    .del(this.keyFor(res.locals.resourceId))
    .srem('ids:' + this.resourceName, res.locals.resourceId)
    .exec(next);
};
