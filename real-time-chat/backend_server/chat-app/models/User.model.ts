export {};
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const Schema = mongoose.Schema;

const User = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    maxlength: 60
  },
  role: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: false,
    maxlength: 150,
  },
  birth: {
    type: String,
    required: false,
  },
  avatar: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: false,
    ref: 'File' 
  },
  cover: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: false,
    ref: 'File' 
  },
  lastLogin: {
    type: Date,
    required: false,
  },
  followerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User'
  }],
  followingIds: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User'
  }],
  serversJoined: [{
    serverId: {
      type: String,
      required: true
    },
    lastActive: {
      type: Date,
      required: true
    },
  }],
  directMessages: [String]
});

module.exports = mongoose.model('User', User, 'users');