const express = require("express");

const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  addContribution,
} = require("../controllers/goalController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createGoal);

router.get("/", getGoals);

router.post("/:id/contribute", addContribution);

router.put("/:id", updateGoal);

router.delete("/:id", deleteGoal);


module.exports = router;