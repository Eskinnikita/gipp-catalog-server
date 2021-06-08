const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const PublicationTags = sequelize.define("PublicationTags", {
  publicationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pubTagId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});



module.exports = PublicationTags;
