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

  // name - The name of your resource.
  // method - 'GET', 'PUT', 'POST', etc.
  // type - 'collection' or 'member'
  // callback - A function that accepts req, res as arguments, run in the
  //            context of the action.
  // basePath - Prepended to the path.
  // path - A full path for the resource. If this is provided, it overrides the
  //        basePath.
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
