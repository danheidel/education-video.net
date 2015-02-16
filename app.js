'use strict';

var globalVars = require('./globalVars');
var deEscalate = require('./api/security/deEscalate');
var express = require('express');
var app = express();
var async = require('async');
var cons = require('consolidate');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
require('./api/security/passport')(passport);
var flash = require('connect-flash');
var routeGenerator = require('./api/routes/routeGenerator');
var routeFactory = require('./api/routes/routeGenerator').routeFactory;
var securityFuncs = require('./api/routes/securityFuncs');
var handlerFuncs = require('./api/routes/handlerFuncs');
var errorHandler = require('errorhandler');
// var logger = require('morgan');
var mongoose = require('mongoose');

global.globals = {};
var mongoIP;
if(process.env.MONGO_PORT_27017_TCP_ADDR){
  mongoIP = process.env.MONGO_PORT_27017_TCP_ADDR;
  console.log('mongo docker container address: ' + mongoIP);
} else {
  mongoIP = 'localhost';
  console.log('no docker container linking detected, using port 27017 default');
}
var env = process.env.NODE_ENV || process.argv[2] || 'test';
console.log('specified environment: ' + env);

async.series([
  setEnv,
  globalVars.bind(null, globals),
  function(callback){
    console.dir(globals);
    callback();
  },
  deEscalate.bind(null, globals),
  setupExpress,
  setupRoutes,
  startServer
], function(err){
  if(err){
    console.error(err);
  }else{
    console.log('setup done');
  }
});

process.on('exit', function(code){
  console.log(code);
  console.log('shutting down server');
  server.close();
  console.log('closed port');
  mongoose.disconnect();
  console.log('disconnected mongodb');
  console.log('preparing to exit with code: ' + code);
});

process.on('uncaughtException', function (err) {
  console.log('uncaught exception');
  console.log(err);
});

function setEnv(callback){
  if(env === 'test'){
    console.log('running in test environment');
    mongoose.connect('mongodb://' + mongoIP + '/education-test');
  } else if(env === 'dev') {
    console.log('running in development environment');
    mongoose.connect('mongodb://' + mongoIP + '/education-dev');
  } else if(env === 'prod'){
    console.log('running in production environment');
    mongoose.connect('mongodb://' + mongoIP + '/education-prod');
  } else {
    console.error('Invalid environment selected');
    process.exit();
  }
  var conn = mongoose.connection;

  conn.on('open', function(){
    console.log('connection opened');
    callback();
  });
}

function setupExpress(callback){
  app.engine('hbs', cons.handlebars);
  app.set('view engine', 'hbs');
  app.set('views', __dirname + '/site/templates');

  //all env
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(cookieParser());
  app.use(express.static(__dirname + '/site/static'));
  app.use(express.static(__dirname + '/site/js'));
  app.use(express.static(__dirname + '/site/templates'));
  app.use(express.static(__dirname + '/bower_components'));

  console.log('specified session secret: ' + globals.sessionSecret);
  app.use(expressSession({secret: globals.sessionSecret}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  if(env === 'production'){
  } else if(env === 'development'){
    app.use(errorHandler());
    // app.use(logger());
  } else if(env === 'test'){
    app.use(errorHandler());
    // app.use(logger());
  }
  console.log('express setup finished');
  callback();
}

function setupRoutes(callback){

  routeFactory('/api/v1/creators', '../models/Creator', app, {
    securityFunc: securityFuncs.creatorSecurity
  });

  routeFactory('/api/v1/tags', '../models/Tag', app, {
    securityFunc: securityFuncs.tagSecurity
  });

  routeFactory('/api/v1/ytchannels', '../models/YTChannel', app, {
    securityFunc: securityFuncs.ytChannelSecurity
  });

  routeFactory('/api/v1/channels', '../models/Channel', app, {
    securityFunc: securityFuncs.channelSecurity,
    populate: ['_creators', '_tags', '_ytchannels', 'ytplaylists']
  });

  routeFactory('/api/v1/stubchannels', '../models/Channel', app, {
    securityFunc: securityFuncs.channelSecurity,
    populate: ['_creators', '_tags']
  });

  routeFactory('/api/v1/users', '../models/User', app, {
    securityFunc: securityFuncs.userSecurity,
    handleCreate: handlerFuncs.createUser,
    handleUpdate: handlerFuncs.updateUser,
    handleGet: handlerFuncs.getUser
  });

  //sets up log-in/account sign-up route handlers
  require('./api/security/loginRoutes.js')(app, passport);
  console.log('routes set up');
  callback();
}

function startServer(callback){
  if(!globals.port){
    console.error('no port provided, exiting');
    process.exit();
  }
  var server = app.listen(globals.port, function(){
    console.log('serving on port: ' + globals.port);
  });
  console.log('server started');
  callback();
}
