'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  name: {
    type: String,
    required:true
  },
  lName: {
    type: String,
    required:true,
    index: {unique: true}
  },
  category: {
    type: String,
    required: true
  },
  local: {
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Tag', schema);
