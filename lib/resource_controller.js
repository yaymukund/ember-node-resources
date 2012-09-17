var _ = require('underscore'),
    redis = require('redis'),

    ResourceAction = require('./resource_action'),
    defaultActions = require('./default_actions'),

    VALID_OPTIONS = [
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
    db: redis.createClient(),
    actions: _.clone(defaultActions)
  });

  controller.extend = function(app) {
    var controller = this;

    // Controllers may add custom methods or override the default ones.
    // controller.actions.push(...);

    _.each(controller.actions, function(options) {

      var options = _.extend({controller: controller}, options),
          action = ResourceAction.create(options);

      action.extend(app);
    });
  };

  return controller;
};
