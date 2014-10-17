'use strict';

var GlobalVars = require('../../models/GlobalVars');
var mongoose = require('mongoose');

var env = process.argv[2];
var userId = process.argv[3];
var port = process.argv[4];
var sessionSecret = process.argv[5];
var ytKey = process.argv[6];

if(!env){
  console.log('env userId port sessoinSecret ytKey');
  console.error('environment was not supplied');
  process.exit();
}
if(!userId) {
  console.log('env userId port sessoinSecret ytKey');
  console.error('user id was not supplied');
  process.exit();
}
if(!port){
  console.log('env userId port sessoinSecret ytKey');
  console.error('port was not supplied');
  process.exit();
}
if(!sessionSecret){
  console.log('env userId port sessoinSecret ytKey');
  console.error('session secret was not supplied');
  process.exit();
}
if(!ytKey){
  console.log('env userId port sessoinSecret ytKey');
  console.error('youtube API key was not supplied');
  process.exit();
}

if(env === 'test'){
  console.log('running in test environment');
  mongoose.connect('mongodb://localhost/education-test');
} else if(env === 'dev') {
  console.log('running in development environment');
  mongoose.connect('mongodb://localhost/education-dev');
} else if(env === 'prod'){
  console.log('running in production environment');
  mongoose.connect('mongodb://localhost/education-prod');
}

var globalVars = new GlobalVars({
  userId: userId,
  port: port,
  sessionSecret: sessionSecret,
  ytKey: ytKey
});

globalVars.save(function(err, savedGlobal){
  if(err){
    console.dir(err);
    mongoose.disconnect();
  }else{
    console.dir(savedGlobal);
    mongoose.disconnect();
  }
});
