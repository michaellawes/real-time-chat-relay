export {};
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import isEmail from 'validator/lib/isEmail';

const User = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: [isEmail, 'No valid email address provided.']
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    maxlength: 60
  },
  lastLogin: {
    type: Date,
    required: false,
  },
  roomsJoined: [{
    roomID: {
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

User.methods.comparePassword = (candidatePassword: string, cb: any) => {
  bcrypt.compare(candidatePassword, this.password, (err: any, isMatch: boolean) => {
    if (err) return cb(err);
    cb(null, isMatch);
  })
}

module.exports = mongoose.model('User', User, 'users');