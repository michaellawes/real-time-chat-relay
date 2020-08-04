export { };
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const ThndrChannel = new Schema({
  serverId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  channelName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ThndrChannel', ThndrChannel, 'ThndrChannels');