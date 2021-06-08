const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Publisher = require("../models/publisher")

const PublisherConfig = sequelize.define("PublisherConfig", {
  publisherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mainColor: {
    type: DataTypes.STRING
  },
  accentColor: {
    type: DataTypes.STRING
  }
});

PublisherConfig.belongsTo(Publisher, {foreignKey: 'publisherId'})

module.exports = PublisherConfig;
