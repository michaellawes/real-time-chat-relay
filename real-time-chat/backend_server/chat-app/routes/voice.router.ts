export{};
const { createVoiceCall, deleteVoiceCall, rename, userIsOwner, userExists, userIsAdmin } = require("../utils");

// Dependencies
const express = require("express");

let router = express.Router();

// Route to create call
router.post('/create', async (req, res) => {
  try {
    const { name, server, username } = req.query;
    if (!name || !server || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(server.split('/', 2)[0], username) || await userIsOwner(server.split('/', 2)[0], username)) {
          const response: any = await createVoiceCall(server.split('/', 2)[0], name);
          res.status(200).send({ server: server, voice: response + '/' + name });
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

// Route to rename call
router.post('/rename', async (req, res) => {
  try {
    const { name, voiceID, username, room } = req.query;
    if(!name || !room || !username || !voiceID) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(room.split('/', 2)[0], username) || await userIsOwner(room.split('/', 2)[0], username)) {
          await rename('voice', room.split('/', 2)[0], name, '', voiceID);
          res.status(200).send({ room: room, voice: voiceID + '/' + name })
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

// Route to delete voice call
router.delete('/delete', async (req, res) => {
  try {
    const { voiceID, roomID, username } = req.query;
    if (!voiceID || !roomID || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        if (await userIsAdmin(roomID, username) || await userIsOwner(roomID, username)) {
          await deleteVoiceCall(roomID, voiceID);
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