/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose')

var Thread = require('../models/thread.js')

module.exports = function (app) {

  app.route('/api/threads/:board')
    .post((req, res) => {
      
      let board_from_params = req.params.board;//
      
      //form data
      let text = req.body.text;
      let delete_password = req.body.delete_password;
      let board_from_form = req.body.board; //form input convenience, check first
      
      //console.log(`param: ${board_from_params}`)
      //console.log(`form : ${text}, ${delete_password},${board_from_form}`)
      //console.log(/^\s+$/.test(text))
      
      if (  ((board_from_params !== undefined && /^\s+$/.test(board_from_params) === false) ||
              (board_from_form !== undefined && /^\s+$/.test(board_from_form) === false)) &&
            (text !== undefined && /^\s+$/.test(text) === false) &&
            (delete_password !== undefined && /^\s+$/.test(delete_password) === false)) {
            
        let board_name = board_from_params || board_from_form;
        //console.log(board_name)
        Thread.create({
          board: board_name, //check if they are . equal
          text: text,
          delete_password:delete_password
        },(err,threadCreated)=>{
          //console.log(threadCreated)
          if(err || threadCreated === undefined|| threadCreated === null){
            res.redirect('/');
            //res.status(200).json("faille")
          }
          else 
          {
             res.redirect(`/b/${threadCreated.board}`)
             //res.status(200).json("hello")
          }
        })

      } else {
        res.redirect('/');
        //res.status(200).json("missing info")
      }

    })
    .get((req,res)=>{
      Thread.aggregate()
        .match({board:req.params.board})
        .sort({bumped_on:"desc"})
        .limit(10)
        .project({_id:1,board:1,created_on:1,bumped_on:1,replies:1})
        .exec((err,threadsFound)=>{
        res.status(200).json(threadsFound)
      })
    })
    .put((req,res)=>{
      //console.log(req.body)
      Thread.updateOne({_id:req.body.reported_id},{reported:true,bumped_on:Date.now()},(err,threadReported)=>{
          res.status(200).json("success");
      });
    })
    .delete((req,res)=>{

    });

  app.route('/api/replies/:board');

};