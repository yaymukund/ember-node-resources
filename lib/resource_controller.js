var _ = require('underscore');
var Step = require('step');

module.exports = {};

/**
 * Use like:
 *   var UserController = ResourceController.create({
 *     name: 'user'
 *   });
 *
 * Options:
 *   name: The name of your resource. This is used to guess the URLs, and to
 *         determine keys in your datastore.
 *   basePath: The root of your resource. Defaults to "/#{name}s".
 */
module.exports.create = function(options) {

  _.defaults(options, {
    basePath: '/' + options.name + 's'
  });

  var controller = {
    name: options.name,

    paths: {
      collection: options.basePath,
      member: options.basePath + '/:id'
    }
  };

  controller.actions = require('./default_actions')(controller);

  controller.initialize = function(app) {
    // Controllers may add custom methods.
    // controller.memberMethods.push({
    //   method: 'PUT', // 'GET', 'POST', 'DELETE'.
    //   action: function(req, res, next) {}
    // });
    _.each(controller.actions, function(m) {
      app[m.method.toLowerCase()](m.path, m.action);
    });
  };

  return controller;
};
