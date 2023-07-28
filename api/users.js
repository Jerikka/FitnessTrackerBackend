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
  // console.log("req.body from /register: ", req.body);
  // console.log("username from /register: ", username);
  // console.log("password from /register: ", password);

  try {
    if (password.length < 8) {
      next({
        
        message: "Password Too Short!",
        name: "PasswordTooShortError",
        error: "Password Too Short"
      });
    }

    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        message: `User ${username} is already taken.`,
        name: "UserExistsError",
        error: `User ${username} is already taken`,
      });
    }

    const user = await createUser({ username, password });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET
    );

    // console.log("user in /register: ", user);

    res.send({
      message: "Thank you for signing up",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = usersRouter;
