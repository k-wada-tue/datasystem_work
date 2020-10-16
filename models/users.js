// Schema for users

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  avator: {
    type: String,
    required: false
  },
  data: [{type: ObjectId, ref: 'metadata', required: false}],
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model("users", userSchema);