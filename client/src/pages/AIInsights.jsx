import { useEffect, useState } from "react";
import { getFinancialInsights } from "../services/aiService";
import { getMonthlyAnalysis } from "../services/analyticsService";
import AskNalvion from "../components/ai/AskNalvion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthly, setMonthly] = useState(null)

  useEffect(() => {
    
    const loadData = async () => {
      try {
        const [insightsData, monthlyData] = await Promise.all([
          getFinancialInsights(),
          getMonthlyAnalysis(),
        ]);

        setData(insightsData);
        console.log("insightsData", insightsData)
        setMonthly(monthlyData, monthlyData);
        console.log("monthlyData", monthlyData)
        
      } catch (err) {
        console.error(err);

        setError(err.response?.data?.message || "Unable to load AI insights.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#070A18]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E293B] border-t-[#8B5CF6]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#070A18] p-6 text-[#F43F5E]">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#070A18] p-5 text-[#F8FAFC] sm:p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-[#8B5CF6]">
          Intelligent financial analysis
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Nalvion AI
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8]">
          Understand your spending patterns, identify unusual expenses, and
          discover opportunities to improve your finances.
        </p>
      </div>

      {/* AI Hero */}
      <div
        className="
          relative mb-6 overflow-hidden
          rounded-2xl
          bg-linear-to-br
          from-[#7C3AED]
          via-[#6D28D9]
          to-[#4C1D95]
          p-6
          shadow-xl shadow-purple-950/30
          sm:p-8
        "
      >
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#C084FC]/20 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur-sm">
            ✦
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-200">
            Nalvion Intelligence
          </p>

          <h2 className="mt-2 max-w-2xl text-2xl font-semibold sm:text-3xl">
            Financial insights generated from your activity
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-purple-100">
            Nalvion analyzes your recorded transactions to identify patterns,
            spending concentration, unusual expenses, and savings opportunities.
          </p>
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <InsightSummary
            label="Income"
            value={data.summary.totalIncome}
            type="income"
          />

          <InsightSummary
            label="Expenses"
            value={data.summary.totalExpenses}
            type="expense"
          />

          <InsightSummary
            label="Balance"
            value={data.summary.balance}
            type="balance"
          />
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5 sm:p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8B5CF6]">
            Financial trends
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[#F8FAFC]">
            Income vs expenses
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            See how your financial activity has changed over time.
          </p>
        </div>

        <div className="mb-4 flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00D6A3]" />
            <span className="text-xs text-[#94A3B8]">Income</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
            <span className="text-xs text-[#94A3B8]">Expenses</span>
          </div>
        </div>

        {monthly?.months?.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthly.months}
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
                    `₹${Number(value).toLocaleString("en-IN")}`,
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
          <div className="flex h-72 items-center justify-center text-sm text-[#64748B]">
            Not enough transaction history yet.
          </div>
        )}
      </div>

      {data?.insights?.length > 0 && (
        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#F8FAFC]">
              What Nalvion noticed
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Important changes detected in your financial activity.
            </p>
          </div>
        </section>
      )}
      {/* Insights */}
      <div className="grid gap-4 lg:grid-cols-2">
        {data?.insights?.map((insight, index) => (
          <InsightCard key={`${insight.title}-${index}`} insight={insight} />
        ))}
      </div>

      {data?.insights?.length === 0 && (
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-8 text-center">
          <p className="text-sm text-[#94A3B8]">
            Keep adding transactions and Nalvion will generate more insights.
          </p>
        </div>
      )}

      <AskNalvion />
    </div>
  );
}

function InsightSummary({
  label,
  value,
  type,
}) {
  const iconClass =
    type === "income"
      ? "bg-[#063B3A] text-[#00D6A3]"
      : type === "expense"
        ? "bg-[#3D1833] text-[#F43F5E]"
        : "bg-[#211A52] text-[#A78BFA]";

  return (
    <div className="group rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#94A3B8]">
          {label}
        </span>

        <span
          className={`flex h-9 w-9 items-center justify-center group-hover:scale-150 transition-transform duration-200 rounded-lg ${iconClass}`}
        >
          {type === "income"
            ? "↙"
            : type === "expense"
              ? "↗"
              : "▣"}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold">
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function InsightCard({ insight }) {
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
  };

  const style =
    styles[insight.type] || styles.info;

  return (
    <div
      className="
        rounded-2xl
        border border-[#1E293B]
        bg-[#0F172A]
        p-6
        transition
        hover:border-[#293754]
        hover:bg-[#131D33]
        hover:scale-102
      "
    >
      <div className="flex gap-4">
        <div
          className={`
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-xl font-bold
            ${style.iconClass}
          `}
        >
          {style.icon}
        </div>

        <div>
          <h3 className="font-semibold text-[#F8FAFC]">
            {insight.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIInsights;