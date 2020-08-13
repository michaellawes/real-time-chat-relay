export {};
const { Admin } = require('./admins.model');
const { Channel } = require('./channel.model');
const { ChatMessage } = require('./chatMessage.model');
const { DirectMessage } = require('./directMessages.model');
const { Room } = require('./room.model');
const { User } = require('./user.model');
const { VoiceCall } = require('./voiceCall.model');

module.exports = { Admin, Channel, ChatMessage, DirectMessage, Room, User, VoiceCall };