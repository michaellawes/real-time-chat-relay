export { };
import { getDM } from '../utils/dmUtils';

// Connection dependencies
const connect = require('../db/db');

// Dependencies
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');

// Models
const User = require("../models/User.model");
const Admin = require("../models/ThndrAdmins.model");
const Server = require("../models/ThndrServer.model");
const Channel = require("../models/ThndrChannel.model");
const VoiceChannel = require("../models/VoiceChannel.model");
const ServerMessage = require("../models/ServerMessage.model");

// Get server list for user
export const getServerList = async (username: string): Promise<object> => {
  const response = await User
    .findOne({ username: username }, { _id: 0, serversJoined: 1 })
    .catch(err => {
      throw err;
    });
  return response.serversJoined;
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
      avatar: new ObjectId(),
      cover: new ObjectId(),
      lastLogin: new Date(),
      followerIds: [],
      followingsIds: [],
      serversJoined: [],
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

// Checks is user is admin of server
export const userIsAdmin = async (serverId: string, username: string) => {
  try {
    return await connect
      .then(async db => {
        return await Admin
          .findOne({ username: username, serverId: serverId})
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
export const updateActive = async (username: string, serverId: string) => {
  try {
    connect
      .then(async db => {
        await User
          .updateOne(
            { username: username, "serversJoined.serverId": serverId },
            { $set: { "serversJoined.$.lastActive": new Date() } }
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

// Loads initial server and dm information for user
export const loadUser = async (username: string): Promise<object> => {
  try {
    return await connect
      .then(async db => {
        const userInfo = await User
          .findOne({ username: username }, { serversJoined: 1, directMessages: 1, _id: 0 })
          .catch(err => {
            throw err;
          });
        const data: any = {};
        for(let i = 0;i < userInfo.serversJoined.length;i++) {
          const serverId = userInfo.serversJoined[i].serverId;
          const server: any = await Server
            .findOne({ serverId: serverId })
            .catch(err => {
              throw err;
            });
          const serverConjoined = serverId + '/' + server.serverName;
          if (data['servers'] === undefined) {
            data['servers'] = {};
          };
          if (data['servers'][serverConjoined] === undefined) {
            data['servers'][serverConjoined] = {};
          };
          if (data['servers'][serverConjoined]['channels'] === undefined) {
            data['servers'][serverConjoined]['channels'] = {};
          };
          if (data['servers'][serverConjoined]['voiceChannels'] === undefined) {
            data['servers'][serverConjoined]['voiceChannels'] = {};
          };
          const channelList = await Channel
            .find({ serverId: serverId }, { channelId: 1, channelName: 1, _id: 0 })
            .catch(err => {
              throw err;
            });
          const voiceChannelList = await VoiceChannel
            .find({ serverId: serverId }, { voiceId: 1, voiceName: 1, _id: 0 })
            .catch(err => {
              throw err;
            });
          for(let j = 0;j < channelList.length;j++) {
            const channel = channelList[j];
            const channelId = channel.channelId;
            const channelConjoined = channelId + '/' + channel.channelName;

            const messages = await ServerMessage
              .find({ serverId: serverId, channelId: channelId }, { from: 1, msgId: 1, msg: 1, timestamp: 1, _id: 0 })
              .catch(err => {
                throw err;
              });
            messages.sort((a, b) => { return a.timestamp - b.timestamp });
            if (data['servers'][serverConjoined]['channels'][channelConjoined] === undefined) {
              data['servers'][serverConjoined]['channels'][channelConjoined] = messages;
            };
          }
          for(let k = 0;k < voiceChannelList.length;k++) {
            const voiceChannel = voiceChannelList[k];
            const voiceConjoined = voiceChannel.voiceId + '/' + voiceChannel.voiceName;
            if (data['servers'][serverConjoined]['voiceChannels'][voiceConjoined] === undefined) {
              data['servers'][serverConjoined]['voiceChannels'][voiceConjoined] = {};
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
