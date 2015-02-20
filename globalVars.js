'use strict';

var GlobalVars = require('./api/models/GlobalVars');

module.exports = function(global, callback){
  console.log('getting globals');
  if(!global){
    console.error('no global var found, exiting');
    process.exit();
  }
  GlobalVars.find({}, function(err, data){
    // console.log(err, data);
    if(err){
      console.error('global vars not found in db, exiting');
      process.exit();
    }
    if(!data || data.length < 1){
      console.error('global data was empty, exiting');
      process.exit();
    }
    console.log('global var successfully pulled from db');
    global.sessionSecret = data[0].sessionSecret;
    global.userId = data[0].userId;
    global.port = data[0].port;
    global.ytKey = data[0].ytKey;

    callback();
  });
};
