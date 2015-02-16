'use strict';
/*jshint expr: true*/
// var _ = require('lodash');
// var superagent = require('superagent');
console.log('starting user api test');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var app = require('../../app.js').app;
var testLogin = require('../testLogin');
var users = {};

var id;
var url = 'http://localhost:5000/api/v1/users/';

describe('user JSON API', function(){
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

  it('create a user as admin', function(done){
    users.adminAgent.post(url)
      .send({
        displayName: 'Test McTesterson',
        email: 'test@test.com',
        password:'test'
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
      expect(res.body.displayName).equal('Test McTesterson');
    }
  });
  it('can get a user collection as admin', function(done){
    users.adminAgent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.length).above(0);
      expect(res.body[0].displayName).to.exist;
      expect(res.body[0].__v).to.not.exist;
      expect(res.body[0].local).to.not.exist;
      //if create fails, get at least one record id to test get single
      if(!id){id = res.body[0]._id;}
      done();
    }
  });
  it('can get a user collection as user1', function(done){
    users.user1Agent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.length).equal(1);
      expect(res.body[0].displayName).to.exist;
      expect(res.body[0].__v).to.not.exist;
      expect(res.body[0].local).to.not.exist;
      done();
    }
  });
  it('can get a user collection as user2', function(done){
    users.user2Agent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.length).equal(1);
      expect(res.body[0].displayName).to.exist;
      expect(res.body[0].__v).to.not.exist;
      expect(res.body[0].local).to.not.exist;
      done();
    }
  });
  it('can\'t get a user collection as nobody', function(done){
    users.nobodyAgent.get(url)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to read this resource');
      done();
    }
  });
  it('can get new user as admin', function(done){
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
      expect(res.body.displayName).equal('Test McTesterson');
      done();
    }
  });
  it('can\'t get new user as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to read this resource');
      done();
    }
  });
  it('can\'t get new user as user2', function(done){
    users.user2Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to read this resource');
      done();
    }
  });
  it('can\'t get new user as nobody', function(done){
    users.nobodyAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to read this resource');
      done();
    }
  });
  it('can update a single user as admin', function(done){
    users.adminAgent.put(url + id)
      .send({
        displayName: 'New user name - admin',
        email: 'test@test.com',
        password:'test'})
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
  it('can verify user edit as admin', function(done){
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
      expect(res.body.displayName).equal('New user name - admin');
      done();
    }
  });
  it('can\'t verify user edit as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to read this resource');
      done();
    }
  });
  it('can\'t update a single user as user1', function(done){
    users.user1Agent.put(url + id)
      .send({displayName:'New user name - user1'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to modify this resource');
      done();
    }
  });
  it('cannot update a single user as user2', function(done){
    users.user2Agent.put(url + id)
      .send({displayName:'New user name - user2'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to modify this resource');
      done();
    }
  });
  it('cannot update a single user as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({displayName:'New user name - nobody'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to modify this resource');
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
      expect(res.body.displayName).equal('New user name - admin');
      done();
    }
  });
  it('cannot delete a user as nobody', function(done){
    users.nobodyAgent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to delete this resource');
      done();
    }
  });
  it('cannot delete a user as user1', function(done){
    users.user1Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to delete this resource');
      done();
    }
  });
  it('cannot delete a user as user2', function(done){
    users.user2Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to delete this resource');
      done();
    }
  });
  it('can delete new user as admin', function(done){
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
  it('can verify user deletion', function(done){
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
  it('create a user as user1', function(done){
    users.user1Agent.post(url)
      .send({
        displayName: 'My user1 user',
        email: 'user1@test.com',
        password:'user1'
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
      expect(res.body.displayName).equal('My user1 user');
    }
  });
  it('can get user1 created user as admin', function(done){
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
      expect(res.body.displayName).equal('My user1 user');
      done();
    }
  });
  it('can\'t get user1 created user as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to read this resource');
      done();
    }
  });
  it('can\'t get user1 created user as user2', function(done){
    users.user2Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to read this resource');
      done();
    }
  });
  it('can\'t get user1 created user as nobody', function(done){
    users.nobodyAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to read this resource');
      done();
    }
  });
  it('cannot update user1 created user as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({displayName:'New user name - nobody'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to modify this resource');
      done();
    }
  });
  it('cannot update user1 created user as user2', function(done){
    users.user2Agent.put(url + id)
      .send({displayName:'New user name - user2'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to modify this resource');
      done();
    }
  });
  it('cannot update user1 created user as user1', function(done){
    users.user1Agent.put(url + id)
      .send({displayName:'New user name - user1'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to modify this resource');
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
      expect(res.body.displayName).equal('My user1 user');
      done();
    }
  });
  it('can update user1 created user as admin', function(done){
    users.adminAgent.put(url + id)
      .send({
        displayName: 'New user name - Admin',
        email: 'test@test.com',
        password:'test'})
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
      expect(res.body.displayName).equal('New user name - Admin');
      done();
    }
  });
  it('cannot delete user1 created user as nobody', function(done){
    users.nobodyAgent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to delete this resource');
      done();
    }
  });
  it('cannot delete user1 created user as user2', function(done){
    users.user2Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to delete this resource');
      done();
    }
  });
  it('cannot delete user1 created user as user1', function(done){
    users.user1Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to delete this resource');
      done();
    }
  });
  it('can delete a user created as admin (owner)', function(done){
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
  it('can verify user deletion', function(done){
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
  it('can create a user as unauthenticated', function(done){
    users.nobodyAgent.post(url)
      .send({
        displayName: 'My nobody user',
        email: 'test@test.com',
        password:'test'
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
      expect(res.body.displayName).equal('My nobody user');
    }
  });
  it('can verify new user as admin', function(done){
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
      expect(res.body.displayName).equal('My nobody user');
      done();
    }
  });
  it('cannot get nobody created user as nobody', function(done){
    users.nobodyAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to read this resource');
      done();
    }
  });
  it('cannot get nobody created user as user2', function(done){
    users.user2Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to read this resource');
      done();
    }
  });
  it('cannot get nobody created user as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to read this resource');
      done();
    }
  });
  it('cannot edit nobody created user as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({
        displayName:'edited!'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to modify this resource');
      done();
    }
  });
  it('cannot edit nobody created user as user2', function(done){
    users.user2Agent.put(url + id)
      .send({
        displayName:'edited!'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to modify this resource');
      done();
    }
  });
  it('cannot edit nobody created user as user1', function(done){
    users.user1Agent.put(url + id)
      .send({
        displayName:'edited!'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to modify this resource');
      done();
    }
  });
  it('can edit a nobody created user as admin', function(done){
    users.adminAgent.put(url + id)
      .send({
        displayName:'edited!',
        email: 'dan.heidel@gmail.com',
        password:'test'})
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
  it('can verify admin edited nobody user as admin', function(done){
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
      expect(res.body.displayName).equal('edited!');
      done();
    }
  });
  it('cannot delete nobody created user as nobody', function(done){
    users.nobodyAgent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('unauthenticated users do not have access to delete this resource');
      done();
    }
  });
  it('cannot delete nobody created user as user2', function(done){
    users.user2Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to delete this resource');
      done();
    }
  });
  it('cannot delete nobody created user as user1', function(done){
    users.user1Agent.del(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      expect(err).equal(null);
      expect(res.body.error).equal('user does not have access to delete this resource');
      done();
    }
  });
  it('can delete a nobody created as admin (owner)', function(done){
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
  it('can verify user deletion', function(done){
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
});
