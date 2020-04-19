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

    this.timeout(5000);
    let boardName = `test${Date.now()}`

    let threadsToSend = 12;
    let timeBoardPostedTo = `timedboard`
    let sendAndWait = (board, serverToSendTo, count, next, finish) => {
      chai.request(serverToSendTo)
        .post(`/api/threads/${board}`)
        .type('form')
        .send({
          text: "This is a test " + count,
          delete_password: "test_pass",
          board: board
        })
        .end((err, res) => {

          setTimeout(() => {
            if (count === 0) {
              console.log("done")
              finish()
            } else {
              console.log(`${count} - ${board}`)
              console.log(res.body)
              next(board, serverToSendTo, count - 1, next, finish)
            }
          }, 100)


        })
    }

    suiteSetup((done) => {
      sendAndWait(timeBoardPostedTo, server, threadsToSend, sendAndWait, done)
    });

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
          .get(`/api/threads/${timeBoardPostedTo}`)
          .end((err, res) => {
            let threads = res.body
            assert.equal(res.status, 200)
            assert.equal(threads.length, 10)

            //!need to test if threads are in desc order
            //!check if replies are the latest
            done()
          })
      })

    });

    suite('DELETE', function () {
      let threadToDelete = `trash${Date.now()}`;
      let save_id;
      suiteSetup((done) => {
        chai.request(server)
          .post(`/api/threads/${threadToDelete}`)
          .type('form')
          .send({
            text: "Delete this after creation",
            delete_password: "test_pass",
            board: threadToDelete
          })
          .end((err, res) => {
            chai.request(server)
              .get(`/api/threads/${threadToDelete}`)
              .end((get_err, get_res) => {
                save_id = get_res.body[0]._id;
                done()
                //console.log(get_res.body[0],save_id)
              })
          })
      })
      test('delete thread with matching password', (done) => {
        //console.log(save_id)

        chai.request(server)
        .delete(`/api/threads/${threadToDelete}`)
        .send({
          thread_id: save_id,
          delete_password: "wrong_pass"
        })
        .end((err, res) => {
          //console.log(res.body)
          assert.equal(res.body,"incorrect password")
          chai.request(server)
          .delete(`/api/threads/${threadToDelete}`)
          .send({
            thread_id: save_id,
            delete_password: "test_pass"
          })
          .end((err, res) => {
            //console.log(res.body)
            assert.equal(res.body,"success")
            done()
          })
        })
      })
    });

    suite('PUT', function () {
      test('reporting a thread', (done) => {
        chai.request(server)
          .get(`/api/threads/${boardName}`)
          .end((err, res) => {
            let threadToReport = res.body[0] //console.log("thread",threadToReport)

            chai.request(server)
              .put(`/api/threads/${boardName}`)
              .send({
                reported_id: threadToReport._id
              })
              .end((put_err, put_res) => {
                assert.equal(put_res.status, 200)
                assert.equal(put_res.body, "success");
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