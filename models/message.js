// import mongoose lib
const mongoose = require('mongoose');

// init message Schema
const messageSchema = new mongoose.Schema({
  username: String,
  content: String,
  likes: Number,
  date: String,
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  type: String,
});

// export message Model
module.exports = mongoose.model('Message', messageSchema);
