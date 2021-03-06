var _ = require('lodash'),
    redis = require('redis'),

    Action = require('../action'),
    defaultActions = require('../action/default'),

    VALID_OPTIONS = [
      'resourceName',
      'properties',
      'basePath',
      'actions',
      'timestamps',
      'db'
    ];

/**
 * Use like:
 *   var UserController = ResourceController.create({
 *     resourceName: 'user'
 *   });
 *
 * Options:
 *   resourceName: The name of your resource. This is used to guess the URLs,
 *                 and to determine keys in your datastore.
 *   properties:   When using the provided callbacks, this is a whitelist of
 *                 properties that the user can update.
 *   basePath:     The root of your resource. Defaults to "/#{name}s".
 *   db:           A database connection that's used to save data to redis.
 */

exports.create = function(options) {

  var controller = _.pick(options, VALID_OPTIONS);

  _.defaults(controller, {
    db: redis.createClient(),
    actions: [],
    timestamps: false
  });

  // Add the default actions.
  controller.actions.push.apply(controller.actions, defaultActions);

  if (controller.timestamps) {
    _.merge(controller.properties, {
      created_at: 'string',
      updated_at: 'string'
    });
  }

  controller.extend = function(app) {
    var controller = this;

    // Controllers may add custom methods or override the default ones.
    // controller.actions.push(...);

    _.each(controller.actions, function(options) {

      var options = _.extend({controller: controller}, options),
          action = Action.create(options);

      _.extend(action, require('./helpers'));
      _.bindAll(action);

      action.extend(app);
    });
  };

  return controller;
};
