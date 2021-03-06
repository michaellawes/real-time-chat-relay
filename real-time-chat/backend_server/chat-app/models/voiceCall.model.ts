export { };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoiceCall = new Schema({
  roomID: {
    type: String,
    required: true
  },
  voiceID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('VoiceCall', VoiceCall, 'VoiceCalls');