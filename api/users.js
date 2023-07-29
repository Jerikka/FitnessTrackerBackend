/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const {
  getUser,
  getUserByUsername,
  createUser,
  getUserById,
} = require("../db/users");
const { getPublicRoutinesByUser } = require("../db/routines");
const { requireUser } = require("./utils");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

// POST /api/users/register
usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (password.length < 8) {
      next({
        message: "Password Too Short!",
        name: "PasswordTooShortError",
        error: "Password Too Short",
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
usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      message: "Please supply both a username and password",
      name: "MissingCredentialsError",
      error: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUser({ username, password });

    if (user.username == username) {
      const token = jwt.sign({ id: user.id, username }, JWT_SECRET);

      res.send({ message: "you're logged in!", token, user });
    } else {
      next({
        message: "Username or password is incorrect",
        name: "IncorrectCredentialsError",
        error: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users/me
usersRouter.get("/me", requireUser, async (req, res, next) => {
  // const id = req.user.id;
  // const auth = req.header("Authorization");
  const user = req.user;
  console.log("user from /me: ", user);
  // console.log("id: ", id)
  // console.log("req.headers: ", req.headers)
  // console.log("user from /me: ", user)
  // console.log("auth: ", auth)

  try {
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:username/routines
usersRouter.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;
  // console.log("req.params from /:username/routines: ", req.params)

  // console.log("username from /:username/routines: ", username)

  try {
    const routines = await getPublicRoutinesByUser({ username });

    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
