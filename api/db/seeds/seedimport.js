'use strict';

var fs = require('fs');
//var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var globalVars = require('../../../globalVars');
var getChannelsByName = require('../../normalizers/YTNormalizer.js').getChannelsByName;
var getChannelsById = require('../../normalizers/YTNormalizer.js').getChannelsById;
var searchVideosByChannelId =
  require('../../normalizers/YTNormalizer.js').searchVideosByChannelId;
var getVideoById = require('../../normalizers/YTNormalizer').getVideoById;
var mode = process.argv[2];
var displayName = process.argv[3];
var email = process.argv[4];
var password = process.argv[5];
global = {};

//if no mode selected, exit
if(!mode) {
  console.log('no mode selected, exiting');
  process.exit();
}

switch(mode){
  case 'test' : mongoose.connect('mongodb://localhost/education-test');
  break;
  case 'dev' : mongoose.connect('mongodb://localhost/education-dev');
  break;
  case 'dev' : mongoose.connect('mongodb://localhost/education-prod');
  break;
}

var Channel = require('../../models/Channel');
var Creator = require('../../models/Creator');
var Tag = require('../../models/Tag');
var User = require('../../models/User');
var YTChannel = require('../../models/YTChannel')
var YTVideo = require('../../models/YTVideo');

var channels = JSON.parse(fs.readFileSync('channels.json'));
var creators = JSON.parse(fs.readFileSync('creators.json'));
var tags = JSON.parse(fs.readFileSync('tags.json'));

var usersDone = 0;
var creatorsDone = 0;
var tagsDone = 0;
var channelsDone = 0;

var tagsIDs = [];
var creatorsIDs = [];
var ytChannels = [];
var tempUser, user1, user2, admin, nobody;

deleteCollections(['channels', 'creators', 'tags', 'ytchannels', 'ytvideos', 'users']);

function deleteCollections(collectionList){

  async.each(collectionList, function(collection, callback){
    console.log('dropping ' + collection);
    mongoose.connection.collections[collection]
      .drop(function(err){
        if(err){
          console.log('error dropping ' + collection);
          console.log(err);
          callback();
        } else {
          console.log('dropped' + collection);
          callback();
        }
      })
  }, function(err){
    if(err){
      console.log(err);
      process.exit();
    }
    console.log('deleted collections');

    globalVars(global, function(){
      console.log('done geting globals');
      if(mode === 'test') {
        //if in test mode, populate test users, otherwise just import seed data
        makeTestUsers();
      } else {
        makeNonTestUsers();
      }
    });
  });
}

function makeTestUsers(){
  //create some users to test security model
  var users = [{
    displayName: 'Admin',
    varName: 'admin',
    email: 'bamf@bar.com',
    permissions: 'admin',
    password: 'admin'
  }, {
    displayName:'User1',
    varName: 'user1',
    email:'foo@bar.com',
    permissions:'user',
    password:'user1'
  }, {
    displayName:'User2',
    varName: 'user2',
    email:'schmoo@bar.com',
    permissions:'user',
    password:'user2'
  }, {
    displayName:'Nobody',
    varName: 'nobody',
    email:'bluh@bar.com',
    permissions:'test',
    password:'nobody'
  }];
  async.each(users, function(user, callback){
    console.log('creating test user: ' + user.displayName);
    tempUser = new User({
      displayName: user.displayName,
      local: {
        email: user.email,
        permissions: user.permissions
      }
    });
    tempUser.local.password = tempUser.generateHash(user.password);

    tempUser.save(function(err, retObject){
      if(err){
        console.error(err);
        callback(err);
      } else {
        global[user.varName] = retObject._id;
        callback();
      }
    });
  }, function(err){
    if(err){
      console.log(err);
      process.exit();
    }
    console.log('test users created');
    popChildren();
  });
}

function makeNonTestUsers(){
  //create admin user account
  if(!displayName || !email || !password){
    console.log('non test setup requires format:')
    console.log('node seedimport.js (dev/prod) displayName email password');
    process.exit();
  }

  console.log('creating admin user: ' + displayName);
  tempUser = new User({
    displayName: displayName,
    local: {
      email: email,
      permissions: 'admin'
    }
  });
  tempUser.local.password = tempUser.generateHash(password);

  tempUser.save(function(err, retObject){
    if(err){
      console.error(err);
      process.exit();
    } else {
      admin = retObject._id;
      console.log('test users created');
      popChildren();
    }
  });
}

function popChildren(){
  console.log('populating creators');
  for(var rep=0;rep<creators.length;rep++){
    creators[rep].local = {};
    creators[rep].local.owner = admin;

    var tempCreator = new Creator(creators[rep]);
    (function(rep){
      console.log('creator: ' + tempCreator.name);
      tempCreator.save(function(err, saved){
        if(err){
          console.error(err);
          process.exit();
        }
        creatorsIDs[creators[rep].id] = saved._id;
        creatorsDone ++;
        creatorsTagsDone();
      });
    })(rep);
  }

  for(var rep=0;rep<tags.length;rep++){
    tags[rep].local = {};
    tags[rep].local.owner = admin;
    var tempTag = new Tag(tags[rep]);
    tempTag.category = 'Subject';
    (function(rep){
      tempTag.save(function(err, saved){
        if(err){
          console.error(err);
          process.exit();
        }
        tagsIDs[tags[rep].id] = saved._id;
        tagsDone ++;
        creatorsTagsDone();
      });
    })(rep);
  }
}

function creatorsTagsDone(){
  console.log('creators: '+ creatorsDone);
  console.log('tags: ' + tagsDone);
  if(creatorsDone >= creators.length && tagsDone >= tags.length){
    console.log('done with tags and creators!');
    //mongoose.disconnect();
    ytChannelImport();
  }
}

function ytChannelImport(){
  console.log(channels.length);
  async.each(channels, function(channel, callback){
    console.log('getting data for channel: ' + channel.name);
    var ytChannelName = channel.location.split('/').pop();
    var channelId;
    if(channel.id){
      channelId = channel.id;
    }
    getChannels(ytChannelName, channelId, channel.name, channel.location, callback);
  }, function(err){
    if(err){
      console.error(err);
    } else {
      console.log('done importing youtube channels');
      //console.dir(ytChannels);
      populateVideos();
    }
  });
}

function getChannels(ytChannelName, channelId, name, location, callback){
  console.log('getting ytchannel data for: ' + ytChannelName);
  var ytFunc, searchTerm;
  if(channelId){
    ytFunc = getChannelsById;
    searchTerm = {id: channelId};
  } else {
    ytFunc = getChannelsByName;
    searchTerm = {channelName: ytChannelName};
  }
  ytFunc(searchTerm, function(err, data){
    if(err){
      callback(err);
    } else if(data.length > 0){
      var tempYT = new YTChannel({
        youtubeChannelId: data[0].id,
        location: location,
        title: data[0].snippet.title,
        started: data[0].snippet.publishedAt,
        thumbnail: data[0].snippet.thumbnails.medium.url,
        description: data[0].snippet.description,
        viewCount: data[0].statistics.viewCount,
        commentCount: data[0].statistics.commentCount,
        subscriberCount:
          data[0].hiddenSubscriberCount ? 0 : data[0].statistics.subscriberCount,
        videoCount: data[0].statistics.videoCount,
        uploadPlaylist: data[0].contentDetails.relatedPlaylists.uploads,
        videos:[],
        local:{
          owner: admin
        }
      });
      getVideos(tempYT, function(){
        tempYT.save(function(err, saved){
          if(err){
            console.log('error getting videos for: ' + tempYT.title);
            console.log(err);
            callback(err);
          }else{
            console.log(name + ' ytchannel saved');
            console.log(tempYT._videos.length + ' videos');
            ytChannels[name] = saved;
            callback();
          }
        });
      });
    } else {
      console.log('no data returned for: ' + ytChannelName + ', retrying');
      getChannels(ytChannelName, channelId, name, location, callback);
    }
  })
}

function getVideos(tempYT, videoCallback){
  console.log('searching for videos for: ' + tempYT.title);
  //get individual channel video data, called per each
  searchVideosByChannelId({
    channelId: tempYT.youtubeChannelId,
    deepSearch: true //recurse through multiple pages of hits, if necessary
  }, function(err, data){
    if(err){
      console.log('error searching video for: ' + tempYT.title);
      console.log(err);
      videoCallback(err);
    } else {
      var tempVideo;
      //console.log(data);
      console.log('got ' + data.length + ' videos for ' + tempYT.title);
      async.each(data, function(video, searchCallback){
        if(!video.id.videoId){
          searchCallback('not a video: ' + video);
        } else {
          tempVideo = new YTVideo({
            youtubeVideoId: video.id.videoId
          });
          tempVideo.save(function(err, saved){
            if(err){
              searchCallback('error saving video: ' + err);
            } else {
              console.log('saved video: ' + saved.youtubeVideoId +
                ' for ytchannel ' + tempYT.title);
              tempYT._videos.push(saved._id);
              searchCallback();
            }
          })
        }
      }, function(err){
        videoCallback();
      });
    }
  })
}

function populateVideos(){
  console.log('populating videos');
  YTVideo.find({}).exec(function(err, videos){
    if(err){
      console.log('error retrieving videos from db: ' + err);
    } else {
      async.each(videos, function(video, callback){
        getVideoById({
          videoId: video.youtubeVideoId,
          deepSearch: true
        }, function(err, data){
          if(err){
            callback(err);
          } else {
            video.title = data[0].snippet.title;
            video.description = data[0].snippet.description;
            video.published = data[0].snippet.publishedAt;
            video.thumbnail = data[0].snippet.thumbnails.medium.url;
            video.length = data[0].contentDetails.duration;
            video.views = data[0].statistics.viewCount;
            video.likes = data[0].statistics.likeCount;
            video.dislikes = data[0].statistics.dislikeCount;
            video.favorites = data[0].statistics.favoriteCount;
            video.comments = data[0].statistics.commentCount;
            video.captions = data[0].contentDetails.caption;
            YTVideo.update({'_id': video._id}, video, function(err){
              if(err){
                callback(err);
              } else {
                console.log('populated video: ' + video.youtubeVideoId);
                callback();
              }
            })
          }
        });
      }, function(err){
        if(err){
          console.log('there was an error populating video: ' + err);
        } else {
          console.log('videos populated');
          importChannels();
        }
      });
    }
  });
}

function importChannels(){
  channelsDone = 0;
  for(var rep=0;rep<channels.length;rep++){
    for(var rep2=0;rep2<channels[rep]._creators.length;rep2++){
      channels[rep]._creators[rep2] = creatorsIDs[channels[rep]._creators[rep2]];
    }
    for(var rep2=0;rep2<channels[rep]._tags.length;rep2++){
      channels[rep]._tags[rep2] = tagsIDs[channels[rep]._tags[rep2]];
    }
    channels[rep]._youtube = ytChannels[channels[rep].name]._id;
    //overwrite with YT info
    channels[rep].description = ytChannels[channels[rep].name].description;
    channels[rep].local = {};
    channels[rep].local.owner = admin;
    var tempChannel = new Channel(channels[rep]);
    (function(rep){
      console.log(rep);
      tempChannel.save(function(err, saved){
        if(err){
          console.error(err);
          process.exit();
        }
        channels[rep]._id = saved._id;
        //console.log(saved);
        channelsDone ++;
        if(channelsDone === channels.length){
          importDone();
        }
      });
    })(rep);
  }
}

function importDone(){
  console.log('all done importing from JSON!');
  mongoose.disconnect();
}
