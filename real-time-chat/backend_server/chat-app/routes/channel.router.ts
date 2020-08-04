export{};
import { userIsAdmin, userExists } from '../utils/userUtils';
import { createChannel, rename, deleteChannel, deleteMessage, userIsOwner } from '../utils/serverUtils';

// Dependencies
const express = require("express");

let router = express.Router();

// Route to create channel
router.post('/create', async (req, res) => {
  try {
    const { channelName, server, username } = req.query;
    if (!channelName || !server || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(server.split('/')[0], username) || await userIsOwner(server.split('/', 2)[0], username)) {
          const response = await createChannel(server.split('/')[0], channelName);
          res.status(200).send({ server: server, channel: response + '/' + channelName});
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
    const { channelName, channelId, username, server } = req.query;
    if (!channelName || !server || !username || !channelId) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(server.split('/', 2)[0], username) || await userIsOwner(server.split('/', 2)[0], username)) {
          await rename('channel', server.split('/', 2)[0], channelName, channelId);
          res.status(200).send({ server: server, channel: channelId + '/' + channelName });
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
    const { channelId, serverId, username } = req.query;
    if (!channelId || !serverId || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(serverId, username) || await userIsOwner(serverId, username)) {
          await deleteChannel(serverId, channelId);
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
    const { msgId, serverId, channelId, username } = req.query;
    if (!msgId || !serverId || !username || !channelId) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        await deleteMessage('server', msgId, serverId, channelId);
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