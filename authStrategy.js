var GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy;
var googleKey        = require('./keyConfig');

module.exports = {
  google: new GoogleStrategy({
    clientID:     googleKey.clientID,
    clientSecret: googleKey.clientSecret,
    callbackURL: "http://fuf.me:3000/auth/google/callback",
    passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
      var userId = profile.emails[0].value;
      Model.User.findOrCreate({name: profile.displayName , email: userId, access_token: accessToken, refresh_token: refreshToken},
      (err, user, created) => {
        if (!err) {
          console.log('user is', user);
          console.log('created is', created);
          done(err,user,created);
        }
      }); 
    }
  )
} 