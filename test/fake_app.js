var express = require('express'),
    app = express(),
    Resource = require('../lib/index'),
    db = require('redis').createClient(),

    postsController = Resource.Controller.create({
      resourceName: 'post',
      db: db,
      timestamps: true,
      properties: {text: 'string'}
    }),

    linesController = Resource.Controller.create({
      resourceName: 'line',
      db: db,
      timestamps: true,
      properties: {content: 'string'}
    });

// Parse request bodies into a JS object.
app.use(express.bodyParser());

// Use app.delete and app.put.
app.use(express.methodOverride());

// Set up routes.
postsController.extend(app);
linesController.extend(app);

module.exports = app;
