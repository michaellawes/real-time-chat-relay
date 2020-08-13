export { };
import { getDM } from '../utils/dmUtils';

// Connection dependencies
const connect = require('../db/db');

// Dependencies
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');

// Models
const { User, Admin, Room, Channel, VoiceCall, ChatMessage } = require('../models');

// Get room list for user
export const getRoomList = async (username: string): Promise<object> => {
  const response = await User
    .findOne({ username: username }, { _id: 0, roomsJoined: 1 })
    .catch(err => {
      throw err;
    });
  return response.roomsJoined;
};

// Create user
export const createUser = async (
  name: string,
  username: string,
  email: string,
  password: string,
) => {
  try {
    await connect;
    const hashed = await hashPassword(password);
    const userCreated = new User({
      username: username,
      email: email,
      password: hashed,
      role: '',
      name: name,
      bio: '',
      birth: '',
      avatar: new ObjectID(),
      cover: new ObjectID(),
      lastLogin: new Date(),
      followerIDs: [],
      followingsIDs: [],
      roomsJoined: [],
      directMessages: []
    });
    await userCreated.save();
  } catch(err) {
    throw err;
  };
};

// Returns true if user exists
export const userExists = async (username: string) => {
  try {
    return await connect
      .then(async db => {
        return await User
          .findOne({ username: username })
          .then((response) => {
            if (response === null) {
              return false;
            } else {
              return true;
            };
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Checks is user is admin of room
export const userIsAdmin = async (roomID: string, username: string) => {
  try {
    return await connect
      .then(async db => {
        return await Admin
          .findOne({ username: username, roomID: roomID})
          .then(response => {
            if(response === null) {
              return false;
            } else {
              return true;
            };
          })
          .catch(err => {
            throw err;
          });
      })  
      .catch(err => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Hash password
export const hashPassword = async (password: string) => {
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      resolve(hash)
    });
  });
  return hashedPassword;
};

// Update user last active
export const updateActive = async (username: string, roomID: string) => {
  try {
    connect
      .then(async db => {
        await User
          .updateOne(
            { username: username, "roomsJoined.roomID": roomID },
            { $set: { "roomsJoined.$.lastActive": new Date() } }
          )
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Loads initial room and dm information for user
export const loadUser = async (username: string): Promise<object> => {
  try {
    return await connect
      .then(async db => {
        const userInfo = await User
          .findOne({ username: username }, { roomsJoined: 1, directMessages: 1, _id: 0 })
          .catch(err => {
            throw err;
          });
        const data: any = {};
        for(let i = 0;i < userInfo.roomsJoined.length;i++) {
          const roomID = userInfo.roomsJoined[i].roomID;
          const room: any = await Room
            .findOne({ roomID: roomID })
            .catch(err => {
              throw err;
            });
          const roomConjoined = roomID + '/' + room.name;
          if (data['rooms'] === undefined) {
            data['rooms'] = {};
          };
          if (data['rooms'][roomConjoined] === undefined) {
            data['rooms'][roomConjoined] = {};
          };
          if (data['rooms'][roomConjoined]['channels'] === undefined) {
            data['rooms'][roomConjoined]['channels'] = {};
          };
          if (data['rooms'][roomConjoined]['voiceCalls'] === undefined) {
            data['rooms'][roomConjoined]['voiceCalls'] = {};
          };
          const channelList = await Channel
            .find({ roomID: roomID }, { channelID: 1, name: 1, _id: 0 })
            .catch(err => {
              throw err;
            });
          const VoiceCallList = await VoiceCall
            .find({ roomID: roomID }, { voiceID: 1, name: 1, _id: 0 })
            .catch(err => {
              throw err;
            });
          for(let j = 0;j < channelList.length;j++) {
            const channel = channelList[j];
            const channelID = channel.channelID;
            const channelConjoined = channelID + '/' + channel.name;

            const messages = await ChatMessage
              .find({ roomID: roomID, channelID: channelID }, { from: 1, msgID: 1, msg: 1, timestamp: 1, _id: 0 })
              .catch(err => {
                throw err;
              });
            messages.sort((a, b) => { return a.timestamp - b.timestamp });
            if (data['rooms'][roomConjoined]['channels'][channelConjoined] === undefined) {
              data['rooms'][roomConjoined]['channels'][channelConjoined] = messages;
            };
          }
          for(let k = 0;k < VoiceCallList.length;k++) {
            const VoiceCall = VoiceCallList[k];
            const voiceConjoined = VoiceCall.voiceID + '/' + VoiceCall.name;
            if (data['rooms'][roomConjoined]['voiceCalls'][voiceConjoined] === undefined) {
              data['rooms'][roomConjoined]['voiceCalls'][voiceConjoined] = {};
            };
          };
        };
        for (let l = 0; l < userInfo.directMessages.length; l++) {
          if (data['pms'] === undefined) {
            data['pms'] = {};
          };
          const conversation: any = await getDM(username, userInfo.directMessages[l]);
          if (data['pms'][userInfo.directMessages[l]] === undefined) {
            data['pms'][userInfo.directMessages[l]] = conversation;
          };
        };
        return data;
      })
      .catch(err => {
        throw err;
      });
  } catch(err) {
    throw err;
  };
};
