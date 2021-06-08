const { DataTypes } = require("sequelize");
const Publication = require('./publication')
const sequelize = require("../database");

const Publisher = sequelize.define("Publisher", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
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
  },
  description: {
    type: DataTypes.TEXT,
  },
  contactPhone: {
    type: DataTypes.STRING,
  },
  contactMail: {
    type: DataTypes.STRING,
  },
  logoUrl: {
    type: DataTypes.STRING
  }
});

Publisher.hasMany(Publication, {
  foreignKey: 'publisherId'
})



module.exports = Publisher;
