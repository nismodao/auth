var Model    = require('./db/config');
var refresh  = require('passport-oauth2-refresh');

module.exports = {
  refresh: (req, res) => {
    var id = req.url.slice(7);
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
    req.logout();
    res.redirect('/');
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


// connect: (userId, auth, topic) => {
//     request({
//       url: 'https://www.googleapis.com/gmail/v1/users/' + userId + '/watch',
//       headers: {
//      'content-type': 'application/json',
//      'Authorization': 'Bearer '+ auth
//      },
//       method: 'POST',
//       json: {topicName: topic} 
//     }, (error, response, body) => {
//       if (error) {
//           console.log("error is", error);
//       } else {
//           console.log(response.statusCode, body);
//       }
//     }); 
//   }  
