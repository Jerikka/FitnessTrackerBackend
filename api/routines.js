const express = require("express");
const routinesRouter = express.Router();
const {
  getAllPublicRoutines,
  createRoutine,
  getRoutineById,
  destroyRoutine,
  updateRoutine,
} = require("../db/routines");
const {
  addActivityToRoutine,
  checkRoutineActivityExists,
} = require("../db/routine_activities");
const { requireUser } = require("./utils");


// GET /api/routines
routinesRouter.get("/", async (req, res, next) => {
  try {
    const allRoutines = await getAllPublicRoutines();

    res.send(allRoutines);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/routines
routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;

  try {
    const newRoutine = await createRoutine({
      creatorId: req.user.id,
      isPublic,
      name,
      goal,
    });
    res.send(newRoutine);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// PATCH /api/routines/:routineId
routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  const user = req.user;

  try {
    const routineToUpdate = await getRoutineById(routineId);

    if (user && user.id !== routineToUpdate.creatorId) {
      next(
        res.status(403).send({
          name: "unauthorizedUser",
          message: `User ${user.username} is not allowed to update ${routineToUpdate.name}`,
          error: "unauthorizedUser",
        })
      );
    } else {
      const updateFields = {};

      if (routineId) {
        updateFields.id = routineId;
      }

      updateFields.isPublic = isPublic;

      if (name) {
        updateFields.name = name;
      }

      if (goal) {
        updateFields.goal = goal;
      }

      const updatedRoutine = await updateRoutine(updateFields);
      res.send(updatedRoutine);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// DELETE /api/routines/:routineId
routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const user = req.user;

  try {
    const routineToDelete = await getRoutineById(routineId);

    if (routineToDelete && routineToDelete.creatorId !== user.id) {
      res.status(403).send({
        name: "unauthorizedUserError",
        message: `User ${user.username} is not allowed to delete ${routineToDelete.name}`,
        error: "unauthorizedUserError",
      });
    } else {
      const deletedRoutine = await destroyRoutine(routineId);
      res.send(deletedRoutine);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/routines/:routineId/activities
routinesRouter.post("/:routineId/activities", async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId, duration, count } = req.body;

  const doesRoutineActivityAlreadyExist = await checkRoutineActivityExists(
    routineId,
    activityId
  );

  try {
    if (doesRoutineActivityAlreadyExist) {
      next(
        res.status(403).send({
          name: "duplicateActivityError",
          message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
          error: "duplicateActivityError",
        })
      );
    } else {
      const updatedRoutine = await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration,
      });

      res.send(updatedRoutine);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = routinesRouter;
