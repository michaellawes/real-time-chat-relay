export { };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoiceChannel = new Schema({
  serverId: {
    type: String,
    required: true
  },
  voiceId: {
    type: String,
    required: true,
  },
  voiceName: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('VoiceChannel', VoiceChannel, 'VoiceChannels');