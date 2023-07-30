const express = require("express");
const activitiesRouter = express.Router();
const { getAllActivities, createActivity, getActivityByName, updateActivity, getActivityById } = require("../db/activities");
const { getPublicRoutinesByActivity } = require("../db/routines");
const { requireUser } = require("./utils");

activitiesRouter.use((req, res, next) => {
  console.log("A request is being made to /activities");

  next();
})

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
activitiesRouter.post("/", requireUser, async (req, res, next) => {
  // const user = req.user.username
  // console.log("user from /activities: ", user)
  // console.log("req.body from /activities: ", req.body)
  const { name, description } = req.body
  
  
  const existingActivity = await getActivityByName(name)

  // console.log(`existingActivity: ${existingActivity}`)

  if (!existingActivity) {
    try {
      const newActivity = await createActivity({ name, description });
      res.send(newActivity);
    } catch ({ name, message }) {
      next({ name, message });
    }

  } else {
   next({
     name: "activityExistsError",
     message: `An activity with name ${name} already exists`,
     error: "activityExistsError",
   });
  }
  


  

})

// PATCH /api/activities/:activityId
activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  console.log(`activityId: ${activityId}`)
  // console.log(`req.body: ${req.body}`)
  const { name, description } = req.body
  console.log(`name: ${name}, description: ${description}`)

  const updateFields = {};

  if (activityId) {
    updateFields.id = activityId;
  }

  if (name) {
    updateFields.name = name;
  }

  if (description) {
    updateFields.description = description;
  }

  const existingActivityId = await getActivityById(activityId);
  console.log(`existingActivityId: ${existingActivityId}`)

  const existingActivityName = await getActivityByName(name);
  console.log(`existingAcivityName: ${existingActivityName}`)

  if (!existingActivityId) {
    next({
      name: "activityDoesNotExist",
      message: `Activity ${activityId} not found`,
      error: "activityDoesNotExist",
    
    })
  }

  if (existingActivityName) {
    next({
      name: "activityNameAlreadyExists",
      message: `An activity with name ${name} already exists`,
      error: "activityNameAlreadyExists"
    })
  }

  try {
    console.log(`updateFields: ${updateFields.name}, ${updateFields.description}`)
    const updatedActivity = await updateActivity(updateFields)
    res.send(updatedActivity)
  } catch ({ name, message }) {
    next({ name, message });
  }



})

module.exports = activitiesRouter;
