var _ = require('underscore');

// Response using the variables in res.locals.response.
exports.respond = function(req, res) {
  res.json(res.locals.response || {});
};

// Get an ID for a new resource.
exports.getId = function(req, res, next) {
  var key = this.name + ':id';
  this.db.incr(key, function(err, id) {
    res.locals.id = id;
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
  res.locals.resource = _.pick(req.body[this.name], this.properties);
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
  var key = this.name + 's:' + res.locals.id;

  res.locals.resource.id = res.locals.id;

  this.db.multi()
    .hmset(key, res.locals.resource)
    .sadd('ids:' + this.name, res.locals.id)
    .exec(function(err, replies) {

      res.locals.response = res.locals.resource;
      next(err);
    });
};

// Fetch the requested resource.
//
// Requires:
//   req.params.id
//
// Sets:
//   res.locals.response
exports.show = function(req, res, next) {
  var key = this.name + 's:' + req.params.id;

  this.db.hgetall(key, function(err, savedResource) {
    res.locals.response = savedResource;
    next(err);
  });
};

// Update the requested resource.
//
// Requires:
//   req.params.id
//   res.locals.resource
//
// Sets:
//   Nothing.
exports.update = function(req, res, next) {
  var key = this.name + 's:' + req.params.id;
  this.db.hmset(key, res.locals.resource, next);
};

// Destroys the specified resource.
//
// Requires:
//   req.params.id
//
// Sets:
//   Nothing.
exports.destroy = function(req, res, next) {
  var key = this.name + 's:' + req.params.id;

  this.db.multi()
    .del(key)
    .srem('ids:' + this.name, req.params.id)
    .exec(next);
};
