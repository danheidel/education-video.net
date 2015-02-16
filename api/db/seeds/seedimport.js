'use strict';

var fs = require('fs');
var _ = require('lodash');
var http = require('http');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var mongoose = require('mongoose');
var globalVars = require('../../../globalVars');
var getChannelsByName = require('../../normalizers/YTNormalizer.js').getChannelsByName;
var getChannelsById = require('../../normalizers/YTNormalizer.js').getChannelsById;
var getPlaylistByPlaylistId = require('../../normalizers/YTNormalizer.js').getPlaylistByPlaylistId;
var getVideosByPlaylistId = require('../../normalizers/YTNormalizer.js').getVideosByPlaylistId;
var searchVideosByChannelId =
  require('../../normalizers/YTNormalizer.js').searchVideosByChannelId;
var getVideoById = require('../../normalizers/YTNormalizer').getVideoById;
var mode = process.argv[2];
var displayName = process.argv[3];
var email = process.argv[4];
var password = process.argv[5];
global.globals = {};

//if no mode selected, exit
if(!mode) {
  console.log('no mode selected, exiting');
  process.exit();
}

switch(mode){
  case 'test' :
    mongoose.connect('mongodb://localhost/education-test');
    console.log('connected to education-test');
  break;
  case 'dev' :
    mongoose.connect('mongodb://localhost/education-dev');
    console.log('connected to education-dev');
  break;
  case 'dev' :
    mongoose.connect('mongodb://localhost/education-prod');
    console.log('connected to education-prod');
  break;
}

var Channel = require('../../models/Channel');
var Creator = require('../../models/Creator');
var Tag = require('../../models/Tag');
var User = require('../../models/User');
var YTChannel = require('../../models/YTChannel');
var YTPlaylist = require('../../models/YTPlaylist');
var YTVideo = require('../../models/YTVideo');
var Website = require('../../models/Website');

var channels = JSON.parse(fs.readFileSync('channels.json'));
var creators = JSON.parse(fs.readFileSync('creators.json'));
var tags = JSON.parse(fs.readFileSync('tags.json'));


var tagsIDs = [];
var creatorsIDs = [];
var ytChannels = [];
var ytPlaylists = [];
var tempUser, user1, user2, admin, nobody;

deleteCollections(['channels', 'creators', 'tags', 'ytchannels',
  'ytplaylists', 'ytvideos', 'websites', 'users']);

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

    globalVars(globals, function(){
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
        switch(user.varName){
          case 'admin':
            admin = retObject._id;
            break;
          case 'user1':
            user1 = retObject._id;
            break;
          case 'user2':
            user2 = retObject._id;
            break;
          case 'nobody':
            nobody = retObject._id;
            break;
        }
        callback();
      }
    });
  }, function(err){
    if(err){
      console.log(err);
      process.exit();
    }
    console.log('test users created');
    populateDatabase();
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
      populateDatabase();
    }
  });
}

function populateDatabase(){
  async.series([
    checkForAdmin,
    populateCreators,
    populateTags,
    importChannels,
    populateVideos
  ],
  function(err){
    if(err){
      console.log(err);
    } else {
      console.log('finished populating the database');
      mongoose.disconnect();
    }
  });
}

function checkForAdmin(outerCallback){
  console.log(admin);
  if(!admin){
    console.log('no valid admin user has been defined');
    process.exit();
  }
  outerCallback();
}

function populateCreators(outerCallback){
  console.log('populating creators');
  async.each(creators, function(creator, callback){
    creator.local = {};
    creator.local.owner = admin;
    var tempContacts = [];
    var truncKey;
    for(var key in creator.contact){
      if(!isNaN(parseInt(key.charAt(key.length - 1)))){
        //to allow duplicate keyvals, they're suffixed with numbers, remove them
        truncKey = key.substring(0, key.length-1);
      } else {
        truncKey = key;
      }
      if(creator.contact[key] !== ''){
        tempContacts.push({
          location: creator.contact[key],
          site: truncKey,
          notes:''
        });
      }
    }
    creator.contact = tempContacts;
    var origId = creator.id;
    delete creator.id;
    //save the creator
    var tempCreator = new Creator(creator);
    console.log(tempCreator);
    tempCreator.save(function(err, saved){
      if(err){
        console.log(err);
        callback(err);
      } else {
        console.log('creator saved: ' + tempCreator.name);
        creatorsIDs[origId] = saved._id;
        callback();
      }
    });
  }, function(err){
    if(err){
      console.log('failed to import creators');
      process.exit();
    } else {
      console.log('*************** populated the creators');
      outerCallback();
    }
  });
}

function populateTags(outerCallback){
  console.log('populating tags');
  async.each(tags, function(tag, callback){
    tag.local = {};
    tag.local.owner = admin;
    var tempTag = new Tag(tag);
    tempTag.category = 'Subject';
    console.log(tempTag);
    tempTag.save(function(err, saved){
      if(err){
        console.log('error');
        console.log(err);
        process.exit();
      } else {
        console.log('tempTag: ' + tempTag._id + '  saved: ' + saved._id);
        tagsIDs[tag.id] = saved._id;
        callback();
      }
    });
  }, function(err){
    if(err){
      console.log(err);
      process.exit();
    } else {
      console.log('************ finished populating tags');
      outerCallback();
    }
  });
}

function importChannels(outerCallback){
  async.eachSeries(channels, function(channel, channelCallback){
    channel._ytchannels = [];
    channel._ytplaylists = [];
    channel._websites = [];
    channel._comments = [];
    console.log('******* importing data for channel: ' + channel.name);
    for(var rep2=0;rep2<channel._creators.length;rep2++){
      channel._creators[rep2] = creatorsIDs[channel._creators[rep2]];
    }
    for(var rep2=0;rep2<channel._tags.length;rep2++){
      channel._tags[rep2] = tagsIDs[channel._tags[rep2]];
    }
    channel.update = Date.now();
    channel.visible = true;
    channel.myDescription = channel.description;
    channel.local = {};
    channel.local.owner = admin;

    //hack to pass iteration index into async.each
    for(var rep2=0;rep2<channel.links.length;rep2++){
      channel.links[rep2].position = rep2;
    }

    async.each(channel.links, function(link, linkCallback){
      var key = Object.keys(link)[0];
      console.log(link);
      if(key === 'youTube'){
        // console.log('getting ytchannel ', link.youTube.split('/').pop());
        getYtChannels(link.youTube.split('/').pop(),
          null,
          channel.name,
          link.youTube,
          function(err, data){
            if(err){
              console.log('error getting youTube channel');
              console.log(err);
              process.exit();
            }
            channel._ytchannels.push(data._id);
            console.log('added ytchannel _id: ', data._id, ' to ', channel.name);
            if(link.position === 0){
              //assume that the first link in the JSON is where we get values from
              console.log('saving position 1');
              channel.location = data.location;
              channel.longDescription = data.description;
              channel.thumbnail = data.thumbnail;
            }
            linkCallback();
          });
      } else if(key === 'youTubeID') {
        // console.log('getting ytchannel by id: ', link.youTubeID.split('/').pop());
        getYtChannels(null,
          link.youTubeID.split('/').pop(),
          channel.name,
          link.youTubeID,
          function(err, data){
            if(err){
              console.log('error getting youTube channel');
              console.log(err);
              process.exit();
            }
            channel._ytchannels.push(data._id);
            console.log('added ytchannel _id: ', data._id, ' to ', channel.name);
            if(link.position === 0){
              //assume that the first link in the JSON is where we get values from
              console.log('saving position 1');
              channel.location = data.location;
              channel.longDescription = data.description;
              channel.thumbnail = data.thumbnail;
            }
            linkCallback();
          });
      } else if(key === 'youTubePL'){
        // console.log('getting ytplaylist by id: ', link.youTubePL.split('=').pop());
        getYtPlaylists(link.youTubePL.split('=').pop(),
          channel.name,
          link.youTubePL,
          function(err, data){
            if(err){
              console.log('error getting youTube playlist');
              console.log(err);
              process.exit();
            }
            channel._ytplaylists.push(data._id);
            console.log('added ytplaylist _id: ', data._id, ' to ', channel.name);
            linkCallback();
          });
      } else {
        //a website, place into _websites
        getWebsites(link.website, function(err, data){
          if(err){
            console.log('error getting website data', err);
            process.exit();
          }
          console.log(data);
          channel._websites.push(data._id);
          console.log('added website _id: ', data._id, 'to', channel.name);
          linkCallback();
        });
      }
    }, function(err){
      if(err){
        console.log(err);
        process.exit();
      }
      var newChannel = new Channel(channel);
      console.log('new channel: ', newChannel);
      console.log('&&&&&&&&&&&&&&&&&&');
      newChannel.save(function(err, saved){
        if(err){
          console.log('error saving new Channel ', err);
          process.exit();
        }
      });
      channelCallback();
    });
  }, function(err){
    if(err){
      console.log(err);
      process.exit();
    }
    outerCallback();
  });
}

function getYtChannels(ytChannelName, channelId, name, location, ytChannelCallback){
  console.log('getting ytchannel data for: ' + (ytChannelName ? ytChannelName : channelId));
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
      ytChannelCallback(err, null);
    } else if(data.length > 0){
      var datum = data[0];
      console.log('successfully got data for ytchannel ', datum.snippet.title);
      var tempYT = new YTChannel({
        youtubeChannelId: datum.id,
        updated: Date.now(),
        title: datum.snippet.title,
        location: location,
        published: datum.snippet.publishedAt,
        thumbnail: datum.snippet.thumbnails.medium.url,
        description: datum.snippet.description,
        viewCount: datum.statistics.viewCount,
        commentCount: datum.statistics.commentCount,
        subscriberCount:
          datum.hiddenSubscriberCount ? 0 : datum.statistics.subscriberCount,
        videoCount: datum.statistics.videoCount,
        uploadPlaylist: datum.contentDetails.relatedPlaylists.uploads,
        _videos:[],
        local:{
          owner: admin
        }
      });
      //populate individual video information
      getVideos(tempYT, function(videoErr){
        if(videoErr){
          ytChannelCallback(videoErr);
        } else {
          tempYT.save(function(err, saved){
            if(err){
              console.log('error getting videos for: ', tempYT.title, tempYT.youtubeChannelId);
              ytChannelCallback(err, null);
            }else{
              console.log(name + ' ytchannel saved');
              ytChannels[name] = saved;
              ytChannelCallback(null, tempYT);
            }
          });
        }
      });
    } else {
      ytChannelCallback('no data returned for: ' + ytChannelName);
    }
  })
}

function getYtPlaylists(playlistId, name, location, ytPlaylistCallback){
  console.log('getting ytplaylist data for: ', playlistId);
  getPlaylistByPlaylistId({playlistId: playlistId}, function(err, data){
    if(err){
      ytPlaylistCallback(err, null);
    } else if(data.length > 0){
      var datum = data[0];
      console.log('successfully got data for playlist ', datum.snippet.title, datum.id);
      var tempPL = new YTPlaylist({
        youtubePlaylistId: datum.id,
        updated: Date.now(),
        location: location,
        title: datum.snippet.title,
        description: datum.snippet.description,
        published: datum.snippet.publishedAt,
        thumbnail: datum.snippet.thumbnails.medium.url,
        videos: [],
        local: {
          owner: admin
        }
      });
      //populate individual video information
      getVideos(tempPL, function(videoErr){
        if(videoErr){
          ytPlaylistCallback(err, null);
        } else {
          tempPL.save(function(err, saved){
            if(err){
              console.log('error getting videos for: ', tempPL.title, tempPL.youtubePlaylistId);
              ytPlaylistCallback(err, null);
            } else {
              console.log(name, ' ytplaylist saved');
              ytPlaylists[name] = saved;
              ytPlaylistCallback(null, saved);
            }
          });
        }
      })
    } else {
      ytPlaylistCallback('no data returned for: ', playlistId);
    }
  });
}

function getWebsites(location, websiteCallback){
  console.log('getting website data for: ', location);
  var reqOptions = {
    url: location,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36'
    }
  };
  request(reqOptions, function(err, response, html){
    if(err){
      console.log(err);
      websiteCallback(err, null);
    } else {
      var $ = cheerio.load(html);
      if(!$('html').text()){
        console.log(html);
        websiteCallback('empty response', null);
      } else {
        var tempWeb = new Website({
          URL: location,
          updated: Date.now(),
          title: $('title').text().trim()
        });
        tempWeb.save(function(err, saved){
          if(err){
            console.log('error saving website for: ', tempWeb.URL);
            websiteCallback(err, null);
          } else {
            console.log(saved.URL, ' website saved');
            websiteCallback(null, saved);
          }
        });
      }
    }
  });
}

function getVideos(tempYT, videoCallback){
  console.log('searching for videos for: ' + tempYT.title);
  //get individual channel video data, called per each
  var ytFunc;
  var store = {
    deepSearch: true
  };
  if(tempYT.youtubeChannelId){
    store.channelId = tempYT.youtubeChannelId;
    ytFunc = searchVideosByChannelId;
  }
  if(tempYT.youtubePlaylistId){
    store.playlistId = tempYT.youtubePlaylistId;
    ytFunc = getVideosByPlaylistId;
  }
  ytFunc(store, function(err, data){
    if(err){
      videoCallback(err);
    } else {
      var tempVideo;
      //console.log(data);
      console.log('got ' + data.length + ' videos for ' + tempYT.title);
      async.eachSeries(data, function(video, searchCallback){
        if(video.id && !video.id.kind === 'youtube#video'){
          searchCallback('not a video: ' + video);
        } else if(video.snippet.resourceId && !video.snippet.resourceId.kind === 'youtube#video'){
          searchCallback('not a video: ' + video);
        } else {
          var videoId = video.id.videoId ? video.id.videoId : video.snippet.resourceId.videoId;
          YTVideo.findOne({'youtubeVideoId': String(videoId)}).exec(function(err, data){
            if(err){
              searchCallback('could not access videos in db');
            } else {
              if(data){
                //video is already in the db
                console.log('video already in db: ', data.youtubeVideoId);
                tempYT._videos.push(data._id);
                searchCallback();
              } else {
                //else add the video
                tempVideo = new YTVideo({
                  youtubeVideoId: videoId
                });
                tempVideo.save(function(err, saved){
                  if(err){
                    console.log('error saving video: ' + err);
                    process.exit();
                    //duplicate videos cause exceptions, don't halt
                    searchCallback();
                  } else {
                    // console.log('saved video: ' + saved.youtubeVideoId +
                    //   ' for ytchannel ' + tempYT.title);
                    tempYT._videos.push(saved._id);
                    searchCallback();
                  }
                });
              }
            }
          });
        }
      }, function(err){
        if(err){
          videoCallback(err);
        } else {
          videoCallback();
        }
      });
    }
  })
}

function populateVideos(outerCallback){
  console.log('populating videos');
  YTVideo.find({}).exec(function(err, videos){
    if(err){
      console.log('error retrieving videos from db: ' + err);
    } else {
      async.eachSeries(videos, function(video, callback){
        getVideoById({
          videoId: video.youtubeVideoId,
          deepSearch: true
        }, function(err, data){
          if(err){
            callback(err);
          } else {
            var datum = data[0];
            if(!datum){
              console.log('a video was found to be deleted: ', video.youtubeVideoId);
              video.title = 'deleted video';
            } else {
              video.title = datum.snippet.title;
              video.description = datum.snippet.description;
              video.published = datum.snippet.publishedAt;
              video.thumbnail = datum.snippet.thumbnails.medium.url;
              video.length = datum.contentDetails.duration;
              video.views = datum.statistics.viewCount;
              video.likes = datum.statistics.likeCount;
              video.dislikes = datum.statistics.dislikeCount;
              video.favorites = datum.statistics.favoriteCount;
              video.comments = datum.statistics.commentCount;
              video.captions = datum.contentDetails.caption;
            }
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
          outerCallback(err);
        } else {
          console.log('videos populated');
          outerCallback();
        }
      });
    }
  });
}
