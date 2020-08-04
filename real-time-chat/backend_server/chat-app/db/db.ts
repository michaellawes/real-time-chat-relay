const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");
const db = process.env.MONGO_URI!;

const connect = mongoose
.connect(
  db,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
)

module.exports = connect;