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
var expect = chai.expect;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  suite('API ROUTING FOR /api/threads/:board', function () {
    let boardName = `test${Date.now()}`
    suite('POST', function () {
      test('create thread', (done) => {
        chai.request(server)
          .post(`/api/threads/${boardName}`)
          .type('form')
          .send({
            text: "This is a test",
            delete_password: "test_pass",
            board: boardName
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.match(res.redirects, RegExp(`/b/${boardName}`))
            done();
          })
      })
    });

    suite('GET', function () {
      test('visiting a board page', (done) => {
        chai.request(server)
          .get(`/api/threads/${boardName}`)
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.equal(res.body.length, 1)
            assert.property(res.body[0], 'text')
            assert.equal(res.body[0].text, 'This is a test')
            done()
          })
      })

    });

    suite('DELETE', function () {

    });

    suite('PUT', function () {
      test('reporting a thread', (done) => {
        chai.request(server)
          .get(`/api/threads/${boardName}`)
          .end((err, res) => {
            let threadToReport = res.body[0]
            assert.equal(threadToReport.reported,false)
            //console.log("thread",threadToReport)
          
            chai.request(server)
            .put(`/api/threads/${boardName}`)
            .send({reported_id:threadToReport._id})
            .end((put_err, put_res) => {
              assert.equal(put_res.status,200)
              assert.equal(put_res.body,"success");
              done();
            })
          });
      })
    })
});

suite('API ROUTING FOR /api/replies/:board', function () {

suite('POST', function () {

});

suite('GET', function () {

});

suite('PUT', function () {

});

suite('DELETE', function () {

});

});

});