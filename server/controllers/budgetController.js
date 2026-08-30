const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// =========================================
// CREATE BUDGET
// =========================================

const createBudget = async (req, res) => {
  try {
    const {
      category,
      amount,
      month,
      year,
    } = req.body;

    if (
      !category ||
      !amount ||
      !month ||
      !year
    ) {
      return res.status(400).json({
        message:
          "Category, amount, month and year are required.",
      });
    }

    const existingBudget =
      await Budget.findOne({
        user: req.user.userId,
        category,
        month,
        year,
      });

    if (existingBudget) {
      return res.status(400).json({
        message:
          "A budget already exists for this category and month.",
      });
    }

    const budget = await Budget.create({
      user: req.user.userId,
      category,
      amount,
      month,
      year,
    });

    res.status(201).json({
      message: "Budget created successfully.",
      budget,
    });
  } catch (error) {
    console.error(
      "Create budget error:",
      error
    );

    res.status(500).json({
      message: "Failed to create budget.",
    });
  }
};

// =========================================
// GET BUDGETS
// =========================================

const getBudgets = async (req, res) => {
  try {
    const now = new Date();

    const month = Number(
      req.query.month || now.getMonth() + 1
    );

    const year = Number(
      req.query.year || now.getFullYear()
    );

    const budgets = await Budget.find({
      user: req.user.userId,
      month,
      year,
    }).sort({ createdAt: -1 });

    // =====================================
    // GET EXPENSES FOR THIS MONTH
    // =====================================

    const startDate = new Date(
      year,
      month - 1,
      1
    );

    const endDate = new Date(
      year,
      month,
      1
    );

    const transactions =
      await Transaction.find({
        user: req.user.userId,
        type: "expense",
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      });

    // =====================================
    // CALCULATE SPENDING PER CATEGORY
    // =====================================

    const spendingByCategory = {};

    transactions.forEach(
      (transaction) => {
        const category =
          transaction.category || "Other";

        spendingByCategory[category] =
          (spendingByCategory[category] || 0) +
          (Number(transaction.amount) || 0);
      }
    );

    // =====================================
    // COMBINE BUDGET + ACTUAL SPENDING
    // =====================================

    const budgetData = budgets.map(
      (budget) => {
        const spent =
          spendingByCategory[
            budget.category
          ] || 0;

        const percentage =
          budget.amount > 0
            ? (spent / budget.amount) * 100
            : 0;

        return {
          _id: budget._id,
          category: budget.category,
          amount: budget.amount,
          spent,
          remaining:
            budget.amount - spent,
          percentage: Number(
            percentage.toFixed(1)
          ),
          month: budget.month,
          year: budget.year,
        };
      }
    );

    res.json({
      budgets: budgetData,
      month,
      year,
    });
  } catch (error) {
    console.error(
      "Get budgets error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch budgets.",
    });
  }
};

// =========================================
// UPDATE BUDGET
// =========================================

const updateBudget = async (req, res) => {
  try {
    const budget =
      await Budget.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.userId,
        },
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found.",
      });
    }

    res.json({
      message:
        "Budget updated successfully.",
      budget,
    });
  } catch (error) {
    console.error(
      "Update budget error:",
      error
    );

    res.status(500).json({
      message: "Failed to update budget.",
    });
  }
};

// =========================================
// DELETE BUDGET
// =========================================

const deleteBudget = async (req, res) => {
  try {
    const budget =
      await Budget.findOneAndDelete({
        _id: req.params.id,
        user: req.user.userId,
      });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found.",
      });
    }

    res.json({
      message:
        "Budget deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete budget error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete budget.",
    });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};