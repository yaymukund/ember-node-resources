var _ = require('lodash'),
    Callbacks = require('../callbacks');

// Default actions for a resource.

module.exports = [];

module.exports.push({
  type: 'collection',
  method: 'POST',
  callbacks: [
    Callbacks.validateBody,
    Callbacks.createTimestamp,
    Callbacks.updateTimestamp,
    Callbacks.createId,
    Callbacks.create,
    Callbacks.renderResource,
    Callbacks.respond
  ]
});

module.exports.push({
  type: 'collection',
  method: 'GET',
  callbacks: [
    Callbacks.getResourceIds,
    Callbacks.showMany,
    Callbacks.renderResources,
    Callbacks.respond
  ]
});

module.exports.push({
  method: 'GET',
  type: 'member',
  callbacks: [
    Callbacks.getResourceId,
    Callbacks.show,
    Callbacks.renderResource,
    Callbacks.respond
  ]
});

module.exports.push({
  type: 'member',
  method: 'PUT',
  callbacks: [
    Callbacks.getResourceId,
    Callbacks.validateBody,
    Callbacks.updateTimestamp,
    Callbacks.update,
    Callbacks.show,
    Callbacks.renderResource,
    Callbacks.respond
  ]
});

module.exports.push({
  type: 'member',
  method: 'DELETE',
  callbacks: [
    Callbacks.getResourceId,
    Callbacks.destroy,
    Callbacks.respond
  ]
});
