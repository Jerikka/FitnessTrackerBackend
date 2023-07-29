const express = require("express");
const activitiesRouter = express.Router();
const { getAllActivities } = require("../db/activities");
const { getPublicRoutinesByActivity } = require("../db/routines");

// GET /api/activities/:activityId/routines
activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  // console.log("req.params from /:activityId/routines: ", req.params)
  const { activityId } = req.params;
  // console.log("activityId from /:activityId/routines: ", activityId)

  try {
    const routinesByActivity = await getPublicRoutinesByActivity({
      id: activityId,
    });

    // console.log("routinesByActivity from /:activityId/routines: ", routinesByActivity)

    // console.log("routinesByActivity.length: ", routinesByActivity.length);

    if (routinesByActivity.length > 0) {
      res.send(routinesByActivity);
    } else {
      res.send({
        message: `Activity ${activityId} not found`,
        name: "activityNotFoundError",
        error: `Activity ${activityId} not found`,
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
activitiesRouter.get("/", async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();

    res.send(allActivities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities

// PATCH /api/activities/:activityId

module.exports = activitiesRouter;
