export{};
const { createRoom, joinRoom, rename, userIsOwner, deleteRoom, getActiveUsers, makeAdmin, leaveRoom, removeAdmin, changeOwner, getUnactiveUsers, userExists, userIsAdmin } = require("../utils");

// Dependencies
const express = require("express");

let router = express.Router();

// Route to create a room
router.post('/create', async(req, res) => {
  try {
    const { name, username } = req.query;
    if (!name || !username) {
      res.status(201).send('Invalid parameters entered');
    } else {
      if (await userExists(username)) {
        let newRoom: any = await createRoom(username, name);
        res.status(200).send({ 
          room: newRoom.roomID + '-' + name,
          channel: newRoom.channelID + '-' + "General",
          voice: newRoom.voiceId + '-' + "General",
        });
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to join a room
router.post('/join', async (req, res) => {
  try {
    const { roomID, username } = req.query;
    if (!roomID || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        await joinRoom(roomID, username);
        res.status(200).send(`${username} joined community`);
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch (err) {
    res.status(400).send();
  };
});

// Route to leave a room
router.delete('/leave', async (req, res) => {
  try {
    const { roomID, username } = req.query;
    if (!roomID || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        await leaveRoom(roomID, username);
        res.status(200).send(`${username} left community`);
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send()
  };
});

// Route to rename a room
router.post('/rename', async (req, res) => {
  try {
    const { name, roomID, username } = req.query;
    if(!name || !roomID || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userIsOwner(roomID, username)) {
        await rename('room', roomID, name);
        res.status(200).send(`${roomID}/${name}`);
      } else {
        res.status(201).send(`${username} is not an owner`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to delete a room
router.delete('/delete', async (req, res) => {
  try{
    const { roomID, username } = req.query;
    if (!roomID || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userIsOwner(roomID, username)) {
        await deleteRoom(roomID);
        res.status(200).send();
      } else {
        res.status(201).send(`${username} is not an owner`)
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to get if user is owner
router.get('/owner', async (req, res) => {
  try {
    const { username, roomID } = req.query;
    if (!username || !roomID) {
      res.status(400).send("Invalid parameters entered");
    } else {
      const response = await userIsOwner(roomID, username);
      res.send(response);
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to get if user is admin
router.get('/admin', async (req, res) => {
  try {
    const { username, roomID } = req.query;
    if (!username || !roomID) {
      res.status(201).send("Invalid parameters entered");
    } else {
      const response = await userIsAdmin(roomID, username);
      res.send(response);
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to make user admin
router.post('/promote', async (req, res) => {
  try {
    const { username, roomID } = req.query;
    if (!username || !roomID) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userIsAdmin(roomID, username)) {
        res.status(201).send(`${username} is already an admin`)
      } else {
        await makeAdmin(roomID, username);
        res.status(200).send(`${username} promoted to admin`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to demote user from admin
router.post('/demote', async (req, res) => {
  try {
    const { username, roomID } = req.query;
    if (!username || !roomID) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userIsAdmin(roomID, username)) {
        await removeAdmin(roomID, username);
        res.status(200).send(`${username} is no longer an admin`);
      } else {
        res.status(201).send(`${username} is not an admin`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to change owner of server 
router.post('/change', async (req, res) => {
  try {
    const { owner, user, roomID } = req.query;
    if (!owner || !user || !roomID) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(owner)) {
        if (await userIsOwner(roomID, owner)) {
          if (await userExists(user)) {
            await changeOwner(roomID, user);
            res.status(200).send(`${user} is the new owner`);
          } else {
            res.status(201).send(`${user} does not exist`)
          };
        } else {
          res.status(201).send(`${owner} is not the owner`)
        };
      } else {
        res.status(201).send(`${owner} does not exist`)
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to remove user from server
router.post('/remove', async (req, res) => {
  try {
    const { username, roomID } = req.query;
    if (!username || !roomID) {
      res.status(201).send("Invalid parameters entered");
    } else {
      await leaveRoom(roomID, username);
      res.status(200).send(`${username} removed from server`);
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to get active users list
router.get('/activeusers', async(req, res) => {
  try {
    const { roomID } = req.query;
    if (!roomID) {
      res.status(400).send("Invalid parameters entered");
    } else {
      const response = await getActiveUsers(roomID);
      res.send(response);
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to get unactive users list
router.get('/unactiveusers', async (req, res) => {
  try {
    const { roomID } = req.query;
    if (!roomID) {
      res.status(400).send("Invalid parameters entered");
    } else {
      const response = await getUnactiveUsers(roomID);
      res.send(response);
    }
  } catch(err) {
    res.status(400).send();
  }
});

module.exports = router;