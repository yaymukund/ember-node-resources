var request = require('supertest');
var app = require('../../../server/start');

var _ = require('underscore');
var db = require('../../db').connection();
var Step = require('step');
var should = require('should');

describe('GET /poems/random', function() {
  // Need to add at least one resource.
  var resource = {
    text: 'lolol',
    created_at: '2012-08-05T00:40:13.567Z'
  };

  before(function(done) {
    db.hmset('resources:1', resource, done);
  });

  it('responds with any resource', function(done) {
    Step(
      function performRandom() {
        request(app)
          .get('/poems/random')
          .end(this);
      },

      function checkResponse(err, res) {
        should.not.exist(err);
        res.body.should.have.property('id');
        done();
      }
    )
  });
});
