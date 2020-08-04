export{};
import { createVoiceChannel, deleteVoiceChannel, rename, userIsOwner } from '../utils/serverUtils';
import { userExists, userIsAdmin } from '../utils/userUtils';

// Dependencies
const express = require("express");

let router = express.Router();

// Route to create channel
router.post('/create', async (req, res) => {
  try {
    const { voiceName, server, username } = req.query;
    if (!voiceName || !server || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(server.split('/', 2)[0], username) || await userIsOwner(server.split('/', 2)[0], username)) {
          const response: any = await createVoiceChannel(server.split('/', 2)[0], voiceName);
          res.status(200).send({ server: server, voice: response + '/' + voiceName });
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
    const { voiceName, voiceId, username, server } = req.query;
    if(!voiceName || !server || !username || !voiceId) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(server.split('/', 2)[0], username) || await userIsOwner(server.split('/', 2)[0], username)) {
          await rename('voice', server.split('/', 2)[0], voiceName, '', voiceId);
          res.status(200).send({ server: server, voice: voiceId + '/' + voiceName })
        } else {
          res.status(201).send(`${username} is not an admin or owner`)
        };
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to delete voice channel
router.delete('/delete', async (req, res) => {
  try {
    const { voiceId, serverId, username } = req.query;
    if (!voiceId || !serverId || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(serverId, username) || await userIsOwner(serverId, username)) {
          await deleteVoiceChannel(serverId, voiceId);
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

module.exports = router;