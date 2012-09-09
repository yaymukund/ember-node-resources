var _ = require('underscore'),
    Step = require('step'),
    VALID_OPTIONS = [

      'controller',
      'method',
      'type',
      'callback',

      // Can be inherited from the controller.
      'name',
      'properties',
      'basePath',
      'path',
      'db'
    ];

exports.create = function(options) {

  // controller - If provided, we can inherit values from the controller (see below).
  // method     - 'GET', 'PUT', 'POST', etc.
  // type       - 'collection' or 'member'
  // callback   - A function that accepts req, res as arguments, run in the
  //              context of the action.
  //
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

  _.defaults(action, options.controller, {
    controller: {},
    basePath: '/' + action.name + 's'
  });

  action = _.pick(action, VALID_OPTIONS);

  if (!_.has(action, 'path')) {
    if (action.type == 'collection') {
      action.path = action.basePath;
    } else if (action.type == 'member') {
      action.path = action.basePath + '/:id'
    }
  }

  return action;
};
