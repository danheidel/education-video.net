'use strict';

var baseInput = function(input){
  //remove any explicit _id
  delete input._id;
  //remove any incoming local object
  delete input.local;
};

module.exports.baseInput = baseInput;

var baseOutput = function(output){
  void(output);
  //leave the output sanitization to the schema toJSON function, otherwise populated fields become horrible
  // output.local = undefined;
  // output.__v = undefined;
};

module.exports.baseOutput = baseOutput;