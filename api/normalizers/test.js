'use strict';

var YTNormalizer = require('./YTNormalizer.js');

global = {
  ytKey: process.argv[2]
}

var options = {
  channelName: 'BrilliantBotany'
};

YTNormalizer.getChannelsByName(options, function(err, data){
  if(err){
    console.error('error');
    console.error(err);
  } else {
    console.log(data);
  }
});
