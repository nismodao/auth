var GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy;
var Model            = require( './db/config' );
var clientID         = process.env.GMAIL_CLIENT_ID;
var clientSecret     = process.env.GMAIL_CLIENT_SECRET;

module.exports = {
  google: new GoogleStrategy({
    clientID:     clientID,
    clientSecret: clientSecret,
    callbackURL: process.env.WEBSERVER_URL + '/v1/auth/callback/google',
    passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
      var userId = profile.emails[0].value;
      Model.User.findOrCreate({name: profile.displayName , email: userId, access_token: accessToken, refresh_token: refreshToken},
      (err, user, created) => {
        if (!err) {
          done(err,user,created);
        } else {
          console.log('err is', err);
        }
      }); 
    }
  )
} 


