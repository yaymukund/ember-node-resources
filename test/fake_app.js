var express = require('express');
var app = express();
var ResourceController = require('../lib/resource_controller');

// Parse request bodies into a JS object.
app.use(express.bodyParser());

// Use app.delete and app.put.
app.use(express.methodOverride());

// Set up routes.
var postsController = ResourceController.create({
  name: 'post',

  properties: {
    text: 'string',
    created_at: 'date'
  }
});

postsController.mapRoutes(app);
module.exports = app;
