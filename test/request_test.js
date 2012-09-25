var request = require('supertest'),
    app = require('./fake_app'),
    _ = require('underscore'),
    db = require('redis').createClient(),
    Step = require('step'),
    should = require('should');

describe('POST /posts', function() {
  var post = {text: 'lolol'},
      response;

  before(function(done) {
    Step(
      function performCreate() {
        request(app)
          .post('/posts')
          .send({post: post})
          .end(this);
      },

      function checkResponse(err, res) {
        should.not.exist(err);
        response = res.body;
        done();
      }
    );
  });

  it('responds with the created post', function() {
    response.should.include(post);
    response.should.have.keys('id', 'created_at', 'updated_at', 'text');
  });

  it('creates the post', function(done) {
    Step(
      function searchForPost() {
        db.hgetall('posts:' + response.id, this);
      },

      function checkResponse(err, foundPost) {
        should.not.exist(err);
        foundPost.should.eql(response);
        done();
      }
    );
  });

  it('adds the ID to the list of post IDs', function(done) {
    Step(
      function searchForId() {
        db.sismember('ids:post', response.id, this);
      },

      function checkResults(err, exists) {
        should.not.exist(err);
        exists.should.equal(1);
        done();
      }
    );
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
    Step(
      function performFind() {
        request(app)
          .get('/posts/1')
          .end(this);
      },

      function checkResponse(err, res) {
        should.not.exist(err);
        res.body.should.include(post);
        done();
      }
    );
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
    Step(
      function createPost() {
        db.hmset('posts:2', post, this);
      },

      function performUpdate(err) {
        request(app)
        .put('/posts/2')
        .send({post: modifiedPost})
        .end(this);
      },

      function setResult(err, res) {
        should.not.exist(err);
        response = res.body;
        done();
      }
    );
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
      Step(
        function getPost() {
          db.hgetall('posts:2', this);
        },

        function savePost(err, thePost) {
          should.not.exist(err);
          savedPost = thePost;
          done();
        }
      );
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
    Step(
      function createPost() {
        db.hmset('posts:3', post, this.parallel());
        db.sadd('ids:post', 3, this.parallel());
      },

      function performDestroy(err) {
        should.not.exist(err);
        request(app)
          .del('/posts/3')
          .end(this);
      },

      function checkResponse(err, res) {
        should.not.exist(err);
        done();
      }
    );
  });

  it('deletes the key', function(done) {
    Step(
      function searchForKey() {
        db.exists('posts:3', this);
      },

      function checkResult(err, exists) {
        should.not.exist(err);
        exists.should.equal(0);
        done();
      }
    );
  });

  it('removes the ID from the set of post IDs', function(done) {
    Step(
      function searchForId() {
        db.sismember(3, 'ids:post', this);
      },

      function checkResult(err, exists) {
        should.not.exist(err);
        exists.should.equal(0);
        done();
      }
    );
  });
});
