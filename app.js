'use strict';

var express = require('express');
var app = express();
var cons = require('consolidate');
//var path = require('path');
var http = require('http');
var passport = require('passport');
var flash = require('connect-flash');
var mongoose = require('mongoose');

var user, port;

startup();

app.engine('hbs', cons.handlebars);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/site/templates');

app.configure(function(){
  //app.use(express.bodyParser());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.cookieParser());
  app.use(express.static(__dirname + '/site/static'));

  var sessionSecret = process.env.OAA_SESSION_SECRET || 'nokey';
  app.use(express.session({secret: sessionSecret}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.logger());
  mongoose.connect('mongodb://localhost/education-dev');
});

app.configure('test', function(){
  mongoose.connect('mongodb://localhost/education-test');
});

//sets up log-in/account sign-up route handlers
require('./site/js/routes/loginRoutes.js')(app, passport);

//DRYing router code for common routes
function baseRoutes(route, data){
  app.get('/api/v1/' + route, data.collection);
  app.get('/api/v1/'+ route, data.findById);
  app.post('/api.v1/' + route, data.create);
  app.put('/api/v1/' + route, data.update);
  app.delete('/api/v1/' + route, data.destroy);
}

var users = require ('./api/routes/userRoutes');
baseRoutes('users', users);

var channels = require('./api/routes/channelRoutes');
baseRoutes('channels', channels);

var creators = require('./api/routes/creatorRoutes');
baseRoutes('creators', creators);


var server  = http.createServer(app);

server.listen(port, function(){
  console.log('serving on port: ' + port);
});

function startup(){
  console.log('starting as user: ' + process.env.USER);

  user = parseInt(process.env.NODEUSERID) || parseInt(process.argv[2]);
  if(!user){
    console.error('no user specified, exiting');
    process.exit();
  }

  //attempt to de-escalate user permissions
  try {
    process.setgid(user);
    process.setuid(user);
  } catch (e) {
    console.error('problem setting user/group, exiting');
    console.dir(e);
    process.exit();
  }
  console.log('user changed to: ' + user);

  port = parseInt(process.env.NODESERVERPORT) || parseInt(process.argv[3]);
  if(!port){
    console.error('no port defined, exiting');
    process.exit();
  }
}
