var express          = require( 'express' )
  , app              = express()
  , request          = require('request')
  , server           = require( 'http' ).createServer( app ) 
  , passport         = require( 'passport' )
  , util             = require( 'util' )
  , bodyParser       = require( 'body-parser' )
  , cookieParser     = require( 'cookie-parser' )
  , session          = require( 'express-session' )
  , RedisStore       = require( 'connect-redis' )( session )
  , GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy
  , googleKey = require('./keyConfig');

var GOOGLE_CLIENT_ID      = googleKey.clientID
  , GOOGLE_CLIENT_SECRET  = googleKey.clientSecret;


var ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var currentTopic = 'projects/adryft-1345/topics/nismo';

var connect = (userId, auth, topic) => {
  request({
    url: 'https://www.googleapis.com/gmail/v1/users/' + userId + '/watch',
    headers: {
   'content-type': 'application/json',
   'Authorization': 'Bearer '+ auth
   },
    method: 'POST',
    json: {topicName: topic} 
  }, (error, response, body) => {
    if (error) {
        console.log("error is", error);
    } else {
        console.log(response.statusCode, body);
    }
  }); 
}

var user = {};
passport.use(new GoogleStrategy({
  clientID:     GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://fuf.me:3000/auth/google/callback",
  passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      console.log('at is', accessToken, 'rt is', refreshToken);
      console.log('profile is', profile.emails[0].value);
      user.accessToken = accessToken;
      user.id = profile.emails[0].value; 
      connect(user.id, user.accessToken, currentTopic);
      return done(null, profile);
    });
  }
));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use( express.static(__dirname + '/public'));
app.use( cookieParser()); 
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
  extended: true
}));
app.use( session({ 
  secret: 'cookie_secret',
  name:   'kaas',
  store:  new RedisStore({
    host: '127.0.0.1',
    port: 6379
  }),
  proxy:  true,
    resave: true,
    saveUninitialized: true
}));
app.use( passport.initialize());
app.use( passport.session());

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', passport.authenticate('google', { scope: [
  'https://www.googleapis.com/auth/plus.login',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/plus.profile.emails.read',
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/pubsub'],
  accessType: 'offline'
}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
  passport.authenticate( 'google', { 
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

server.listen( 3000 );





