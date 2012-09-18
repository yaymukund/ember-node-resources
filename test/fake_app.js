var express = require('express'),
    app = express(),
    Resource = require('../lib/index'),
    db = require('redis').createClient(),

    postsController = Resource.Controller.create({
      resourceName: 'post',
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
