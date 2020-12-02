const express = require("express");
const cors = require("cors");
const createRoutes = require("./router");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

createRoutes(app);

const PORT = process.env.PORT || 2222;

async function start() {
  try {
    await sequelize.sync();
    app.listen(PORT);
  } catch (e) {
    console.log(e);
  }
}

start();

module.exports = app;
