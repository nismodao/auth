var express          = require( 'express' )
  , app              = express()
  , request          = require('request')
  , mongoose         = require('mongoose')
  , Model            = require('./db/config')
  , server           = require( 'http' ).createServer( app ) 
  , passport         = require( 'passport' )
  , refresh          = require('passport-oauth2-refresh')
  , util             = require( 'util' )
  , bodyParser       = require( 'body-parser' )
  , cookieParser     = require( 'cookie-parser' )
  , session          = require( 'express-session' )
  , RedisStore       = require( 'connect-redis' )( session )
  , GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy
  , googleKey        = require('./keyConfig')
  , handler          = require('./handler')
  , strategy         = require('./authStrategy');

var ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});



var strategy = strategy.google;
passport.use(strategy);
refresh.use(strategy);

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

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});


app.get('/auth/google', passport.authenticate('google', { scope: [
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/plus.profile.emails.read'],
   accessType: 'offline',
   prompt: 'consent'
}));

app.get('/auth/google/callback', 
  passport.authenticate( 'google', { 
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/logout', handler.logOut);
app.get('/profile/refresh/:email', handler.refresh);
app.get('/profile/:email', handler.getProfile);

server.listen( 3000 );





