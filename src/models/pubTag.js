const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const PubTag = sequelize.define("PubTag", {
  tag: {
    type: DataTypes.STRING,
    allowNull: false
  }
});



module.exports = PubTag;
