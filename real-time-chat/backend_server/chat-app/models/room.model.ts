export { };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Room = new Schema({
  roomID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Room', Room, 'Rooms');
