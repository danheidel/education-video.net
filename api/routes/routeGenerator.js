'use strict';
/*global _*/
/*jshint -W079 */
//blank route file
var _ = require('lodash');

//route: API URl endpoint, e.g.: /api/v1/users/
//objectPath: file path from routeGenerator.js to the .js file with the Mongoose schema object, e.g.: '../models/User'
//app: instantiated Express server object
//securityFunc() - custom function to handle db-level ownership of documents.  Takes (user, dbobject), representing req.user and the returned db object.  Returns 'full', 'read', 'none' depending on whether the user is allowed read/write, read-only or no access to given resource.  Required or all API requests will return 403
//options:
//populate: [] - array of paths to populate on retrieval
//collection() - custom collection retrieval function
//findById() - custom single retrieval function
//create() - custom create function
//update() - custom update function
//destroy() - custom delete function
exports.routeFactory = function(route, objectPath, app, securityFunc, options){
  //objectPath is assumed to be the file and db object name
  var DbObject = require(objectPath);
  var popArray = [];
  if(options.populate){
    _.each(options.populate, function(elem){
      popArray.push({path: elem});
    });
  }

  var collection = function(req, res){
    console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && securityFunc(undefined) === 'none'){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403);
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    if(!options.collection){
      var queryBase;
      //if populate array is provided, populate return object with linked mongodb documents
      if(options.populate){
        queryBase = DbObject.find({}).populate(popArray);
      }else{
        queryBase = DbObject.find({});
      }
      queryBase.exec(function(err, retObject){
        if(err){
          res.send(500, {'error': err});
        } else {
          var accessVal = securityFunc(req.user, retObject);
          if(accessVal === 'full' || accessVal === 'read'){
            res.send(JSON.stringify(retObject));
          }else{
            res.send(403);
          }
        }
      });
    }else{
      options.collection();
    }
  };
  //set up the basic get collection route
  app.get(route, collection);

  var findById = function(req, res){
    console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && securityFunc(undefined) === 'none'){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403);
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    if(!options.findById){
      var queryBase;
      if(options.populate){
        queryBase = DbObject.findOne({'_id': String(id)}).populate(popArray);
      }else{
        queryBase = DbObject.findOne({'_id': String(id)});
      }
      queryBase.exec(function(err, retObject){
        if(err){
          res.send(500, {'error': err});
        } else {
          var accessVal = securityFunc(req.user, retObject);
          if(accessVal === 'full' || accessVal === 'read'){
            res.send(JSON.stringify(retObject));
          }else{
            res.send(403);
          }
        }
      });
    }else{
      options.findById();
    }
  };
  //set up the get by id route
  app.get(route + '/:id', findById);

  var create = function(req, res){
    console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && securityFunc(undefined) !== 'full'){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403);
      return;
    }
    var dbObject = new DbObject(req.body);
    if(!options.create){
      dbObject.save(function(err, retObject){
        if(err){
          res.send(500, {'error': err});
        } else {
          res.send(retObject);
        }
      });
    }else{
      options.create();
    }
  };
  //set up the create route
  app.post(route, create);

  var update = function(req, res){
    console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && securityFunc(undefined) !== 'full'){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403);
      return;
    }
    var id = String(req.params.id);
    //get rid of _id to prevent Mongo from shitting a brick
    delete req.body._id;
    var inputObject = req.body;
    if(!options.update){
      //need to put some validation here
      DbObject.update({'_id': id}, inputObject, function(err){
        if(err){
          res.send(500, {'error': err});
        } else {
          res.send({msg: 'success'});
        }
      });
    }else{
      options.create();
    }
  };
  //sets up the update route
  app.put(route + '/:id', update);

  var destroy = function(req, res){
    console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && securityFunc(undefined) !== 'full'){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403);
      return;
    }
    var id = String(req.params.id);
    if(!options.destroy){
      DbObject.remove({'_id': id}, function(err){
        if(err){
          res.send(500, {'error': err});
        } else {
          res.send({msg: 'success'});
        }
      });
    }else{
      options.destroy();
    }
  };
  //set up the delete route
  app.delete(route + '/:id', destroy);
};