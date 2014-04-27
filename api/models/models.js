'use strict';

module.exports.setupModel = function(schema){
  if(!schema.options.toJSON) {
    schema.options.toJSON = {};
  }
  schema.options.toJSON.transform = function(doc, ret, options){
    void(options);
    //sanitize local object
    delete ret.local;
    delete ret.__v;
  };
};