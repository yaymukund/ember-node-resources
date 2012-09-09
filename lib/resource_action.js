var _ = require('underscore'),
    Step = require('step'),
    VALID_OPTIONS = [
      'name',
      'method',
      'type',
      'callback',
      'properties',
      'controller',
      'basePath',
      'path'
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
  var action = _.pick(options, VALID_OPTIONS);
  _.defaults(action, options.controller, {
    controller: {}
  });

  // Try to intelligently fill in some of the options.
  if (!_.has(action, 'path')) {
    if (!_.has(action, 'basePath')) {
      action.basePath = '/' + action.name + 's';
    }

    if (action.type == 'collection') {
      action.path = action.basePath;
    } else if (action.type == 'member') {
      action.path = action.basePath + '/:id'
    }
  }

  return action;
};
