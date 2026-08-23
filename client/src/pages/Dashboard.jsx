import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCreditCard,
  FiPlus,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl">

      {/* Heading */}

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>

          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Good morning, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening with your money.
          </p>

        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500">

          <FiPlus />

          Add transaction

        </button>

      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Balance */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total balance
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                ₹24,500
              </p>

            </div>

            <div className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <FiCreditCard />
            </div>

          </div>

          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">

            <FiTrendingUp />

            8.4% this month

          </div>

        </div>

        {/* Income */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Income
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                ₹40,000
              </p>

            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FiArrowDownLeft />
            </div>

          </div>

          <p className="mt-4 text-xs text-slate-400">
            This month
          </p>

        </div>

        {/* Expenses */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Expenses
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                ₹15,500
              </p>

            </div>

            <div className="rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <FiArrowUpRight />
            </div>

          </div>

          <p className="mt-4 text-xs text-slate-400">
            This month
          </p>

        </div>

        {/* Savings */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Savings rate
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                61.2%
              </p>

            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <FiTarget />
            </div>

          </div>

          <p className="mt-4 text-xs text-slate-400">
            +4.2% from last month
          </p>

        </div>

      </div>

      {/* Main content */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        {/* Spending */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-semibold text-slate-900 dark:text-white">
                Spending overview
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Your spending over the last 6 months
              </p>

            </div>

            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <option>Last 6 months</option>
              <option>This year</option>
            </select>

          </div>

          <div className="mt-8 flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400 dark:bg-slate-950">
            Chart will appear here
          </div>

        </div>

        {/* AI Insight */}

        <div className="rounded-2xl bg-linear-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-600/10">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            ✦
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-violet-200">
            Nalvion AI
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Your spending insight
          </h2>

          <p className="mt-3 text-sm leading-6 text-violet-100">
            You're spending more on dining this month
            than your usual average. Reducing it by
            ₹1,500 could help you reach your savings
            goal faster.
          </p>

          <button className="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50">
            View insights
          </button>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;