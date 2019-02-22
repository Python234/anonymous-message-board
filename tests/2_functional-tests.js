/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('create thread with empty fields', function(done) {
        chai.request(server)
          .post('/api/threads/testsuite')
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'Please provide thread_text and delete_password');
            done();
          });
      });
      
      test('create thread with filled fields', function(done) {
        chai.request(server)
          .post('/api/threads/testsuite')
          .send({text: 'thread text', delete_password: 'password'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
      
    });
    
    suite('GET', function() {
      
      test('get top 10 threads', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.isBelow(res.body.length, 11, 'response should have 10 threads');
            assert.isObject(res.body[0], 'thread should be an object');
            assert.property(res.body[0], '_id', 'thread should have \'_id\' property');
            assert.property(res.body[0], 'text', 'thread should have \'text\' property');
            assert.property(res.body[0], 'created_on', 'thread should have \'created_on\' property');
            assert.property(res.body[0], 'bumped_on', 'thread should have \'bumped_on\' property');
            assert.notProperty(res.body[0], 'reported', 'threads should not have \'reported\' property');
            assert.notProperty(res.body[0], 'delete_password', 'threads should not have \'delete_password\' property');
            done();
          });
      });
      
    });
    
    suite('DELETE a thread', function() {
      
      // test('delete thread with invalid id', function(done) {
      //   chai.request(server)
      //     .delete('/api/threads/testsuite')
      //     .query({_id: 'invalidid', delete_password: 'password'})
      //     .end((err, res) => {
      //       assert.equal(res.status, 400);
      //       assert.equal(res.text, '_id error');
      //       done();
      //     });
      // });
      
      test('with invalid password', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
          
            let _id = res.body[0]._id;
          
            chai.request(server)
              .delete('/api/threads/testsuite')
              .query({_id: _id, delete_password: 'wrong password'})
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
              });
          
          });
      });
      
      test('with valid password', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
          
            let _id = res.body[0]._id;
          
            chai.request(server)
              .delete('/api/threads/testsuite')
              .query({_id: _id, delete_password: 'password'})
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
              });
          });
      });
      
    });
    
    suite('PUT, report a thread', function() {
      
      test('with invalid _id', function(done) {
        chai.request(server)
          .put('/api/threads/testsuite')
          .query({_id: 'invalid Id'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'invalid _id');
            done();
          });
      });
      
      test('with valid _id', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
            
            let _id = res.body[0]._id;
          
            chai.request(server)
              .put('/api/threads/testsuite')
              .query({_id: _id})
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success')
                done();
              });
          });
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST a reply to thread on specific board', function() {
      
      test('with invalid thread_id', function(done) {
        chai.request(server)
          .post('/api/replies/testsuite')
          .query({text: 'reply text', delete_password: 'password', thread_id: 'invalid Id'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'invalid thread id')
            done();
          });
      });
      
      test('with valid id', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
          
            let thread_id = res.body[0]._id;
          
            chai.request(server)
              .post('/api/replies/testsuite')
              .query({text: 'reply text', delete_password: 'password', thread_id: thread_id})
              .end((err, res) => {
                assert.equal(res.status, 200);
                done();
              });
          });
      });
      
    });
    
    suite('GET all replies of a thread by thread id', function() {
      
      test('with invalid id', function(done) {
        chai.request(server)
          .get('/api/replies/testsuite')
          .query({thread_id: 'invalid id'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'invalid thread id')
            done();
          });
      });
      
      test('with valid id', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
            
            let thread_id = res.body[0]._id;
          
            chai.request(server)
              .get('/api/replies/testsuite')
              .query({thread_id: thread_id})
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body, 'response should be an object');
                assert.property(res.body, '_id', 'response should have \'_id\' property');
                assert.property(res.body, 'text', 'response should have \'text\' property');
                assert.property(res.body, 'created_on', 'response should have \'created on\' property');
                assert.property(res.body, 'bumped_on', 'response should have \'bumped_on\' property');
                assert.notProperty(res.body, 'reported', 'response should not have \'reported\' property');
                assert.notProperty(res.body, 'delete_password', 'response should not have \'delete_password\' property');
                assert.property(res.body, 'replies', 'response should have \'replies\' property');
                assert.isArray(res.body.replies, 'replies should be an array');
                assert.isObject(res.body.replies[0], 'replies should be an array of objects');
                assert.property(res.body.replies[0], '_id', 'reply should have \'_id\' property');
                assert.property(res.body.replies[0], 'text', 'reply should have \'text\' property');
                assert.property(res.body.replies[0], 'created_on', 'reply should have \'created_on\' property');
                assert.notProperty(res.body.replies[0], 'reported', 'reply should not have \'reported\' property');
                assert.notProperty(res.body.replies[0], 'delete_password', 'reply should not have \'delete_password\' property');
                done();
              });
          });
      });
      
    });
    
    suite('PUT, report a thread', function() {
      
      test('with invalid id', function(done) {
        chai.request(server)
          .put('/api/replies/testsuite')
          .query({thread_id: 'invalid id', reply_id: 'invalid id'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'invalid id');
            done();
          });
      });
      
      test('with valid id', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
            
            let thread_id = res.body[0]._id;
            let reply_id  = res.body[0].replies[0]._id;
          
            chai.request(server)
              .put('/api/replies/testsuite')
              .query({thread_id: thread_id, reply_id: reply_id})
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
              });
          });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('a reply with invalid delete password', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
            
            let query = {
              thread_id: res.body[0]._id,
              reply_id: res.body[0].replies[0]._id,
              delete_password: 'invalid password'
            }
            
            chai.request(server)
              .delete('/api/replies/testsuite')
              .query(query)
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
              });
          });
      });
      
      test('delete reply with valid password', function(done) {
        chai.request(server)
          .get('/api/threads/testsuite')
          .end((err, res) => {
            
            let query = {
              thread_id: res.body[0]._id,
              reply_id: res.body[0].replies[0]._id,
              delete_password: 'password'
            }
            
            chai.request(server)
              .delete('/api/replies/testsuite')
              .query(query)
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
              });
          });
      });
      
    });
    
  });

});
