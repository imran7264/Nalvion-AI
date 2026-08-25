const Transaction = require("../models/Transaction");

const getFinancialInsights = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transactions = await Transaction.find({
      user: userId,
    }).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.json({
        insights: [
          {
            type: "info",
            title: "Start tracking your finances",
            message:
              "Add a few income and expense transactions so Nalvion can analyze your financial patterns.",
          },
        ],
      });
    }

    const incomeTransactions = transactions.filter(
      (transaction) => transaction.type === "income"
    );

    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === "expense"
    );

    const totalIncome = incomeTransactions.reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

    const totalExpenses = expenseTransactions.reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

    const balance = totalIncome - totalExpenses;

    const insights = [];

    // =========================================
    // SAVINGS INSIGHT
    // =========================================

    if (totalIncome > 0) {
      const savingsRate =
        ((totalIncome - totalExpenses) /
          totalIncome) *
        100;

      if (savingsRate < 10) {
        insights.push({
          type: "warning",
          title: "Low savings rate",
          message: `You're currently saving about ${savingsRate.toFixed(
            1
          )}% of your recorded income. Consider reviewing your largest expense categories.`,
        });
      } else if (savingsRate >= 30) {
        insights.push({
          type: "positive",
          title: "Strong savings rate",
          message: `You're saving approximately ${savingsRate.toFixed(
            1
          )}% of your recorded income. That's a healthy savings pattern.`,
        });
      }
    }

    // =========================================
    // CATEGORY ANALYSIS
    // =========================================

    const categoryTotals = {};

    expenseTransactions.forEach(
      (transaction) => {
        const category = transaction.category;

        categoryTotals[category] =
          (categoryTotals[category] || 0) +
          transaction.amount;
      }
    );

    const categories = Object.entries(
      categoryTotals
    ).sort((a, b) => b[1] - a[1]);

    if (categories.length > 0) {
      const [topCategory, topAmount] =
        categories[0];

      const percentage =
        totalExpenses > 0
          ? (topAmount / totalExpenses) * 100
          : 0;

      insights.push({
        type: "category",
        title: "Your biggest spending category",
        message: `${topCategory} represents approximately ${percentage.toFixed(
          1
        )}% of your recorded expenses.`,
        category: topCategory,
        amount: topAmount,
      });
    }

    // =========================================
    // LARGE EXPENSE DETECTION
    // =========================================

    if (expenseTransactions.length > 0) {
      const averageExpense =
        totalExpenses /
        expenseTransactions.length;

      const largeExpense =
        expenseTransactions.find(
          (transaction) =>
            transaction.amount >
            averageExpense * 3
        );

      if (largeExpense) {
        insights.push({
          type: "alert",
          title: "Unusual expense detected",
          message: `Your ${largeExpense.category} transaction of ₹${largeExpense.amount.toLocaleString(
            "en-IN"
          )} is significantly higher than your average expense.`,
          transactionId: largeExpense._id,
        });
      }
    }

    // =========================================
    // BALANCE INSIGHT
    // =========================================

    if (balance < 0) {
      insights.push({
        type: "warning",
        title: "Expenses exceed income",
        message:
          "Your recorded expenses currently exceed your recorded income. Review your recent spending to identify areas you can reduce.",
      });
    } else if (balance > 0) {
      insights.push({
        type: "positive",
        title: "You're currently in the positive",
        message: `Your recorded income is currently ₹${balance.toLocaleString(
          "en-IN"
        )} higher than your recorded expenses.`,
      });
    }

    res.json({
      insights,
      summary: {
        totalIncome,
        totalExpenses,
        balance,
      },
    });
  } catch (error) {
    console.error(
      "Financial insights error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to generate financial insights.",
    });
  }
};

module.exports = {
  getFinancialInsights,
};