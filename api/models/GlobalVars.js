'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  sessionSecret: String,
  userId: Number,
  port: Number,
  ytKey: String
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('GlobalVars', schema);
