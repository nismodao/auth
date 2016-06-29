var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var findOrCreate = require('mongoose-findorcreate');
require('dotenv').config();

var MONGODB_URI = process.env.MONGODB_URI;
var db;


mongoose.connect(MONGODB_URI, 
  function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  } else {
  db = database;
  console.log("Database connection ready");
  }
});

  // Save database object from the callback for reuse.

var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  email: String,
  access_token: String,
  refresh_token: String
});

userSchema.plugin(findOrCreate);

var User = mongoose.model('User', userSchema);

module.exports.User = User;