var Model    = require('./db/config');
var refresh  = require('passport-oauth2-refresh');

module.exports = {
  refresh: (req, res) => {
    var id = req.params.userId;
    Model.User.findOne({_id: id})
      .then((result) => {
        refresh.requestNewAccessToken('google', result.refresh_token, 
        (err, accessToken, refreshToken) => {  
        res.json({accessToken: accessToken});
        })
      })
      .catch((err) => {
        res.send('no token available');
      });
  },
  getUsers: (req, res) => {
    var users = [];
    Model.User.find({})
    .then((result) => {
      result.forEach((value) => {
        if (!!value.refresh_token) users.push(value._id);
      });
      res.json(users);
    })
    .catch((err) => {
      res.send('err in finding user');
    });
  },
  logOut: (req, res) => {
    // req.logout();
    req.session.destroy(() => {
      res.redirect('/');
    });
  },
  dropTable: (req, res) => {
    Model.User.remove(function (err, result) {
      if (err) {
        console.log('err is', err);
      } else {
        console.log('result is', result);
      }
    });
    res.send('table dropped');
  }
}
