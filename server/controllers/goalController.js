const Goal = require("../models/Goal");

// =========================================
// CREATE GOAL
// =========================================

const createGoal = async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      savedAmount,
      targetDate,
    } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({
        message:
          "Goal name and target amount are required.",
      });
    }

    const goal = await Goal.create({
      user: req.user.userId,
      name,
      targetAmount,
      savedAmount:
        savedAmount || 0,
      targetDate:
        targetDate || null,
    });

    res.status(201).json({
      message: "Goal created successfully.",
      goal,
    });
  } catch (error) {
    console.error(
      "Create goal error:",
      error
    );

    res.status(500).json({
      message: "Failed to create goal.",
    });
  }
};

// =========================================
// GET GOALS
// =========================================

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    const formattedGoals = goals.map(
      (goal) => {
        const targetAmount =
          Number(goal.targetAmount) || 0;

        const savedAmount =
          Number(goal.savedAmount) || 0;

        const remaining = Math.max(
          targetAmount - savedAmount,
          0
        );

        const percentage =
          targetAmount > 0
            ? (savedAmount /
                targetAmount) *
              100
            : 0;

        return {
          _id: goal._id,
          name: goal.name,
          targetAmount,
          savedAmount,
          remaining,
          percentage: Number(
            Math.min(
              percentage,
              100
            ).toFixed(1)
          ),
          targetDate:
            goal.targetDate,
          createdAt:
            goal.createdAt,
        };
      }
    );

    res.json({
      goals: formattedGoals,
    });
  } catch (error) {
    console.error(
      "Get goals error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch goals.",
    });
  }
};

// =========================================
// UPDATE GOAL
// =========================================

const updateGoal = async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      savedAmount,
      targetDate,
    } = req.body;

    const goal =
      await Goal.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.userId,
        },
        {
          name,
          targetAmount,
          savedAmount,
          targetDate:
            targetDate || null,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found.",
      });
    }

    res.json({
      message:
        "Goal updated successfully.",
      goal,
    });
  } catch (error) {
    console.error(
      "Update goal error:",
      error
    );

    res.status(500).json({
      message: "Failed to update goal.",
    });
  }
};

// =========================================
// DELETE GOAL
// =========================================

const deleteGoal = async (req, res) => {
  try {
    const goal =
      await Goal.findOneAndDelete({
        _id: req.params.id,
        user: req.user.userId,
      });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found.",
      });
    }

    res.json({
      message:
        "Goal deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete goal error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete goal.",
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};