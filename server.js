var express          = require( 'express' )
  , app              = express()
  , Model            = require( './db/config' )
  , server           = require( 'http' ).createServer( app )
  , passport         = require( 'passport' )
  , refresh          = require( 'passport-oauth2-refresh')
  , bodyParser       = require( 'body-parser' )
  , cookieParser     = require( 'cookie-parser' )
  , session          = require( 'express-session' )
  , RedisStore       = require( 'connect-redis' )( session )
  , handler          = require( './handler')
  , strategy         = require( './authStrategy');
require('dotenv').config();

 
var strategy = strategy.google;
passport.use(strategy);
refresh.use(strategy);
var PORT = process.env.PORT || 3000;
app.set( 'views', __dirname + '/views');
app.set( 'view engine', 'ejs');
app.use( express.static(__dirname + '/public'));

app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
  extended: true
}));

app.use( cookieParser('cookie_secret'));
app.use( session({
  secret: 'cookie_secret',
  name:   'newreactions',
  resave: false,
  saveUninitialized: false,
  store:  new RedisStore({
    host: 'localhost',
    port: 6379
  })
}));

app.use( passport.initialize());
app.use( passport.session());


var ensureAuthenticated = ( req, res, next ) => {
  console.log('req.session', req.session);
  if (req.isAuthenticated()) {
   return next();
 }
  res.redirect('/login');
};

passport.serializeUser(function(user, done) {
  console.log('user.id from serializeUser is', user._id);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Model.User.findById(id, function(err, user) {
    console.log('user from deserializeUser is', user);
    done(err, user);
  });
});

app.get('/', (req, res) => {
  console.log('req.user is', req.user);
  console.log('req.session', req.session);
  console.log('req.sessioID is', req.sessionID);
  console.log('req.isAuthenticated is', req.isAuthenticated());

  if (!req.session.key) console.log('req.session.key not defined');
  if (!!req.user) req.session.key = req.user.name;
  if(req.session.key) console.log('req.session.key is defined - user has access to / page', req.session.key);
  res.render('index', { user: req.user});
});


app.get('/account', ensureAuthenticated, (req, res) => {
  console.log('req.user is', req.user);
  console.log('req.isAuthenticated is', req.isAuthenticated());
  if(req.session.key) console.log('req.session.key is defined user to / account', req.session.key);
  res.render('account', { user: req.user });
});

app.get('/abc', (req, res) => {
  if(req.session.key) {
  console.log('req.session.key is defined user to /abc page', req.session.key);
  res.send('you are authenticated');
  } else {
    res.send('no access');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

app.get('/connect/google', passport.authenticate( 'google', { scope: [
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/plus.profile.emails.read'],
   accessType: 'offline',
   prompt: 'consent'
}));


app.get('/api/v1/auth/connect/callback/google', passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/account');
});

app.get('/logout', handler.logOut);
app.get('/token/gmail/:userId', handler.refresh);
app.get('/connected/gmail', handler.getUsers);
app.get('/dropTable', handler.dropTable);

server.listen( PORT );
console.log('listening on PORT', PORT);





