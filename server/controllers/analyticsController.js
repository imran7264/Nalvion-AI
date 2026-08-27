const Transaction = require("../models/Transaction");

const getMonthlyAnalysis = async (req, res) => {
  try {
    // =========================================
    // GET USER TRANSACTIONS
    // =========================================

    const transactions = await Transaction.find({
      user: req.user.userId,
    }).sort({ date: 1 });

    // =========================================
    // MONTHLY DATA
    // =========================================

    const monthlyData = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: date.toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          }),

          income: 0,
          expenses: 0,
          savings: 0,
          savingsRate: 0,
        };
      }

      const amount =
        Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        monthlyData[key].income += amount;
      }

      if (transaction.type === "expense") {
        monthlyData[key].expenses += amount;
      }
    });

    const months = Object.values(monthlyData);

    // =========================================
    // CALCULATE SAVINGS
    // =========================================

    months.forEach((month) => {
      month.savings =
        month.income - month.expenses;

      month.savingsRate =
        month.income > 0
          ? Number(
              (
                (month.savings /
                  month.income) *
                100
              ).toFixed(1)
            )
          : 0;
    });

    // =========================================
    // MONTH-OVER-MONTH CHANGES
    // =========================================

    const analysis = [];

    for (let i = 1; i < months.length; i++) {
      const current = months[i];
      const previous = months[i - 1];

      const expenseChange =
        previous.expenses > 0
          ? ((current.expenses -
              previous.expenses) /
              previous.expenses) *
            100
          : 0;

      const incomeChange =
        previous.income > 0
          ? ((current.income -
              previous.income) /
              previous.income) *
            100
          : 0;

      const savingsChange =
        previous.savings !== 0
          ? ((current.savings -
              previous.savings) /
              Math.abs(previous.savings)) *
            100
          : 0;

      analysis.push({
        month: current.month,

        expenseChange: Number(
          expenseChange.toFixed(1)
        ),

        incomeChange: Number(
          incomeChange.toFixed(1)
        ),

        savingsChange: Number(
          savingsChange.toFixed(1)
        ),

        currentExpenses:
          current.expenses,

        previousExpenses:
          previous.expenses,

        currentIncome:
          current.income,

        previousIncome:
          previous.income,

        currentSavings:
          current.savings,

        previousSavings:
          previous.savings,
      });
    }

    // =========================================
    // TOTALS
    // =========================================

    const totalIncome = transactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (sum, transaction) =>
          sum +
          (Number(transaction.amount) || 0),
        0
      );

    const totalExpenses = transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (sum, transaction) =>
          sum +
          (Number(transaction.amount) || 0),
        0
      );

    const balance =
      totalIncome - totalExpenses;

    const savingsRate =
      totalIncome > 0
        ? Number(
            (
              (balance / totalIncome) *
              100
            ).toFixed(1)
          )
        : 0;

    // =========================================
    // CATEGORY SPENDING
    // =========================================

    const categoryTotals = {};

    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {
        const category =
          transaction.category || "Other";

        categoryTotals[category] =
          (categoryTotals[category] || 0) +
          (Number(transaction.amount) || 0);
      });

    const categorySpending =
      Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
        }))
        .sort(
          (a, b) => b.amount - a.amount
        );

    // =========================================
    // BEST SAVINGS MONTH
    // =========================================

    const positiveSavingsMonths =
      months.filter(
        (month) => month.savings > 0
      );

    const bestSavingsMonth =
      positiveSavingsMonths.length > 0
        ? [...positiveSavingsMonths].sort(
            (a, b) =>
              b.savings - a.savings
          )[0]
        : null;

    // =========================================
    // RESPONSE
    // =========================================
    //
    // IMPORTANT:
    // No "insights" are returned here.
    //
    // AI insights belong exclusively to
    // /api/ai/insights.
    //
    // =========================================

    res.json({
      months,

      analysis,

      summary: {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate,
      },

      categorySpending,

      bestSavingsMonth,
    });
  } catch (error) {
    console.error(
      "Monthly analysis error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to generate monthly analysis.",
    });
  }
};

module.exports = {
  getMonthlyAnalysis,
};