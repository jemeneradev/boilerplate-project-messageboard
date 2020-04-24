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
          text: `thread:${count}`,
          delete_password: "test_pass",
          board: board
        })
        .end((err, res) => {

          setTimeout(() => {
            if (count === 0) {
              //console.log("done")
              finish()
            } else {
              //console.log(`${count} - ${board}`)
              //console.log(res.body)
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

    let sendReplies = (s,b,t,c,cb) => {
      chai.request(s)
      .post(`/api/replies/${b}`)
      .type('form')
      .send({
        text:`reply:${c}`,
        delete_password:'test_pass',
        thread_id:t
      })
      .end((err,res)=>{
        if (c===0){cb(t)}
        else{
          sendReplies(s,b,t,c-1,cb)
        }
      })
    }

    suite('GET', function () {
      test('visiting a board page', (done) => {
        chai.request(server)
          .get(`/api/threads/${timeBoardPostedTo}`)
          .end((err, res) => {
            let threads = res.body
            console.log(res.body)
            assert.equal(res.status, 200)
            assert.equal(threads.length, 10)
            threads.forEach((thrd) => {
              assert.notProperty(thrd,'reported')
              assert.notProperty(thrd,'delete_password')
            });
            //console.log(threads)
            //!need to test if threads are in desc order
            //!check if replies are the latest
            done()
            //sendReplies(server,timeBoardPostedTo,threads[0]._id,5,(thread_posted)=>{
              
            })
          })
    })
    
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
    let boardTestingReplies = `boardWithReplies${Date.now()}`
    suiteSetup((done) => {
      chai.request(server)
        .post(`/api/threads/${boardTestingReplies}`)
        .type('form')
        .send({
          text: "This is a thread",
          delete_password: "test_pass",
          board: boardTestingReplies
        })
        .end((err, res) => {
          console.log(res.body)
          console.log(`Created thread to test replies: ${boardTestingReplies}`)
          done();
        })
    })

    suite('POST', function () {
      let replies;
      let thread_id;
      suiteSetup((done) => {
        chai.request(server)
          .get(`/api/threads/${boardTestingReplies}`)
          .end((err, thread_res) => {
            console.log(thread_res.body)
            replies = thread_res.body[0].replies
            thread_id = thread_res.body[0]._id
            console.log(replies)
            done()
          })
      })
      test('posting a reply', (done) => {
        console.log(replies)
        assert.equal(replies.length, 0)
        chai.request(server)
          .post(`/api/replies/${boardTestingReplies}`)
          .type('form')
          .send({
            text: "my first reply",
            delete_password: "test_pass",
            thread_id: thread_id
          })
          .end((err, post_res) => {
            chai.request(server)
              .get(`/api/threads/${boardTestingReplies}`)
              .end((err, thread_res) => {
                console.log(thread_res.body)
                assert.equal(thread_res.body[0].replies.length, 1) //count incremented
                assert.equal(thread_res.body[0]._id, thread_id) //inserted to same thread
                assert.equal(thread_res.body[0].replies[0].thread_id, thread_id) //inserted reply to correct thread
                console.log(thread_res.body[0].replies)
                done()
                //replies = thread_res.body[0].replies
                //thread_id = thread_res.body[0]._id
                //sconsole.log(replies)
              })
          })
      })
    });

    let repeatReplyPost = (server, board, thread, num, finish) => {
      chai.request(server)
        .post(`/api/replies/${board}`)
        .type('form')
        .send({
          text: `reply #${num}`,
          delete_password: "test_pass",
          thread_id: thread
        })
        .end((err, res) => {
          if (num <= 0) {
            finish()
          } else {
            console.log("called post on replies")
            repeatReplyPost(server,board,thread,num-1,finish)
          }
        })
    }

    suite('GET', function () {
      this.timeout(3000)

      let replies;
      let thread_id;
      suiteSetup((done) => {
        chai.request(server)
          .get(`/api/threads/${boardTestingReplies}`)
          .end((err, thread_res) => {
            console.log("In GET")
            console.log(thread_res.body)
            replies = thread_res.body[0].replies
            thread_id = thread_res.body[0]._id
            console.log(replies)
            repeatReplyPost(server,boardTestingReplies,thread_id,5,done)
          })

      })
      test('getting replies from existing thread', (done) => {
        chai.request(server)
          .get(`/api/replies/${boardTestingReplies}?thread_id=${thread_id}`)
          .end((err, thread_res) => {
            console.log(thread_res.body)
            //assert.equal(thread_res.body.replies.length,1)//count incremented
            assert.equal(thread_res.body._id,thread_id)//inserted to same thread
            assert.equal(thread_res.body.replies[0].thread_id,thread_id)//inserted reply to correct thread
            console.log(thread_res.body.replies)
            done()
            //replies = thread_res.body[0].replies
            //thread_id = thread_res.body[0]._id
            //sconsole.log(replies)
          })
      })
    });

    suite('PUT', function () {

    });

    suite('DELETE', function () {

    });

  });

});