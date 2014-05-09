'use strict';

module.exports.setupModel = function(schema){
  if(!schema.options.toJSON) {
    schema.options.toJSON = {};
  }

  schema.options.toJSON.transform = function(doc, ret, options){
    void(options);
    //sanitize to remove local object before it is sent out
    delete ret.local;
    delete ret.__v;
  };

  schema.methods.security = function(user, dbObject){
    //default security stub.  Disallows all access to resource
    void(user);
    void(dbObject);
    return 'none';
  };
  schema.methods.create = function(){};
  schema.methods.update = function(){};
  schema.methods.sanitizeInput = function(){};

  // schema.pre('save', function(next){
  //   //incoming data from API should never have local object included
  //   this.local = undefined;
  //   next();
  // });

  // schema.pre('update', function(next){
  //   //incoming data from API should never have local object included
  //   this.local = undefined;
  //   next();
  // });
};