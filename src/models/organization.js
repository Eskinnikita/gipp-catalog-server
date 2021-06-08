const {DataTypes} = require("sequelize");
const sequelize = require("../database");

const Organ = sequelize.define("Organ", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logoUrl: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  blocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
});

module.exports = Organ;
