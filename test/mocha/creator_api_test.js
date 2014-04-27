'use strict';

var superagent = require('superagent');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var app = require('../../app.js').app;

describe('Creator JSON API', function(){
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