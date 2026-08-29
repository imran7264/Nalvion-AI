const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0,
    }
  );
};

const getFinancialInsights = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budgets = await Budget.find({
      user: userId,
      month: currentMonth,
      year: currentYear,
    });

    // =========================================
    // GET USER TRANSACTIONS
    // =========================================

    const transactions = await Transaction.find({
      user: userId,
    }).sort({ date: -1 });

    // =========================================
    // NO TRANSACTIONS
    // =========================================

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

        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          savingsRate: 0,
        },
      });
    }

    // =========================================
    // SEPARATE TRANSACTIONS
    // =========================================

    const incomeTransactions = transactions.filter(
      (transaction) => transaction.type === "income",
    );

    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === "expense",
    );

    // =========================================
    // CURRENT MONTH EXPENSES
    // =========================================

    const currentMonthExpenseTransactions = expenseTransactions.filter(
      (transaction) => {
        const date = new Date(transaction.date);

        return (
          date.getMonth() + 1 === currentMonth &&
          date.getFullYear() === currentYear
        );
      },
    );

    // =========================================
    // CURRENT MONTH CATEGORY TOTALS
    // =========================================

    const currentMonthCategoryTotals = {};

    currentMonthExpenseTransactions.forEach((transaction) => {
      const category = transaction.category || "Other";

      currentMonthCategoryTotals[category] =
        (currentMonthCategoryTotals[category] || 0) +
        (Number(transaction.amount) || 0);
    });

    // =========================================
    // TOTAL INCOME
    // =========================================

    const totalIncome = incomeTransactions.reduce(
      (sum, transaction) => sum + (Number(transaction.amount) || 0),
      0,
    );

    // =========================================
    // TOTAL EXPENSES
    // =========================================

    const totalExpenses = expenseTransactions.reduce(
      (sum, transaction) => sum + (Number(transaction.amount) || 0),
      0,
    );

    // =========================================
    // BALANCE
    // =========================================

    const balance = totalIncome - totalExpenses;

    // =========================================
    // SAVINGS RATE
    // =========================================

    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // =========================================
    // INSIGHTS ARRAY
    // =========================================

    const insights = [];

    // =========================================
    // 1. FINANCIAL POSITION
    // =========================================

    if (balance < 0) {
      insights.push({
        type: "warning",
        title: "You're spending more than you earn",

        message: `Your recorded expenses are ₹${formatCurrency(
          Math.abs(balance),
        )} higher than your recorded income.`,
      });
    } else if (balance > 0) {
      insights.push({
        type: "positive",
        title: "You're earning more than you spend",

        message: `Your recorded income is ₹${formatCurrency(
          balance,
        )} higher than your recorded expenses.`,
      });
    } else {
      insights.push({
        type: "neutral",
        title: "Your finances are balanced",

        message: "Your recorded income and expenses are currently equal.",
      });
    }

    // =========================================
    // 2. SAVINGS RATE
    // =========================================

    if (totalIncome > 0) {
      if (savingsRate < 0) {
        insights.push({
          type: "warning",
          title: "Negative savings rate",

          message: `Your expenses currently exceed your income by ${Math.abs(
            savingsRate,
          ).toFixed(
            1,
          )}%. Reducing unnecessary spending could improve your cash flow.`,
        });
      } else if (savingsRate < 20) {
        insights.push({
          type: "warning",
          title: "Low savings rate",

          message: `You're currently saving about ${savingsRate.toFixed(
            1,
          )}% of your recorded income. Consider reviewing your largest expense categories.`,
        });
      } else {
        insights.push({
          type: "positive",
          title: "Healthy savings rate",

          message: `You're currently saving about ${savingsRate.toFixed(
            1,
          )}% of your recorded income. Keep maintaining your savings habit.`,
        });
      }
    }

    // =========================================
    // 3. BIGGEST SPENDING CATEGORY
    // =========================================

    const categoryTotals = {};

    expenseTransactions.forEach((transaction) => {
      const category = transaction.category || "Other";

      categoryTotals[category] =
        (categoryTotals[category] || 0) + (Number(transaction.amount) || 0);
    });

    const categories = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    );

    if (categories.length > 0) {
      const [topCategory, topAmount] = categories[0];

      const percentage =
        totalExpenses > 0 ? (topAmount / totalExpenses) * 100 : 0;

      insights.push({
        type: "category",

        title: "Your biggest spending category",

        message: `${topCategory} represents approximately ${percentage.toFixed(
          1,
        )}% of your recorded expenses.`,

        category: topCategory,

        amount: topAmount,
      });
    }

    // =========================================
    // BUDGET ANALYSIS
    // =========================================

    const budgetInsights = [];

    if (budgets.length > 0) {
      budgets.forEach((budget) => {
        const spent = currentMonthCategoryTotals[budget.category] || 0;

        const percentage =
          budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        // -------------------------------
        // OVER BUDGET
        // -------------------------------

        if (percentage > 100) {
          budgetInsights.push({
            type: "budget-warning",
            title: `${budget.category} budget exceeded`,
            message: `You've spent ₹${formatCurrency(
              spent,
            )} against your ₹${formatCurrency(
              budget.amount,
            )} ${budget.category} budget this month.`,

            category: budget.category,
            budget: budget.amount,
            spent,
            percentage: Number(percentage.toFixed(1)),
          });
        }

        // -------------------------------
        // NEAR BUDGET
        // -------------------------------
        else if (percentage >= 80) {
          budgetInsights.push({
            type: "budget-alert",

            title: `${budget.category} budget is almost reached`,

            message: `You've used ${percentage.toFixed(
              1,
            )}% of your ${budget.category} budget this month.`,

            category: budget.category,

            budget: budget.amount,

            spent,

            percentage: Number(percentage.toFixed(1)),
          });
        }
      });
    }

    // =========================================
    // 4. UNUSUAL EXPENSE
    // =========================================

    if (expenseTransactions.length > 1) {
      const averageExpense = totalExpenses / expenseTransactions.length;

      const unusualExpense = [...expenseTransactions]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .find(
          (transaction) => Number(transaction.amount) >= averageExpense * 3,
        );

      if (unusualExpense) {
        insights.push({
          type: "alert",

          title: "Unusual expense detected",

          message: `Your ${
            unusualExpense.category || "Other"
          } transaction of ₹${formatCurrency(
            unusualExpense.amount,
          )} is significantly higher than your average expense.`,

          transactionId: unusualExpense._id,
        });
      }
    }

    // =========================================
    // 5. SPENDING CONCENTRATION
    // =========================================
    //
    // This is intentionally different from
    // "biggest spending category".
    //
    // It tells the user when one category
    // dominates their spending.
    //
    // =========================================

    if (categories.length > 0 && totalExpenses > 0) {
      const [topCategory, topAmount] = categories[0];

      const percentage = (topAmount / totalExpenses) * 100;

      if (percentage >= 50) {
        insights.push({
          type: "warning",

          title: "Most of your spending is concentrated",

          message: `${topCategory} accounts for ${percentage.toFixed(
            1,
          )}% of your recorded expenses. Reviewing this category could have a significant impact on your finances.`,
        });
      } else {
        insights.push({
          type: "info",

          title: "Your spending is well distributed",

          message:
            "No single category currently dominates most of your recorded expenses.",
        });
      }
    }

    // =========================================
    // RETURN ONLY 5 INSIGHTS
    // =========================================
    const combinedInsights = [...budgetInsights, ...insights];

    res.json({
      insights: combinedInsights.slice(0, 5),

      summary: {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate: Number(savingsRate.toFixed(1)),
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

const askNalvion = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Please enter a question.",
      });
    }

    const transactions = await Transaction.find({
      user: userId,
    }).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.json({
        answer:
          "I don't have enough financial data yet. Add some income and expense transactions and I'll be able to analyze them for you.",
      });
    }

    // =========================================
    // BASIC FINANCIAL DATA
    // =========================================

    const incomeTransactions =
      transactions.filter(
        (transaction) =>
          transaction.type === "income"
      );

    const expenseTransactions =
      transactions.filter(
        (transaction) =>
          transaction.type === "expense"
      );

    const totalIncome =
      incomeTransactions.reduce(
        (sum, transaction) =>
          sum +
          (Number(transaction.amount) || 0),
        0
      );

    const totalExpenses =
      expenseTransactions.reduce(
        (sum, transaction) =>
          sum +
          (Number(transaction.amount) || 0),
        0
      );

    const balance =
      totalIncome - totalExpenses;

    const savingsRate =
      totalIncome > 0
        ? (balance / totalIncome) * 100
        : 0;

    // =========================================
    // NORMALIZE QUESTION
    // =========================================

    const normalizedQuestion =
      question.toLowerCase().trim();

    // =========================================
    // CATEGORY TOTALS
    // =========================================

    const categoryTotals = {};

    expenseTransactions.forEach(
      (transaction) => {
        const category =
          transaction.category ||
          "Other";

        categoryTotals[category] =
          (categoryTotals[category] || 0) +
          (Number(transaction.amount) || 0);
      }
    );

    const categories = Object.entries(
      categoryTotals
    ).sort(
      (a, b) => b[1] - a[1]
    );

    // =========================================
    // BIGGEST EXPENSE
    // =========================================

    const biggestExpense =
      expenseTransactions.length > 0
        ? [...expenseTransactions].sort(
            (a, b) =>
              Number(b.amount) -
              Number(a.amount)
          )[0]
        : null;

    // =========================================
    // QUESTION: TOTAL SPENDING
    // =========================================

    if (
      normalizedQuestion.includes(
        "how much did i spend"
      ) ||
      normalizedQuestion.includes(
        "total spending"
      ) ||
      normalizedQuestion.includes(
        "total expenses"
      ) ||
      normalizedQuestion.includes(
        "how much have i spent"
      )
    ) {
      return res.json({
        answer: `You've recorded total expenses of ₹${formatCurrency(
          totalExpenses
        )}.`,
      });
    }

    // =========================================
    // QUESTION: TOTAL INCOME
    // =========================================

    if (
      normalizedQuestion.includes(
        "how much did i earn"
      ) ||
      normalizedQuestion.includes(
        "total income"
      ) ||
      normalizedQuestion.includes(
        "my income"
      )
    ) {
      return res.json({
        answer: `You've recorded total income of ₹${formatCurrency(
          totalIncome
        )}.`,
      });
    }

    // =========================================
    // QUESTION: BALANCE
    // =========================================

    if (
      normalizedQuestion.includes(
        "my balance"
      ) ||
      normalizedQuestion.includes(
        "how much money do i have"
      ) ||
      normalizedQuestion.includes(
        "am i in the positive"
      )
    ) {
      if (balance >= 0) {
        return res.json({
          answer: `Your recorded income is currently ₹${formatCurrency(
            balance
          )} higher than your expenses.`,
        });
      }

      return res.json({
        answer: `Your recorded expenses are currently ₹${formatCurrency(
          Math.abs(balance)
        )} higher than your income.`,
      });
    }

    // =========================================
    // QUESTION: SAVINGS
    // =========================================

    if (
      normalizedQuestion.includes(
        "saving"
      ) ||
      normalizedQuestion.includes(
        "savings rate"
      )
    ) {
      if (savingsRate < 0) {
        return res.json({
          answer: `Your current savings rate is ${Math.abs(
            savingsRate
          ).toFixed(
            1
          )}% negative because your expenses are higher than your income.`,
        });
      }

      return res.json({
        answer: `Your current savings rate is approximately ${savingsRate.toFixed(
          1
        )}%. You've kept ₹${formatCurrency(
          balance
        )} after your recorded expenses.`,
      });
    }

    // =========================================
    // QUESTION: BIGGEST EXPENSE
    // =========================================

    if (
      normalizedQuestion.includes(
        "biggest expense"
      ) ||
      normalizedQuestion.includes(
        "largest expense"
      ) ||
      normalizedQuestion.includes(
        "most expensive"
      )
    ) {
      if (!biggestExpense) {
        return res.json({
          answer:
            "You don't have any recorded expenses yet.",
        });
      }

      return res.json({
        answer: `Your biggest recorded expense is ₹${formatCurrency(
          biggestExpense.amount
        )} in the ${biggestExpense.category} category.`,
      });
    }

    // =========================================
    // CATEGORY QUESTIONS
    // =========================================

    const matchedCategory =
      categories.find(([category]) =>
        normalizedQuestion.includes(
          category.toLowerCase()
        )
      );

    if (matchedCategory) {
      const [
        category,
        amount,
      ] = matchedCategory;

      const percentage =
        totalExpenses > 0
          ? (amount / totalExpenses) * 100
          : 0;

      return res.json({
        answer: `You've spent ₹${formatCurrency(
          amount
        )} on ${category}. That's approximately ${percentage.toFixed(
          1
        )}% of your recorded expenses.`,
      });
    }

    // =========================================
    // QUESTION: WHERE DO I SPEND MOST?
    // =========================================

    if (
      normalizedQuestion.includes(
        "where do i spend"
      ) ||
      normalizedQuestion.includes(
        "where am i spending"
      ) ||
      normalizedQuestion.includes(
        "spend the most"
      ) ||
      normalizedQuestion.includes(
        "most of my money"
      )
    ) {
      if (categories.length === 0) {
        return res.json({
          answer:
            "You don't have enough expense data yet to identify your main spending category.",
        });
      }

      const [
        topCategory,
        topAmount,
      ] = categories[0];

      return res.json({
        answer: `You spend the most on ${topCategory}, with ₹${formatCurrency(
          topAmount
        )} recorded.`,
      });
    }

    // =========================================
    // QUESTION: REDUCE SPENDING
    // =========================================

    if (
      normalizedQuestion.includes(
        "reduce my spending"
      ) ||
      normalizedQuestion.includes(
        "save more"
      ) ||
      normalizedQuestion.includes(
        "cut my spending"
      ) ||
      normalizedQuestion.includes(
        "where can i reduce"
      )
    ) {
      if (categories.length === 0) {
        return res.json({
          answer:
            "Add some expense transactions first, and I'll identify areas where you may be able to reduce spending.",
        });
      }

      const [
        topCategory,
        topAmount,
      ] = categories[0];

      return res.json({
        answer: `Your ${topCategory} spending is currently your largest expense at ₹${formatCurrency(
          topAmount
        )}. Reviewing this category first could have the biggest impact on your overall spending.`,
      });
    }

    // =========================================
    // FALLBACK
    // =========================================

    return res.json({
      answer:
        "I can help you understand your income, expenses, savings, biggest spending categories, and unusual transactions. Try asking me something like \"How much did I spend on Shopping?\"",
    });
  } catch (error) {
    console.error(
      "Ask Nalvion error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to answer your question.",
    });
  }
};


module.exports = {
  getFinancialInsights,
  askNalvion,
};