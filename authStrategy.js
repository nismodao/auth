var passport         = require( 'passport' );
var GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy;
var Model            = require( './db/config' );
var clientID         = process.env.GMAIL_CLIENT_ID;
var clientSecret     = process.env.GMAIL_CLIENT_SECRET;

module.exports = {
  google: new GoogleStrategy({
    clientID:     clientID,
    clientSecret: clientSecret,
    callbackURL: process.env.WEBSERVER_URL + 'api/v1/connect/callback/google',
    passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
      var userId = profile.emails[0].value;
      Model.User.findOrCreate({name: profile.displayName , email: userId}, {access_token: accessToken, refresh_token: refreshToken},
      (err, user, created) => {
        if (err) {
          console.log('err is', err);
          done(err, null);
        }
        if (!err) {
          console.log('user is', user);
          console.log('created is', created);
          done(null,user,created);

        } else {

        }
      }); 
    }
  ),
  google_auth: passport.authenticate( 'google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/plus.profile.emails.read'],
     accessType: 'offline',
     prompt: 'consent'
  }),
  google_callback: passport.authenticate( 'google', { 
    successRedirect: '/',
    failureRedirect: '/login'
  }),
  spotify_auth: passport.authenticate( 'spotify', { scope: []
  }),
  spotify_callback: passport.authenticate( 'spotify', { 
    successRedirect: '/',
    failureRedirect: '/login'
  })
    
} 







