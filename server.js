var express          = require( 'express' )
  , app              = express()
  , redis            = require('redis')
  , client           = redis.createClient()
  , request          = require( 'request' )
  , mongoose         = require( 'mongoose' )
  , Model            = require( './db/config' )
  , server           = require( 'http' ).createServer( app ) 
  , passport         = require( 'passport' )
  , refresh          = require( 'passport-oauth2-refresh')
  , util             = require( 'util' )
  , bodyParser       = require( 'body-parser' )
  , cookieParser     = require( 'cookie-parser' )
  , session          = require( 'express-session' )
  , RedisStore       = require( 'connect-redis' )( session )
  , GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy
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

app.use( session({ 
  secret: 'cookie_secret',
  name:   'newreactions',
  resave: false,
  saveUninitialized: false,
  store:  new RedisStore({
    host: 'redis',
    port: 6379,
    client: client
  })
}));

app.use( cookieParser()); 

app.use( passport.initialize());
app.use( passport.session());

var ensureAuthenticated = ( req, res, next ) => {
  console.log('req.session', req.session);
  if (req.isAuthenticated()) {
   return next(); 
 }
  res.redirect('/login');
};

passport.serializeUser( (user, done) => {
  console.log('user from serializeUser is', user);
  done(null, {id: user._id, name: user.name});
});

passport.deserializeUser( (obj, done) => {
  console.log('object form deserializeUser is', obj);
  client.get(obj.name, (err, result) => {
    if (!err) {
      console.log('result is from deserializeUser', result);
      done(null, obj);
    }
  });
})


app.get('/', (req, res) => {
  console.log('req.user is', req.user);
  if (!req.session.key) console.log('req.session.key not defined');
  if (!!req.user) req.session.key = req.user.name;
  if(req.session.key) console.log('req.session.key is defined - user has access to / page', req.session.key);
  res.render('index', { user: req.user});
});


app.get('/account', ensureAuthenticated, (req, res) => {
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


app.get('/connect/callback/google', passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
}); 

app.get('/logout', handler.logOut);
app.get('/token/gmail/:userId', handler.refresh);
app.get('/connected/gmail', handler.getUsers);
app.get('/dropTable', handler.dropTable);

server.listen( PORT );
console.log('listening on PORT', PORT);





