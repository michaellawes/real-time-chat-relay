export { };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Admin = new Schema({
  roomID: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Admin', Admin, 'Admins');