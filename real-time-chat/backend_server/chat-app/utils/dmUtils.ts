export { };
// Connection dependencies
const connect = require('../db/db');

// Models
const User = require("../models/User.model");
const DirectMessage = require("../models/DirectMessages.model");

// Check if DM exists
export const dmExists = async (user1: string, user2: string) => {
  try {
    await connect;
    return await DirectMessage
      .findOne({ users: { $all: [user1, user2] } })
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
  } catch(err) {
    throw err;
  };
};

// Initiate DMS
export const startDM = async (userInitiating: string, userMessaging: string) => {
  try {
    await connect;
    if (await dmExists(userInitiating, userMessaging)) {
      return;
    } else {
      const newDM = new DirectMessage({
        users: [userInitiating, userMessaging],
        conversation: []
      });
      await newDM.save();
      await User
        .updateOne(
          { username: userInitiating },
          { $push: { directMessages: userMessaging } }
        )
        .catch(err => {
          throw err;
        });
      await User
        .updateOne(
          { username: userMessaging },
          { $push: { directMessages: userInitiating } }
        )
        .catch(err => {
          throw err;
        });
    };
  } catch(err) {
    throw err;
  };
};

export const getDM = async (username1: string, username2: string): Promise<Array<Object>> => {
  try {
    return await connect
      .then(async db => {
        const dm = await DirectMessage
          .findOne({ users: { $all: [username1, username2] } }, { conversation: 1, _id: 0 })
          .catch(err => {
            throw err;
          });
        let convo = [];
        for(let m = 0; m < dm.conversation.length; m++) {
          convo.push({
            from: dm.conversation[m].from,
            userTo: dm.conversation[m].userTo,
            msgId: dm.conversation[m].msgId,
            msg: dm.conversation[m].msg,
            timestamp: dm.conversation[m].timestamp
          });
        };
        return convo;
      })
      .catch(err => {
        throw err;
      });
  } catch(err) {
    throw err;
  };
};

