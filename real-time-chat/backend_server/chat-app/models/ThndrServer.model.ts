export { };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThndrServer = new Schema({
  serverId: {
    type: String,
    required: true,
  },
  serverName: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ThndrServer', ThndrServer, 'ThndrServers');
