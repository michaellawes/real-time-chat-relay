export { };
import { userIsAdmin } from "./userUtils";

// Connection dependencies
const connect = require('../db/db');

// Models
const ServerMessage = require("../models/ServerMessage.model");
const Channel = require("../models/ThndrChannel.model");
const Server = require("../models/ThndrServer.model");
const User = require("../models/User.model");
const Admin = require("../models/ThndrAdmins.model");
const DirectMessage = require('../models/DirectMessages.model');
const VoiceChannel = require("../models/VoiceChannel.model");

const generateId = (): string => {
  return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/1|0/g, function () {
    return (0 | (Math.random() * 16)).toString(16);
  });
};

// Gets unique Id for server or channel or message
export const getUniqueId = async(
  type: string,
  serverId?: string,
  channelId?: string,
  userId1?: string,
  userId2?: string
): Promise<string> => {
  try {
    const newId = generateId();
    return await connect
    .then(async db => {
      if (type === "server") {
        return await Server.findOne({ serverId: newId })
          .then(async (response) => {
            if (response === null) {
              return newId;
            } else {
              return await getUniqueId(type);
            };
          })
          .catch((err) => {
            throw err;
          });
      } else if (type === "channel") {
        return await Channel.findOne({ serverId: serverId, channelId: newId })
          .then(async (response) => {
            if (response === null) {
              return newId;
            } else {
              return await getUniqueId(type, serverId);
            };
          })
          .catch((err) => {
            throw err;
          });
      } else if (type === "server-message") {
        const response = await ServerMessage
          .findOne({
            serverId: serverId,
            channelId: channelId,
            msgId: newId,
          })
          .catch((err) => {
            throw err;
          });
        if (response === null) {
          return newId;
        } else {
          return await getUniqueId(type, serverId, channelId);
        };
      } else if (type === "voice") {
        return await VoiceChannel.findOne({ serverId: serverId, voiceId: newId })
          .then(async (response) => {
            if (response === null) {
              return newId;
            } else {
              return await getUniqueId(type, serverId);
            };
          })
          .catch((err) => {
            throw err;
          });
      } else {
        return await DirectMessage
          .findOne({
            users: { $all: [userId1, userId2] },
            conversation: { msgId: newId },
          })
          .then(async (response) => {
            if (response === null) {
              return newId;
            } else {
              return await getUniqueId(type, '','', userId1, userId2);
            };
          })
          .catch((err) => {
            throw err;
          });
      };
    })
    .catch(err => {
      throw err;
    });
  } catch (err) {
    throw err;
  };
};

// Insert message into either server or private message
export const insertMessage = async (msg: any): Promise<object> => {
  try {
    return await connect
      .then(async (db) => {
        if (msg.type === "server") {
          const msgId = await getUniqueId("server-message", msg.server.split('/', 2)[0], msg.channel.split('/', 2)[0]);
          const message = {
            server: msg.server,
            channel: msg.channel,
            from: msg.from,
            msg: msg.msg,
            msgId: msgId,
            timestamp: msg.timestamp,
          };
          const serverMessage = new ServerMessage({
            serverId: msg.server.split('/')[0],
            channelId: msg.channel.split('/')[0],
            from: msg.from,
            msg: msg.msg,
            msgId: msgId,
            timestamp: msg.timestamp
          });
          await serverMessage
            .save()
            .catch((err) => {
              throw err;
            });
          return message;
        } else {
          const msgId = await getUniqueId("private-message", "", "", msg.from, msg.userTo);
          const message = {
            from: msg.from,
            userTo: msg.userTo,
            user: msg.user,
            msgId: msgId,
            msg: msg.msg,
            timestamp: msg.timestamp,
          };
          await DirectMessage
            .updateOne(
              { users: { $all: [msg.from, msg.userTo] } },
              { $push: { conversation: 
                  {
                    from: msg.from,
                    userTo: msg.userTo,
                    msgId: msgId,
                    msg: msg.msg,
                    timestamp: msg.timestamp,
                  } 
                } 
              },
            )
            .catch((err) => {
              throw err;
            });
          return message;
        };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Deletes message from either server or direct message
export const deleteMessage = async(
  type: string,
  msgId: string,
  serverId?: string,
  channelId?: string,
  from?: string,
  userTo?: string,
) => {
  try {
    connect
      .then(async (db) => {
        if (type === "server") {
          await ServerMessage
            .deleteOne({
              serverId: serverId,
              channelId: channelId,
              msgId: msgId,
            })
            .catch((err) => {
              throw err;
            });
        } else {
          await DirectMessage
            .findOneAndUpdate(
              { users: { $all: [from, userTo] } },
              { $pull: { conversation: { msgId: msgId } } }
            )
            .catch((err) => {
              throw err;
            });
        };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Adds user to server
export const joinServer = async (
  serverId: string,
  username: string
) => {
  try {
    await connect;
    await User
      .updateOne(
        { username: username },
        {
          $push: {
            serversJoined: {
              serverId: serverId,
              lastActive: new Date(),
            },
          },
        }
      )
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Creates server
export const createServer = async (
  username: string,
  serverName: string
): Promise<object> => {
  try {
    await connect;
    const serverId = await getUniqueId("server");
    const server = new Server({
      serverId: serverId,
      serverName: serverName,
      ownerId: username,
    });
    await server.save();
    const newChannel = await createChannel(serverId, "General");
    const newVoice = await createVoiceChannel(serverId, "General");
    await User
      .findOneAndUpdate(
        { username: username },
        { 
          $push: { serversJoined: {
            serverId: serverId,
            lastActive: new Date()
            } 
          }
        }
      )
      .catch(err => {
        throw err;
      });
    return {
      serverId: serverId,
      channelId: newChannel,
      voiceId: newVoice,
    };
  } catch (err) {
    throw err;
  };
};

// Leave server
export const leaveServer = async(
  serverId: string,
  username: string,
) => {
  try {
    await connect;
    await User
          .updateOne(
            { "serversJoined.serverId": serverId, username: username },
            { $pull: { serversJoined: { serverId: serverId }  } }
          )
          .catch((err) => {
            throw err;
          });
    if (await userIsAdmin(serverId, username)) {
      await removeAdmin(serverId, username);
    };
  } catch(err) {
    throw err;
  };
};

// Creates channel 
export const createChannel = async(
  serverId: string,
  channelName: string
): Promise<string> => {
  try {
    await connect;
    const channelId = await getUniqueId("channel", serverId);
    const channel = new Channel({
      serverId: serverId,
      channelId: channelId,
      channelName: channelName,
    });
    await channel.save();
    return channelId;
  } catch (err) {
    throw err;
  };
};

// Creates voice channel
export const createVoiceChannel = async(
  serverId: string,
  voiceName: string
): Promise<string> => {
  try {
    await connect;
    const voiceId = await getUniqueId("voice", serverId);
    const voiceChannel = new VoiceChannel({
      serverId: serverId,
      voiceId: voiceId,
      voiceName: voiceName,
    });
    await voiceChannel.save();
    return voiceId;
  } catch (err) {
    throw err;
  };
};

// Makes user admin of server
export const makeAdmin = async(
  serverId: string,
  username: string
) => {
  try {
    await connect
      .then(async (db) => {
        const newAdmin = new Admin({
          serverId: serverId,
          username: username,
        });
        await newAdmin
          .save()
          .catch(err => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Removes admin status from user
export const removeAdmin = async (serverId: string, username: string) => {
  try {
    await connect
      .then(async (db) => {
        await Admin
          .deleteOne({ serverId: serverId, username: username })
          .catch(err => { 
            throw err; 
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch(err) {
    throw err;
  };
};

// Gets current display name
export const getServerName = async (serverId: string): Promise<string> => {
  try {
    return await connect
      .then(async (db) => {
        const server = await Server
          .findOne({ serverId: serverId }, { serverName: 1, _id: 0 })
          .catch((err) => {
            throw err;
          });
        return server.serverName;
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Get active List
export const getActiveUsers = async (serverId: string): Promise<object> => {
  try {
    return await connect
      .then(async (db) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 5);
        const UsersThatApply = await User
          .find({
            $and: [
                { "serversJoined.serverId": serverId },
                { "serversJoined.lastActive": { $gt: now } },
              ],
          }, { _id: 0, username: 1 })
          .catch((err) => {
            throw err;
          });
        return UsersThatApply;
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Get unactive user list
export const getUnactiveUsers = async (serverId: string): Promise<object> => {
  try {
    return await connect
      .then(async (db) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 5);
        const UsersThatApply = await User
          .find({
            $and: [
                { "serversJoined.serverId": serverId },
                { "serversJoined.lastActive": { $lt: now } },
              ],
          }, { _id: 0, username: 1 })
          .catch((err) => {
            throw err;
          });
        return UsersThatApply;
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Delete server
export const deleteServer = async (serverId: string) => {
  try {
    connect
      .then(async (db) => {
        await User
          .updateMany(
            { "serversJoined.serverId": serverId },
            { $pull: { serversJoined: { serverId: serverId }  } }
          )
          .catch((err) => {
            throw err;
          });
        await Admin
          .deleteMany({ serverId: serverId })
          .catch((err) => {
            throw err;
          });
        const channelInventory = await Channel
          .find({ serverId: serverId }, { _id: 0, channelId: 1 })
          .catch((err) => {
            throw err;
          });
        for (var i = 0; i < channelInventory.length; i++) {
          await ServerMessage
            .deleteMany({ channelId: channelInventory[i].channelId })
            .catch((err) => {
              throw err;
            });
        };
        await VoiceChannel
          .deleteMany({ serverId: serverId })
          .catch((err) => {
            throw err;
          });
        await Channel
          .deleteMany({ serverId: serverId })
          .catch((err) => {
            throw err;
          });
        await Server
          .deleteOne({ serverId: serverId })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Deletes channel
export const deleteChannel = async (serverId: string, channelId: string) => {
  try {
    connect
      .then(async (db) => {
        await ServerMessage
          .deleteMany({ channelId: channelId })
          .catch((err) => {
            throw err;
          });
        await Channel
          .deleteOne({ serverId: serverId, channelId: channelId })
          .catch((err) => {
          throw err;
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Delete voice channel
export const deleteVoiceChannel = async (serverId: string, voiceId: string) => {
  try {
    connect
      .then(async (db) => {
        await VoiceChannel
          .deleteOne({ serverId: serverId, voiceId: voiceId })
          .catch(err => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Rename channel
export const rename = async (type: string, serverId: string, name: string, channelId?: string, voiceId?: string) => {
  try {
    connect
      .then(async (db) => {
        if (type === "server") {
          await Server.findOneAndUpdate(
            { serverId: serverId },
            { $set: { serverName: name } }
          ).catch((err) => {
            throw err;
          });
        } else if (type === "channel") {
          await Channel.findOneAndUpdate(
            { serverId: serverId, channelId: channelId },
            { $set: { channelName: name } }
          ).catch((err) => {
            throw err;
          });
        } else {
          await VoiceChannel.findOneAndUpdate(
            { serverId: serverId, voiceId: voiceId },
            { $set: { voiceName: name } }
          ).catch((err) => {
            throw err;
          });
        };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Change server owner
export const changeOwner = async (serverId: string, username: string) => {
  try {
    connect
      .then(async db => {
        await Server
          .findOneAndUpdate(
            { serverId: serverId },
            { $set: { ownerId: username } }
          ).catch((err) => {
            throw err;
          });
        })
        .catch((err) => {
          throw err;
        });
        if (await userIsAdmin(serverId, username)) {
          await removeAdmin(serverId, username)
        };
  } catch (err) {
    throw err;
  };
};

// Checks if user is owner of a server
export const userIsOwner = async (serverId: string, username: string) => {
  try {
    return await connect
      .then(async db => {
        return await Server
          .findOne({ serverId: serverId, ownerId: username })
          .then(response => {
            if(response === null) {
              return false;
            } else {
              return true;
            }
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  } catch(err) {
    throw err;
  };
};
