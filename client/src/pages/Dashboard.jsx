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

import { getDashboardOverview } from "../services/dashboardService";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // Load dashboard
  // =========================
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardOverview();

      setDashboard(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================
  // Currency formatter
  // =========================
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // =========================
  // Date formatter
  // =========================
  const formatDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
    }).format(new Date(date));
  };

  // =========================
  // Chart data
  // =========================
  const chartData = useMemo(() => {
    if (!dashboard?.monthlySpending) {
      return [];
    }

    return dashboard.monthlySpending;
  }, [dashboard]);

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#070A18]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E293B] border-t-[#8B5CF6]" />
      </div>
    );
  }

  // =========================
  // Error
  // =========================
  if (error) {
    return (
      <div className="min-h-full bg-[#070A18] p-6 lg:p-8">
        <div className="rounded-2xl border border-[#3D1833] bg-[#170D18] p-5 text-sm text-[#F43F5E]">
          {error}
        </div>
      </div>
    );
  }

  const {
    summary,
    categorySpending = [],
    recentTransactions = [],
  } = dashboard;

  // =========================
  // Savings rate
  // =========================
  const savingsRate =
    summary.totalIncome > 0
      ? ((summary.totalIncome - summary.totalExpenses) /
          summary.totalIncome) *
        100
      : 0;

    //   const monthlySavings = summary.monthlyIncome - summary.monthlyExpenses;

    //   const previousMonthSavings =
    //     summary.previousMonthIncome - summary.previousMonthExpenses;

    //   const savingsChange =
    //     previousMonthSavings !== 0
    //       ? ((monthlySavings - previousMonthSavings) /
    //           Math.abs(previousMonthSavings)) *
    //         100
    //       : 0;

  return (
    <div className="min-h-full bg-[#070A18] p-5 text-[#F8FAFC] sm:p-6 lg:p-8">

      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#8B5CF6]">
            Financial overview
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-4xl">
            Good morning, there 👋
          </h1>

          <p className="mt-3 text-sm text-[#94A3B8]">
            Here's what's happening with your money.
          </p>
        </div>

        <button
          type="button"
          className="
            flex w-fit items-center gap-2
            rounded-xl
            bg-linear-to-r from-[#7C3AED] to-[#9333EA]
            px-5 py-3
            text-sm font-semibold text-white
            shadow-lg shadow-purple-950/30
            transition
            hover:from-[#8B5CF6]
            hover:to-[#A855F7]
            hover:shadow-purple-500/20
          "
        >
          <span className="text-lg leading-none">+</span>
          Add transaction
        </button>
      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Balance */}
        <SummaryCard
          title="Total balance"
          amount={formatCurrency(summary.balance)}
          icon="▣"
          iconClass="bg-[#211A52] text-[#A78BFA]"
          footer={
            <span className="font-medium text-[#00D6A3]">
              Current available balance
            </span>
          }
        />

        {/* Income */}
        <SummaryCard
          title="Total Income"
          amount={formatCurrency(summary.totalIncome)}
          icon="↙"
          iconClass="bg-[#063B3A] text-[#00D6A3]"
          footer={
            <span className="text-[#64748B]">
               All recorded income
            </span>
          }
        />

        {/* Expenses */}
        <SummaryCard
          title="Total expenses"
          amount={formatCurrency(summary.totalExpenses)}
          icon="↗"
          iconClass="bg-[#3D1833] text-[#F43F5E]"
          footer={
            <span className="text-[#64748B]">
             All recorded expenses
            </span>
          }
        />

        {/* Savings */}
        <SummaryCard
          title="Savings rate"
          amount={`${savingsRate.toFixed(1)}%`}
          icon="◎"
          iconClass="bg-[#3D3011] text-[#F59E0B]"
          footer={
            <span className="text-[#94A3B8]">
              Based on current income
            </span>
          }
        />
      </div>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}
      <div className="grid gap-6 xl:grid-cols-3">

        {/* =======================================
            SPENDING OVERVIEW
        ======================================= */}
        <div
          className="
            rounded-2xl
            border border-[#1E293B]
            bg-[#0F172A]
            p-5
            sm:p-6
            xl:col-span-2
          "
        >
          <div className="mb-6 flex items-start justify-between gap-4">

            <div>
              <h2 className="text-xl font-semibold text-[#F8FAFC]">
                Spending overview
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Your spending over the last 6 months
              </p>
            </div>

            <select
              className="
                rounded-xl
                border border-[#1E293B]
                bg-[#070A18]
                px-3 py-2
                text-xs text-[#CBD5E1]
                outline-none
                transition
                focus:border-[#7C3AED]
                focus:ring-1
                focus:ring-[#7C3AED]
              "
              defaultValue="6"
            >
              <option value="6">
                Last 6 months
              </option>

              <option value="3">
                Last 3 months
              </option>

              <option value="12">
                Last 12 months
              </option>
            </select>
          </div>

          {chartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -18,
                    bottom: 0,
                  }}
                >
                  {/* Purple gradient */}
                  <defs>
                    <linearGradient
                      id="nalvionPurple"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8B5CF6"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="100%"
                        stopColor="#8B5CF6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid */}
                  <CartesianGrid
                    stroke="#1E293B"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  {/* X Axis */}
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                  />

                  {/* Y Axis */}
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 11,
                    }}
                    tickFormatter={(value) =>
                      `₹${value}`
                    }
                  />

                  {/* Tooltip */}
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value),
                      "Spending",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border:
                        "1px solid #293754",
                      borderRadius: "12px",
                      color: "#F8FAFC",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.35)",
                    }}
                    labelStyle={{
                      color: "#94A3B8",
                      marginBottom: "4px",
                    }}
                    cursor={{
                      stroke: "#8B5CF6",
                      strokeOpacity: 0.2,
                    }}
                  />

                  {/* Area */}
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    fill="url(#nalvionPurple)"
                    dot={{
                      r: 4,
                      fill: "#8B5CF6",
                      stroke: "#0F172A",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#A855F7",
                      stroke: "#FFFFFF",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* =======================================
            NALVION AI INSIGHT
        ======================================= */}
        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            bg-linear-to-br
            from-[#7C3AED]
            via-[#6D28D9]
            to-[#4C1D95]
            p-6
            shadow-xl
            shadow-purple-950/30
          "
        >
          {/* Glow */}
          <div
            className="
              absolute
              -right-12
              -top-12
              h-40
              w-40
              rounded-full
              bg-[#C084FC]/20
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-16
              -left-12
              h-40
              w-40
              rounded-full
              bg-[#8B5CF6]/30
              blur-3xl
            "
          />

          <div className="relative flex h-full flex-col">

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl text-white backdrop-blur-sm">
              ✦
            </div>

            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-purple-200">
              Nalvion AI
            </p>

            <h2 className="mt-2 text-center text-2xl font-semibold text-white">
              Your spending insight
            </h2>

            <p className="mt-5 text-center text-sm leading-7 text-purple-100">
              You're spending more on dining this
              month than your usual average. Reducing
              it by ₹1,500 could help you reach your
              savings goal faster.
            </p>

            <button
              type="button"
              className="
                mx-auto mt-auto
                rounded-xl
                bg-white
                px-5 py-3
                text-sm font-semibold
                text-[#6D28D9]
                transition
                hover:bg-purple-50
                hover:shadow-lg
              "
            >
              View insights
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          TOP SPENDING
      ========================================= */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">

        <div
          className="
            rounded-2xl
            border border-[#1E293B]
            bg-[#0F172A]
            p-5
            sm:p-6
            xl:col-span-1
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#F8FAFC]">
              Top spending
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Where your money is going.
            </p>
          </div>

          {categorySpending.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#64748B]">
              No spending data yet.
            </p>
          ) : (
            <div className="space-y-5">
              {categorySpending
                .slice(0, 5)
                .map((item) => {
                  const percentage =
                    summary.monthlyExpenses > 0
                      ? (item.amount /
                          summary.monthlyExpenses) *
                        100
                      : 0;

                  return (
                    <div key={item.category}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[#CBD5E1]">
                          {item.category}
                        </span>

                        <span className="text-sm font-semibold text-[#F8FAFC]">
                          {formatCurrency(
                            item.amount
                          )}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#1E293B]">
                        <div
                          className="
                            h-full
                            rounded-full
                            bg-gradient-to-r
                            from-[#7C3AED]
                            to-[#A855F7]
                            transition-all
                          "
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* =======================================
            RECENT TRANSACTIONS
        ======================================= */}
        <div
          className="
            overflow-hidden
            rounded-2xl
            border border-[#1E293B]
            bg-[#0F172A]
            xl:col-span-2
          "
        >
          <div className="flex items-center justify-between border-b border-[#1E293B] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">
                Recent transactions
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Your latest financial activity.
              </p>
            </div>

            <a
              href="/transactions"
              className="
                text-sm
                font-semibold
                text-[#8B5CF6]
                transition
                hover:text-[#A855F7]
              "
            >
              View all →
            </a>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#070A18] text-[#64748B]">
                ◫
              </div>

              <p className="text-sm font-medium text-[#94A3B8]">
                No transactions yet
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Add your first transaction to get
                started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1E293B]">
              {recentTransactions.map(
                (transaction) => {
                  const isIncome =
                    transaction.type === "income";

                  return (
                    <div
                      key={transaction._id}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        px-5 py-4
                        transition
                        hover:bg-[#131D33]
                        sm:px-6
                      "
                    >
                      {/* Left */}
                      <div className="flex min-w-0 items-center gap-3">

                        <div
                          className={`
                            flex h-10 w-10
                            shrink-0
                            items-center justify-center
                            rounded-xl
                            font-semibold
                            ${
                              isIncome
                                ? "bg-[#063B3A] text-[#00D6A3]"
                                : "bg-[#3D1833] text-[#F43F5E]"
                            }
                          `}
                        >
                          {isIncome ? "↙" : "↗"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#F8FAFC]">
                            {transaction.category}
                          </p>

                          <p className="truncate text-xs text-[#64748B]">
                            {transaction.description ||
                              formatPaymentMethod(
                                transaction.paymentMethod
                              )}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="shrink-0 text-right">
                        <p
                          className={`
                            text-sm
                            font-semibold
                            ${
                              isIncome
                                ? "text-[#00D6A3]"
                                : "text-[#F8FAFC]"
                            }
                          `}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(
                            transaction.amount
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          {formatDate(
                            transaction.date
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================
// SUMMARY CARD
// =============================================

function SummaryCard({
  title,
  amount,
  icon,
  iconClass,
  footer,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-[#1E293B]
        bg-[#0F172A]
        p-5
        transition
        hover:border-[#293754]
        hover:bg-[#131D33]
      "
    >
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">
          <p className="text-sm font-medium text-[#94A3B8]">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold text-[#F8FAFC]">
            {amount}
          </p>

          <div className="mt-2 text-xs">
            {footer}
          </div>
        </div>

        <div
          className={`
            flex h-11 w-11
            shrink-0
            items-center justify-center
            rounded-xl
            text-lg font-bold
            ${iconClass}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// =============================================
// EMPTY CHART
// =============================================

function EmptyChart() {
  return (
    <div className="flex h-72 items-center justify-center rounded-xl bg-[#070A18]">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-[#64748B]">
          ▥
        </div>

        <p className="text-sm font-medium text-[#94A3B8]">
          No spending data
        </p>

        <p className="mt-1 text-xs text-[#64748B]">
          Add expenses to see your spending chart.
        </p>
      </div>
    </div>
  );
}

// =============================================
// PAYMENT METHOD
// =============================================

function formatPaymentMethod(method) {
  const labels = {
    upi: "UPI",
    card: "Card",
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    other: "Other",
  };

  return labels[method] || "Other";
}

export default Dashboard;