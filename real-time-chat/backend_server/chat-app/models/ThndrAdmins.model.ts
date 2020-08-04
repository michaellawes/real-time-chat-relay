export { };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThndrAdmin = new Schema({
  serverId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('ThndrAdmin', ThndrAdmin, 'ThndrAdmins');