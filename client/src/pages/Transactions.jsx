import { useEffect, useMemo, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactionService";

const createInitialForm = () => ({
  type: "expense",
  amount: "",
  category: "Food",
  description: "",
  paymentMethod: "upi",
  date: new Date().toISOString().split("T")[0],
});

const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Investment",
  "Other",
];

const paymentMethods = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
  },
  { value: "other", label: "Other" },
];

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [form, setForm] = useState(createInitialForm());

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTransactions();

      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setForm((previous) => ({
      ...previous,
      type,
      category:
        type === "income" ? "Salary" : "Food",
    }));
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    setForm(createInitialForm());
    setError("");
    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);

    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description || "",
      paymentMethod:
        transaction.paymentMethod || "other",
      date: new Date(transaction.date)
        .toISOString()
        .split("T")[0],
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingTransaction(null);
    setForm(createInitialForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const transactionData = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingTransaction) {
        const data = await updateTransaction(
          editingTransaction._id,
          transactionData
        );

        setTransactions((previous) =>
          previous.map((transaction) =>
            transaction._id === editingTransaction._id
              ? data.transaction
              : transaction
          )
        );
      } else {
        const data = await createTransaction(
          transactionData
        );

        setTransactions((previous) => [
          data.transaction,
          ...previous,
        ]);
      }

      closeModal();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to save transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteTransaction(id);

      setTransactions((previous) =>
        previous.filter(
          (transaction) => transaction._id !== id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to delete transaction."
      );
    }
  };

  /*
   * Filter transactions
   */
  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.category
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.description
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.paymentMethod
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        transaction.type === typeFilter;

      const transactionDate = new Date(
        transaction.date
      );

      let matchesDate = true;

      if (dateFilter === "month") {
        matchesDate =
          transactionDate.getMonth() ===
            now.getMonth() &&
          transactionDate.getFullYear() ===
            now.getFullYear();
      }

      if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();

        thirtyDaysAgo.setDate(
          thirtyDaysAgo.getDate() - 30
        );

        matchesDate =
          transactionDate >= thirtyDaysAgo;
      }

      if (dateFilter === "year") {
        matchesDate =
          transactionDate.getFullYear() ===
          now.getFullYear();
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesDate
      );
    });
  }, [
    transactions,
    search,
    typeFilter,
    dateFilter,
  ]);

  /*
   * Summary
   */
  const totalIncome = transactions
    .filter(
      (transaction) => transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const totalExpenses = transactions
    .filter(
      (transaction) => transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track and manage your income and expenses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <span className="text-lg leading-none">
            +
          </span>

          Add transaction
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Total income"
          amount={formatCurrency(totalIncome)}
          icon="↗"
          iconClass="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          label="Total expenses"
          amount={formatCurrency(totalExpenses)}
          icon="↘"
          iconClass="bg-red-100 text-red-600"
        />

        <SummaryCard
          label="Balance"
          amount={formatCurrency(balance)}
          icon="₹"
          iconClass="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Transactions container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-sm">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search transactions..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              >
                <option value="all">
                  All types
                </option>

                <option value="income">
                  Income
                </option>

                <option value="expense">
                  Expenses
                </option>
              </select>

              <select
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              >
                <option value="all">
                  All time
                </option>

                <option value="month">
                  This month
                </option>

                <option value="30days">
                  Last 30 days
                </option>

                <option value="year">
                  This year
                </option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Showing {filteredTransactions.length} of{" "}
            {transactions.length} transactions
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            hasTransactions={transactions.length > 0}
            onAdd={openCreateModal}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map(
              (transaction) => (
                <TransactionRow
                  key={transaction._id}
                  transaction={transaction}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TransactionModal
          form={form}
          editing={Boolean(editingTransaction)}
          submitting={submitting}
          onChange={handleChange}
          onTypeChange={handleTypeChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/* ---------------------------------- */
/* Summary Card */
/* ---------------------------------- */

function SummaryCard({
  label,
  amount,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {amount}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Transaction Row */
/* ---------------------------------- */

function TransactionRow({
  transaction,
  onDelete,
  onEdit,
  formatCurrency,
  formatDate,
}) {
  const isIncome = transaction.type === "income";

  return (
    <div className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
            isIncome
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isIncome ? "↗" : "↘"}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {transaction.category}
          </p>

          <p className="truncate text-sm text-slate-500">
            {transaction.description ||
              formatPaymentMethod(
                transaction.paymentMethod
              )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-left sm:text-right">
          <p
            className={`font-semibold ${
              isIncome
                ? "text-emerald-600"
                : "text-slate-900"
            }`}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>

          <p className="text-xs text-slate-400">
            {formatDate(transaction.date)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(transaction)}
            className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            Edit
          </button>

          <button
            onClick={() =>
              onDelete(transaction._id)
            }
            className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Empty State */
/* ---------------------------------- */

function EmptyState({
  hasTransactions,
  onAdd,
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {hasTransactions ? "⌕" : "₹"}
      </div>

      <h3 className="font-semibold text-slate-900">
        {hasTransactions
          ? "No matching transactions"
          : "No transactions yet"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasTransactions
          ? "Try changing your search or filters."
          : "Start tracking your finances by adding your first transaction."}
      </p>

      {!hasTransactions && (
        <button
          onClick={onAdd}
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add your first transaction
        </button>
      )}
    </div>
  );
}

/* ---------------------------------- */
/* Modal */
/* ---------------------------------- */

function TransactionModal({
  form,
  editing,
  submitting,
  onChange,
  onTypeChange,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editing
                ? "Edit transaction"
                : "Add transaction"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editing
                ? "Update your transaction details."
                : "Record your income or expense."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >
          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Transaction type
            </label>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() =>
                  onTypeChange("expense")
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  form.type === "expense"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Expense
              </button>

              <button
                type="button"
                onClick={() =>
                  onTypeChange("income")
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  form.type === "income"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ₹
              </span>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={onChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
                className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="e.g. Dinner with friends"
              maxLength={200}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* Payment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Payment method
            </label>

            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              {paymentMethods.map((method) => (
                <option
                  key={method.value}
                  value={method.value}
                >
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : editing
                ? "Save changes"
                : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

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

export default Transactions;