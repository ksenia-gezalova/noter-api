const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const bcrypt = require("bcryptjs");

const user = sequelize.define("Users", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = user;
