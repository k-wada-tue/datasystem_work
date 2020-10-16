// Schema for metadata

// database 
const mongoose = require("mongoose");
//const directory = require("./directories");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const metadataSchema = new Schema ({
  id: ObjectId,
  title: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  age_group: {
    type: String,
    required: true
  },
  contributor: {
    type: ObjectId, 
    ref: 'users'
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: false
  },
  access: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  file: {
    type: String,
    required: false
  },
  created: {
    type: Date, 
    default: Date.now()
  },
  share: [{type: ObjectId, ref: 'users', required: false}]
  //updated: Date
}, {collection:"metadata"} //prevent mongoose to change the collection name plural
);

// exports.userSchema = mongoose.model('users', userSchema);
module.exports = mongoose.model('metadata', metadataSchema);
