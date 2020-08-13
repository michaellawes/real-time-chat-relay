export{};
const { userIsAdmin, userExists, createChannel, rename, deleteChannel, deleteMessage, userIsOwner } = require("../utils");

// Dependencies
const express = require("express");

let router = express.Router();

// Route to create channel
router.post('/create', async (req, res) => {
  try {
    const { name, room, username } = req.query;
    if (!name || !room || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(room.split('/')[0], username) || await userIsOwner(room.split('/', 2)[0], username)) {
          const response = await createChannel(room.split('/')[0], name);
          res.status(200).send({ server: room, channel: response + '/' + name});
        } else {
          res.status(201).send(`${username} is not an admin or owner`);
        };
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to rename channel
router.post('/rename', async (req, res) => {
  try {
    const { name, channelID, username, server } = req.query;
    if (!name || !server || !username || !channelID) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(server.split('/', 2)[0], username) || await userIsOwner(server.split('/', 2)[0], username)) {
          await rename('channel', server.split('/', 2)[0], name, channelID);
          res.status(200).send({ server: server, channel: channelID + '/' + name });
        } else {
          res.status(201).send(`${username} is not an admin or owner`);
        };
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to delete channel
router.delete('/delete', async (req, res) => {
  try {
    const { channelID, roomID, username } = req.query;
    if (!channelID || !roomID || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(roomID, username) || await userIsOwner(roomID, username)) {
          await deleteChannel(roomID, channelID);
          res.status(200).send();
        } else {
          res.status(201).send(`${username} is not an admin or owner`);
        };
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to delete server message
router.delete('/dltmsg', async (req, res) => {
  try {
    const { msgId, roomID, channelID, username } = req.query;
    if (!msgId || !roomID || !username || !channelID) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        await deleteMessage('server', msgId, roomID, channelID);
        res.status(200).send();
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

module.exports = router;