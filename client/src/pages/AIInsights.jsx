import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getFinancialInsights } from "../services/aiService";
import { getMonthlyAnalysis } from "../services/analyticsService";
import AskNalvion from "../components/ai/AskNalvion";

function AIInsights() {
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // LOAD AI + ANALYTICS DATA
  // =========================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [insightsData, monthlyData] = await Promise.all([
          getFinancialInsights(),
          getMonthlyAnalysis(),
        ]);

        setData(insightsData);
        setMonthly(monthlyData);

        console.log("AI insights:", insightsData);

        console.log("Monthly analytics:", monthlyData);
      } catch (err) {
        console.error(err);

        setError(err.response?.data?.message || "Unable to load AI insights.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =========================================
  // CURRENCY
  // =========================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // =========================================
  // CHART DATA
  // =========================================

  const chartData = useMemo(() => {
    return monthly?.months || [];
  }, [monthly]);

  // =========================================
  // INSIGHT COUNTS
  // =========================================

  const insightStats = useMemo(() => {
    const insights = data?.insights || [];

    return {
      total: insights.length,

      warnings: insights.filter(
        (item) =>
          item.type === "warning" ||
          item.type === "budget-warning" ||
          item.type === "goal-warning",
      ).length,

      positive: insights.filter(
        (item) => item.type === "positive" || item.type === "goal-positive",
      ).length,

      alerts: insights.filter(
        (item) => item.type === "alert" || item.type === "budget-alert",
      ).length,
    };
  }, [data]);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#070A18]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E293B] border-t-[#8B5CF6]" />
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="min-h-full bg-[#070A18] p-6 lg:p-8">
        <div className="rounded-2xl border border-[#3D1833] bg-[#170D18] p-5 text-sm text-[#F43F5E]">
          {error}
        </div>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="min-h-full bg-[#070A18] p-5 text-[#F8FAFC] sm:p-6 lg:p-8">
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="mb-7">
        <p className="text-sm font-medium text-[#8B5CF6]">
          Your financial intelligence
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Nalvion AI
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8]">
          Ask questions about your finances, understand your spending, and get
          personalized insights based on your financial activity.
        </p>
      </div>

      {/* =====================================
          ASK NALVION — PRIMARY AI EXPERIENCE
      ===================================== */}

      <div className="mb-7">
        <AskNalvion />
      </div>

      {/* =====================================
          AI STATUS / HERO
      ===================================== */}

      <div
        className="
          relative
          mb-6
          overflow-hidden
          rounded-2xl
          bg-linear-to-br
          from-[#7C3AED]
          via-[#6D28D9]
          to-[#4C1D95]
          p-6
          shadow-xl
          shadow-purple-950/30
          sm:p-8
        "
      >
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#C084FC]/20 blur-3xl" />

        <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#8B5CF6]/20 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl text-white backdrop-blur-sm">
                ✦
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-200">
                Nalvion Intelligence
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Your finances, understood.
              </h2>

              <p className="mt-4 text-sm leading-7 text-purple-100">
                Nalvion analyzes your transactions, budgets, savings goals, and
                financial patterns to surface information that deserves your
                attention.
              </p>
            </div>

            {/* AI STATUS */}

            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3">
                  <span className="absolute h-3 w-3 animate-ping rounded-full bg-[#00D6A3] opacity-75" />
                  <span className="relative h-3 w-3 rounded-full bg-[#00D6A3]" />
                </span>

                <span className="text-sm font-medium text-white">
                  Intelligence active
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-purple-200">
                {insightStats.total > 0
                  ? `${insightStats.total} financial observations are currently available.`
                  : "Add more financial activity to generate deeper insights."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          FINANCIAL SNAPSHOT
      ===================================== */}

      {summary && (
        <section className="mb-7">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">
              Financial snapshot
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#F8FAFC]">
              Here's what Nalvion sees
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InsightSummary
              label="Income"
              value={summary.totalIncome}
              type="income"
            />

            <InsightSummary
              label="Expenses"
              value={summary.totalExpenses}
              type="expense"
            />

            <InsightSummary
              label="Balance"
              value={summary.balance}
              type="balance"
            />

            <InsightSummary
              label="Savings rate"
              value={`${Number(summary.savingsRate || 0).toFixed(1)}%`}
              type="savings"
              isFormatted
            />
          </div>
        </section>
      )}

      {/* =====================================
          WHAT NALVION NOTICED
      ===================================== */}

      <section className="mb-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">
              AI observations
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#F8FAFC]">
              What Nalvion noticed
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Important patterns and events detected in your financial activity.
            </p>
          </div>

          {insightStats.total > 0 && (
            <span className="w-fit rounded-full border border-[#293754] bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-[#94A3B8]">
              {insightStats.total}{" "}
              {insightStats.total === 1 ? "observation" : "observations"}
            </span>
          )}
        </div>

        {data?.insights?.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.insights.map((insight, index) => (
              <InsightCard
                key={`${insight.title}-${index}`}
                insight={insight}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#293754] bg-[#0F172A] p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#211A52] text-[#A78BFA]">
              ✦
            </div>

            <p className="text-sm font-medium text-[#CBD5E1]">
              Nalvion needs more data
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#64748B]">
              Keep adding transactions, budgets, and goals. Nalvion will use
              them to generate more meaningful observations.
            </p>
          </div>
        )}
      </section>

      {/* =====================================
          FINANCIAL TRENDS
      ===================================== */}

      <section className="mb-7 rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">
              Financial trends
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#F8FAFC]">
              Income vs expenses
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Your historical financial activity.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00D6A3]" />
              <span className="text-xs text-[#94A3B8]">Income</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
              <span className="text-xs text-[#94A3B8]">Expenses</span>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -18,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="aiIncomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#00D6A3" stopOpacity={0.8} />

                    <stop offset="100%" stopColor="#00D6A3" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="aiExpenseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />

                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#1E293B"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 11,
                  }}
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `₹${(value / 1000).toFixed(0)}K`
                      : `₹${value}`
                  }
                />

                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name === "income" ? "Income" : "Expenses",
                  ]}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    border: "1px solid #293754",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#00D6A3"
                  strokeWidth={3}
                  fill="url(#aiIncomeGradient)"
                  dot={false}
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fill="url(#aiExpenseGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl bg-[#070A18]">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-[#64748B]">
                ▥
              </div>

              <p className="text-sm font-medium text-[#94A3B8]">
                Not enough transaction history
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Add more transactions to see your financial trends.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// =============================================
// SUMMARY CARD
// =============================================

function InsightSummary({ label, value, type, isFormatted = false }) {
  const iconClass =
    type === "income"
      ? "bg-[#063B3A] text-[#00D6A3]"
      : type === "expense"
        ? "bg-[#3D1833] text-[#F43F5E]"
        : type === "savings"
          ? "bg-[#3D3011] text-[#F59E0B]"
          : "bg-[#211A52] text-[#A78BFA]";

  const icon =
    type === "income"
      ? "↙"
      : type === "expense"
        ? "↗"
        : type === "savings"
          ? "◎"
          : "▣";

  return (
    <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5 transition hover:border-[#293754] hover:bg-[#131D33]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#94A3B8]">{label}</span>

        <span
          className={`
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            ${iconClass}
          `}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-[#F8FAFC]">
        {isFormatted ? value : `₹${Number(value || 0).toLocaleString("en-IN")}`}
      </p>
    </div>
  );
}

// =============================================
// INSIGHT CARD
// =============================================

function InsightCard({ insight, formatCurrency }) {
  const styles = {
    positive: {
      icon: "✓",
      iconClass: "bg-[#063B3A] text-[#00D6A3]",
    },

    warning: {
      icon: "!",
      iconClass: "bg-[#3D3011] text-[#F59E0B]",
    },

    alert: {
      icon: "!",
      iconClass: "bg-[#3D1833] text-[#F43F5E]",
    },

    category: {
      icon: "◈",
      iconClass: "bg-[#211A52] text-[#A78BFA]",
    },

    info: {
      icon: "i",
      iconClass: "bg-[#1E293B] text-[#94A3B8]",
    },

    neutral: {
      icon: "•",
      iconClass: "bg-[#1E293B] text-[#94A3B8]",
    },

    "budget-warning": {
      icon: "!",
      iconClass: "bg-[#3D1833] text-[#F43F5E]",
    },

    "budget-alert": {
      icon: "!",
      iconClass: "bg-[#3D3011] text-[#F59E0B]",
    },

    "goal-warning": {
      icon: "!",
      iconClass: "bg-[#3D1833] text-[#F43F5E]",
    },

    "goal-positive": {
      icon: "✓",
      iconClass: "bg-[#063B3A] text-[#00D6A3]",
    },

    "goal-info": {
      icon: "◎",
      iconClass: "bg-[#211A52] text-[#A78BFA]",
    },
  };

  const style = styles[insight.type] || styles.info;

  return (
    <div
      className="
        rounded-2xl
        border border-[#1E293B]
        bg-[#0F172A]
        p-6
        transition
        hover:border-[#293754]
        hover:bg-[#131D33]"
    >
      <div className="flex gap-4">
        <div
          className={`
            flex h-11 w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            font-bold
            ${style.iconClass}
          `}
        >
          {style.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-semibold text-[#F8FAFC]">{insight.title}</h3>

            {insight.percentage !== undefined && (
              <span className="rounded-full bg-[#070A18] px-2.5 py-1 text-xs font-semibold text-[#A78BFA]">
                {insight.percentage}%
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
            {insight.message}
          </p>

          {/* Budget / Goal metadata */}

          {(insight.category || insight.remaining !== undefined) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {insight.category && (
                <span className="rounded-lg border border-[#1E293B] bg-[#070A18] px-2.5 py-1.5 text-xs text-[#64748B]">
                  {insight.category}
                </span>
              )}

              {insight.remaining !== undefined && (
                <span className="rounded-lg border border-[#1E293B] bg-[#070A18] px-2.5 py-1.5 text-xs text-[#64748B]">
                  {formatCurrency(insight.remaining)} remaining
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIInsights;
