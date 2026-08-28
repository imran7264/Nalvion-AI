import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import api from "../services/api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/transactions");

      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // =========================================
  // FORMAT CURRENCY
  // =========================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // =========================================
  // CATEGORIES
  // =========================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        transactions.map((transaction) => transaction.category).filter(Boolean),
      ),
    ];
  }, [transactions]);

  // =========================================
  // FILTER TRANSACTIONS
  // =========================================

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !search ||
        transaction.category?.toLowerCase().includes(searchText) ||
        transaction.description?.toLowerCase().includes(searchText) ||
        transaction.paymentMethod?.toLowerCase().includes(searchText);

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" || transaction.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  // =========================================
  // SUMMARY
  // =========================================

  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        income += Number(transaction.amount);
      } else {
        expenses += Number(transaction.amount);
      }
    });

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  // =========================================
  // Edit Transactions
  // =========================================

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  // =========================================
  // Delete Transaction
  // =========================================

  const handleDelete = async (transactionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);

      await api.delete(`/transactions/${transactionId}`);

      await loadTransactions();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to delete transaction.");
    } finally {
      setDeleteLoading(false);
    }
  };

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

  return (
    <div className="min-h-full bg-[#070A18] p-5 text-[#F8FAFC] sm:p-6 lg:p-8">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#8B5CF6]">
            Financial activity
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-4xl">
            Transactions
          </h1>

          <p className="mt-3 text-sm text-[#94A3B8]">
            Track and manage all your income and expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="
    flex w-fit items-center gap-2
    rounded-xl
    bg-linear-to-r
    from-[#7C3AED]
    to-[#9333EA]
    px-5 py-3
    text-sm font-semibold
    text-white
    shadow-lg
    shadow-purple-950/30
    transition
    hover:from-[#8B5CF6]
    hover:to-[#A855F7]
  "
        >
          + Add Transaction
        </button>
      </div>

      {/* =====================================
          SUMMARY CARDS
      ===================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {/* Balance */}

        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94A3B8]">Balance</p>

              <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
                {formatCurrency(summary.balance)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#211A52] text-[#A78BFA]">
              ₹
            </div>
          </div>
        </div>

        {/* Income */}

        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94A3B8]">Total income</p>

              <p className="mt-2 text-2xl font-bold text-[#00D6A3]">
                +{formatCurrency(summary.income)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#063B3A] text-[#00D6A3]">
              ↙
            </div>
          </div>
        </div>
        {/* =====================================
          ADD TRANSACTION MODAL
      ===================================== */}

        {showModal && (
          <TransactionModal
            transaction={editingTransaction}
            onClose={() => {
              setShowModal(false);
              setEditingTransaction(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingTransaction(null);
              loadTransactions();
            }}
          />
        )}

        {/* Expenses */}

        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94A3B8]">Total expenses</p>

              <p className="mt-2 text-2xl font-bold text-[#F43F5E]">
                -{formatCurrency(summary.expenses)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3D1833] text-[#F43F5E]">
              ↗
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          TRANSACTIONS CARD
      ===================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0F172A]">
        {/* Top controls */}

        <div className="border-b border-[#1E293B] p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}

            <div className="relative w-full xl:max-w-md">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                <FiSearch />
              </span>

              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  h-11
                  w-full
                  rounded-xl
                  border border-[#1E293B]
                  bg-[#070A18]
                  pl-11 pr-4
                  text-sm
                  text-[#F8FAFC]
                  placeholder:text-[#64748B]
                  outline-none
                  transition
                  focus:border-[#7C3AED]
                  focus:ring-1
                  focus:ring-[#7C3AED]
                "
              />
            </div>

            {/* Filters */}

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="
                  h-11
                  rounded-xl
                  border border-[#1E293B]
                  bg-[#070A18]
                  px-4
                  text-sm
                  text-[#CBD5E1]
                  outline-none
                  focus:border-[#7C3AED]
                "
              >
                <option value="all">All types</option>

                <option value="income">Income</option>

                <option value="expense">Expenses</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="
                  h-11
                  rounded-xl
                  border border-[#1E293B]
                  bg-[#070A18]
                  px-4
                  text-sm
                  text-[#CBD5E1]
                  outline-none
                  focus:border-[#7C3AED]
                "
              >
                <option value="all">All categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* =====================================
            TABLE
        ===================================== */}

        {error ? (
          <div className="m-5 rounded-xl border border-[#3D1833] bg-[#170D18] p-4 text-sm text-[#F43F5E]">
            {error}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#1E293B] text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Transaction
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1E293B]">
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === "income";

                  return (
                    <tr
                      key={transaction._id}
                      className="transition hover:bg-[#131D33]"
                    >
                      {/* Transaction */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                                flex h-10 w-10
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
                            <p className="max-w-55 truncate text-sm font-semibold capitalize text-[#F8FAFC]">
                              {transaction.description || transaction.category}
                            </p>

                            <p className="mt-1 text-xs capitalize text-[#64748B]">
                              {transaction.type}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-[#070A18] px-3 py-1.5 text-xs font-medium text-[#94A3B8]">
                          {transaction.category}
                        </span>
                      </td>

                      {/* Payment */}

                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {formatPaymentMethod(transaction.paymentMethod)}
                      </td>

                      {/* Date */}

                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {formatDate(transaction.date)}
                      </td>

                      {/* Amount */}

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`
                              text-sm
                              font-semibold
                              ${isIncome ? "text-[#00D6A3]" : "text-[#F43F5E]"}
                            `}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>

                      {/* Action */}

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(transaction)}
                            className="
                            px-3 py-2
                            rounded-lg
                            font-medium
                            text-xs
                            transition
                          text-[#94A3B8]
                          hover:text-[#A78BFA]
                          hover:bg-[#211A52]
                          "
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(transaction._id)}
                            className="
                            px-3 py-2
                            text-xs
                            font-medium
                            text-[#94A3B8]
                            transition
                            hover:bg-[#3D1833]
                            hover:text-[#F43F5E]
                            rounded-lg
                            "
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}

        {filteredTransactions.length > 0 && (
          <div className="border-t border-[#1E293B] px-5 py-4 sm:px-6">
            <p className="text-xs text-[#64748B]">
              Showing{" "}
              <span className="font-medium text-[#94A3B8]">
                {filteredTransactions.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[#94A3B8]">
                {transactions.length}
              </span>{" "}
              transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// EMPTY STATE
// =============================================

function EmptyTransactions() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#070A18] text-xl text-[#64748B]">
        ◫
      </div>

      <h3 className="text-sm font-semibold text-[#F8FAFC]">
        No transactions found
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#64748B]">
        Try changing your filters or add a new transaction to start tracking
        your finances.
      </p>
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

function TransactionModal({ transaction, onClose, onSuccess }) {
  const [form, setForm] = useState({
    type: transaction?.type || "expense",
    amount: transaction?.amount || "",
    category: transaction?.category || "",
    description: transaction?.description || "",
    paymentMethod: transaction?.paymentMethod || "upi",
    date: transaction?.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!form.amount || !form.category || !form.date) {
        setError("Please fill in all required fields.");

        setLoading(false);
        return;
      }

      const payload = {
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        paymentMethod: form.paymentMethod,
        date: form.date,
      };

      if (transaction?._id) {
        await api.put(`/transactions/${transaction._id}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      onSuccess();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to add transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/70
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full max-w-lg
          overflow-hidden
          rounded-2xl
          border border-[#1E293B]
          bg-[#0F172A]
          shadow-2xl
          shadow-black/50
        "
      >
        {/* =====================================
            MODAL HEADER
        ===================================== */}

        <div className="flex items-center justify-between border-b border-[#1E293B] px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-[#F8FAFC]">
              {transaction ? "Edit transaction" : "Add transaction"}
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              {transaction
                ? "Update your transaction details."
                : "Record your income or expense."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-lg
              text-[#64748B]
              transition
              hover:bg-[#1E293B]
              hover:text-[#F8FAFC]
            "
          >
            ×
          </button>
        </div>

        {/* =====================================
            FORM
        ===================================== */}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error */}

          {error && (
            <div className="mb-5 rounded-xl border border-[#3D1833] bg-[#170D18] px-4 py-3 text-sm text-[#F43F5E]">
              {error}
            </div>
          )}

          {/* TYPE */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Transaction type
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    type: "expense",
                  }))
                }
                className={`
                  rounded-xl
                  border
                  px-4 py-3
                  text-sm
                  font-semibold
                  transition
                  ${
                    form.type === "expense"
                      ? "border-[#F43F5E] bg-[#3D1833] text-[#F43F5E]"
                      : "border-[#1E293B] bg-[#070A18] text-[#64748B] hover:border-[#293754]"
                  }
                `}
              >
                ↗ Expense
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    type: "income",
                  }))
                }
                className={`
                  rounded-xl
                  border
                  px-4 py-3
                  text-sm
                  font-semibold
                  transition
                  ${
                    form.type === "income"
                      ? "border-[#00D6A3] bg-[#063B3A] text-[#00D6A3]"
                      : "border-[#1E293B] bg-[#070A18] text-[#64748B] hover:border-[#293754]"
                  }
                `}
              >
                ↙ Income
              </button>
            </div>
          </div>

          {/* AMOUNT */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                ₹
              </span>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                required
                className="
                  h-12
                  w-full
                  rounded-xl
                  border border-[#1E293B]
                  bg-[#070A18]
                  pl-10 pr-4
                  text-[#F8FAFC]
                  placeholder:text-[#475569]
                  outline-none
                  transition
                  focus:border-[#7C3AED]
                  focus:ring-1
                  focus:ring-[#7C3AED]
                "
              />
            </div>
          </div>

          {/* CATEGORY */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="
                h-12
                w-full
                rounded-xl
                border border-[#1E293B]
                bg-[#070A18]
                px-4
                text-[#F8FAFC]
                outline-none
                transition
                focus:border-[#7C3AED]
                focus:ring-1
                focus:ring-[#7C3AED]
              "
            >
              <option value="">Select category</option>
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Transport">Transport</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Salary">Salary</option>
              <option value="Travel">Travel</option>
              <option value="Freelance">Freelance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* DESCRIPTION */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Description
              <span className="ml-1 text-[#64748B]">(optional)</span>
            </label>

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Dinner with friends"
              className="
                h-12
                w-full
                rounded-xl
                border border-[#1E293B]
                bg-[#070A18]
                px-4
                text-[#F8FAFC]
                placeholder:text-[#475569]
                outline-none
                transition
                focus:border-[#7C3AED]
                focus:ring-1
                focus:ring-[#7C3AED]
              "
            />
          </div>

          {/* PAYMENT METHOD + DATE */}

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
                Payment method
              </label>

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="
                  h-12
                  w-full
                  rounded-xl
                  border border-[#1E293B]
                  bg-[#070A18]
                  px-4
                  text-[#F8FAFC]
                  outline-none
                  transition
                  focus:border-[#7C3AED]
                  focus:ring-1
                  focus:ring-[#7C3AED]
                "
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
                Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="
                  h-12
                  w-full
                  rounded-xl
                  border border-[#1E293B]
                  bg-[#070A18]
                  px-4
                  text-[#F8FAFC]
                  outline-none
                  transition
                  focus:border-[#7C3AED]
                  focus:ring-1
                  focus:ring-[#7C3AED]
                "
              />
            </div>
          </div>

          {/* =====================================
              BUTTONS
          ===================================== */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-xl
                border border-[#1E293B]
                bg-[#070A18]
                px-5 py-3
                text-sm
                font-semibold
                text-[#94A3B8]
                transition
                hover:border-[#293754]
                hover:text-[#F8FAFC]
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                rounded-xl
                bg-linear-to-r
                from-[#7C3AED]
                to-[#9333EA]
                px-5 py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-purple-950/30
                transition
                hover:from-[#8B5CF6]
                hover:to-[#A855F7]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Saving..."
                : transaction
                  ? "Update transaction"
                  : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Transactions;
