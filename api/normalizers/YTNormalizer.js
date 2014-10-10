'use strict';

/*global global*/

var https = require('https');

var ytReqOptions = {
  hostname: 'www.googleapis.com',
  port: 443,
  path: '',
  method: 'GET'
};
var ytBasePath = '/youtube/v3/';

module.exports.getChannelsByName = function(store, callback){
  var options = {
    path: 'channels?',
    terms:''
  };
  var part = 'part=+id%2C+snippet%2C+contentDetails%2C+statistics';
  var channelFilter = 'forUsername=' + store.channelName;
  options.terms = part + '&' + channelFilter;
  ytCall(store, options, callback);
};

module.exports.getChannelsById = function(store, callback){
  var options = {
    path: 'channels?',
    terms: ''
  };
  var part = 'part=+id%2C+snippet%2C+contentDetails%2C+statistics';
  var channelFilter = 'id=' + store.id;
  options.terms = part + '&' + channelFilter;
  ytCall(store, options, callback);
};

function ytCall(store, options, callback){
  ytReqOptions.path = ytBasePath + options.path + options.terms + '&key=' + global.ytKey;
  //console.dir(ytReqOptions);
  var ytReq = https.request(ytReqOptions, function(res){
    var concatRes = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){
      concatRes += chunk;
    });
    res.on('end', function(){
      callback(null, JSON.parse(concatRes));
    });
  });

  ytReq.on('error', function(err){
    console.error(err);
    callback(err, null);
  });

  ytReq.end();
}
