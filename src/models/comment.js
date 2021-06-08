const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Publisher = require("../models/publisher")
const User = require("../models/user")
const Organ = require("../models/organization")
const Article = require("../models/article")

const Comment = sequelize.define("Comment", {
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  authorRole: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
});

Comment.belongsTo(Publisher, {foreignKey: 'authorId', onDelete: 'CASCADE'},)
Comment.belongsTo(Organ, {foreignKey: 'authorId', onDelete: 'CASCADE'})
Comment.belongsTo(User, {foreignKey: 'authorId', onDelete: 'CASCADE'})
Comment.belongsTo(Article, {foreignKey: 'articleId', onDelete: 'CASCADE'})

module.exports = Comment;
