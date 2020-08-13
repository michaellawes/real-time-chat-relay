export { };
import { userIsAdmin } from "./userUtils";

// Connection dependencies
const connect = require('../db/db');

// Models
const { ChatMessage, Channel, Room, User, Admin, DirectMessage, VoiceCall } = require('../models');


const generateId = (): string => {
  return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/1|0/g, function () {
    return (0 | (Math.random() * 16)).toString(16);
  });
};

// Gets unique Id for room or channel or message
export const getUniqueId = async(
  type: string,
  roomID?: string,
  channelID?: string,
  userId1?: string,
  userId2?: string
): Promise<string> => {
  try {
    const newId = generateId();
    return await connect
    .then(async db => {
      if (type === "room") {
        return await Room.findOne({ id: newId })
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
        return await Channel.findOne({ roomID: roomID, channelID: newId })
          .then(async (response) => {
            if (response === null) {
              return newId;
            } else {
              return await getUniqueId(type, roomID);
            };
          })
          .catch((err) => {
            throw err;
          });
      } else if (type === "chat-message") {
        const response = await ChatMessage
          .findOne({
            roomID: roomID,
            channelID: channelID,
            msgId: newId,
          })
          .catch((err) => {
            throw err;
          });
        if (response === null) {
          return newId;
        } else {
          return await getUniqueId(type, roomID, channelID);
        };
      } else if (type === "voice") {
        return await VoiceCall.findOne({ roomID: roomID, voiceId: newId })
          .then(async (response) => {
            if (response === null) {
              return newId;
            } else {
              return await getUniqueId(type, roomID);
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

// Insert message into either room or private message
export const insertMessage = async (msg: any): Promise<object> => {
  try {
    return await connect
      .then(async (db) => {
        if (msg.type === "room") {
          const msgId = await getUniqueId("chat-message", msg.room.split('/', 2)[0], msg.channel.split('/', 2)[0]);
          const message = {
            room: msg.room,
            channel: msg.channel,
            from: msg.from,
            msg: msg.msg,
            msgId: msgId,
            timestamp: msg.timestamp,
          };
          const chatMessage = new ChatMessage({
            roomID: msg.room.split('/')[0],
            channelID: msg.channel.split('/')[0],
            from: msg.from,
            msg: msg.msg,
            msgId: msgId,
            timestamp: msg.timestamp
          });
          await chatMessage
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

// Deletes message from either room or direct message
export const deleteMessage = async(
  type: string,
  msgId: string,
  roomID?: string,
  channelID?: string,
  from?: string,
  userTo?: string,
) => {
  try {
    connect
      .then(async (db) => {
        if (type === "room") {
          await ChatMessage
            .deleteOne({
              roomID: roomID,
              channelID: channelID,
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

// Adds user to room
export const joinRoom = async (
  roomID: string,
  username: string
) => {
  try {
    await connect;
    await User
      .updateOne(
        { username: username },
        {
          $push: {
            roomsJoined: {
              roomID: roomID,
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

// Creates room
export const createRoom = async (
  username: string,
  name: string
): Promise<object> => {
  try {
    await connect;
    const roomID = await getUniqueId("room");
    const room = new Room({
      roomID: roomID,
      name: name,
      owner: username,
    });
    await room.save();
    const newChannel = await createChannel(roomID, "General");
    const newVoice = await createVoiceCall(roomID, "General");
    await User
      .findOneAndUpdate(
        { username: username },
        { 
          $push: { roomsJoined: {
            roomID: roomID,
            lastActive: new Date()
            } 
          }
        }
      )
      .catch(err => {
        throw err;
      });
    return {
      roomID: roomID,
      channelID: newChannel,
      voiceId: newVoice,
    };
  } catch (err) {
    throw err;
  };
};

// Leave room
export const leaveRoom = async(
  roomID: string,
  username: string,
) => {
  try {
    await connect;
    await User
          .updateOne(
            { "roomsJoined.roomID": roomID, username: username },
            { $pull: { roomsJoined: { roomID: roomID }  } }
          )
          .catch((err) => {
            throw err;
          });
    if (await userIsAdmin(roomID, username)) {
      await removeAdmin(roomID, username);
    };
  } catch(err) {
    throw err;
  };
};

// Creates channel 
export const createChannel = async(
  roomID: string,
  name: string
): Promise<string> => {
  try {
    await connect;
    const channelID = await getUniqueId("channel", roomID);
    const channel = new Channel({
      roomID: roomID,
      channelID: channelID,
      name: name,
    });
    await channel.save();
    return channelID;
  } catch (err) {
    throw err;
  };
};

// Creates voice channel
export const createVoiceCall = async(
  roomID: string,
  name: string
): Promise<string> => {
  try {
    await connect;
    const voiceId = await getUniqueId("voice", roomID);
    const voiceCall = new VoiceCall({
      roomID: roomID,
      voiceId: voiceId,
      name: name,
    });
    await voiceCall.save();
    return voiceId;
  } catch (err) {
    throw err;
  };
};

// Makes user admin of room
export const makeAdmin = async(
  roomID: string,
  username: string
) => {
  try {
    await connect
      .then(async (db) => {
        const newAdmin = new Admin({
          roomID: roomID,
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
export const removeAdmin = async (roomID: string, username: string) => {
  try {
    await connect
      .then(async (db) => {
        await Admin
          .deleteOne({ roomID: roomID, username: username })
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
export const getRoomName = async (roomID: string): Promise<string> => {
  try {
    return await connect
      .then(async (db) => {
        const room = await Room
          .findOne({ roomID: roomID }, { name: 1, _id: 0 })
          .catch((err) => {
            throw err;
          });
        return room.name;
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  };
};

// Get active List
export const getActiveUsers = async (roomID: string): Promise<object> => {
  try {
    return await connect
      .then(async (db) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 5);
        const UsersThatApply = await User
          .find({
            $and: [
                { "roomsJoined.roomID": roomID },
                { "roomsJoined.lastActive": { $gt: now } },
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
export const getUnactiveUsers = async (roomID: string): Promise<object> => {
  try {
    return await connect
      .then(async (db) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 5);
        const UsersThatApply = await User
          .find({
            $and: [
                { "roomsJoined.roomID": roomID },
                { "roomsJoined.lastActive": { $lt: now } },
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

// Delete room
export const deleteRoom = async (roomID: string) => {
  try {
    connect
      .then(async (db) => {
        await User
          .updateMany(
            { "roomsJoined.roomID": roomID },
            { $pull: { roomsJoined: { roomID: roomID }  } }
          )
          .catch((err) => {
            throw err;
          });
        await Admin
          .deleteMany({ roomID: roomID })
          .catch((err) => {
            throw err;
          });
        const channelInventory = await Channel
          .find({ roomID: roomID }, { _id: 0, channelID: 1 })
          .catch((err) => {
            throw err;
          });
        for (var i = 0; i < channelInventory.length; i++) {
          await ChatMessage
            .deleteMany({ channelID: channelInventory[i].channelID })
            .catch((err) => {
              throw err;
            });
        };
        await VoiceCall
          .deleteMany({ roomID: roomID })
          .catch((err) => {
            throw err;
          });
        await Channel
          .deleteMany({ roomID: roomID })
          .catch((err) => {
            throw err;
          });
        await Room
          .deleteOne({ roomID: roomID })
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
export const deleteChannel = async (roomID: string, channelID: string) => {
  try {
    connect
      .then(async (db) => {
        await ChatMessage
          .deleteMany({ channelID: channelID })
          .catch((err) => {
            throw err;
          });
        await Channel
          .deleteOne({ roomID: roomID, channelID: channelID })
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
export const deleteVoiceCall = async (roomID: string, voiceId: string) => {
  try {
    connect
      .then(async (db) => {
        await VoiceCall
          .deleteOne({ roomID: roomID, voiceId: voiceId })
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
export const rename = async (type: string, roomID: string, name: string, channelID?: string, voiceId?: string) => {
  try {
    connect
      .then(async (db) => {
        if (type === "room") {
          await Room.findOneAndUpdate(
            { roomID: roomID },
            { $set: { name: name } }
          ).catch((err) => {
            throw err;
          });
        } else if (type === "channel") {
          await Channel.findOneAndUpdate(
            { roomID: roomID, channelID: channelID },
            { $set: { name: name } }
          ).catch((err) => {
            throw err;
          });
        } else {
          await VoiceCall.findOneAndUpdate(
            { roomID: roomID, voiceId: voiceId },
            { $set: { name: name } }
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

// Change room owner
export const changeOwner = async (roomID: string, username: string) => {
  try {
    connect
      .then(async db => {
        await Room
          .findOneAndUpdate(
            { roomID: roomID },
            { $set: { ownerId: username } }
          ).catch((err) => {
            throw err;
          });
        })
        .catch((err) => {
          throw err;
        });
        if (await userIsAdmin(roomID, username)) {
          await removeAdmin(roomID, username)
        };
  } catch (err) {
    throw err;
  };
};

// Checks if user is owner of a room
export const userIsOwner = async (roomID: string, username: string) => {
  try {
    return await connect
      .then(async db => {
        return await Room
          .findOne({ roomID: roomID, ownerId: username })
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
