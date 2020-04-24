/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
const mongoose = require("mongoose");

const Thread = require("../models/thread.js");
const Reply = require("../models/reply.js");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post((req, res) => {
      let board_from_params = req.params.board; //

      //form data
      let text = req.body.text;
      let delete_password = req.body.delete_password;
      let board_from_form = req.body.board; //form input convenience, check first

      //console.log(`param: ${board_from_params}`)
      //console.log(`form : ${text}, ${delete_password},${board_from_form}`)
      //console.log(/^\s+$/.test(text))

      if (
        ((board_from_params !== undefined &&
          /^\s+$/.test(board_from_params) === false) ||
          (board_from_form !== undefined &&
            /^\s+$/.test(board_from_form) === false)) &&
        text !== undefined &&
        /^\s+$/.test(text) === false &&
        delete_password !== undefined &&
        /^\s+$/.test(delete_password) === false
      ) {
        let board_name = board_from_params || board_from_form;
        //console.log(board_name)
        Thread.create(
          {
            board: board_name, //check if they are . equal
            text: text,
            delete_password: delete_password,
          },
          (err, threadCreated) => {
            //console.log(threadCreated)
            if (err || threadCreated === undefined || threadCreated === null) {
              res.redirect("/");
              //res.status(200).json("faille")
            } else {
              res.redirect(`/b/${threadCreated.board}`);
              //res.status(200).json("hello")
            }
          }
        );
      } else {
        res.redirect("/");
        //res.status(200).json("missing info")
      }
    })
    .get((req, res) => {
      Thread.aggregate()
        .match({
          board: req.params.board,
        })
        .sort({
          bumped_on: "desc",
          "replies.created_on": -1
        })
        .project({
          _id: 1,
          board: 1,
          created_on: 1,
          bumped_on: 1,
          text: 1,
          replycount:{$size:['$replies']},
          replies: {
            $slice:['$replies', 0, 3]
            /*
            text:1,
            created_on:1,
            thread_id:1*/
          }
        })
        .limit(10)
        .exec((err, threadsFound) => {
          //console.log(threadsFound);
          if(threadsFound!==null){
            threadsFound.forEach(th=>{//very efficient but I have to find out how to do this
              th.replies.forEach(re=>{//though project
                delete re.delete_password;
                delete re.reported
              })
            })
            res.status(200).json(threadsFound);
          }
          else {
            res.status(200).json([]); 
          }
          
        });
    })
    .put((req, res) => {
      //console.log(req.body)
      Thread.updateOne(
        {
          _id: req.body.reported_id,
        },
        {
          reported: true,
          bumped_on: Date.now(),
        },
        (err, threadReported) => {
          res.status(200).json("success");
        }
      );
    })
    .delete((req, res) => {
      //console.log(req.body)
      Thread.findOneAndDelete(
        {
          _id: req.body.thread_id,
          delete_password: req.body.delete_password,
        },
        (err, threadDeleted) => {
          //console.log(threadDeleted, "here")
          if (threadDeleted === null) {
            res.status(200).json("incorrect password");
          } else {
            res.status(200).json("success");
          }
        }
      );
    });

  app
    .route("/api/replies/:board")
    .post((req, res) => {
      Thread.updateOne(
        { _id: req.body.thread_id },
        {
          bumped_on: Date.now(),
          $push: {
            replies: {
              text: req.body.text,
              delete_password: req.body.delete_password,
              thread_id: req.body.thread_id,
            },
          },
        },
        (err, threadFound) => {
          //console.log(err,req.body)
          if (err === null) {
            res.redirect(`/b/${req.params.board}/${req.body.thread_id}`);
          } else {
            res.redirect(`/b/${req.params.board}`);
          }
        }
      );
    })
    //?7 I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}.
    //?Also hiding the same fields.
    .get((req, res) => {
      console.log(req.params, req.query);
      //res.status(200).json("testing")
      let currentBoard = req.params.board;
      let threadInBoard = req.query.thread_id;
      if ((currentBoard !== undefined) & (threadInBoard !== undefined)) {
        Thread.find({_id:threadInBoard,board:currentBoard},{delete_password:0,reported:0},(err, threadFound) => {
          //console.log(threadFound)
          if (threadFound !== null) {
            res.status(200).json(threadFound[0]);
          } else {
            res.status(200).json([]);
          }
          //threadFound.replies.aggregate([$sort:])
        });
      } else {
        res.status(200).json([]);
      }
    });
}; //end top suite

//? 4 I can POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.(Recomend res.redirect to board page /b/{board}) Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).

//?5 I can POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board} and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.

//?6 I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from /api/threads/{board}. The reported and delete_passwords fields will not be sent.

//?8 I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
//?9 I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')

//?10 I can report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board} and pass along the thread_id. (Text response will be 'success')
//?11 I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. (Text response will be 'success')
