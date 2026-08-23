const Transaction = require("../models/Transaction");

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transactions = await Transaction.find({
      user: userId,
    }).sort({ date: -1 });

    // =========================================
    // TOTAL INCOME / EXPENSES
    // =========================================

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += Number(transaction.amount);
      } else {
        totalExpenses += Number(transaction.amount);
      }
    });

    const balance = totalIncome - totalExpenses;

    // =========================================
    // CURRENT MONTH
    // =========================================

    const now = new Date();

    const currentMonthTransactions =
      transactions.filter((transaction) => {
        const transactionDate = new Date(
          transaction.date
        );

        return (
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() ===
            now.getFullYear()
        );
      });

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    currentMonthTransactions.forEach(
      (transaction) => {
        if (transaction.type === "income") {
          monthlyIncome += Number(transaction.amount);
        } else {
          monthlyExpenses += Number(
            transaction.amount
          );
        }
      }
    );

    // =========================================
    // CATEGORY SPENDING
    // =========================================

    const categoryMap = {};

    currentMonthTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {
        const category = transaction.category;

        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }

        categoryMap[category] += Number(
          transaction.amount
        );
      });

    const categorySpending = Object.entries(
      categoryMap
    )
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    // =========================================
    // LAST 6 MONTHS SPENDING
    // =========================================

    const monthlySpending = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const year = date.getFullYear();
      const month = date.getMonth();

      const amount = transactions
        .filter((transaction) => {
          if (transaction.type !== "expense") {
            return false;
          }

          const transactionDate = new Date(
            transaction.date
          );

          return (
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() === month
          );
        })
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

      monthlySpending.push({
        month: date.toLocaleString("en-IN", {
          month: "short",
        }),
        amount,
      });
    }

    // =========================================
    // RECENT TRANSACTIONS
    // =========================================

    const recentTransactions =
      transactions.slice(0, 5);

    // =========================================
    // RESPONSE
    // =========================================

    res.status(200).json({
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        monthlyIncome,
        monthlyExpenses,
      },

      categorySpending,

      monthlySpending,

      recentTransactions,
    });
  } catch (error) {
    console.error(
      "Dashboard overview error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load dashboard overview.",
    });
  }
};

module.exports = {
  getDashboardOverview,
};