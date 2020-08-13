export {};

const connect = require("./db/db");
const Admin = require('./models/ThndrAdmins.model');
const ServerMessage = require('./models/ServerMessage.model');
const User = require('./models/User.model');
const VoiceChannel = require('./models/VoiceChannel.model');
const bcrypt = require('bcryptjs');

const populate = async () => {
  try {
    return await connect
      .then(async db => {
        /*
        const icgarlin = 'chris-10';
        const digimon = 'wavesONtsunami12';
        const bobby = 'cottingham';
        const waterman = 'chris-10';
        const gman = 'ruleruponrulers';
        const dollars = 'theGodwithTheDolla';
        const michael = password;
        */
      })
      .catch(err => {
        throw err;
      })
  } catch(err) {
    throw err;
  }
}
console.log(populate());