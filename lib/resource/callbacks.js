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
//   res.locals.resourceId
//
// Sets:
//   res.locals.response
exports.renderResource = function(req, res, next) {
  if (!_.isObject(res.locals.resource) || _.isNull(res.locals.resourceId)) {
    var msg = 'Could not find a ' + this.resourceName + ' resource to render';
    next(new Error(msg));
  }

  // According to Ember, IDs are strings.
  res.locals.resource.id = res.locals.resourceId.toString();

  exports.deserialize(res.locals.resource, this.properties);

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
    res.locals.resourceId = id;
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
    next(new Error('ID '+req.params.id+' not an integer.'));
    return;
  }

  res.locals.resourceId = parseInt(req.params.id, 10);
  next();
};

exports.serialize = function(resource, properties) {
  _.forOwn(resource, function(val, name) {
    var type = properties[name];

    if (_.isObject(util.transforms[type]) &&
        _.isFunction(util.transforms[type].serialize)) {
      resource[name] = util.transforms[type].serialize(val);
    }
  });
};

exports.deserialize = function(resource, properties) {
  _.forOwn(resource, function(val, name) {
    var type = properties[name];

    if (_.isObject(util.transforms[type]) &&
        _.isFunction(util.transforms[type].deserialize)) {
      resource[name] = util.transforms[type].deserialize(val);
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
//   res.locals.resourceId
//   res.locals.resource
//
// Sets:
//   (Nothing)
exports.create = function(req, res, next) {
  exports.deserialize(res.locals.resource, this.properties);

  var key = this.resourceName + 's:' + res.locals.resourceId;

  this.db.multi()
    .hmset(key, res.locals.resource)
    .sadd('ids:' + this.resourceName, res.locals.resourceId)
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
  exports.serialize(res.locals.resource, this.properties);

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
