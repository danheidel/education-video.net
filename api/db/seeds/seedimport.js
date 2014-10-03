'use strict';

var fs = require('fs');
//var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var getChannelsByName = require('../../normalizers/YTNormalizer.js').getChannelsByName;
var getChannelsById = require('../../normalizers/YTNormalizer.js').getChannelsById;
var mode = process.argv[2];
global = {
  ytKey: process.argv[3]
}

//if no mode selected, exit
if(!mode) {process.exit();}

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

var channels = JSON.parse(fs.readFileSync('channels.json'));
var creators = JSON.parse(fs.readFileSync('creators.json'));
var tags = JSON.parse(fs.readFileSync('tags.json'));

var usersDone = 0;
var creatorsDone = 0;
var tagsDone = 0;
var channelsDone = 0;

var tagsIDs = [];
var creatorsIDs = [];
var ytIDs = [];
var tempUser, user1, user2, admin, nobody;

if(mode === 'test') {
  //if in test mode, populate test users, otherwise just import seed data
  makeTestUsers();
} else {
  popChildren();
}

function makeTestUsers(){
  //create some users to test security model
  tempUser  = new User({displayName: 'Admin', lastName: 'Superuser',
    local:{email: 'bamf@bar.com', permissions: 'admin'}
  });
  tempUser.local.password = tempUser.generateHash('admin');
  tempUser.save(function(err, retObject){
    if(err){console.error(err);}
    else{
      admin = retObject._id;
      usersDone ++;
      areUsersDone();
    }
  });

  tempUser  = new User({displayName: 'User1', lastName: 'Foo',
    local:{email: 'foo@bar.com', permissions: 'user'}
  });
  tempUser.local.password = tempUser.generateHash('user1');
  tempUser.save(function(err, retObject){
    if(err){console.error(err);}
    else{
      user1 = retObject._id;
      usersDone ++;
      areUsersDone();
    }
  });

  tempUser  = new User({displayName: 'User2', lastName: 'Schmoo',
    local:{email: 'schmoo@bar.com', permissions: 'user'}
  });
  tempUser.local.password = tempUser.generateHash('user2');
  tempUser.save(function(err, retObject){
    if(err){console.error(err);}
    else{
      user2 = retObject._id;
      usersDone ++;
      areUsersDone();
    }
  });

  tempUser  = new User({displayName: 'Nobody', lastName: 'Schlub',
    local:{email: 'bluh@bar.com', permissions: 'test'}
  });
  tempUser.local.password = tempUser.generateHash('nobody');
  tempUser.save(function(err, retObject){
    if(err){console.error(err);}
    else{
      nobody = retObject._id;
      usersDone ++;
      areUsersDone();
    }
  });
}

function areUsersDone(){
  if(usersDone >= 4){
    popChildren();
  }
}

function popChildren(){
  for(var rep=0;rep<creators.length;rep++){
    creators[rep].local = {};
    creators[rep].local.owner = admin;

    var tempCreator = new Creator(creators[rep]);
    (function(rep){
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
    ytImport();
  }
}

function ytImport(){
  console.log(channels.length);
  async.each(channels, function(channel, callback){
    var channelName = channel.location.split('/').pop();
    console.log('-' + channelName);
    getChannelsByName({channelName: channelName}, function(err, data){
      if(data.items.length > 0){
        //console.log(data.items[0]);
        var tempYT = new YTChannel({
          youtubeId: data.items[0].id,
          location: channel.location,
          title: data.items[0].snippet.title,
          started: data.items[0].snippet.publishedAt,
          thumbnail: data.items[0].snippet.thumbnails.medium.url,
          description: data.items[0].snippet.description,
          local:{
            owner: admin
          }
        });
        //console.log(tempYT);
        tempYT.save(function(err, saved){
          if(err){
            callback(err);
          }else{
            ytIDs[channel.id] = saved._id;
            callback();
          }
        });
      }else if(err){
        callback(err);
      }else{
        console.log('no data returned for ' + channelName);
        ytRetry(channelName, channel, callback);
      }
    });
  }, function(err){
    if(err){
      console.error(err);
    } else {
      importChannels();
    }
  });
}

function ytRetry(channelId, channel, callback){
  console.log('retrying ' + channelId + ' as an id');
  getChannelsById({id: channelId}, function(err, data){
    if(data.items.length > 0){
      //console.log(data.items[0]);
      var tempYT = new YTChannel({
        youtubeId: data.items[0].id,
        location: channel.location,
        title: data.items[0].snippet.title,
        started: data.items[0].snippet.publishedAt,
        thumbnail: data.items[0].snippet.thumbnails.medium.url,
        description: data.items[0].snippet.description,
        local:{
          owner: admin
        }
      });
      tempYT.save(function(err, saved){
        if(err){
          callback(err);
        }else{
          console.log('retry as id worked for ' + channelId);
          ytIDs[channel.id] = saved._id;
          callback();
        }
      });
    } else {
      callback('unable to get data for ' + channelId);
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
    channels[rep]._youtube = ytIDs[channels[rep].id];
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
        console.log(saved);
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
