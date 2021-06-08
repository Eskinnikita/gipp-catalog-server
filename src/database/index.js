const {
  Sequelize
} = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
)

sequelize.sync()
.then(() => {
  console.log("Connection has been established successfully.")
})
.catch((e) => {
  console.error("Unable to connect to the database:", e)
})

module.exports = sequelize
