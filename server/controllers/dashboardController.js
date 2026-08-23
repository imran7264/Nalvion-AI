const Transaction = require("../models/Transaction");

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get current date
    const now = new Date();

    // Start of current month
    const startOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Start of 6 months ago
    const startOfSixMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    // Fetch user's transactions
    const transactions = await Transaction.find({
      user: userId,
    }).sort({ date: -1 });

    // -----------------------------------------
    // TOTAL INCOME / EXPENSES
    // -----------------------------------------

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    const balance = totalIncome - totalExpenses;

    // -----------------------------------------
    // CURRENT MONTH
    // -----------------------------------------

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach((transaction) => {
      const transactionDate = new Date(
        transaction.date
      );

      if (transactionDate >= startOfCurrentMonth) {
        if (transaction.type === "income") {
          monthlyIncome += transaction.amount;
        } else {
          monthlyExpenses += transaction.amount;
        }
      }
    });

    // -----------------------------------------
    // MONTHLY SPENDING - LAST 6 MONTHS
    // -----------------------------------------

    const monthlySpendingMap = {};

    for (let i = 0; i < 6; i++) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - i),
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      monthlySpendingMap[key] = {
        month: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        amount: 0,
      };
    }

    transactions.forEach((transaction) => {
      if (transaction.type !== "expense") {
        return;
      }

      const transactionDate = new Date(
        transaction.date
      );

      if (transactionDate < startOfSixMonthsAgo) {
        return;
      }

      const key = `${transactionDate.getFullYear()}-${String(
        transactionDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthlySpendingMap[key]) {
        monthlySpendingMap[key].amount +=
          transaction.amount;
      }
    });

    const monthlySpending = Object.values(
      monthlySpendingMap
    );

    // -----------------------------------------
    // CATEGORY SPENDING - CURRENT MONTH
    // -----------------------------------------

    const categoryMap = {};

    transactions.forEach((transaction) => {
      const transactionDate = new Date(
        transaction.date
      );

      if (
        transaction.type !== "expense" ||
        transactionDate < startOfCurrentMonth
      ) {
        return;
      }

      if (!categoryMap[transaction.category]) {
        categoryMap[transaction.category] = 0;
      }

      categoryMap[transaction.category] +=
        transaction.amount;
    });

    const categorySpending = Object.entries(
      categoryMap
    )
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    // -----------------------------------------
    // RECENT TRANSACTIONS
    // -----------------------------------------

    const recentTransactions =
      transactions.slice(0, 5);

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------

    res.status(200).json({
      summary: {
        balance,
        totalIncome,
        totalExpenses,

        monthlyIncome,
        monthlyExpenses,
      },

      monthlySpending,

      categorySpending,

      recentTransactions,
    });
  } catch (error) {
    console.error(
      "Dashboard overview error:",
      error
    );

    res.status(500).json({
      message: "Failed to load dashboard.",
    });
  }
};

module.exports = {
  getDashboardOverview,
};