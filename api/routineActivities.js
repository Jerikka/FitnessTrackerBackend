const express = require("express");
const routineActivitiesRouter = express.Router();
const {
  canEditRoutineActivity,
  updateRoutineActivity,
  destroyRoutineActivity,
  getRoutineActivityById,
} = require("../db/routine_activities");
const { getRoutineById } = require("../db/routines");
const { requireUser } = require("./utils");

// PATCH /api/routine_activities/:routineActivityId
routineActivitiesRouter.patch(
  "/:routineActivityId",
  requireUser,
  async (req, res, next) => {
    const { routineActivityId } = req.params;

    const { count, duration } = req.body;

    const user = req.user;

    try {
      const canUserEdit = await canEditRoutineActivity(
        routineActivityId,
        user.id
      );

      const routineActivity = await getRoutineActivityById(routineActivityId);

      const routine = await getRoutineById(routineActivity.routineId);

      if (!canUserEdit) {
        next(
          res.status(403).send({
            name: "unauthorizedUserError",
            message: `User ${user.username} is not allowed to update ${routine.name}`,
            error: "unauthorizedUserError",
          })
        );
      } else {
        const updateFields = {};

        if (routineActivityId) {
          updateFields.id = routineActivityId;
        }

        if (count) {
          updateFields.count = count;
        }

        if (duration) {
          updateFields.duration = duration;
        }

        const updatedRoutineActivity = await updateRoutineActivity(
          updateFields
        );
        res.send(updatedRoutineActivity);
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

// DELETE /api/routine_activities/:routineActivityId
routineActivitiesRouter.delete(
  "/:routineActivityId",
  requireUser,
  async (req, res, next) => {
    const { routineActivityId } = req.params;
    const user = req.user;

    try {
      const canUserEdit = await canEditRoutineActivity(
        routineActivityId,
        user.id
      );

      if (!canUserEdit) {
        next(
          res.status(403).send({
            name: "unauthorizedUserError",
            message: `User ${user.username} is not allowed to delete In the afternoon`,
            error: "unauthorizedUserError",
          })
        );
      } else {
        const deletedRoutineActivity = await destroyRoutineActivity(
          routineActivityId
        );
        res.send(deletedRoutineActivity);
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

module.exports = routineActivitiesRouter;
