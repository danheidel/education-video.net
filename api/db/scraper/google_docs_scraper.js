'use strict';

var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var _ = require('lodash');

var url = 'http://docs.google.com/spreadsheet/pub?key=0AsbnFyzmW4V_dGw0SHBxZGhjQkxZUk9uUW5hWlF0OUE';
var parseList = [];
var channelList = [];
var creatorList = [];
var tagList = [];

pageScrape();

function pageScrape(){
  request(url, function(err, resp, body){
    if(err){
      console.error('error' + err);
    }
    var $ = cheerio.load(body);
    $('#tblMain > tr').each(function(){
      if(!$(this).hasClass('rShim')){
        //fix s2 class weirdness
        $(this).children('.s2').addClass('s1');
        var tempChannel = {};
        $(this).children('.s1').each(function(i){
          switch(i){
            case 0:
            tempChannel.creator = $(this).text();
            break;
            case 1:
            var tempTags = $(this).text();
            //use regex for global replace
            tempChannel.tags = tempTags.replace(/,/g,'').split(' ');
            break;
            case 2:
            tempChannel.name = $(this).text();
            break;
            case 3:
            tempChannel.description = $(this).text();
            break;
            case 4:
            tempChannel.location = $(this).text();
            break;
          }
        });
        parseList.push(tempChannel);
      }
    });
    scrapeParse();
    writeSeedFiles();
  });
}

function scrapeParse(){
  _.each(parseList, function(parse){
    var tempCreator = _.find(creatorList, function(creator){
       return parse.creator === creator;
    });
    if(tempCreator){
      parse.creatorId = tempCreator.Id;
    }else{
      creatorList.push({
        name: parse.creator,
        description: '',
        contact:{
          website: '',
          youTube: parse.location,
          email: '',
          twitter: '',
          facebook: ''
        },
        id: creatorList.length.toString()
      });
      parse.creatorId = creatorList.length - 1;
    }
    parse.tagIds = [];
    _.each(parse.tags, function(tag){
      var tempTag = _.find(tagList, function(listTag){
        return tag === listTag.name;
      });
      if(tempTag){
        parse.tagIds.push(tempTag.id);
      }else{
        tagList.push({
          name: tag,
          id: tagList.length
        });
        parse.tagIds.push(tagList.length - 1);
      }
    });
    channelList.push({
      name: parse.name,
      location: parse.location,
      description: parse.description,
      _creators:[parse.creatorId],
      _tags: parse.tagIds
    });
  });
  console.log('creators');
  console.dir(creatorList);
  console.log('tags');
  console.dir(tagList);
  console.log('channels');
  console.dir(channelList);
}

function writeSeedFiles(){
  //console.log(parseList);
  fs.writeFileSync(__dirname + '/../seeds/test.json',
    JSON.stringify(parseList));
  fs.writeFileSync(__dirname + '/../seeds/creators.json',
    JSON.stringify(creatorList));
  fs.writeFileSync(__dirname + '/../seeds/tags.json',
    JSON.stringify(tagList));
  fs.writeFileSync(__dirname + '/../seeds/channels.json',
    JSON.stringify(channelList));
}