var ResourceAction = require('../lib/resource_action'),
    should = require('should'),
    _ = require('underscore');


var createAction = function() {
  var options = arguments[0] || {};

  _.defaults(options, {
    method: 'POST',
    type: 'collection',
    callbacks: [function() {}]
  });

  return ResourceAction.create(options);
};

describe('A collection action', function() {
  var action;

  before(function() {
    action = createAction({
      name: 'resource',
      type: 'collection'
    });
  });

  it('maps to /resources', function() {
    action.should.include({
      basePath: '/resources',
      path: '/resources'
    });
  });
});

describe('A member action', function() {
  var action;

  before(function() {
    action = createAction({
      name: 'resource',
      type: 'member'
    });
  });

  it('maps to /resources/:id', function() {
    action.should.include({
      basePath: '/resources',
      path: '/resources/:id'
    });
  });
});

describe('An action with a controller', function() {
  var action,
      controller = {
        name: 'resource',
        properties: ['p1', 'p2'],
        basePath: '/res',
        path: '/special',
        db: 'connection'
      };

  before(function() {
    action = createAction({controller: controller})
  });

  it('inherits name, properties, basePath, path, and db', function() {
    action.should.include(controller);
  });

  describe('with conflicting properties', function() {
    var routeProperties = {
      name: 'conflict',
      properties: ['p3', 'p4'],
      basePath: '/con',
      path: '/spec',
      db: 'connection2'
    };

    before(function() {
      var properties = _.clone(routeProperties);
      properties.controller = controller;
      action = createAction(properties);
    });

    it('prefers action properties over the controller properties', function() {
      action.should.include(routeProperties);
    });
  });
});
