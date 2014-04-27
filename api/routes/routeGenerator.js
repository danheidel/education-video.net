'use strict';
/**/
//blank route file

//options:
//security: full - all API endpoints need authentication
//security: open-read - API C-UD endpoints need authentication
//security: none - API endpoints all open w/o authentication
//collection() - custom collection retrieval function
//findById() - custom single retrieval function
//create() - custom create function
//update() - custom update function
//destroy() - custom delete function
exports.routeFactory = function(route, objectPath, options){
  //objectPath is assumed to be the file and db object name
  var app = options.app;
  //security can be 'full', open-read', 'none'
  var security = options.security || 'full';
  var DbObject = require(objectPath);

  var collection = function(req, res){
    if(security === 'full' && !req.isAuthenticated()){
      res.send(403);
    }
    res.setHeader('Content-Type', 'application/json');
    if(!options.collection){
      DbObject.find({}, function(err, retObject){
        if(err){
          res.send(500, {'error': err});
        } else {
          res.send(JSON.stringify(retObject));
        }
      });
    }else{
      options.collection();
    }
  };
  //set up the basic get collection route
  app.get(route, collection);

  var findById = function(req, res){
    if(security === 'full' && !req.isAuthenticated()){
      res.send(403);
    }
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    if(!options.findById){
      DbObject.findOne({'_id': String(id)}, function(err, retObject){
        if(err){
          res.send(500, {'error': err});
        } else {
          res.send(retObject);
        }
      });
    }else{
      options.findById();
    }
  };
  //set up the get by id route
  app.get(route + '/:id', findById);

  var create = function(req, res){
    if(security !== 'none' && !req.isAuthenticated()){
      res.send(403);
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
    if(security !== 'none' && !req.isAuthenticated()){
      res.send(403);
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
    if(security !== 'none' && !req.isAuthenticated()){
      res.send(403);
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