var _ = require('underscore'),
    util = require('../util');

// Response using the variables in res.locals.response.
exports.respond = function(req, res) {
  res.json(res.locals.response || {});
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
exports.validateId = function(req, res, next) {
  if (!req.params.id.match(/\d+/)) {
    next('route');
    return;
  }

  res.locals.resourceId = parseInt(req.params.id, 10);
  next();
};

// Only allow certain options to modify the body.
//
// Requires:
//   Nothing.
//
// Sets:
//   res.locals.resource
exports.validateBody = function(req, res, next) {
  res.locals.resource = _.pick(req.body[this.resourceName], this.properties);
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
    res.locals.resource.updated_at = util.dateToString(new Date());
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
    res.locals.resource.created_at = util.dateToString(new Date());
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
//   res.locals.resource
//   res.locals.response
exports.create = function(req, res, next) {
  var key = this.resourceName + 's:' + res.locals.id;

  res.locals.resource.id = res.locals.id;

  this.db.multi()
    .hmset(key, res.locals.resource)
    .sadd('ids:' + this.resourceName, res.locals.id)
    .exec(function(err, replies) {

      res.locals.response = res.locals.resource;
      next(err);
    });
};

// Fetch the requested resource.
//
// Requires:
//   res.locals.resourceId
//
// Sets:
//   res.locals.response
exports.show = function(req, res, next) {
  var key = this.resourceName + 's:' + res.locals.resourceId;

  this.db.hgetall(key, function(err, savedResource) {
    res.locals.response = savedResource;
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
