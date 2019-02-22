/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

let expect      = require('chai').expect;
let MongoClient = require('mongodb').MongoClient;
let ObjectId    = require('mongodb').ObjectId;
let DATABASE    = process.env.DATABASE;
let bcrypt      = require('bcrypt');
let shortId     = require('shortid');

module.exports = function (app) {
  
  
  app.route('/api/threads/:board')
  
    //create new thread
    .post((req, res) => {
      let board = req.params.board;
      let text  = req.body.text;
      let pass  = req.body.delete_password;
    
      if (!text || !pass) return res.status(400).send('Please provide thread_text and delete_password');
    
      let date = Date.now();
    
      let data = {
        _id: shortId(),
        text:            text,
        created_on:      date,
        bumped_on:       date,
        reported:        false,
        delete_password: pass,
        replies:         []
      }
      
      MongoClient.connect(DATABASE, (err, db) => {
        db.collection(board).insertOne(data, (err, doc) => {
          if (err) { console.log(err); return res.status(500).send('Error: failed to create thread'); }
          db.close();
        });
      });
    
      res.redirect(`/b/${board}`);
    })
  
    // get top 10 threads
    .get((req, res) => {
      let board = req.params.board;
    
      MongoClient.connect(DATABASE, (err, db) => {
        db.collection(board).aggregate(
          [
            {$match: {reported: false}},
            {$sort: {bumped_on: -1}},
            {$limit: 10},
            {$project: 
             {
               text: 1,
               created_on: 1,
               bumped_on: 1,
               replies: {$slice: ['$replies',3]}
             }
            }
          ]
        ).toArray((err, docs) => {
          if (err) return res.status(500).send('Error: could not complete your request');
          res.json(docs);
        })
      });
    })
  
    //delete thread
    .delete((req, res) => {
      let board = req.params.board;
      
      let filter = {
        _id: req.query._id,
        delete_password: req.query.delete_password
      };
      
      MongoClient.connect(DATABASE, (err, db) => {
        db.collection(board).findOneAndDelete(filter, (err, doc) => {
          if (err) return res.status(500).send('Error: could not complete your request');
          if (doc.value) res.send('success');
          else res.send('incorrect password');
        });
      });
    })
  
    //report a thread
    .put((req, res) => {
      let board = req.params.board;
    
      let filter = {_id: req.query._id};
    
      MongoClient.connect(DATABASE, (err, db) => {
        db.collection(board).findOneAndUpdate(filter, {$set: {reported: true}}, (err, doc) => {
          if (err) return res.status(500).send('Error: could not complete your request');
          if (doc.value) res.send('success');
          else res.send('invalid _id');
        });
      });
    });
    
  app.route('/api/replies/:board')
  
    //replie to thread
    .post((req, res) => {
      let board = req.params.board;
      let date  = Date.now();
      
      let filter = {_id: req.query.thread_id};
      let data   = {
        _id: shortId(),
        text: req.query.text,
        created_on: date,
        reported: false,
        delete_password: req.query.delete_password
      };
      
      MongoClient.connect(DATABASE, (err, db) => {
        db.collection(board).findOneAndUpdate(filter, 
                                              {$set: {bumped_on: date},
                                               $push: {replies: {$each: [data]}}},
                                              (err, doc) => {
          if (err) return res.status(500).send('Error: could not complete your request');
          if (doc.value) res.redirect(`/b/${board}/${filter._id}`);
          else res.send('invalid thread id');
        });
      });
    })
  
    //get all replies of a thread in a specific board
    .get((req, res) => {
      let board = req.params.board;
      let filter = {
        _id: req.query.thread_id,
        'replies.reported': false
      };
    
      MongoClient.connect(DATABASE, (err, db) => {
        db.collection(board).aggregate(
          [
            {$match: filter},
            {
              $project:
              {
                text: 1,
                created_on: 1,
                bumped_on: 1,
                replies: {_id: 1, text: 1, created_on: 1}
              }
            }
          ],
          (err, doc) => {
            if (err) return res.status(500).send('Error: could not complete your request');
            if (doc[0]) res.json(doc[0]);
            else res.send('invalid thread id');
          });
      });
    })
  
    //report a reply on spacific thread
    .put((req, res) => {
      let board = req.params.board;
      let filter = {
        _id: req.query.thread_id,
        'replies._id': req.query.reply_id
      }
      
      MongoClient.connect(DATABASE, (err, db) => {
        db.collection(board).findOneAndUpdate(filter, {$set: {'replies.0.reported': true}}, (err, doc) => {
          if (err) return res.status(500).send('Error: could not complete your request');
          if (doc.value) res.send('success');
          else res.send('invalid id');
        });
      });
    })
  
    //delete reply
    .delete((req, res) => {
      let board = req.params.board;
      let filter = {
        _id: req.query.thread_id,
        'replies._id': req.query.reply_id,
        'replies.delete_password': req.query.delete_password
      }
      
      MongoClient.connect(DATABASE, (err, db) => {
        db.collection(board).findOneAndUpdate(filter, {$set: {'replies.0.text': 'delete'}}, (err, doc) => {
          if (err) return res.status(500).send('Error: could not complete your request');
          if (doc.value) res.send('success');
          else res.send('incorrect password');
        });
      });
    });

};
