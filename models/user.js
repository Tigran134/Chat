// import mongoose lib
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')
// init user Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name : String, 
  vkontakteId:  String ,
  photo :  String ,
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.plugin(findOrCreate)

// export user model
module.exports = mongoose.model('User', userSchema);
