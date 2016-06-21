var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/abc');
var findOrCreate = require('mongoose-findorcreate')

var db = mongoose.connection;

db.on('error', function () {
  console.log('db could not connect');
});

db.once('open', function () {
  console.log('connection to db good');
});

var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  email: String,
  access_token: String,
  refresh_token: String
});

userSchema.plugin(findOrCreate);

var User = mongoose.model('User', userSchema);

//module.exports.db = db;

module.exports.User = User;