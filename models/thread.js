const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadSchema = new Schema({
  text: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  delete_password: String,
  replies:[
    {
      type:Schema.Types.ObjectId,
      ref: 'Reply',
      // this should make our autopopulate plugin populate the fields by bumped_on date
      autopopulate:{ sort: [['created_on', -1 ]] }
    }
  ]
});

// threadSchema.pre('save',()=>{

//     //it is much more useful to save Date as string
//     this.created_on = new Date().toISOString();
  
//     this.reported=false;

//     this.replies=[];
  
//   this.bumped_on = new Date().toISOString();

// })

threadSchema.plugin(require('mongoose-autopopulate'));
const Thread = mongoose.model('Thread',threadSchema);

module.exports = Thread;
