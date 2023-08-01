/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { getUser, getUserByUsername, createUser } = require("../db/users");
const {
  getPublicRoutinesByUser,
  getAllRoutinesByUser,
} = require("../db/routines");
const { requireUser } = require("./utils");

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
  } catch ({ name, message }) {
    next({ name, message });
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
  } catch ({ name, message }) {
    
    next({ name, message });
  }
});

// GET /api/users/me
usersRouter.get("/me", requireUser, async (req, res, next) => {
  
  const user = req.user;
  

  try {
    res.send(user);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// GET /api/users/:username/routines
usersRouter.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;

  const user = req.user.username;

  if (username === user) {
    try {
      const routines = await getAllRoutinesByUser(req.params);

      res.send(routines);
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    try {
      const routines = await getPublicRoutinesByUser(req.params);
      res.send(routines);
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
});

module.exports = usersRouter;
