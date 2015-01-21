'use strict';
/*jshint expr: true*/
// var _ = require('lodash');
// var superagent = require('superagent');
console.log('starting channel api test');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var app = require('../../app.js').app;
var testLogin = require('../testLogin');
var users = {};
var tags = [];
var creators = [];

var id;
var url = 'http://localhost:3000/api/v1/channels/';

describe('Channel JSON API', function(){
  before(function(done){
    testLogin.loginAdmin(done, users);
  });
  before(function(done){
    testLogin.loginUser1(done, users);
  });
  before(function(done){
    testLogin.loginUser2(done, users);
  });
  before(function(done){
    testLogin.loginNobody(done, users);
  });
  before(function(done){
    testLogin.getTags(done, tags);
  });
  before(function(done){
    testLogin.getCreators(done, creators);
  });

  it('create a channel as user1', function(done){
    users.user1Agent.post(url)
      .send({
        name:'My test channel',
        location: 'www.foo.com/foo',
        description:'Test channel',
        _id: '1111111',
        local:{
          foo: 'this shouldn\'t be here!'
        },
        _creators:[creators[0]._id, creators[1]._id],
        _tags: [tags[0]._id, tags[1]._id]
      })
      .end(function(err, res){
        try{
          expects(err, res);
          done();
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      console.log('created object');
      console.log(res.body);
      expect(err).eql(null);
      id = res.body._id;
      expect(res.status).to.not.equal(403);
      expect(res.body._id).not.equal(null);
      expect(res.body._id).not.equal('1111111');
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My test channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._tags.length).above(0);
    }
  });
  it('can get a channel collection as admin', function(done){
    users.adminAgent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.length).above(0);
      expect(res.body[0].name).to.exist;
      expect(res.body[0].__v).to.not.exist;
      expect(res.body[0].local).to.not.exist;
      expect(res.body[0]._creators.length).above(0);
      expect(res.body[0]._creators[0].name).to.exist;
      expect(res.body[0]._creators[0].__v).to.not.exist;
      expect(res.body[0]._creators[0].local).to.not.exist;
      expect(res.body[0]._tags.length).above(0);
      expect(res.body[0]._tags[0].name).to.exist;
      expect(res.body[0]._tags[0].__v).to.not.exist;
      expect(res.body[0]._tags[0].local).to.not.exist;
      //if create fails, get at least one record id to test get single
      if(!id){id = res.body[0]._id;}
      done();
    }
  });
  it('can get a channel collection as user1', function(done){
    users.user1Agent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.length).above(0);
      expect(res.body[0].name).to.exist;
      expect(res.body[0].__v).to.not.exist;
      expect(res.body[0].local).to.not.exist;
      expect(res.body[0]._creators.length).above(0);
      expect(res.body[0]._creators[0].name).to.exist;
      expect(res.body[0]._creators[0].__v).to.not.exist;
      expect(res.body[0]._creators[0].local).to.not.exist;
      expect(res.body[0]._tags.length).above(0);
      expect(res.body[0]._tags[0].name).to.exist;
      expect(res.body[0]._tags[0].__v).to.not.exist;
      expect(res.body[0]._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a channel collection as user2', function(done){
    users.user2Agent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.length).above(0);
      expect(res.body[0].name).to.exist;
      expect(res.body[0].__v).to.not.exist;
      expect(res.body[0].local).to.not.exist;
      expect(res.body[0]._creators.length).above(0);
      expect(res.body[0]._creators[0].name).to.exist;
      expect(res.body[0]._creators[0].__v).to.not.exist;
      expect(res.body[0]._creators[0].local).to.not.exist;
      expect(res.body[0]._tags.length).above(0);
      expect(res.body[0]._tags[0].name).to.exist;
      expect(res.body[0]._tags[0].__v).to.not.exist;
      expect(res.body[0]._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a channel collection as nobody', function(done){
    users.nobodyAgent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.length).above(0);
      expect(res.body[0].name).to.exist;
      expect(res.body[0].__v).to.not.exist;
      expect(res.body[0].local).to.not.exist;
      expect(res.body[0]._creators.length).above(0);
      expect(res.body[0]._creators[0].name).to.exist;
      expect(res.body[0]._creators[0].__v).to.not.exist;
      expect(res.body[0]._creators[0].local).to.not.exist;
      expect(res.body[0]._tags.length).above(0);
      expect(res.body[0]._tags[0].name).to.exist;
      expect(res.body[0]._tags[0].__v).to.not.exist;
      expect(res.body[0]._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a single channel as admin', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My test channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a single channel as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My test channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a single channel as user2', function(done){
    users.user2Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My test channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a single channel as nobody', function(done){
    users.nobodyAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My test channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can update a single channel as admin', function(done){
    users.adminAgent.put(url + id)
      .send({name:'New channel name - admin'})
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
  it('can verify channel edit as admin', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('New channel name - admin');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can verify channel edit as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('New channel name - admin');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can update a single channel as user1', function(done){
    users.user1Agent.put(url + id)
      .send({name:'New channel name - user1'})
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
  it('can verify second channel edit as admin', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('New channel name - user1');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can verify second channel edit as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('New channel name - user1');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('cannot update a single channel as user2', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New channel name - user2'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('cannot update a single channel as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({name:'New channel name - user2'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('can verify lack of unauthorized edits', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('New channel name - user1');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('cannot delete a channel as nobody', function(done){
    users.nobodyAgent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('cannot delete a channel as user2', function(done){
    users.user2Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('can delete a channel as user1 (owner)', function(done){
    users.user1Agent.del(url + id)
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
  it('can verify channel deletion', function(done){
    users.adminAgent.get(url + id)
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
  it('create a channel as admin', function(done){
    users.adminAgent.post(url)
      .send({
        name:'My admin channel',
        location: 'www.foo.com/foo',
        description:'Test channel',
        _creators:[creators[0]._id, creators[1]._id],
        _tags: [tags[0]._id, tags[1]._id]
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
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._tags.length).above(0);
    }
  });
  it('can get a single channel as admin', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a admin channel as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a admin channel as user2', function(done){
    users.user2Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can get a admin channel as nobody', function(done){
    users.nobodyAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('cannot update admin channel as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({name:'New channel name - nobody'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('cannot update admin channel as user2', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New channel name - user2'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('cannot update admin channel as user1', function(done){
    users.user1Agent.put(url + id)
      .send({name:'New channel name - user1'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('can verify lack of unauthorized edits', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin channel');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('can update admin channel as admin', function(done){
    users.adminAgent.put(url + id)
      .send({name:'New channel name - admin'})
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
  it('can verify admin edits', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('New channel name - admin');
      expect(res.body._creators.length).above(0);
      expect(res.body._creators[0].name).to.exist;
      expect(res.body._creators[0].__v).to.not.exist;
      expect(res.body._creators[0].local).to.not.exist;
      expect(res.body._tags.length).above(0);
      expect(res.body._tags[0].name).to.exist;
      expect(res.body._tags[0].__v).to.not.exist;
      expect(res.body._tags[0].local).to.not.exist;
      done();
    }
  });
  it('cannot delete admin channel as nobody', function(done){
    users.nobodyAgent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('cannot delete admin channel as user2', function(done){
    users.user2Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('cannot delete admin channel as user1', function(done){
    users.user1Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('can delete a channel as admin (owner)', function(done){
    users.adminAgent.del(url + id)
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
  it('can verify channel deletion', function(done){
    users.adminAgent.get(url + id)
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
  it('cannot create a channel as unauthenticated', function(done){
    users.nobodyAgent.post(url)
      .send({
        name:'My nobody channel',
        location: 'www.foo.com/foo',
        description:'Test channel',
        _creators:[creators[0]._id, creators[1]._id],
        _tags: [tags[0]._id, tags[1]._id]
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
      expect(res.status).to.equal(403);
    }
  });
});
