var _ = require('underscore'),
    Callbacks = require('./resource_callbacks');

// Default actions for a resource.

module.exports = [];

module.exports.push({
  type: 'collection',
  method: 'POST',
  callbacks: [
    Callbacks.validateBody,
    Callbacks.getId,
    Callbacks.create,
    Callbacks.respond
  ]
});

module.exports.push({
  method: 'GET',
  type: 'member',
  callbacks: [
    Callbacks.validateId,
    Callbacks.show,
    Callbacks.respond
  ]
});

module.exports.push({
  type: 'member',
  method: 'PUT',
  callbacks: [
    Callbacks.validateId,
    Callbacks.validateBody,
    Callbacks.update,
    Callbacks.show,
    Callbacks.respond
  ]
});

module.exports.push({
  type: 'member',
  method: 'DELETE',
  callbacks: [
    Callbacks.validateId,
    Callbacks.destroy,
    Callbacks.respond
  ]
});
