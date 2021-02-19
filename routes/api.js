'use strict';
const Thread = require('../models/thread');
const Reply = require('../models/reply');

module.exports = function (app) {
  app
    .route('/api/threads/:board')
    .get(async (req, res) => {
      let threads = await Thread.find({})
        .sort({ bumped_on: -1 })
        .limit(10)
        .exec();

      for (let key in threads) {
        threads[key].delete_password = undefined;
        threads[key].reported = undefined;
        threads[key].replies = threads[key].replies.slice(0, 2);
        threads[key].replies.map((repl) => {
          repl.reported = undefined;
          repl.delete_password = undefined;
        });
      }

      res.send({ threads });
    })
    .post(async (req, res) => {
      let { text, delete_password } = req.body;
      let thread = await new Thread({
        text: text,
        delete_password: delete_password,
        created_on: new Date().toISOString(),
        bumped_on: new Date().toISOString(),
        reported: false,
        replies: [],
      });

      await thread.save(function (err) {
        if (err) return console.log(err);
      });

      res.send({ thread_id: thread._id });
    })
    .delete(async (req, res) => {
      let { thread_id, delete_password } = req.body;
      let thread = await Thread.findOne({ _id: thread_id }).exec();
      if (delete_password === thread.delete_password) {
        await Thread.deleteOne({ _id: thread_id }, function (err) {
          if (err) return handleError(err);
        });
        return res.send('success');
      }
      res.send('incorrect password');
    })
    .put(async (req, res) => {
      let { thread_id } = req.body;
      // The reported value of the thread_id will be changed to true.
      let thread = await Thread.findOneAndUpdate(
        { _id: thread_id },
        { reported: true },
        { new: true }
      ).exec();
      console.log(thread);
      res.send('success');
    });

  app
    .route('/api/replies/:board')
    .get(async (req, res) => {
      let { thread_id } = req.query;
      let thread = await Thread.findOne({ _id: thread_id }).exec();
      thread.delete_password = undefined;
      thread.reported = undefined;
      thread.replies.map((repl) => {
        repl.delete_password = undefined;
        repl.reported = undefined;
      });

      res.send({ thread });
    })
    .post(async (req, res) => {
      let { text, delete_password, thread_id } = req.body;

      let reply = await new Reply({
        text: text,
        delete_password: delete_password,
        created_on: new Date().toISOString(),
        thread: thread_id,
        reported: false,
      });

      await reply.save(function (err) {
        if (err) return console.log(err);
      });

      let thread = await Thread.findOne({ _id: thread_id }).exec();
      thread.replies.push(reply);
      thread.bumped_on = await reply.created_on;

      await thread.save(function (err) {
        if (err) return console.log(err);
      });

      res.send({ reply_id: reply._id });
    })
    .delete(async (req, res) => {
      let deleted = false;
      let index;
      let { thread_id, reply_id, delete_password } = req.body;
      let thread = await Thread.findOne({ _id: thread_id }).exec();
      thread.replies.forEach((repl, i) => {
        if (repl._id.toString() === reply_id) {
          if (repl.delete_password === delete_password) {
            // we get the index location of the array property we want to delete
            // we cannot delete here because forEach function doesn't allow modification of object properties
            index = i;
            deleted = true;
          }
        }
      });

      if (deleted) {
        // findOneAndUpdate doesn't update if there are duplicate ids!! becareful
        let reply = await Reply.findOneAndUpdate(
          { _id: reply_id },
          { text: '[deleted]' },
          { new: true }
        ).exec();
        console.log(reply);
        // await reply.save(function (err) {
        //   if (err) return console.log(err);
        // });
        return res.send('success');
      }

      res.send('incorrect password');
    })
    .put(async (req, res) => {
      let { thread_id, reply_id } = req.body;
      // The reported value of the thread_id will be changed to true.
      let reply = await Reply.findOneAndUpdate(
        { _id: reply_id },
        { reported: true },
        { new: true }
      ).exec();
      console.log(reply);
      res.send('success');
    });
};