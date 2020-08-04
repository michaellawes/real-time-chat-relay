export {};
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServerMessage = new Schema({
  serverId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
    required: true,
  },
  msgId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model("ServerMessage", ServerMessage, 'ServerMessages');
