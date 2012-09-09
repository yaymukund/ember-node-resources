var _ = require('underscore');
var Step = require('step');
var redis = require('redis');

var ResourceAction = require('./resource_action');
var defaultActions = require('./default_actions');

var VALID_OPTIONS = [
  'name',
  'properties',
  'basePath',
  'path',
  'db'
];

/**
 * Use like:
 *   var UserController = ResourceController.create({
 *     name: 'user'
 *   });
 *
 * Options:
 *   name: The name of your resource. This is used to guess the URLs, and to
 *         determine keys in your datastore.
 *   basePath: The root of your resource. Defaults to "/#{name}s".
 */

exports.create = function(options) {

  var controller = _.pick(options, VALID_OPTIONS);

  _.defaults(controller, {
    basePath: '/' + options.name + 's',
    db: redis.createClient(),
    actions: _.clone(defaultActions)
  });

  _.defaults(controller, {
    paths: {
      collection: controller.basePath,
      member: controller.basePath + '/:id'
    }
  });

  controller.mapRoutes = function(app) {
    var controller = this;

    // Controllers may add custom methods or override the default ones.
    // controller.actions.push(...);

    _.each(controller.actions, function(options) {

      var options = _.extend({controller: controller}, options),
          action = ResourceAction.create(options),
          callback = action.callback.bind(action);

      app[action.method.toLowerCase()](action.path, callback);
    });
  };

  return controller;
};
