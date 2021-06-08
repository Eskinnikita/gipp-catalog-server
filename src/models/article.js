const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const User = require("../models/user")
const Organ = require("../models/organization")
const Publisher = require("../models/publisher")

const Article = sequelize.define("Article", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mainImageUrl: {
    type: DataTypes.STRING,
  },
  blocks: {
    type: DataTypes.JSON
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  authorRole: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Article.belongsTo(Publisher, {foreignKey: 'authorId'})
Article.belongsTo(Organ, {foreignKey: 'authorId'})
Article.belongsTo(User, {foreignKey: 'authorId'})

module.exports = Article;
