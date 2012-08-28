var _ = require('underscore');
var Step = require('step');

module.exports = {};
module.exports.create = function(options) {

  var VALID_OPTIONS = [
    // Required.
    'method',
    'type',
    'action',
    'properties',
    'controller',
    'name',
    'basePath',
    'path'
  ];

  var route = _.pick(options, VALID_OPTIONS);

  if (!_.has(route, 'controller')) {
    route.controller = {};
  };

  route = _.defaults(route, _.pick(route.controller, VALID_OPTIONS));

  if (!_.has(route, 'path')) {
    if (!_.has(route, 'basePath')) {
      route.basePath = '/' + route.name + 's';
    }

    if (route.type == 'collection') {
      route.path = route.basePath;
    } else if (route.type == 'member') {
      route.path = route.basePath + '/:id'
    }
  }

  return route;
};
