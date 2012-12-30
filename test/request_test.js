var app = require('./fake_app'),
    request = require('supertest')(app),
    _ = require('underscore'),
    db = require('redis').createClient(),
    should = require('should');

describe('A request', function() {
  it('doesn\'t include the root if objectRoot is false', function(done) {
    var line = {content: 'something'};

    request
      .post('/lines')
      .send({line: line})
      .end(function(err, res) {
        should.not.exist(err);
        should.not.exist(res.body.line);
        res.body.should.include(line);
        done();
      });
  });
});

describe('POST /posts', function() {
  var post = {text: 'lolol'},
      response;

  before(function(done) {
    request
      .post('/posts')
      .send({post: post})
      .end(function(err, res) {
        should.not.exist(err);
        response = res.body.post;
        done();
      });
  });

  it('responds with the created post', function() {
    response.should.include(post);
    response.should.have.keys('id', 'created_at', 'updated_at', 'text');
  });

  it('creates the post', function(done) {
    db.hgetall('posts:' + response.id, function(err, foundPost) {
      should.not.exist(err);
      foundPost.should.eql(response);
      done();
    });
  });

  it('adds the ID to the list of post IDs', function(done) {
    db.sismember('ids:post', response.id, function(err, exists) {
      should.not.exist(err);
      exists.should.equal(1);
      done();
    });
  });
});

describe('GET /posts/:id', function() {
  var post = {
    text: 'lolol',
    created_at: '2012-08-05T00:40:13.567Z'
  };

  before(function(done) {
    db.hmset('posts:1', post, done);
  });

  it('responds with the post', function(done) {
    request
      .get('/posts/1')
      .end(function(err, res) {
        should.not.exist(err);
        res.body.post.should.include(post);
        done();
      });
  });
});

describe('PUT /posts/:id', function() {
  var post = {
      id: '2',
      text: 'lolol',
      created_at: '2012-08-05T00:40:13.567Z',
      updated_at: '2012-08-05T00:40:13.567Z'
    },
    modifiedPost = {text: 'not lolol'},
    response;

  before(function(done) {
    db.hmset('posts:2', post, function(err) {
      request
        .put('/posts/2')
        .send({post: modifiedPost})
        .end(function(err, res) {
          should.not.exist(err);
          response = res.body.post;
          done();
        });
    });
  });

  it('responds with the updated post', function() {
    response.should.include(modifiedPost);
    response.should.have.keys('id', 'text', 'created_at', 'updated_at');
    response.created_at.should.eql(post.created_at);
    response.updated_at.should.not.eql(post.updated_at);
  });

  describe('the saved post', function() {
    var savedPost;

    before(function(done) {
      db.hgetall('posts:2', function(err, thePost) {
        should.not.exist(err);
        savedPost = thePost;
        done();
      });
    });

    it('contains the update', function() {
      savedPost.should.include(modifiedPost);
      savedPost.should.eql(response);
    });
  });
});

describe('DELETE /posts/:id', function() {
  var post = {
    text: 'lolol',
    created_at: '2012-08-05T00:40:13.567Z'
  };

  before(function(done) {
    db.hmset('posts:3', post, function(err) {
      should.not.exist(err);

      db.sadd('ids:post', 3, function(err) {
        should.not.exist(err);

        request
          .del('/posts/3')
          .end(function(err, res) {
            should.not.exist(err);
            done();
          });
      });
    });
  });

  it('deletes the key', function(done) {
    db.exists('posts:3', function(err, exists) {
      should.not.exist(err);
      exists.should.equal(0);
      done();
    });
  });

  it('removes the ID from the set of post IDs', function(done) {
    db.sismember(3, 'ids:post', function(err, exists) {
        should.not.exist(err);
        exists.should.equal(0);
        done();
    });
  });
});
