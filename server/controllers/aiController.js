const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

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

    const goals = await Goal.find({
      user: userId,
    });

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
    // GOAL ANALYSIS
    // =========================================

    const goalInsights = [];

    if (goals.length > 0) {
      goals.forEach((goal) => {
        const targetAmount = Number(goal.targetAmount) || 0;

        const savedAmount = Number(goal.savedAmount) || 0;

        if (targetAmount <= 0) {
          return;
        }

        const remaining = Math.max(targetAmount - savedAmount, 0);

        const percentage = (savedAmount / targetAmount) * 100;

        // =====================================
        // COMPLETED GOAL
        // =====================================

        if (percentage >= 100) {
          goalInsights.push({
            type: "goal-positive",

            title: `${goal.name} goal completed`,

            message: `You've reached your ${goal.name} goal of ₹${formatCurrency(
              targetAmount,
            )}. Great work!`,

            goalId: goal._id,

            percentage: 100,
          });

          return;
        }

        // =====================================
        // GOAL ALMOST COMPLETE
        // =====================================

        if (percentage >= 80) {
          goalInsights.push({
            type: "goal-positive",

            title: `${goal.name} is almost complete`,

            message: `You've saved ${percentage.toFixed(
              1,
            )}% of your ${goal.name} goal. Only ₹${formatCurrency(
              remaining,
            )} remains.`,

            goalId: goal._id,

            percentage: Number(percentage.toFixed(1)),

            remaining,
          });

          return;
        }

        // =====================================
        // GOAL WITH TARGET DATE
        // =====================================

        if (goal.targetDate) {
          const targetDate = new Date(goal.targetDate);

          const today = new Date();

          const daysRemaining = Math.ceil(
            (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysRemaining > 0) {
            const monthsRemaining = Math.max(daysRemaining / 30, 1);

            const monthlySaving = remaining / monthsRemaining;

            goalInsights.push({
              type: "goal-info",

              title: `${goal.name} savings plan`,

              message: `You need to save approximately ₹${formatCurrency(
                monthlySaving,
              )} per month to reach your ${goal.name} goal by ${targetDate.toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )}.`,

              goalId: goal._id,

              percentage: Number(Math.min(percentage, 100).toFixed(1)),

              remaining,

              monthlySaving: Number(monthlySaving.toFixed(2)),
            });
          }

          // ===================================
          // TARGET DATE PASSED
          // ===================================
          else {
            goalInsights.push({
              type: "goal-warning",

              title: `${goal.name} target date has passed`,

              message: `Your target date for ${goal.name} has passed and the goal is not yet complete. Consider updating the target date or increasing your savings.`,

              goalId: goal._id,

              percentage: Number(Math.min(percentage, 100).toFixed(1)),

              remaining,
            });
          }
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
    const combinedInsights = [...budgetInsights, ...goalInsights, ...insights];

    const priority = {
      "budget-warning": 1,
      "goal-warning": 2,
      warning: 3,
      alert: 4,
      "budget-alert": 5,
      "goal-positive": 6,
      positive: 7,
      "goal-info": 8,
      category: 9,
      info: 10,
      neutral: 11,
    };

const prioritizedInsights = combinedInsights
  .sort((a, b) => (priority[a.type] || 99) - (priority[b.type] || 99))
  .slice(0, 5);

    res.json({
      insights: prioritizedInsights,

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

    // =========================================
    // LOAD USER DATA
    // =========================================

    const [goals, budgets, transactions] = await Promise.all([
      Goal.find({
        user: userId,
      }).sort({ createdAt: -1 }),

      Budget.find({
        user: userId,
      }).sort({
        year: -1,
        month: -1,
      }),

      Transaction.find({
        user: userId,
      }).sort({ date: -1 }),
    ]);

    // =========================================
    // NO TRANSACTIONS
    // =========================================

    if (transactions.length === 0) {
      return res.json({
        answer:
          "I don't have enough financial data yet. Add some income and expense transactions and I'll be able to analyze them for you.",
      });
    }

    // =========================================
    // CURRENT DATE
    // =========================================

    const now = new Date();

    const currentMonth = now.getMonth() + 1;

    const currentYear = now.getFullYear();

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
    // CURRENT MONTH TRANSACTIONS
    // =========================================

    const currentMonthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getMonth() + 1 === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    // =========================================
    // CURRENT MONTH INCOME
    // =========================================

    const currentMonthIncome = currentMonthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    // =========================================
    // CURRENT MONTH EXPENSES
    // =========================================

    const currentMonthExpenses = currentMonthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    // =========================================
    // CURRENT MONTH BALANCE
    // =========================================

    const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

    // =========================================
    // CURRENT MONTH SAVINGS RATE
    // =========================================

    const currentMonthSavingsRate =
      currentMonthIncome > 0
        ? (currentMonthBalance / currentMonthIncome) * 100
        : 0;

    // =========================================
    // NORMALIZE QUESTION
    // =========================================

    const normalizedQuestion = question.toLowerCase().trim();

    // =========================================
    // CATEGORY TOTALS - ALL TIME
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

    // =========================================
    // CURRENT MONTH CATEGORY TOTALS
    // =========================================

    const currentMonthCategoryTotals = {};

    currentMonthTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const category = transaction.category || "Other";

        currentMonthCategoryTotals[category] =
          (currentMonthCategoryTotals[category] || 0) +
          (Number(transaction.amount) || 0);
      });

    const currentMonthCategories = Object.entries(
      currentMonthCategoryTotals,
    ).sort((a, b) => b[1] - a[1]);

    // =========================================
    // BIGGEST EXPENSE
    // =========================================

    const biggestExpense =
      expenseTransactions.length > 0
        ? [...expenseTransactions].sort(
            (a, b) => Number(b.amount) - Number(a.amount),
          )[0]
        : null;

    // =========================================
    // BIGGEST CURRENT MONTH EXPENSE
    // =========================================

    const biggestCurrentMonthExpense =
      currentMonthTransactions.filter(
        (transaction) => transaction.type === "expense",
      ).length > 0
        ? [
            ...currentMonthTransactions.filter(
              (transaction) => transaction.type === "expense",
            ),
          ].sort((a, b) => Number(b.amount) - Number(a.amount))[0]
        : null;

    // =========================================
    // GOAL DATA
    // =========================================

    const goalData = goals.map((goal) => {
      const targetAmount = Number(goal.targetAmount) || 0;

      const savedAmount = Number(goal.savedAmount) || 0;

      const remaining = Math.max(targetAmount - savedAmount, 0);

      const percentage =
        targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;

      return {
        id: goal._id,
        name: goal.name,
        targetAmount,
        savedAmount,
        remaining,
        percentage: Math.min(percentage, 100),
        targetDate: goal.targetDate,
      };
    });

    // =========================================
    // MATCH GOAL
    // =========================================

    const matchedGoal = goalData.find((goal) =>
      normalizedQuestion.includes(goal.name.toLowerCase()),
    );

    // =========================================
    // CURRENT MONTH BUDGETS
    // =========================================

    const currentBudgets = budgets.filter(
      (budget) =>
        Number(budget.month) === currentMonth &&
        Number(budget.year) === currentYear,
    );

    // =========================================
    // BUDGET DATA
    // =========================================

    const budgetData = currentBudgets.map((budget) => {
      const amount = Number(budget.amount) || 0;

      const spent = Number(currentMonthCategoryTotals[budget.category]) || 0;

      const remaining = Math.max(amount - spent, 0);

      const percentage = amount > 0 ? (spent / amount) * 100 : 0;

      return {
        id: budget._id,
        category: budget.category,
        budget: amount,
        spent,
        remaining,
        percentage,
      };
    });

    // =========================================
    // MATCH BUDGET CATEGORY
    // =========================================

    const matchedBudget = budgetData.find((budget) =>
      normalizedQuestion.includes(budget.category.toLowerCase()),
    );

    // =========================================
    // MONTH NAMES
    // =========================================

    const currentMonthName = now.toLocaleDateString("en-IN", {
      month: "long",
    });

    // =========================================
    // 1. SPECIFIC GOAL QUESTIONS
    // =========================================

    if (matchedGoal) {
      // ---------------------------------------
      // GOAL TARGET DATE
      // ---------------------------------------

      if (
        normalizedQuestion.includes("when") &&
        (normalizedQuestion.includes("due") ||
          normalizedQuestion.includes("date") ||
          normalizedQuestion.includes("deadline"))
      ) {
        if (!matchedGoal.targetDate) {
          return res.json({
            answer: `Your ${matchedGoal.name} goal doesn't have a target date yet.`,
          });
        }

        const targetDate = new Date(matchedGoal.targetDate);

        return res.json({
          answer: `Your ${matchedGoal.name} goal is targeted for ${targetDate.toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            },
          )}.`,
        });
      }

      // ---------------------------------------
      // DAYS REMAINING
      // ---------------------------------------

      if (
        normalizedQuestion.includes("days") &&
        (normalizedQuestion.includes("left") ||
          normalizedQuestion.includes("remaining"))
      ) {
        if (!matchedGoal.targetDate) {
          return res.json({
            answer: `Your ${matchedGoal.name} goal doesn't have a target date, so I can't calculate the remaining days.`,
          });
        }

        const targetDate = new Date(matchedGoal.targetDate);

        const daysRemaining = Math.ceil(
          (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysRemaining <= 0) {
          return res.json({
            answer: `The target date for your ${matchedGoal.name} goal has passed.`,
          });
        }

        return res.json({
          answer: `You have approximately ${daysRemaining} days remaining to reach your ${matchedGoal.name} goal.`,
        });
      }

      // ---------------------------------------
      // MONTHLY SAVING REQUIRED
      // ---------------------------------------

      if (
        normalizedQuestion.includes("per month") ||
        normalizedQuestion.includes("monthly") ||
        normalizedQuestion.includes("each month")
      ) {
        if (!matchedGoal.targetDate) {
          return res.json({
            answer: `Your ${matchedGoal.name} goal doesn't have a target date, so I can't calculate a monthly saving requirement.`,
          });
        }

        if (matchedGoal.remaining === 0) {
          return res.json({
            answer: `You've already reached your ${matchedGoal.name} goal. 🎉`,
          });
        }

        const targetDate = new Date(matchedGoal.targetDate);

        const daysRemaining = Math.ceil(
          (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysRemaining <= 0) {
          return res.json({
            answer: `The target date for your ${matchedGoal.name} goal has already passed.`,
          });
        }

        const monthsRemaining = Math.max(daysRemaining / 30, 1);

        const monthlySaving = matchedGoal.remaining / monthsRemaining;

        return res.json({
          answer: `To reach your ${matchedGoal.name} goal by the target date, you need to save approximately ₹${formatCurrency(
            monthlySaving,
          )} per month.`,
        });
      }

      // ---------------------------------------
      // GOAL PROGRESS
      // ---------------------------------------

      if (
        normalizedQuestion.includes("progress") ||
        normalizedQuestion.includes("saved") ||
        normalizedQuestion.includes("saving")
      ) {
        return res.json({
          answer: `Your ${matchedGoal.name} goal is ${matchedGoal.percentage.toFixed(
            1,
          )}% complete. You've saved ₹${formatCurrency(
            matchedGoal.savedAmount,
          )} of your ₹${formatCurrency(
            matchedGoal.targetAmount,
          )} target, with ₹${formatCurrency(matchedGoal.remaining)} remaining.`,
        });
      }

      // ---------------------------------------
      // GOAL COMPLETE
      // ---------------------------------------

      if (
        normalizedQuestion.includes("complete") ||
        normalizedQuestion.includes("finished") ||
        normalizedQuestion.includes("reached")
      ) {
        if (matchedGoal.remaining === 0) {
          return res.json({
            answer: `Yes! You've completed your ${matchedGoal.name} goal. 🎉`,
          });
        }

        return res.json({
          answer: `Your ${matchedGoal.name} goal is ${matchedGoal.percentage.toFixed(
            1,
          )}% complete. You still need ₹${formatCurrency(
            matchedGoal.remaining,
          )} to reach it.`,
        });
      }

      // ---------------------------------------
      // GOAL STATUS
      // ---------------------------------------

      return res.json({
        answer: `Your ${matchedGoal.name} goal is currently ${matchedGoal.percentage.toFixed(
          1,
        )}% complete, with ₹${formatCurrency(
          matchedGoal.remaining,
        )} remaining.`,
      });
    }

    // =========================================
    // 2. MY GOALS
    // =========================================

    if (
      normalizedQuestion.includes("my goals") ||
      normalizedQuestion.includes("my financial goals") ||
      normalizedQuestion.includes("what goals")
    ) {
      if (goalData.length === 0) {
        return res.json({
          answer:
            "You haven't created any financial goals yet. Create a goal and I'll help you track your progress toward it.",
        });
      }

      const goalList = goalData
        .map((goal) => `${goal.name} (${goal.percentage.toFixed(1)}% complete)`)
        .join(", ");

      return res.json({
        answer: `You currently have ${goalData.length} financial ${
          goalData.length === 1 ? "goal" : "goals"
        }: ${goalList}.`,
      });
    }

    // =========================================
    // 3. GOAL PROGRESS
    // =========================================

    if (
      normalizedQuestion.includes("goal progress") ||
      normalizedQuestion.includes("how much have i saved for") ||
      normalizedQuestion.includes("how much have i saved toward") ||
      normalizedQuestion.includes("how much have i saved towards")
    ) {
      if (goalData.length === 0) {
        return res.json({
          answer: "You don't have any financial goals yet.",
        });
      }

      const goal = goalData[0];

      return res.json({
        answer: `For your ${goal.name} goal, you've saved ₹${formatCurrency(
          goal.savedAmount,
        )} out of ₹${formatCurrency(
          goal.targetAmount,
        )}. You're ${goal.percentage.toFixed(
          1,
        )}% of the way there, with ₹${formatCurrency(
          goal.remaining,
        )} remaining.`,
      });
    }

    // =========================================
    // 4. GOAL REMAINING
    // =========================================

    if (
      normalizedQuestion.includes("how much more do i need") ||
      normalizedQuestion.includes("how much more do i need to save") ||
      normalizedQuestion.includes("how much is left for my goal")
    ) {
      if (goalData.length === 0) {
        return res.json({
          answer: "You don't have any financial goals yet.",
        });
      }

      const goal = goalData[0];

      if (goal.remaining === 0) {
        return res.json({
          answer: `You've already reached your ${goal.name} goal of ₹${formatCurrency(
            goal.targetAmount,
          )}. 🎉`,
        });
      }

      return res.json({
        answer: `You need another ₹${formatCurrency(
          goal.remaining,
        )} to reach your ${goal.name} goal.`,
      });
    }

    // =========================================
    // 5. BUDGET QUESTIONS
    // =========================================

    if (normalizedQuestion.includes("budget")) {
      // ---------------------------------------
      // NO BUDGETS
      // ---------------------------------------

      if (budgetData.length === 0) {
        return res.json({
          answer: `You don't have any budgets set for ${currentMonthName} yet. Create a budget to let me track your spending against it.`,
        });
      }

      // ---------------------------------------
      // SPECIFIC CATEGORY BUDGET
      // ---------------------------------------

      if (matchedBudget) {
        const budget = matchedBudget;

        if (
          normalizedQuestion.includes("remaining") ||
          normalizedQuestion.includes("left")
        ) {
          if (budget.remaining === 0) {
            return res.json({
              answer: `You've used your entire ${budget.category} budget of ₹${formatCurrency(
                budget.budget,
              )}.`,
            });
          }

          return res.json({
            answer: `You have ₹${formatCurrency(
              budget.remaining,
            )} remaining in your ${budget.category} budget this month.`,
          });
        }

        if (
          normalizedQuestion.includes("over") ||
          normalizedQuestion.includes("exceed")
        ) {
          if (budget.spent > budget.budget) {
            const exceededBy = budget.spent - budget.budget;

            return res.json({
              answer: `Yes. You've exceeded your ${budget.category} budget by ₹${formatCurrency(
                exceededBy,
              )}. You've spent ₹${formatCurrency(
                budget.spent,
              )} against a ₹${formatCurrency(budget.budget)} budget.`,
            });
          }

          return res.json({
            answer: `No. Your ${budget.category} spending is currently within budget. You've used ${budget.percentage.toFixed(
              1,
            )}% of your budget.`,
          });
        }

        return res.json({
          answer: `You've spent ₹${formatCurrency(
            budget.spent,
          )} of your ₹${formatCurrency(
            budget.budget,
          )} ${budget.category} budget this month. That's ${budget.percentage.toFixed(
            1,
          )}% of the budget.`,
        });
      }

      // ---------------------------------------
      // OVERALL BUDGET
      // ---------------------------------------

      if (
        normalizedQuestion.includes("over budget") ||
        normalizedQuestion.includes("exceeded")
      ) {
        const exceeded = budgetData.filter(
          (budget) => budget.spent > budget.budget,
        );

        if (exceeded.length === 0) {
          return res.json({
            answer:
              "You're currently within all of your category budgets this month.",
          });
        }

        const list = exceeded
          .map(
            (budget) =>
              `${budget.category} by ₹${formatCurrency(
                budget.spent - budget.budget,
              )}`,
          )
          .join(", ");

        return res.json({
          answer: `You've exceeded these budgets this month: ${list}.`,
        });
      }

      // ---------------------------------------
      // BUDGET STATUS
      // ---------------------------------------

      const budgetList = budgetData
        .map(
          (budget) =>
            `${budget.category}: ₹${formatCurrency(
              budget.spent,
            )} / ₹${formatCurrency(budget.budget)} (${budget.percentage.toFixed(
              1,
            )}%)`,
        )
        .join(", ");

      return res.json({
        answer: `Your ${currentMonthName} budget status is: ${budgetList}.`,
      });
    }

    // =========================================
    // 6. CURRENT MONTH SPENDING
    // =========================================

    if (
      normalizedQuestion.includes("this month") &&
      (normalizedQuestion.includes("spend") ||
        normalizedQuestion.includes("expense"))
    ) {
      return res.json({
        answer: `You've spent ₹${formatCurrency(
          currentMonthExpenses,
        )} so far in ${currentMonthName}.`,
      });
    }

    // =========================================
    // 7. CURRENT MONTH INCOME
    // =========================================

    if (
      normalizedQuestion.includes("this month") &&
      (normalizedQuestion.includes("income") ||
        normalizedQuestion.includes("earn") ||
        normalizedQuestion.includes("earned"))
    ) {
      return res.json({
        answer: `You've recorded ₹${formatCurrency(
          currentMonthIncome,
        )} of income so far in ${currentMonthName}.`,
      });
    }

    // =========================================
    // 8. CURRENT MONTH SAVINGS
    // =========================================

    if (
      normalizedQuestion.includes("this month") &&
      (normalizedQuestion.includes("saving") ||
        normalizedQuestion.includes("saved"))
    ) {
      return res.json({
        answer: `You've currently saved ₹${formatCurrency(
          currentMonthBalance,
        )} in ${currentMonthName}, which is a savings rate of ${currentMonthSavingsRate.toFixed(
          1,
        )}%.`,
      });
    }

    // =========================================
    // 9. MONTHLY SPENDING CATEGORY
    // =========================================

    if (
      normalizedQuestion.includes("this month") &&
      (normalizedQuestion.includes("where") ||
        normalizedQuestion.includes("spend most"))
    ) {
      if (currentMonthCategories.length === 0) {
        return res.json({
          answer: `You don't have any recorded expenses for ${currentMonthName} yet.`,
        });
      }

      const [topCategory, topAmount] = currentMonthCategories[0];

      return res.json({
        answer: `This month, you are spending the most on ${topCategory}, with ₹${formatCurrency(
          topAmount,
        )} recorded.`,
      });
    }

    // =========================================
    // 10. MONTHLY BIGGEST EXPENSE
    // =========================================

    if (
      normalizedQuestion.includes("this month") &&
      (normalizedQuestion.includes("biggest expense") ||
        normalizedQuestion.includes("largest expense"))
    ) {
      if (!biggestCurrentMonthExpense) {
        return res.json({
          answer: `You don't have any recorded expenses for ${currentMonthName} yet.`,
        });
      }

      return res.json({
        answer: `Your biggest expense this month is ₹${formatCurrency(
          biggestCurrentMonthExpense.amount,
        )} in the ${biggestCurrentMonthExpense.category || "Other"} category.`,
      });
    }

    // =========================================
    // 11. TOTAL SPENDING
    // =========================================

    if (
      normalizedQuestion.includes("how much did i spend") ||
      normalizedQuestion.includes("total spending") ||
      normalizedQuestion.includes("total expenses") ||
      normalizedQuestion.includes("how much have i spent")
    ) {
      return res.json({
        answer: `You've recorded total expenses of ₹${formatCurrency(
          totalExpenses,
        )}.`,
      });
    }

    // =========================================
    // 12. TOTAL INCOME
    // =========================================

    if (
      normalizedQuestion.includes("how much did i earn") ||
      normalizedQuestion.includes("total income") ||
      normalizedQuestion.includes("my income")
    ) {
      return res.json({
        answer: `You've recorded total income of ₹${formatCurrency(
          totalIncome,
        )}.`,
      });
    }

    // =========================================
    // 13. BALANCE
    // =========================================

    if (
      normalizedQuestion.includes("my balance") ||
      normalizedQuestion.includes("how much money do i have") ||
      normalizedQuestion.includes("am i in the positive")
    ) {
      if (balance >= 0) {
        return res.json({
          answer: `Your recorded income is currently ₹${formatCurrency(
            balance,
          )} higher than your expenses.`,
        });
      }

      return res.json({
        answer: `Your recorded expenses are currently ₹${formatCurrency(
          Math.abs(balance),
        )} higher than your income.`,
      });
    }

    // =========================================
    // 14. SAVINGS
    // =========================================

    if (
      normalizedQuestion.includes("saving") ||
      normalizedQuestion.includes("savings rate")
    ) {
      if (savingsRate < 0) {
        return res.json({
          answer: `Your current savings rate is ${Math.abs(savingsRate).toFixed(
            1,
          )}% negative because your expenses are higher than your income.`,
        });
      }

      return res.json({
        answer: `Your current savings rate is approximately ${savingsRate.toFixed(
          1,
        )}%. You've kept ₹${formatCurrency(
          balance,
        )} after your recorded expenses.`,
      });
    }

    // =========================================
    // 15. BIGGEST EXPENSE
    // =========================================

    if (
      normalizedQuestion.includes("biggest expense") ||
      normalizedQuestion.includes("largest expense") ||
      normalizedQuestion.includes("most expensive")
    ) {
      if (!biggestExpense) {
        return res.json({
          answer: "You don't have any recorded expenses yet.",
        });
      }

      return res.json({
        answer: `Your biggest recorded expense is ₹${formatCurrency(
          biggestExpense.amount,
        )} in the ${biggestExpense.category || "Other"} category.`,
      });
    }

    // =========================================
    // 16. UNUSUAL EXPENSE
    // =========================================

    if (
      normalizedQuestion.includes("unusual") ||
      normalizedQuestion.includes("abnormal") ||
      normalizedQuestion.includes("unexpected expense") ||
      normalizedQuestion.includes("large expense")
    ) {
      if (expenseTransactions.length < 2) {
        return res.json({
          answer:
            "I don't have enough expense history yet to identify an unusual expense.",
        });
      }

      const averageExpense = totalExpenses / expenseTransactions.length;

      const unusualExpense = [...expenseTransactions]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .find(
          (transaction) => Number(transaction.amount) >= averageExpense * 3,
        );

      if (!unusualExpense) {
        return res.json({
          answer:
            "I don't currently see an expense that is significantly higher than your average recorded expense.",
        });
      }

      return res.json({
        answer: `I found an unusual expense of ₹${formatCurrency(
          unusualExpense.amount,
        )} in the ${
          unusualExpense.category || "Other"
        } category. That's significantly higher than your average expense of approximately ₹${formatCurrency(
          averageExpense,
        )}.`,
      });
    }

    // =========================================
    // 17. CATEGORY QUESTIONS
    // =========================================

    const matchedCategory = categories.find(([category]) =>
      normalizedQuestion.includes(category.toLowerCase()),
    );

    if (matchedCategory) {
      const [category, amount] = matchedCategory;

      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

      return res.json({
        answer: `You've spent ₹${formatCurrency(
          amount,
        )} on ${category}. That's approximately ${percentage.toFixed(
          1,
        )}% of your recorded expenses.`,
      });
    }

    // =========================================
    // 18. WHERE DO I SPEND MOST?
    // =========================================

    if (
      normalizedQuestion.includes("where do i spend") ||
      normalizedQuestion.includes("where am i spending") ||
      normalizedQuestion.includes("spend the most") ||
      normalizedQuestion.includes("most of my money")
    ) {
      if (categories.length === 0) {
        return res.json({
          answer:
            "You don't have enough expense data yet to identify your main spending category.",
        });
      }

      const [topCategory, topAmount] = categories[0];

      return res.json({
        answer: `You spend the most on ${topCategory}, with ₹${formatCurrency(
          topAmount,
        )} recorded.`,
      });
    }

    // =========================================
    // 19. REDUCE SPENDING
    // =========================================

    if (
      normalizedQuestion.includes("reduce my spending") ||
      normalizedQuestion.includes("save more") ||
      normalizedQuestion.includes("cut my spending") ||
      normalizedQuestion.includes("where can i reduce")
    ) {
      if (categories.length === 0) {
        return res.json({
          answer:
            "Add some expense transactions first, and I'll identify areas where you may be able to reduce spending.",
        });
      }

      const [topCategory, topAmount] = categories[0];

      return res.json({
        answer: `Your ${topCategory} spending is currently your largest expense at ₹${formatCurrency(
          topAmount,
        )}. Reviewing this category first could have the biggest impact on your overall spending.`,
      });
    }

    // =========================================
    // FALLBACK
    // =========================================

    return res.json({
      answer:
        'I can help you understand your income, expenses, savings, budgets, goals, spending patterns, and unusual transactions. Try asking something like "How much did I spend this month?", "Am I over budget?", or "How much do I need to save for my laptop goal?"',
    });
  } catch (error) {
    console.error("Ask Nalvion error:", error);

    res.status(500).json({
      message: "Unable to answer your question.",
    });
  }
};


module.exports = {
  getFinancialInsights,
  askNalvion,
};