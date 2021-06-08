require("dotenv").config();
const express = require('express');
const cors = require('cors')
const morgan = require('morgan')
const helmet = require("helmet");
require("./auth/passport");

const app = express()
const api = require("./api");
const middlewares = require("./middlewares");

app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))
app.use(helmet());
app.use('/uploads', express.static('uploads'))

app.get("/api/healthcheck", async (req, res) => {
    try {
        res.status(200).json({
            message: "Server is working"
        })
    } catch (err) {
        res.status(500).json({message: err})
    }
})

app.use("/api", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
