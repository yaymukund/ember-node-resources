var express = require('express'),
    app = express(),
    ResourceController = require('../lib/resource_controller'),
    db = require('redis').createClient(),

    postsController = ResourceController.create({
      name: 'post',
      db: db,

      properties: [
        'text',
        'created_at'
      ]
    });

// Parse request bodies into a JS object.
app.use(express.bodyParser());

// Use app.delete and app.put.
app.use(express.methodOverride());

// Set up routes.
postsController.extend(app);

module.exports = app;
