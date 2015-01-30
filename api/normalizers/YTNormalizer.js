'use strict';

/*global global*/

var https = require('https');
var _ = require('lodash');

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
    pageToken: '',
    terms: '',
    items: []
  };
  var part = 'part=+id%2C+snippet%2C+contentDetails%2C+statistics';
  var channelFilter = 'forUsername=' + store.channelName;
  options.terms = part + '&' + channelFilter;
  ytCall(store, options, callback);
};

module.exports.getChannelsById = function(store, callback){
  var options = {
    path: 'channels?',
    pageToken: '',
    terms: '',
    items: []
  };
  var part = 'part=+id%2C+snippet%2C+contentDetails%2C+statistics';
  var channelFilter = 'id=' + store.id;
  options.terms = part + '&' + channelFilter;
  ytCall(store, options, callback);
};

module.exports.getActivitiesByChannelId = function(store, callback){
  var options = {
    path: 'channels?',
    pageToken: '',
    terms: '',
    items: []
  };
  var part = 'part=id%2C+snippet%2C+contentDetails';
  var activityFilter = 'channelId=' + store.channelId;
  options.terms = part + '&' + activityFilter;
  ytCall(store, options, callback);
};

module.exports.searchVideosByChannelId = function(store, callback){
  var options = {
    path: 'search?',
    pageToken: '',
    terms: '',
    items: []
  };
  var part = 'part=id%2Csnippet';
  var searchFilter = 'channelId=' + store.channelId;
  var properties = '&maxResults=50&order=date&type=video';
  options.terms = part + '&' + searchFilter + properties;
  ytCall(store, options, callback);
}

module.exports.getVideoById = function(store, callback){
  var options = {
    path: 'videos?',
    pageToken: '',
    terms: '',
    items: []
  };
  var part = 'part=id%2C+snippet%2C+contentDetails%2C+statistics%2C+status';
  var searchFilter = 'id=' + store.videoId;
  options.terms = part + '&' + searchFilter;
  ytCall(store, options, callback);
}

function ytCall(store, options, callback){
  ytReqOptions.path = ytBasePath + options.path + options.terms +
    '&key=' + global.ytKey + options.pageToken;
  //console.dir(ytReqOptions);
  var ytReq = https.request(ytReqOptions, function(res){
    var concatRes = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){
      concatRes += chunk;
    });
    res.on('end', function(){
      var parsedRes = JSON.parse(concatRes);
      if(store.deepSearch === true && parsedRes.nextPageToken){
        //doing recursive search and last hit still had another page
        options.pageToken = parsedRes.nextPageToken ?
          ('&pageToken=' + parsedRes.nextPageToken) : '';
        //if first iteration, stored returned values in
          //options.items, otherwise add to array
        _.forEach(parsedRes.items, function(item){
          options.items.push(item);
        });
        ytCall(store, options, callback);
      } else {
        //if first iteration, stored returned values in
          //store.items, otherwise add to array
        _.forEach(parsedRes.items, function(item){
          options.items.push(item);
        });
        //console.log(options.items);
        callback(null, options.items);
      }
    });
  });

  ytReq.on('error', function(err){
    console.error(err);
    callback(err, null);
  });

  ytReq.end();
}
