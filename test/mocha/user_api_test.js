'use strict';
/*jshint expr: true*/
// var _ = require('lodash');
// var superagent = require('superagent');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var app = require('../../app.js').app;
var testLogin = require('../testLogin');
var users = {};

var id;
var url = 'http://localhost:3000/api/v1/users/';

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

  it('create a user as user1', function(done){
    users.user1Agent.post(url)
      .send({
        firstName: 'Test',
        lastName: 'McTesterson'
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
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My test user');
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
      expect(res.body[0].name).to.exist;
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
      expect(res.body.length).above(0);
      expect(res.body[0].name).to.exist;
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
      expect(res.body.length).above(0);
      expect(res.body[0].name).to.exist;
      expect(res.body[0].__v).to.not.exist;
      expect(res.body[0].local).to.not.exist;
      done();
    }
  });
  it('can get a user collection as nobody', function(done){
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
      done();
    }
  });
  it('can get a single user as admin', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My test user');
      done();
    }
  });
  it('can get a single user as user1', function(done){
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
      expect(res.body.name).equal('My test user');
      done();
    }
  });
  it('can get a single user as user2', function(done){
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
      expect(res.body.name).equal('My test user');
      done();
    }
  });
  it('can get a single user as nobody', function(done){
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
      expect(res.body.name).equal('My test user');
      done();
    }
  });
  it('can update a single user as admin', function(done){
    users.adminAgent.put(url + id)
      .send({name:'New user name - admin'})
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
      expect(res.body.name).equal('New user name - admin');
      done();
    }
  });
  it('can verify user edit as user1', function(done){
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
      expect(res.body.name).equal('New user name - admin');
      done();
    }
  });
  it('can update a single user as user1', function(done){
    users.user1Agent.put(url + id)
      .send({name:'New user name - user1'})
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body.msg).equal('success');
      done();
    }
  });
  it('can verify second user edit as admin', function(done){
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
      expect(res.body.name).equal('New user name - user1');
      done();
    }
  });
  it('can verify second user edit as user1', function(done){
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
      expect(res.body.name).equal('New user name - user1');
      done();
    }
  });
  it('cannot update a single user as user2', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New user name - user2'})
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
  it('cannot update a single user as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({name:'New user name - user2'})
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
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('New user name - user1');
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
      expect(res.body.msg).not.equal('success');
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
      expect(res.body.msg).not.equal('success');
      done();
    }
  });
  it('can delete a user as user1 (owner)', function(done){
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
  it('create a user as admin', function(done){
    users.adminAgent.post(url)
      .send({
        name:'My admin user',
        description:'Test user',
        contact:{
          youTube: 'www.youtube.com/foo'
        }
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
      expect(res.body.name).equal('My admin user');
    }
  });
  it('can get a single user as admin', function(done){
    users.adminAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin user');
      done();
    }
  });
  it('can get a admin user as user1', function(done){
    users.user1Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin user');
      done();
    }
  });
  it('can get a admin user as user2', function(done){
    users.user2Agent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin user');
      done();
    }
  });
  it('can get a admin user as nobody', function(done){
    users.nobodyAgent.get(url + id)
      .end(function(err, res){
        try{
          expects(err, res);
        }catch(e){console.error(e);}
      });
    function expects(err, res){
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin user');
      done();
    }
  });
  it('cannot update admin user as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({name:'New user name - nobody'})
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
  it('cannot update admin user as user2', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New user name - user2'})
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
  it('cannot update admin user as user1', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New user name - user1'})
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
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My admin user');
      done();
    }
  });
  it('can update admin user as admin', function(done){
    users.adminAgent.put(url + id)
      .send({name:'New user name - Admin'})
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
      console.log(res.body);
      expect(err).equal(null);
      expect(res.body._id).equal(id);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('New user name - Admin');
      done();
    }
  });
  it('cannot delete admin user as nobody', function(done){
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
  it('cannot delete admin user as user2', function(done){
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
  it('cannot delete admin user as user1', function(done){
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
  it('can delete a user as admin (owner)', function(done){
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
  it('cannot create a user as unauthenticated', function(done){
    users.nobodyAgent.post(url)
      .send({
        name:'My nobody user',
        description:'Test user',
        contact:{
          youTube: 'www.youtube.com/foo'
        }
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