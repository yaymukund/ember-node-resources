var Resource = require('../lib/index'),
    should = require('should'),
    _ = require('lodash');


var createAction = function() {
  var options = arguments[0] || {};

  _.defaults(options, {
    method: 'POST',
    type: 'collection',
    callbacks: [function() {}]
  });

  return Resource.Action.create(options);
};

describe('A collection action', function() {
  var action;

  before(function() {
    action = createAction({
      resourceName: 'resource',
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
      resourceName: 'resource',
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
        resourceName: 'resource',
        properties: {p1: 'string', p2: 'string'},
        basePath: '/res',
        path: '/special',
        db: 'connection',
        objectRoot: false
      };

  before(function() {
    action = createAction({controller: controller})
  });

  it('inherits name, properties, basePath, path, db, and objectRoot', function() {
    action.should.include(controller);
  });

  describe('with conflicting properties', function() {
    var routeProperties = {
      resourceName: 'conflict',
      properties: {p3: 'string', p4: 'string'},
      basePath: '/con',
      path: '/spec',
      db: 'connection2',
      objectRoot: true
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

describe('An action with a name', function() {
  var action;

  describe('on a collection', function() {
    before(function() {
      action = createAction({
        resourceName: 'resource',
        type: 'collection',
        name: 'action'
      });
    });

    it('maps to /resources/action', function() {
      action.should.include({
        basePath: '/resources',
        path: '/resources/action'
      });
    });
  });

  describe('on a member', function() {
    before(function() {
      action = createAction({
        resourceName: 'resource',
        type: 'member',
        name: 'action'
      });
    });

    it('maps to /resources/:id/action', function() {
      action.should.include({
        basePath: '/resources',
        path: '/resources/:id/action'
      });
    });
  });
});
