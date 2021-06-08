const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const UserPublication = sequelize.define("UserPublication", {
  publicationId: {
    type: DataTypes.INTEGER
  },
  userId: {
    type: DataTypes.INTEGER
  },
  userRole: {
    type: DataTypes.INTEGER
  }
});

module.exports = UserPublication;
