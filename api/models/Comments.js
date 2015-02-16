'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  //_id: String,
  text: {
    type: String,
    required:true,
    index: {unique: true}
  },
  time: Date,
  userName: String,
  local: {
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Comments', schema);
