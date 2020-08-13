export {};
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatMessage = new Schema({
  roomID: {
    type: String,
    required: true
  },
  channelID: {
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

module.exports = mongoose.model("ChatMessage", ChatMessage, 'ChatMessages');
