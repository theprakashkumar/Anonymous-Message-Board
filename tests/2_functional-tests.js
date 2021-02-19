const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let threadId;
let replyId;
suite('Functional Tests', function () {
  this.timeout(10000);

  test('Creating a new thread: POST request to /api/threads/{board}', function (done) {
    chai
      .request(server)
      .post('/api/threads/board')
      .send({
        text: 'chai testing our thread',
        delete_password: 'tester deleter',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        threadId = res.body.thread_id;
        done();
      });
  });

  test('Creating a new reply: POST request to /api/replies/{board}', function (done) {
    chai
      .request(server)
      .post('/api/replies/{board}')
      .send({
        text: 'chai testing our thread',
        delete_password: 'tester deleter',
        thread_id: threadId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        replyId = res.body.reply_id;
        done();
      });
  });

  test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board', function (done) {
    chai
      .request(server)
      .get('/api/threads/board')
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function (done) {
    chai
      .request(server)
      .get(`/api/replies/board?thread_id=${threadId}`)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  test('Reporting a reply: PUT request to /api/replies/{board}', function (done) {
    chai
      .request(server)
      .put('/api/replies/board')
      .send({ reply_id: replyId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  test('Deleting a reply with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
    chai
      .request(server)
      .delete(`/api/replies/board`)
      .send({
        thread_id: threadId,
        reply_id: replyId,
        delete_password: 'Incorrect Password',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  test('Deleting a reply with the correct password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
    chai
      .request(server)
      .delete(`/api/replies/board`)
      .send({
        thread_id: threadId,
        reply_id: replyId,
        delete_password: 'tester deleter',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  test('Reporting a thread: PUT request to /api/threads/{board}', function (done) {
    chai
      .request(server)
      .put('/api/threads/board')
      .send({ thread_id: threadId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/threads/board')
      .send({
        thread_id: threadId,
        delete_password: 'wrong password',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/threads/board')
      .send({
        thread_id: threadId,
        delete_password: 'tester deleter',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });
});