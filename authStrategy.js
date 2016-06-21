var GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy;
var googleKey        = require( './keyConfig' );
var Model            = require( './db/config' );
module.exports = {
  google: new GoogleStrategy({
    clientID:     googleKey.clientID,
    clientSecret: googleKey.clientSecret,
    callbackURL: "https://adryftnismo.herokuapp.com/auth/google/callback",
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


