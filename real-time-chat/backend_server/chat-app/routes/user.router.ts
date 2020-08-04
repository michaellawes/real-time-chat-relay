export {};
import  { loadUser, userExists, createUser, hashPassword } from "../utils/userUtils";
import { deleteMessage } from '../utils/serverUtils';
// Connection dependencies
const connect = require('../db/db');
const express = require("express");

// Dependencies 
const bcrypt = require('bcryptjs');
const User = require("../models/User.model");

let router = express.Router();

// Route to get data associated with user
router.get('/data', async (req, res) => {
  try {
    const { username } = req.query;
    if(!username) {
      res.status(201).send('Invalid parameters entered');
    } else {
      if(await userExists(username)) {
        const data = await loadUser(username);
        res.status(200).send(data);
      } else {
        res.status(201).send(`User does not exist`);
      }
    }
  } catch(err) {
    res.status(400).send();
  }
});


// Route to create user
router.post('/create', async (req, res) => {
  try {
    const { userName, userPass, email } = req.query;
    if (await userExists(userName)) {
      res.status(201).send('Username already exists');
    } else {
      await createUser('New Thndr User', userName, email, userPass);
      res.status(200).send({ username: userName }); 
    }
  } catch(err) {
    res.status(400).send();
  }
})

// Route to login
router.get('/login', async(req, res) => {
  try {
    const { userName, userPass } = req.query;
    connect.then(async db => {
      await User
      .findOne({ username: userName })
      .then(async response => {
        try {
          if(response === null) {
            res.status(201).send('User does not exist');
          } else {
            const hashPass = response.password;
            const isMatch = await bcrypt
              .compare(userPass, hashPass)
              .catch(err => {
                throw err;
              });
            if (isMatch) {
              res.status(200).send({ username: response.username });
            } else {
              res.status(202).send('Username / Password does not match');
            }
          }
        } catch(err) {
          res.status(203).send(`Error occured processing ${userName}'s information`);
        }
      })
      .catch(err => {
        res.status(204).send(`Error occured retrieving ${userName}'s information`);
      })
    })
    .catch(err => {
      res.status(205).send('Error occurred accessing database, servers may be down');
    })
  } catch(err) {
    res.status(400).send();
  }
});

// Route to delete private message
router.delete('/dltpm', async (req, res) => {
  try {
    const { msgId, from, userTo } = req.query;
    if (!msgId || !from || !userTo) {
      res.status(201).send("Invalid parameters entered");
    } else {
      if(await userExists(from)) {
        await deleteMessage('private', msgId, '', '', from, userTo);
        res.status(200).send(`${from} deleted a message`);
      } else {
        res.status(201).send(`${from} does not exist`);
      }
    }
  } catch (err) {
    res.status(400).send();
  }
});

module.exports = router;