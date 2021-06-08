const { DataTypes } = require("sequelize");
const PubTag = require("../models/pubTag")
const sequelize = require("../database");

const Publication = sequelize.define("Publication", {
  publisherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  coverLink: {
    type: DataTypes.STRING
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subsLink: {
    type: DataTypes.STRING
  },
  desc: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.STRING
  },
  age: {
    type: DataTypes.STRING
  },
  count: {
    type: DataTypes.INTEGER
  },
  period: {
    type: DataTypes.STRING
  },
  strips: {
    type: DataTypes.INTEGER
  },
  subindex: {
    type: DataTypes.STRING
  },
  weight: {
    type: DataTypes.INTEGER
  }
});

// Publication.hasMany(PubTag, { through: 'PublicationTags' });
PubTag.belongsToMany(Publication, { through: 'PublicationTags' });

module.exports = Publication;
