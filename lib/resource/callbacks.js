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

// Prepares to render the resource object.
//
// Requires:
//   res.locals.resource
//
// Sets:
//   res.locals.response
exports.renderResource = function(req, res, next) {
  if (res.locals.resource === undefined) {
    var msg = 'Could not find a ' + this.resourceName + ' resource to render';
    next(new Error(msg));
  }

  exports.deserializeArrays(res.locals.resource, this.properties);

  if (!!this.objectRoot) {
    res.locals.response = {};
    res.locals.response[this.resourceName] = res.locals.resource;

  } else {
    res.locals.response = res.locals.resource;
  }

  next();
};

// Reserve an ID for a new resource.
exports.getId = function(req, res, next) {
  var key = this.resourceName + ':id';
  this.db.incr(key, function(err, id) {
    res.locals.id = id.toString();
    next(err);
  });
};

// The ID must be an integer.
//
// Requires:
//   Nothing.
//
// Sets:
//   res.locals.resourceId
exports.validateId = function(req, res, next) {
  if (!req.params.id.match(/\d+/)) {
    next('route');
    return;
  }

  res.locals.resourceId = parseInt(req.params.id, 10);
  next();
};

exports.serializeArrays = function(resource, properties) {
  _.forOwn(resource, function(val, name) {
    if (properties[name] == 'array') {
      resource[name] = util.transforms.array.serialize(val);
    }
  });
};

exports.deserializeArrays = function(resource, properties) {
  _.forOwn(resource, function(val, name) {
    if (properties[name] == 'array') {
      resource[name] = util.transforms.array.deserialize(val);
    }
  });
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
  res.locals.resource = _.pick(resource, _.keys(this.properties));
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
    res.locals.resource.updated_at = util.transforms.date.serialize(new Date());
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
    res.locals.resource.created_at = util.transforms.date.serialize(new Date());
  }

  next();
};

// Create a resource.
//
// Requires:
//   res.locals.id
//   res.locals.resource
//
// Sets:
//   res.locals.resource.id
exports.create = function(req, res, next) {
  res.locals.resource.id = res.locals.id;

  exports.deserializeArrays(res.locals.resource, this.properties);

  var key = this.resourceName + 's:' + res.locals.id;

  this.db.multi()
    .hmset(key, res.locals.resource)
    .sadd('ids:' + this.resourceName, res.locals.id)
    .exec(function(err, replies) {
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
  var key = this.resourceName + 's:' + res.locals.resourceId;

  this.db.hgetall(key, function(err, savedResource) {
    res.locals.resource = savedResource;
    next(err);
  });
};

// Update the requested resource.
//
// Requires:
//   res.locals.resourceId
//   res.locals.resource
//
// Sets:
//   Nothing.
exports.update = function(req, res, next) {
  exports.serializeArrays(res.locals.resource, this.properties);

  var key = this.resourceName + 's:' + res.locals.resourceId;
  this.db.hmset(key, res.locals.resource, next);
};

// Destroys the specified resource.
//
// Requires:
//   res.locals.resourceId
//
// Sets:
//   Nothing.
exports.destroy = function(req, res, next) {
  var key = this.resourceName + 's:' + res.locals.resourceId;

  this.db.multi()
    .del(key)
    .srem('ids:' + this.resourceName, res.locals.resourceId)
    .exec(next);
};
