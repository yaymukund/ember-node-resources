var _ = require('underscore'),
    Callbacks = require('./callbacks');

// Default actions for a resource.

module.exports = [];

module.exports.push({
  type: 'collection',
  method: 'POST',
  callbacks: [
    Callbacks.validateBody,
    Callbacks.createTimestamp,
    Callbacks.updateTimestamp,
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
    Callbacks.updateTimestamp,
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
