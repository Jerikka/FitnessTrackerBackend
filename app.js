/* eslint-disable */
require("dotenv").config();
const express = require("express");
const app = express();

// Setup your Middleware and API Router here

// const {
//   USER: user,
//   HOST: host,
//   DATABASE: database,
//   PASSWORD: password,
//   PORT: port,
//   SERVER_PORT,
// } = process.env;

const morgan = require("morgan");

app.use(morgan("dev"));

const cors = require("cors");
app.use(cors());

app.use(express.json());

const apiRouter = require("./api");
app.use("/api", apiRouter);

// app.use((req, res, next) => {
//   console.log("<___Body Logger START___>");
//   console.log(req.body);
//   console.log("<___Body Logger END___>");

//   next();
// })

app.use((error, req, res, next) => {
  res.status(500);
  res.send({
    name: error.name,
    message: error.message,
    error: error.error,
  });
});

module.exports = app;
