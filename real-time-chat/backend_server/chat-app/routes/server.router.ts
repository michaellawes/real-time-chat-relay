export{};
import { createServer, joinServer, rename, userIsOwner, deleteServer, getActiveUsers, makeAdmin, leaveServer, removeAdmin, changeOwner, getUnactiveUsers } from '../utils/serverUtils';
import { userExists, userIsAdmin } from '../utils/userUtils';

// Dependencies
const express = require("express");

let router = express.Router();

// Route to create a server
router.post('/create', async(req, res) => {
  try {
    const { serverName, username } = req.query;
    if (!serverName || !username) {
      res.status(201).send('Invalid parameters entered');
    } else {
      if (await userExists(username)) {
        let newServer: any = await createServer(username, serverName);
        res.status(200).send({ 
          server: newServer.serverId + '-' + serverName,
          channel: newServer.channelId + '-' + "General",
          voice: newServer.voiceId + '-' + "General",
        });
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to join a server
router.post('/join', async (req, res) => {
  try {
    const { serverId, username } = req.query;
    if (!serverId || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        await joinServer(serverId, username);
        res.status(200).send(`${username} joined community`);
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch (err) {
    res.status(400).send();
  };
});

// Route to leave a server
router.delete('/leave', async (req, res) => {
  try {
    const { serverId, username } = req.query;
    if (!serverId || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(username)) {
        await leaveServer(serverId, username);
        res.status(200).send(`${username} left community`);
      } else {
        res.status(201).send(`${username} does not exist`);
      };
    };
  } catch(err) {
    res.status(400).send()
  };
});

// Route to rename a server
router.post('/rename', async (req, res) => {
  try {
    const { serverName, serverId, username } = req.query;
    if(!serverName || !serverId || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userIsOwner(serverId, username)) {
        await rename('server', serverId, serverName);
        res.status(200).send(`${serverId}/${serverName}`);
      } else {
        res.status(201).send(`${username} is not an owner`);
      };
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to delete a server
router.delete('/delete', async (req, res) => {
  try{
    const { serverId, username } = req.query;
    if (!serverId || !username) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userIsOwner(serverId, username)) {
        await deleteServer(serverId);
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
    const { username, serverId } = req.query;
    if (!username || !serverId) {
      res.status(400).send("Invalid parameters entered");
    } else {
      const response = await userIsOwner(serverId, username);
      res.send(response);
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to get if user is admin
router.get('/admin', async (req, res) => {
  try {
    const { username, serverId } = req.query;
    if (!username || !serverId) {
      res.status(201).send("Invalid parameters entered");
    } else {
      const response = await userIsAdmin(serverId, username);
      res.send(response);
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to make user admin
router.post('/promote', async (req, res) => {
  try {
    const { username, serverId } = req.query;
    if (!username || !serverId) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userIsAdmin(serverId, username)) {
        res.status(201).send(`${username} is already an admin`)
      } else {
        await makeAdmin(serverId, username);
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
    const { username, serverId } = req.query;
    if (!username || !serverId) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userIsAdmin(serverId, username)) {
        await removeAdmin(serverId, username);
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
    const { owner, user, serverId } = req.query;
    if (!owner || !user || !serverId) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if (await userExists(owner)) {
        if (await userIsOwner(serverId, owner)) {
          if (await userExists(user)) {
            await changeOwner(serverId, user);
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
    const { username, serverId } = req.query;
    if (!username || !serverId) {
      res.status(201).send("Invalid parameters entered");
    } else {
      await leaveServer(serverId, username);
      res.status(200).send(`${username} removed from server`);
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to get active users list
router.get('/activeusers', async(req, res) => {
  try {
    const { serverId } = req.query;
    if (!serverId) {
      res.status(400).send("Invalid parameters entered");
    } else {
      const response = await getActiveUsers(serverId);
      res.send(response);
    };
  } catch(err) {
    res.status(400).send();
  };
});

// Route to get unactive users list
router.get('/unactiveusers', async (req, res) => {
  try {
    const { serverId } = req.query;
    if (!serverId) {
      res.status(400).send("Invalid parameters entered");
    } else {
      const response = await getUnactiveUsers(serverId);
      res.send(response);
    }
  } catch(err) {
    res.status(400).send();
  }
});

module.exports = router;