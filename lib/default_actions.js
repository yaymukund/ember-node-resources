var _ = require('underscore');
var ResourceRoute = require('./resource_route');

// Default actions for a resource.

module.exports = function(controller) {
  var actions = {};

  actions.create = ResourceRoute.create({
    controller: controller,
    method: 'POST',
    type: 'collection',
    action: function(req, res) {
      var options = this;

      var props = req.body[options.name];
      props = _.pick(props, _.keys(options.properties));

      Step(
        function getId() {
          db.incr(options.name + ':id', this);
        },

        function createResource(err, id) {
          if (err) { throw err; }

          props.id = id;
          var key = options.name + 's:' + id;

          db.hmset(key, props, this.parallel());
          db.sadd('ids:' + options.name, id, this.parallel());

          return id;
        },

        function respond(err, id) {
          if (err) {
            res.json(500, {error: err.message});
            return;
          }

          res.json(props);
        }
      );
    }
  });

  actions.read = {
    controller: controller,
    method: 'GET',
    type: 'member',
    action: function(req, res) {
      var options = this;
      var key = options.name + 's:' + req.params.id;

      Step(
        function getResource() {
          db.hgetall(key, this);
        },

        function respond(err, savedResource) {
          if (err) {
            res.json(500, {error: err.message});
            return;
          }

          res.json(savedResource);
        }
      );
    }
  };

  actions.update = {
    controller: controller,
    method: 'PUT',
    type: 'member',
    action: function(req, res) {
      var options = this;
      var key = options.name + 's:' + req.params.id;

      Step(
        function getResource() {
          db.hmset(key, req.body[options.name], this);
        },

        function respond(err, savedResource) {
          if (err) {
            res.json(500, {error: err.message});
            return;
          }

          res.json(req.body[options.name]);
        }
      );
    }
  };

  actions.destroy = {
    controller: controller,
    method: 'DELETE',
    type: 'member',
    action: function(req, res) {
      var options = this;
      var key = options.name + 's:' + req.params.id;

      Step(
        function destroyResource() {
          db.del(key, this.parallel());
          db.srem(ids + 's:' + options.name, req.params.id, this.parallel());
        },

        function respond(err) {
          if (err) {
            res.json(500, {error: err.message});
            return;
          }

          res.send(200);
        }
      );
    }
  };

  return actions;
};
