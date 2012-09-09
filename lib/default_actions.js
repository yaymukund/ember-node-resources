var _ = require('underscore'),
    Step = require('step');

// Default actions for a resource.

module.exports = [];

module.exports.push({
  type: 'collection',
  method: 'POST',
  callback: function(req, res) {
    var options = this,
        props = req.body[options.name];

    props = _.pick(props, _.keys(options.properties));

    Step(
      function getId() {
        options.db.incr(options.name + ':id', this);
      },

      function createResource(err, id) {
        if (err) { throw err; }

        props.id = id;
        var key = options.name + 's:' + id;

        options.db.hmset(key, props, this.parallel());
        options.db.sadd('ids:' + options.name, id, this.parallel());

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

module.exports.push({
  method: 'GET',
  type: 'member',
  callback: function(req, res) {
    var options = this;
    var key = options.name + 's:' + req.params.id;

    Step(
      function getResource() {
        options.db.hgetall(key, this);
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
});

module.exports.push({
  type: 'member',
  method: 'PUT',
  callback: function(req, res) {
    var options = this;
    var key = options.name + 's:' + req.params.id;

    Step(
      function getResource() {
        options.db.hmset(key, req.body[options.name], this);
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
});

module.exports.push({
  type: 'member',
  method: 'DELETE',
  callback: function(req, res) {
    var options = this;
    var key = options.name + 's:' + req.params.id;

    Step(
      function destroyResource() {
        options.db.del(key, this.parallel());
        options.db.srem('ids:' + options.name, req.params.id, this.parallel());
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
});
