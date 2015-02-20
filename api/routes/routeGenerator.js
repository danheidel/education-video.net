'use strict';
/*global _*/
/*jshint -W079 */
//blank route file
var _ = require('lodash');

//this is a factory to create Express API endpoint to Mongoose routes
//generates all standard CRUD functionality
//this was build to assume that there is a 'local' object in the db that is not
  //propagated to the front end.  While these functions are db structure agnostic,
  //they are designed to provide db-specific data that is non-modifiable from the
  //front end.  sanitizeInput() ensures that the front end cannot inject private
  //objects, sanitizeOutput() ensure the private data is not transmitted and
  //handleCreate()/handleUpdate() deal with populating the private fields.
  //and any other data manipulation/checks necessary to create/update the data
  //The implementation of the private variables is up to the developer.

//route: API URl endpoint, e.g.: /api/v1/users/

//objectPath: file path from routeGenerator.js to the .js file with the Mongoose
  //schema object, e.g.: '../models/User'

//app: instantiated Express server object

//options:
//securityFunc(user, dbObject) - custom function to handle db-level ownership of
  //documents.  Takes (user, dbobject), representing req.user and the returned db
  //object.  Returns 'full', 'read', 'none' depending on whether the user is allowed
  //read/write, read-only or no access to given resource.  If called with user = undefined,
  //returns the API-level access for unauthenticated users.
  //Defaults to no access if no function provided.

//sanitizeInput(input) - function to validate data before saving it to db.
  //Primarily handles security, preventing modification of the local object
  //Takes input, modifies it.  Default removes any _id or local objects
  //from incoming object

//sanitizeOutput(output) - function to remove db private data, etc from
  //outgoing data.  Takes output, modifies it.  Defaults to removing local
  //object and __v from all outgoing objects.
  //returns a new JS object cast from the DB object

//handleGet(outputObject, dbObject, userId) - function to handle any processing
  //for the API GET routes such as creating temporary fields based off of DB data.
  //Called after sanitizeOutput to simplify handling of properties in case of Mongoose
  //Default is a simple no-op stub
  //outputObject - JS object ready to be sent out, has already been sanitized
  //dbObject - the retrieved DB object, passed in in case sanitized properties need to
    //be accessed
  //userId - user identity for permissions operations
  //returns null on success, otherwise an error object

//handleCreate(input, userId, newObject) - function to handle API POST operations.
  //e.g.: handling hidden ownership and permissions and any other custom operations on
  //the newly created db object.  Default function creates an empty object on the local
  //property and populates the user identity into local.owner
  //input - incoming data object from req
  //userId - user identity for permissions operations
  //newObject - newly created DB object previously made from input
  //returns null on success, otherwise an error object

//handleUpdate(input, userId, oldObject) - function to handle API PUT operations.
  //e.g.: handling hidden ownership and permissions and any other custom operations on
  //the DB object being modified.  Defalt function ensures there is a local object and
  //copies the local.owner data into input to preserve it when the DB is updated
  //input - incoming data object from req
  //userId - user identity for permissions operations
  //oldObject - retrieved DB object that is being modified
  //returns null on success, otherwise an error object

//populate: [] - array of paths to populate on retrieval

//collection() - collection retrieval function,

//findById() - single retrieval function

//create() - create function

//update() - update function

//destroy() - delete function

//default, no-op stub versions of the security/sanitization/handler functions
//exposed to allow changing of defaults
exports.defaultSecurityFunc = function(user, dbObject){
  void(user);
  void(dbObject);
  return {
    read: false,
    create: false,
    edit: false,
    del: false
  };
};

exports.defaultSanitizeInput = function(input){
  //default function removes and reference to _id or the local object
  //to help prevent injection attacks
  delete(input._id);
  delete(input.__v);
  delete(input.local);
};

exports.defaultSanitizeOutput = function(output){
  //It is a good idea to modify the mongo schema options.toJSON
  //function to also delete the local object on outgoing data.
  //That handles *all* outgoing objects, including ones
  //on routes not defined by the route generator
  var outputObject = {};
  //assumes that if an object has toObject, it is a Mongoose schema
  if(output.toObject){
    outputObject = output.toObject();
    delete outputObject.local;
    delete outputObject.__v;
    return outputObject;
  } else {
    delete output.local;
    delete output.__v;
    return output;
  }
};

exports.defaultHandleGet = function(outputObject, dbObject, userId){
  return null;
};

exports.defaultHandleCreate = function(input, userId, newObject){
  if(!newObject.local){
    newObject.local = {};
  }
  newObject.local.owner = userId;
  return null;
};

exports.defaultHandleUpdate = function(input, userId, oldObject){
  if(!input.local){
    input.local = {};
  }
  input.local.owner = oldObject.local.owner;
  return null;
};

exports.routeFactory = function(route, objectPath, app, options){
  //if no securityFunc, block all access
  if(!options.securityFunc){
    options.securityFunc = exports.defaultSecurityFunc;
  }
  //if no sanitizeInput, replace with default
  if(!options.sanitizeInput){
    options.sanitizeInput = exports.defaultSanitizeInput;
  }
  //if no handleGet, replace with default
  if(!options.handleGet){
    options.handleGet = exports.defaultHandleGet;
  }
  //if no handleCreate, replace with default
  if(!options.handleCreate){
    options.handleCreate = exports.defaultHandleCreate;
  }
  //if no handleUpdate, replace with default
  if(!options.handleUpdate){
    options.handleUpdate = exports.defaultHandleUpdate;
  }
  //if no sanitizeOutput, replace with default
  if(!options.sanitizeOutput){
    options.sanitizeOutput = exports.defaultSanitizeOutput;
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
      res.status(403).send({'error': 'unauthenticated users do not have access to read this resource'});
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
          res.status(500).send({'error': err});
        } else {
          var checkedArray = [];
          _.each(retArray, function(dbReturn){
            //for each element, do access check and sanitize
            if(options.securityFunc(req.user, dbReturn).read){
              //if user has at read / full access to resource
              var retObject = options.sanitizeOutput(dbReturn);
              if(options.populate){
                //sanitize child objects from populate if necessary
                handlePopulate(req.user, retObject);
              }
              var getErr = options.handleGet(retObject, dbReturn, (req.user ? req.user._id : null));
              if(getErr){
                return res.status(getErr.status).send(getErr.error);
              }
              checkedArray.push(retObject);
            }
          });
          res.send(JSON.stringify(checkedArray));
        }
      });
    }else{
      options.collection(req, res);
    }
  };
  //set up the basic get collection route
  app.get(route, collection);

  var findByQuery = function(req, res){
    console.log('findByQuery');
    if(!req.isAuthenticated() && !options.securityFunc(undefined).read){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.status(403).send({'error': 'unauthenticated users do not have access to read this resource'});
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    var query = req.query;
    if(!options.findByQuery){
      var queryBase;
      //if populate array is provided, populate return object with linked mongodb documents
      if(options.populate){
        queryBase = DbObject.find(query).populate(popArray);
      }else{
        queryBase = DbObject.find(query);
      }
      queryBase.exec(function(err, retArray){
        console.log(query);
        console.log(retArray);
        if(err){
          res.status(500).send({'error': err});
        } else {
          var checkedArray = [];
          _.each(retArray, function(dbReturn){
            //for each element, do access check and sanitize
            if(options.securityFunc(req.user, dbReturn).read){
              //if user has at read / full access to resource
              var retObject = options.sanitizeOutput(dbReturn);
              if(options.populate){
                //sanitize child objects from populate if necessary
                handlePopulate(req.user, retObject);
              }
              var getErr = options.handleGet(retObject, dbReturn, (req.user ? req.user._id : null));
              if(getErr){
                return res.status(getErr.status).send(getErr.error);
              }
              checkedArray.push(retObject);
            }
          });
          res.send(JSON.stringify(checkedArray));
        }
      });
    } else {
      options.findByQuery(req, res);
    }
  };
  //set up the query-able route
  app.get(route + '/query', findByQuery);

  var findById = function(req, res){
    // console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && !options.securityFunc(undefined).read){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.status(403).send({'error': 'unauthenticated users do not have access to read this resource'});
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
      queryBase.exec(function(err, dbReturn){
        if(err){
          res.status(500).send({'error': err});
        } else if(!dbReturn){
          // nothing with that _id was found
          res.status(500).send({'error': 'no resource with that id could be found'});
        } else {
          if(options.securityFunc(req.user, dbReturn).read){
            //if user has at read / full access to resource
            var retObject = options.sanitizeOutput(dbReturn);
            if(options.populate){
              //sanitize child objects from populate if necessary
              handlePopulate(req.user, retObject);
            }
            var getErr = options.handleGet(retObject, dbReturn, (req.user ? req.user._id : null));
            if(getErr){
              return res.status(getErr.status).send(getErr.error);
            }
            res.send(JSON.stringify(retObject));
          }else{
            res.status(403).send({'error':'user does not have access to read this resource'});
          }
        }
      });
    }else{
      options.findById(req, res);
    }
  };
  //set up the get by id route
  app.get(route + '/:id', findById);

  var create = function(req, res){
    // console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && !options.securityFunc(undefined).create){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.status(403).send({'error': 'unauthenticated users do not have access to create this resource'});
      return;
    }
    //see if user has access rights to create a resource
    if(!options.securityFunc(req.user, null).create){
      res.status(403).send({'error':'user does not have rights to create that resource'});
      return;
    }
    options.sanitizeInput(req.body);

    var dbObject = new DbObject(req.body);

    //handle any necessary operations on new object (e.g., setting private vars for ownership, permisions, etc)
    //if object is being created by unauthenticated user, res.user will be undefined, handle that
    //returns non-null if an error
    var createErr = options.handleCreate(req.body, (req.user ? req.user._id : null), dbObject);
    if(createErr){
      return res.status(createErr.status).send(createErr.error);
    }

    if(!options.create){
      dbObject.save(function(err, createdObject){
        if(err){
          res.status(500).send({'error': err});
          console.dir(err);
        } else {
          options.sanitizeOutput(createdObject);
          res.send(createdObject);
        }
      });
    }else{
      //if default behavior has been overridden
      options.create(req, res);
    }
  };
  //set up the create route
  app.post(route, create);

  var update = function(req, res){
    // console.log('is authenticated? ' + req.isAuthenticated());
    if(!req.isAuthenticated() && !options.securityFunc(undefined).update){
      //if resource is not available to unauthenticated users and user is unauthenticated, skip db, return 403
      res.status(403).send({'error': 'unauthenticated users do not have access to modify this resource'});
      return;
    }
    var id = String(req.params.id);
    //get existing db object to pull ownership, etc from it
    DbObject.findOne({'_id': String(id)}).exec(function(err, oldObject){
      if(err){
        res.status(500).send({'error': err});
      } else if(!oldObject){
        res.status(500).send({'error':'no resource with that id was found'});
      } else {
        //complete the update
        options.sanitizeInput(req.body);

        //handle any special modification steps, returns non-null if this has failed
        var updateErr = options.handleUpdate(req.body, (req.user ? req.user._id : null), oldObject);
        if(updateErr){
          return res.status(updateErr.status).send(updateErr.error);
        }

        if(options.securityFunc(req.user, oldObject).update){
          //only allow updates to this object if user has full write access to it
          if(!options.update){
            DbObject.update({'_id': id}, req.body, function(err){
              if(err){
                res.status(500).send({'error': err});
              } else {
                res.send({msg: 'success'});
              }
            });
          }else{
            options.update(req, res);
          }
        } else {
          res.status(403).send({'error':'user does not have access to modify this resource'});
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
      res.status(403).send({'error': 'unauthenticated users do not have access to delete this resource'});
      return;
    }
    var id = String(req.params.id);
    //get existing db object to pull ownership, etc from it
    DbObject.findOne({'_id': String(id)}).exec(function(err, retObject){
      if(err){
        res.status(500).send({'error': err});
      } else if(!retObject){
        res.status(500).send({'error':'no resource with that id was found'});
      } else {
        //complete the deletion
        if(options.securityFunc(req.user, retObject).destroy){
          if(!options.destroy){
            DbObject.remove({'_id': id}, function(err){
              if(err){
                res.status(500).send({'error': err});
              } else {
                res.send({msg: 'success'});
              }
            });
          }else{
            options.destroy(req, res);
          }
        } else {
          res.status(403).send({'error':'user does not have access to delete this resource'});
        }
      }
    });
  };
  //set up the delete route
  app.delete(route + '/:id', destroy);
};
