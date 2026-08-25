import { useEffect, useState } from "react";
import { getFinancialInsight } from "../services/aiService";

function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const response =
          await getFinancialInsight();

        setData(response);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load AI insights."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
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
          Understand your spending patterns,
          identify unusual expenses, and discover
          opportunities to improve your finances.
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
            Nalvion analyzes your recorded transactions
            to identify patterns, spending concentration,
            unusual expenses, and savings opportunities.
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

      {/* Insights */}
      <div className="grid gap-4 lg:grid-cols-2">
        {data?.insights?.map((insight, index) => (
          <InsightCard
            key={`${insight.title}-${index}`}
            insight={insight}
          />
        ))}
      </div>

      {data?.insights?.length === 0 && (
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-8 text-center">
          <p className="text-sm text-[#94A3B8]">
            Keep adding transactions and Nalvion
            will generate more insights.
          </p>
        </div>
      )}
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
    <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#94A3B8]">
          {label}
        </span>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
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