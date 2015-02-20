'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;
var subSchema = mongoose.Schema({
  location: String,
  site: String,
  notes: String
}, {_id: false});

var schema = new mongoose.Schema({
  //_id: String,
  name: {
    type: String,
    required:true
  },
  lName: {
    type: String,
    required:true,
    index: {unique: true}
  },
  description: String,
  contact:[subSchema],
  local: {
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Creator', schema);
