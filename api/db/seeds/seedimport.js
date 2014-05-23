'use strict';

var fs = require('fs');
//var _ = require('lodash');
var mongoose = require('mongoose');
var mode = process.argv[2];

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

var channels = JSON.parse(fs.readFileSync('channels.json'));
var creators = JSON.parse(fs.readFileSync('creators.json'));
var tags = JSON.parse(fs.readFileSync('tags.json'));

var usersDone = 0;
var creatorsDone = 0;
var tagsDone = 0;
var channelsDone = 0;

var tagsIDs = [];
var creatorsIDs = [];
var tempUser, user1, user2, admin, nobody;

if(mode === 'test') {
  //if in test mode, populate test users, otherwise just import seed data
  makeTestUsers();
} else {
  popChildren();
}

function makeTestUsers(){
  //create some users to test security model
  tempUser  = new User({firstName: 'Admin', lastName: 'Superuser',
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

  tempUser  = new User({firstName: 'User1', lastName: 'Foo',
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

  tempUser  = new User({firstName: 'User2', lastName: 'Schmoo',
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

  tempUser  = new User({firstName: 'Nobody', lastName: 'Schlub',
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
        checkIfDone();
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
        checkIfDone();
      });
    })(rep);
  }
}

function checkIfDone(){
  console.log('creators: '+ creatorsDone);
  console.log('tags: ' + tagsDone);
  if(creatorsDone === creators.length && tagsDone === tags.length){
    console.log('done with tags and creators!');
    //mongoose.disconnect();
    importChannels();
  }
}

function importChannels(){
  for(var rep=0;rep<channels.length;rep++){
    for(var rep2=0;rep2<channels[rep]._creators.length;rep2++){
      channels[rep]._creators[rep2] = creatorsIDs[channels[rep]._creators[rep2]];
    }
    for(var rep2=0;rep2<channels[rep]._tags.length;rep2++){
      channels[rep]._tags[rep2] = tagsIDs[channels[rep]._tags[rep2]];
    }
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
          allDone();
        }
      });
    })(rep);
  }
}

function allDone(){
  // console.log('------------------------------');
  // console.log(channels[0]);
  // Channel.findOne({'_id': String(channels[0]._id)}).populate([{path:'_tags'}, {path:'_creators'}]).exec(function(err, result){
  //   if(err){console.log(err);}
  //   console.log(result);
  // });
  console.log('all done!');
  mongoose.disconnect();
}