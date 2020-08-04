export { }
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DirectMessage = new Schema({
  users: [String],
  conversation: [{
    from: {
      type: String,
      required: true,
    },
    userTo: {
      type: String,
      required: true,
    },
    msgId: {
      type: String,
      unique: true,
      required: true,
    },
    msg: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    }
  }],
});

module.exports = mongoose.model("DirectMessage", DirectMessage, 'DirectMessages');