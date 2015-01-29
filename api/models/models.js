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
};
