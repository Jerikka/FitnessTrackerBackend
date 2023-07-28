/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { getUser, getUserByUsername, createUser } = require("../db/users");

// usersRouter.use((req, res, next) => {
//   console.log("A request is being made to /users");

//   next();
// });

// POST /api/users/register
usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  console.log("req.body from /register: ", req.body);
  console.log("username from /register: ", username);
  console.log("password from /register: ", password);

  try {
    if (password.length < 8) {
      res.send({ message: "Password Too Short!" });
    }

    const _user = await getUserByUsername(username);
    // console.log("_user from /register: ", username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const user = await createUser({ username, password });
    // console.log("user from /register: ", user)

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET
    );

    res.send({
      message: "Thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/users/login
usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign({ id: user.id, username }, JWT_SECRET);

      res.send({ message: "You're logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = usersRouter;
