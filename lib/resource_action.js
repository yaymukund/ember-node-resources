var _ = require('underscore'),
    VALID_OPTIONS = [

      'controller',
      'method',
      'type',
      'callbacks',

      // Can be inherited from the controller.
      'name',
      'properties',
      'basePath',
      'path',
      'db'
    ];

exports.create = function(options) {

  // controller - If provided, we can inherit values from the controller (see below).
  // method     - 'GET', 'PUT', 'POST', 'UPDATE', 'DELETE'
  // type       - 'collection' or 'member'
  // callbacks  - An array of middleware callbacks. See the express docs. They
  //              are automatically bound to the action before running.
  // The following values can be inherited from the controller:
  //
  // name       - The name of your resource.
  // properties - A whitelist of properties that a use can read/write.
  // basePath   - Prepended to the path.
  // path       - A full path for the resource. If this is provided, it
  //              overrides the basePath.
  // db         - An optional db client used to interface with Redis. By
  //              default, we create a new client for every controller.

  var action = _.clone(options);

  _.defaults(action, options.controller);

  _.defaults(action, {
    controller: {},
    basePath: '/' + action.name + 's'
  });

  action = _.pick(action, VALID_OPTIONS);

  if (!action.path) {
    if (action.type == 'collection') {
      action.path = action.basePath;
    } else if (action.type == 'member') {
      action.path = action.basePath + '/:id';
    }
  }

  action.extend = function(app) {
    var action = this,
        callbacks;

    callbacks = _.map(action.callbacks, function(callback) {
      return callback.bind(action);
    });

    app[this.method.toLowerCase()](this.path, callbacks);
  };

  return action;
};
