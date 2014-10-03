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
var url = 'http://localhost:3000/api/v1/tags/';

describe('tag JSON API', function(){
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

  it('create a tag as user1', function(done){
    users.user1Agent.post(url)
      .send({
        name:'My test tag',
        description:'Test tag',
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
      expect(res.body.name).equal('My test tag');
    }
  });
  it('can get a tag collection as admin', function(done){
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
  it('can get a tag collection as user1', function(done){
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
  it('can get a tag collection as user2', function(done){
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
  it('can get a tag collection as nobody', function(done){
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
  it('can get a single tag as admin', function(done){
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
      expect(res.body.name).equal('My test tag');
      done();
    }
  });
  it('can get a single tag as user1', function(done){
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
      expect(res.body.name).equal('My test tag');
      done();
    }
  });
  it('can get a single tag as user2', function(done){
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
      expect(res.body.name).equal('My test tag');
      done();
    }
  });
  it('can get a single tag as nobody', function(done){
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
      expect(res.body.name).equal('My test tag');
      done();
    }
  });
  it('can update a single tag as admin', function(done){
    users.adminAgent.put(url + id)
      .send({name:'New tag name - admin'})
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
  it('can verify tag edit as admin', function(done){
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
      expect(res.body.name).equal('New tag name - admin');
      done();
    }
  });
  it('can verify tag edit as user1', function(done){
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
      expect(res.body.name).equal('New tag name - admin');
      done();
    }
  });
  it('can update a single tag as user1', function(done){
    users.user1Agent.put(url + id)
      .send({name:'New tag name - user1'})
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
  it('can verify second tag edit as admin', function(done){
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
      expect(res.body.name).equal('New tag name - user1');
      done();
    }
  });
  it('can verify second tag edit as user1', function(done){
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
      expect(res.body.name).equal('New tag name - user1');
      done();
    }
  });
  it('cannot update a single tag as user2', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New tag name - user2'})
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
  it('cannot update a single tag as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({name:'New tag name - user2'})
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
      expect(res.body.name).equal('New tag name - user1');
      done();
    }
  });
  it('cannot delete a tag as nobody', function(done){
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
  it('cannot delete a tag as user2', function(done){
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
  it('can delete a tag as user1 (owner)', function(done){
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
  it('can verify tag deletion', function(done){
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
  it('create a tag as admin', function(done){
    users.adminAgent.post(url)
      .send({
        name:'My admin tag',
        description:'Test tag',
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
      expect(res.body.name).equal('My admin tag');
    }
  });
  it('can get a single tag as admin', function(done){
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
      expect(res.body.name).equal('My admin tag');
      done();
    }
  });
  it('can get a admin tag as user1', function(done){
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
      expect(res.body.name).equal('My admin tag');
      done();
    }
  });
  it('can get a admin tag as user2', function(done){
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
      expect(res.body.name).equal('My admin tag');
      done();
    }
  });
  it('can get a admin tag as nobody', function(done){
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
      expect(res.body.name).equal('My admin tag');
      done();
    }
  });
  it('cannot update admin tag as nobody', function(done){
    users.nobodyAgent.put(url + id)
      .send({name:'New tag name - nobody'})
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
  it('cannot update admin tag as user2', function(done){
    users.user2Agent.put(url + id)
      .send({name:'New tag name - user2'})
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
  it('cannot update admin tag as user1', function(done){
    users.user1Agent.put(url + id)
      .send({name:'New tag name - user1'})
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
      expect(res.body.name).equal('My admin tag');
      done();
    }
  });
  it('can update admin tag as admin', function(done){
    users.adminAgent.put(url + id)
      .send({name:'New tag name - Admin'})
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
      expect(res.body.name).equal('New tag name - Admin');
      done();
    }
  });
  it('cannot delete admin tag as nobody', function(done){
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
  it('cannot delete admin tag as user2', function(done){
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
  it('cannot delete admin tag as user1', function(done){
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
  it('can delete a tag as admin (owner)', function(done){
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
  it('can verify tag deletion', function(done){
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
  it('cannot create a tag as unauthenticated', function(done){
    users.nobodyAgent.post(url)
      .send({
        name:'My nobody tag',
        description:'Test tag',
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