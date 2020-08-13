export { };
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const Channel = new Schema({
  roomID: {
    type: String,
    required: true,
  },
  channelID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Channel', Channel, 'Channels');