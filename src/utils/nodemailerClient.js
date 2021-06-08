const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_CLIENT_USERNAME,
    pass: process.env.MAIL_CLIENT_PASSWORD,
  },

});

module.exports = transporter
