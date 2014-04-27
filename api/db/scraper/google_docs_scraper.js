'use strict';

var cheerio = require('cheerio');
var request = require('request');

var url = 'http://docs.google.com/spreadsheet/pub?key=0AsbnFyzmW4V_dGw0SHBxZGhjQkxZUk9uUW5hWlF0OUE';
var channelList = [];

pageScrape();

function pageScrape(){
  request(url, function(err, resp, body){
    if(err){
      console.error('error' + err);
    }
    var $ = cheerio.load(body);
    $('#tblMain > tr').each(function(){
      var tempChannel = {};
      $(this).children('.s1').each(function(i){
        switch(i){
          case 0:
          tempChannel.creator = $(this).text();
          break;
          case 1:
          tempChannel.tags = $(this).text();
          break;
          case 2:
          tempChannel.name = $(this).text();
          break;
          case 3:
          tempChannel.description = $(this).text();
          break;
          case 4:
          tempChannel.url = $(this).text();
          break;
        }
      });
      channelList.push(tempChannel);
    });
    console.log(channelList);
  });
}