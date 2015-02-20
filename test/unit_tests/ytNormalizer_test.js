'use strict';
/*global globals*/

//fire app.js to get db connections
var mongoose = require('mongoose');
var globalVars = require('../../globalVars');
global.globals = {};
var chai = require('chai');
chai.should();
chai.use(require('chai-things'));
var expect = chai.expect;
var should = chai.should;

var path = '../../api/normalizers/';
var YTNormalizer = require(path + 'YTNormalizer.js');
var getChannelsByName = YTNormalizer.getChannelsByName;
var getChannelsById = YTNormalizer.getChannelsById;
var getActivitiesByChannelId = YTNormalizer.getActivitiesByChannelId;
var getPlaylistByPlaylistId = YTNormalizer.getPlaylistByPlaylistId;
var searchVideosByChannelId = YTNormalizer.searchVideosByChannelId;
var getVideoById = YTNormalizer.getVideoById;
var getVideosByPlaylistId = YTNormalizer.getVideosByPlaylistId;

describe('YTNormalizer', function(){
  before(function(done){
    mongoose.connect('mongodb://localhost/education-test');
    console.log('connected to education-test');
    var conn = mongoose.connection;

    conn.on('open', function(){
      console.log('connection opened');
      globalVars(globals, function(){
        console.log('done geting globals');
        done();
      });
    });
  });

  describe('getChannelsByName', function(){
    it('should return a list of YouTube channels', function(done){
      getChannelsByName({channelName: 'BrilliantBotany'}, function(err, data){
        try{
          expect(err).not.exist();
          expect(data).exist();
          expect(data).have.length.above(0);
          data.should.all.have.property('kind', 'youtube#channel');
          done();
        } catch(e){
          done(e);
        }
      });
    });
  });

  describe('getChannelsById', function(){
    it('should return a list of YouTube channels', function(done){
      getChannelsById({id: 'UCcut0VhjxE1MFXHIGJ9ZfTA'}, function(err, data){
        try{
          expect(err).not.exist();
          expect(data).exist();
          expect(data).have.length(1);
          data.should.all.have.property('kind', 'youtube#channel');
          done();
        } catch(e){
          done(e);
        }
      });
    });
  });

  describe('getActivitiesByChannelId', function(){
    it('should return a list of YouTube activities', function(done){
      getActivitiesByChannelId({channelId: 'UCcut0VhjxE1MFXHIGJ9ZfTA'}, function(err, data){
        try{
          expect(err).not.exist();
          expect(data).exist();
          expect(data).have.length.above(0);
          data.should.all.have.property('kind', 'youtube#activity');
          done();
        } catch(e){
          done(e);
        }
      });
    });
  });

  describe('getPlaylistByPlaylistId', function(){
    it('should return a list of YouTube activities', function(done){
      getPlaylistByPlaylistId({playlistId: 'PLN7b6uU-KpjHiLm4o7T4AHTre4WCFcUbP'}, function(err, data){
        try{
          expect(err).not.exist();
          expect(data).exist();
          expect(data).have.length(1);
          data.should.all.have.property('kind', 'youtube#playlist');
          done();
        } catch(e){
          done(e);
        }
      });
    });
  });

  describe('searchVideosByChannelId', function(){
    it('should return a list of YouTube activities', function(done){
      searchVideosByChannelId({channelId: 'UCcut0VhjxE1MFXHIGJ9ZfTA'}, function(err, data){
        try{
          expect(err).not.exist();
          expect(data).exist();
          expect(data).have.length.above(0);
          data.should.all.have.property('kind', 'youtube#searchResult');
          data.should.all.have.deep.property('id.kind', 'youtube#video');
          done();
        } catch(e){
          done(e);
        }
      });
    });
  });

  describe('getVideoById', function(){
    it('should return a list of YouTube activities', function(done){
      getVideoById({videoId: 'Qmp-Qi7-ltY'}, function(err, data){
        try{
          expect(err).not.exist();
          expect(data).exist();
          expect(data).have.length(1);
          data.should.all.have.property('kind', 'youtube#video');
          done();
        } catch(e){
          done(e);
        }
      });
    });
  });

  describe('getVideosByPlaylistId', function(){
    it('should return a list of YouTube activities', function(done){
      getVideosByPlaylistId({playlistId: 'PLN7b6uU-KpjHiLm4o7T4AHTre4WCFcUbP'}, function(err, data){
        try{
          expect(err).not.exist();
          expect(data).exist();
          expect(data).have.length.above(0);
          data.should.all.have.property('kind', 'youtube#playlistItem');
          data.should.all.have.deep.property('snippet.resourceId.kind', 'youtube#video');
          done();
        } catch(e){
          done(e);
        }
      });
    });
  });

});

