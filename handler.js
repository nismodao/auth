var Model    = require('./db/config');
var refresh  = require('passport-oauth2-refresh');

module.exports = {
  refresh: (req, res) => {
    var user = req.url.slice(17);
    Model.User.findOne({email: user})
      .then((result) => {
        refresh.requestNewAccessToken('google', result.refresh_token, 
        (err, accessToken, refreshToken) => {
        console.log('refreshtoken', refreshToken);
        console.log('updated accessToken', accessToken);  
        res.json({accessToken: accessToken, refreshToken: refreshToken});
        })
      })
      .catch((err) => {
        console.log('err is', err);
      });
  },
  getProfile: (req, res) => {
    var user = req.url.slice(9);
    Model.User.findOne({email: user})
    .then((result) => {
      console.log('result from get profile', result)
      res.json(result);
    });
  },
  logOut: (req, res) => {
    req.logout();
    res.redirect('/');
  },
  dropTable: () => {
    Model.User.remove(function (err, result) {
      if (err) {
        console.log('err is', err);
      } else {
        console.log('result is', result);
      }
    });
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
