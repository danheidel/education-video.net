'use strict';
/*global _*/
/*jshint -W079 */
//blank route file
var _ = require('lodash');

//this is a factory to create Express API endpoint to Mongoose routes
//generates all standard CRUD functionality
//this was build to assume that there is a 'local' object in the db that is not propagated to the front end.  While these functions are db structure agnostic, they are designed to provide db-specific data that is non-modifiable from the front end.  sanitizeInput() ensures that the front end cannot inject private objects, sanitizeOutput() ensure the private data is not transmitted and handleCreate() / handleUpdate() deal with populating the private fields.  The implementation of the private variables is up to the developer.

//route: API URl endpoint, e.g.: /api/v1/users/
//objectPath: file path from routeGenerator.js to the .js file with the Mongoose schema object, e.g.: '../models/User'
//app: instantiated Express server object
//options:
//securityFunc(user, dbObject) - custom function to handle db-level ownership of documents.  Takes (user, dbobject), representing req.user and the returned db object.  Returns 'full', 'read', 'none' depending on whether the user is allowed read/write, read-only or no access to given resource.  If called with user = undefined, returns the API-level access for unathenticated users.  Defaults to no access if no function provided.
//sanitizeInput(input) - custom function to validate data before saving it to db.  Takes input, modifies it.  Defaults to no-op
//sanitizeOutput(output) - custom function to remove db private data, etc from outgoing data.  Takes output, modifies it.  Defaults to no-op
//handleCreate(newObject, req) - custom function to handle non-public information creation on creation of new resource, e.g.: handling ownership and permissions level in db which are not accessible from the public API.  Takes newly created object and req and modifies the new object, e.g.: assigning req.user._id to the ownership field of the new object.  Defaults to no-op
//handleUpdate(newObject, oldObject) - custom function like handleCreate() to deal with non-public data when a resource is modified.  Takes newObject and old Object, modifies newObject.  E.g.: copies local non-visible properties from old object instance to the new object.  (incoming non-visible values populating new object are deleted to prevent injection attacks)  Defaults to no-op
//populate: [] - array of paths to populate on retrieval
//collection() - custom collection retrieval function
//findById() - custom single retrieval function
//create() - custom create function
//update() - custom update function
//destroy() - custom delete function
exports.routeFactory = function(route, objectPath, app, options){
  //if no securityFunc, block all access
  if(!options.securityFunc){
    options.securityFunc = function(user, dbObject){
      void(user);
      void(dbObject);
      return {
        read: false,
        create: false,
        edit: false,
        del: false
      };
    };
  }
  //if no sanitizeInput, create no-op stub
  if(!options.sanitizeInput){
    options.sanitizeInput = function(input){
      void(input);
    };
  }
  //if no checkCreate, create no-op stub
  if(!options.checkCreate){
    options.checkCreate = function(input, res){
      void(input);
      void(res);
    };
  }
  //if no checkUpdate, create no-op stub
  if(!options.checkUpdate){
    options.checkUpdate = function(input, res){
      void(input);
      void(res);
    };
  }
  //if no handleCreate, create no-op stub
  if(!options.handleCreate){
    options.handleCreate = function(input, userId, newObject){
      void(newObject);
      void(input);
      void(userId);
    };
  }
  //if no handleUpdate, create no-op stub
  if(!options.handleUpdate){
    options.handleUpdate = function(input, userId, oldObject){
      void(input);
      void(oldObject);
      void(userId);
    };
  }
  //if no sanitizeOutput, create no-op stub
  if(!options.sanitizeOutput){
    options.sanitizeOutput = function(output){
      void(output);
    };
  }

  //objectPath is file path from this file to Mongoose schema definition file
  var DbObject = require(objectPath);
  //convert populate string array to properly formatted object array
  var popArray = [];
  if(options.populate){
    _.each(options.populate, function(elem){
      popArray.push({path: elem});
    });
  }

  function handlePopulate(user, retObject){
    //handles security and sanitization in the population returned child objects in queries
    _.each(options.populate, function(pop){
      //for each populate field
      _.each(retObject[pop], function(popObject){
        //the populated object might be an array, so iterate another level
        if(options.securityFunc(user, popObject).read){
          //user has access to read resource
          options.sanitizeOutput(popObject);
        } else {
          //user shouldn't see this populated object
          popObject = undefined;
        }
      });
    });
  }

  var collection = function(req, res){
    // console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && !options.securityFunc(undefined).read){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403, {'error': 'unauthenticated users do not have access to read this resource'});
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
      queryBase.exec(function(err, retArray){
        if(err){
          res.send(500, {'error': err});
        } else {
          var checkedArray = [];
          _.each(retArray, function(retObject){
            //for each element, do access check and sanitize
            if(options.securityFunc(req.user, retObject).read){
              //if user has at read / full access to resource
              options.sanitizeOutput(retObject);
              if(options.populate){
                //sanitize child objects from populate if necessary
                handlePopulate(req.user, retObject);
              }
              checkedArray.push(retObject);
            }
          });
          res.send(JSON.stringify(checkedArray));
        }
      });
    }else{
      options.collection();
    }
  };
  //set up the basic get collection route
  app.get(route, collection);

  var findById = function(req, res){
    // console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && !options.securityFunc(undefined).read){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403, {'error': 'unauthenticated users do not have access to read this resource'});
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    if(!options.findById){
      var queryBase;
      //if populate array is provided, populate return object with linked mongodb documents
      if(options.populate){
        queryBase = DbObject.findOne({'_id': String(id)}).populate(popArray);
      }else{
        queryBase = DbObject.findOne({'_id': String(id)});
      }
      queryBase.exec(function(err, retObject){
        if(err){
          res.send(500, {'error': err});
        } else if(!retObject){
          // nothing with that _id was found
          res.send(500, {'error': 'no resource with that id could be found'});
        } else {
          //console.log(retObject);
          if(options.securityFunc(req.user, retObject).read){
            //if user has at read / full access to resource
            if(retObject){
              //if object returned, sanitize it
              options.sanitizeOutput(retObject);
              if(options.populate){
                //sanitize child objects from populate if necessary
                handlePopulate(req.user, retObject);
              }
            }
            res.send(JSON.stringify(retObject));
          }else{
            res.send(403, {'error':'user does not have access to read this resource'});
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
    // console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && !options.securityFunc(undefined).create){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403, {'error': 'unauthenticated users do not have access to create this resource'});
      return;
    }
    //see if user has access rights to create a resource
    if(!options.securityFunc(req.user, null).create){
      res.send(403, {'error':'user does not have rights to create that resource'});
      return;
    }
    options.sanitizeInput(req.body);
    options.checkCreate(req.body, res);

    var dbObject = new DbObject(req.body);

    //handle any necessary operations on new object (e.g., setting private vars for ownership, permisions, etc)
    //if object is being created by unauthenticated user, res.user will be undefined, handle that
    options.handleCreate(req.body, (req.user ? req.user._id : null), dbObject);

    if(!options.create){
      dbObject.save(function(err, createdObject){
        if(err){
          res.send(500, {'error': err});
          console.dir(err);
        } else {
          options.sanitizeOutput(createdObject);
          res.send(createdObject);
        }
      });
    }else{
      //if default behavior has been overridden
      options.create();
    }
  };
  //set up the create route
  app.post(route, create);

  var update = function(req, res){
    // console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && !options.securityFunc(undefined).update){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403, {'error': 'unauthenticated users do not have access to modify this resource'});
      return;
    }
    var id = String(req.params.id);
    //get existing db object to pull ownership, etc from it
    DbObject.findOne({'_id': String(id)}).exec(function(err, oldObject){
      if(err){
        res.send(500, {'error': err});
      } else if(!oldObject){
        res.send(500, {'error':'no resource with that id was found'});
      } else {
        //complete the update
        options.sanitizeInput(req.body);
        options.checkUpdate(req.body, res);

        options.handleUpdate(req.body, (req.user ? req.user._id : null), oldObject);

        if(options.securityFunc(req.user, oldObject).update){
          //only allow updates to this object if user has full write access to it
          if(!options.update){
            DbObject.update({'_id': id}, req.body, function(err){
              if(err){
                res.send(500, {'error': err});
              } else {
                res.send({msg: 'success'});
              }
            });
          }else{
            options.create();
          }
        } else {
          res.send(403, {'error':'user does not have access to modify this resource'});
        }
      }
    });
  };
  //sets up the update route
  app.put(route + '/:id', update);

  var destroy = function(req, res){
    // console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && !options.securityFunc(undefined).destroy){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.send(403, {'error': 'unauthenticated users do not have access to delete this resource'});
      return;
    }
    var id = String(req.params.id);
    //get existing db object to pull ownership, etc from it
    DbObject.findOne({'_id': String(id)}).exec(function(err, retObject){
      if(err){
        res.send(500, {'error': err});
      } else if(!retObject){
        res.send(500, {'error':'no resource with that id was found'});
      } else {
        //complete the deletion
        if(options.securityFunc(req.user, retObject).destroy){
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
        } else {
          res.send(403, {'error':'user does not have access to delete this resource'});
        }
      }
    });
  };
  //set up the delete route
  app.delete(route + '/:id', destroy);
};