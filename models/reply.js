const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema({
  thread:{type: Schema.Types.ObjectId,ref:'Thread'},
  text: String,
  created_on: Date,
  reported: Boolean,
  delete_password: String
});


const Reply = mongoose.model('Reply',replySchema);

module.exports = Reply;