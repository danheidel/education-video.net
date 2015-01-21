'use strict';
/*jshint expr: true*/
// var _ = require('lodash');
// var superagent = require('superagent');
console.log('starting creator api test');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var app = require('../../app.js').app;
var testLogin = require('../testLogin');
var users = {};

var id;
var url = 'http://localhost:5000/api/v1/creators/';

describe('Creator JSON API', function(){
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

  it('create a creator as user1', function(done){
    users.user1Agent.post(url)
      .send({
        name:'My test creator',
        description:'Test creator',
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
      console.log('created object');
      console.log(res.body);
      expect(err).eql(null);
      id = res.body._id;
      expect(res.status).to.not.equal(403);
      expect(res.body._id).not.equal(null);
      expect(res.body.__v).to.not.exist;
      expect(res.body.local).to.not.exist;
      expect(res.body.name).equal('My test creator');
    }
  });
  it('can get a creator collection as admin', function(done){
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
  it('can get a creator collection as user1', function(done){
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
  it('can get a creator collection as user2', function(done){
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
  it('can get a creator collection as nobody', function(done){
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
  it('can get a single creator as admin', function(done){
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
      expect(res.body.name).equal('My test creator');
      done();
    }
  });
  it('can get a single creator as user1', function(done){
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
      expect(res.body.name).equal('My test creator');
      done();
    }
  });
  it('can get a single creator as user2', function(done){
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
      expect(res.body.name).equal('My test creator');
      done();
    }
  });
  it('can get a single creator as nobody', function(done){
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
      expect(res.body.name).equal('My test creator');
      done();
    }
  });
  it('can update a single creator as admin', function(done){
    users.adminAgent.put(url + id)
      .send({name:'New creator name - admin'})
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
  it('can verify creator edit as admin', function(done){
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
      expect(res.body.name).equal('New creator name - admin');
      done();
    }
  });
  it('can verify creator edit as user1', function(done){
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
      expect(res.body.name).equal('New creator name - admin');
      done();
    }
  });
  it('can update a single creator as user1', function(done){
    users.user1Agent.put(url + id)
      .send({name:'New creator name - user1'})
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
  it('can verify second creator edit as admin', function(done){
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
      expect(res.body.name).equal('New creator name - user1');
      done();
    }
  });
  it('can verify second creator edit as user1', function(done){
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
      expect(res.body.name).equal('New creator name - user1');
      done();
    }
  });
  it('cannot update a single creator as user2', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New creator name - user2'})
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
  it('cannot update a single creator as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({name:'New creator name - user2'})
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
      expect(res.body.name).equal('New creator name - user1');
      done();
    }
  });
  it('cannot delete a creator as nobody', function(done){
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
  it('cannot delete a creator as user2', function(done){
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
  it('can delete a creator as user1 (owner)', function(done){
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
  it('can verify creator deletion', function(done){
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
  it('create a creator as admin', function(done){
    users.adminAgent.post(url)
      .send({
        name:'My admin creator',
        description:'Test creator',
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
      expect(res.body.name).equal('My admin creator');
    }
  });
  it('can get a single creator as admin', function(done){
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
      expect(res.body.name).equal('My admin creator');
      done();
    }
  });
  it('can get a admin creator as user1', function(done){
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
      expect(res.body.name).equal('My admin creator');
      done();
    }
  });
  it('can get a admin creator as user2', function(done){
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
      expect(res.body.name).equal('My admin creator');
      done();
    }
  });
  it('can get a admin creator as nobody', function(done){
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
      expect(res.body.name).equal('My admin creator');
      done();
    }
  });
  it('cannot update admin creator as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({name:'New creator name - nobody'})
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
  it('cannot update admin creator as user2', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New creator name - user2'})
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
  it('cannot update admin creator as user1', function(done){
    users.user1Agent.put(url + id)
      .send({name:'New creator name - user1'})
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
      expect(res.body.name).equal('My admin creator');
      done();
    }
  });
  it('can update admin creator as admin', function(done){
    users.adminAgent.put(url + id)
      .send({name:'New creator name - Admin'})
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
      expect(res.body.name).equal('New creator name - Admin');
      done();
    }
  });
  it('cannot delete admin creator as nobody', function(done){
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
  it('cannot delete admin creator as user2', function(done){
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
  it('cannot delete admin creator as user1', function(done){
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
  it('can delete a creator as admin (owner)', function(done){
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
  it('can verify creator deletion', function(done){
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
  it('cannot create a creator as unauthenticated', function(done){
    users.nobodyAgent.post(url)
      .send({
        name:'My nobody creator',
        description:'Test creator',
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
