'use strict';

var _ = require('lodash');
var superagent = require('superagent');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var app = require('../../app.js').app;
var users = {};

describe('Creator JSON API', function(){
  before(function(done){
    //pull in the test users for checking security models
    console.log('before');
    var User = require('../../api/models/User');
    User.find({}, function(err, retObject){
      if(err){
        console.log(err);
        return done(err);
      }
      users.adminId = _.find(retObject, {firstName: 'Admin'});
      users.user1Id = _.find(retObject, {firstName: 'User1'});
      users.user2Id = _.find(retObject, {firstName: 'User2'});
      users.nobodyId = _.find(retObject, {firstName: 'Nobody'});
      console.log(users);
      console.log('before done');
      return done();
    });
  });

  var id;
  var url = 'http://localhost:3000/api/v1/creators/';
  it('can create a creator', function(done){
    superagent.post(url)
      .send({
        name:'My test creator',
        description:'Test creator',
        contact:{
          youTube: 'http://foo.com',
          email: 'foo@foo.com',
          twitter: 'foo',
          facebook: 'foo'
        },
      })
      .end(function(err, res){
        try{
          expects(err, res);
          done();
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).eql(null);
      id = res.body._id;
      expect(res.status).to.not.equal(403);
      expect(res.body._id).not.equal(null);
      expect(res.body.__v).to.not.exist;
      expect(res.body.name).equal('My test creator');
    }
  });
  it('can get a creator collection', function(done){
    superagent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.length).above(0);
      expect(res.body[0].__v).to.not.exist;
      //if create failed, point to an existing id for remaining tests
      if(!id){id = res.body[0]._id; console.log(id);}
      done();
    }
  });
  it('can get a single creator', function(done){
    superagent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.name).equal('My test creator');
      done();
    }
  });
  it('can update a single creator', function(done){
    superagent.put(url + id)
      .send({name:'New creator name'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).equal('success');
      done();
    }
  });
  it('can verify creator edit', function(done){
    superagent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.name).equal('New creator name');
      done();
    }
  });
  it('can delete a creator', function(done){
    superagent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).equal('success');
      done();
    }
  });
  it('can verify creator deletion', function(done){
    superagent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).to.not.exist;
      done();
    }
  });
});