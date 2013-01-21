var util = require('../../util'),
    _ = require('lodash');

// Key for a single resource.
exports.keyFor = function(id) {
  return this.resourceName + 's:' + id;
};

exports.validateId = function(id) {
  if (!id.match(/\d+/)) {
    throw new Error('ID '+id+' not an integer.');
  }

  return parseInt(id, 10);
};

// Serialize a single instance of a resource.
exports.serialize = function(resource) {
  _.forOwn(resource, function(val, name) {
    var type = this.properties[name];

    if (_.isObject(util.transforms[type]) &&
        _.isFunction(util.transforms[type].serialize)) {
      resource[name] = util.transforms[type].serialize(val);
    }
  }, this);
};

// Deserialize a single instance of a resource from the DB.
exports.deserialize = function(resource) {
  _.forOwn(resource, function(val, name) {
    var type = this.properties[name];

    if (_.isObject(util.transforms[type]) &&
        _.isFunction(util.transforms[type].deserialize)) {
      resource[name] = util.transforms[type].deserialize(val);
    }
  }, this);
};

// Render a resource.
exports.render = function(resource, id) {
  if (!_.isObject(resource) || _.isNull(id)) {
    var msg = 'Could not render '+this.resourceName;
    throw new Error(msg);
  }

  resource = _.cloneDeep(resource);

  // According to Ember, IDs are strings.
  resource.id = id.toString();

  // Deserialize from DB.
  this.deserialize(resource);

  return resource
};
