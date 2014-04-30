'use strict';

var fs = require('fs');
//var _ = require('lodash');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/education-test');

var Channel = require('../../models/Channel');
var Creator = require('../../models/Creator');
var Tag = require('../../models/Tag');
var User = require('../../models/User');

var channels = JSON.parse(fs.readFileSync('channels.json'));
var creators = JSON.parse(fs.readFileSync('creators.json'));
var tags = JSON.parse(fs.readFileSync('tags.json'));

var creatorsDone = 0;
var tagsDone = 0;
var channelsDone = 0;

var tagsIDs = [];
var creatorsIDs = [];
var tempUser, user1, user2, admin, nobody;

//create some users to test security model
tempUser  = new User({firstName: 'Admin', lastName: 'Superuser',
  local:{email: 'bamf@bar.com', password: 'reallycantseeeme', permissions: 'admin'}
});
tempUser.save(function(err, retObject){
  if(err){console.error(err);}
  else{admin = retObject._id;}
});
tempUser  = new User({firstName: 'User1', lastName: 'Foo',
  local:{email: 'foo@bar.com', password: 'cantseeme', permissions: 'user'}
});
tempUser.save(function(err, retObject){
  if(err){console.error(err);}
  else{user1 = retObject._id;}
});
tempUser  = new User({firstName: 'User2', lastName: 'Schmoo',
  local:{email: 'schmoo@bar.com', password: 'cantseeme', permissions: 'user'}
});
tempUser.save(function(err, retObject){
  if(err){console.error(err);}
  else{user2 = retObject._id;}
});
tempUser  = new User({firstName: 'Nobody', lastName: 'Schlub',
  local:{email: 'bluh@bar.com', password: 'cantseeeme', permissions: 'test'}
});
tempUser.save(function(err, retObject){
  if(err){console.error(err);}
  else{nobody = retObject._id;}
});

for(var rep=0;rep<creators.length;rep++){
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