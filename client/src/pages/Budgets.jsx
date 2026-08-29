import { useEffect, useMemo, useState } from "react";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../services/budgetService";

const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Entertainment",
  "Health",
  "Bills",
  "Education",
  "Travel",
  "Other",
];

function Budgets() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);

  const [year, setYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingBudget, setEditingBudget] = useState(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    category: "Food",
    amount: "",
  });

  // =========================================
  // LOAD BUDGETS
  // =========================================

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBudgets(month, year);

      setBudgets(data.budgets || []);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     loadBudgets();
  }, [month, year]);

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
  // MONTH NAME
  // =========================================

  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  // =========================================
  // TOTALS
  // =========================================

  const totals = useMemo(() => {
    const budget = budgets.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const spent = budgets.reduce(
      (sum, item) => sum + Number(item.spent || 0),
      0,
    );

    const remaining = budget - spent;

    const percentage = budget > 0 ? (spent / budget) * 100 : 0;

    return {
      budget,
      spent,
      remaining,
      percentage,
    };
  }, [budgets]);

  // =========================================
  // OPEN CREATE MODAL
  // =========================================

  const openCreateModal = () => {
    setEditingBudget(null);

    setForm({
      category: "Food",
      amount: "",
    });

    setShowModal(true);
  };

  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  const openEditModal = (budget) => {
    setEditingBudget(budget);

    setForm({
      category: budget.category,
      amount: budget.amount,
    });

    setShowModal(true);
  };

  // =========================================
  // CLOSE MODAL
  // =========================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingBudget(null);
  };

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // SAVE BUDGET
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingBudget) {
        await updateBudget(editingBudget._id, {
          category: form.category,
          amount,
        });
      } else {
        await createBudget({
          category: form.category,
          amount,
          month,
          year,
        });
      }

      closeModal();
      await loadBudgets();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to save budget.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE BUDGET
  // =========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteBudget(id);

      await loadBudgets();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to delete budget.");
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

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#8B5CF6]">
            Financial planning
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-4xl">
            Budgets
          </h1>

          <p className="mt-3 text-sm text-[#94A3B8]">
            Set spending limits and stay on track.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="
            flex
            w-fit
            items-center
            gap-2
            rounded-xl
            bg-linear-to-r
            from-[#7C3AED]
            to-[#9333EA]
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-lg
            shadow-purple-950/30
            transition
            hover:from-[#8B5CF6]
            hover:to-[#A855F7]
          "
        >
          <span className="text-lg leading-none">+</span>
          Create budget
        </button>
      </div>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-[#3D1833] bg-[#170D18] px-4 py-3 text-sm text-[#F43F5E]">
          {error}
        </div>
      )}

      {/* =====================================
          MONTH SELECTOR
      ===================================== */}

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#1E293B] bg-[#0F172A] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-sm font-semibold text-[#F8FAFC]">Budget period</p>

          <p className="mt-1 text-xs text-[#64748B]">
            Manage your budgets for this month.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="
              rounded-xl
              border border-[#1E293B]
              bg-[#070A18]
              px-3
              py-2.5
              text-sm
              text-[#CBD5E1]
              outline-none
              focus:border-[#7C3AED]
              focus:ring-1
              focus:ring-[#7C3AED]
            "
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map(
              (monthNumber) => (
                <option key={monthNumber} value={monthNumber}>
                  {new Date(2000, monthNumber - 1, 1).toLocaleDateString(
                    "en-IN",
                    {
                      month: "long",
                    },
                  )}
                </option>
              ),
            )}
          </select>

          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="
              rounded-xl
              border border-[#1E293B]
              bg-[#070A18]
              px-3
              py-2.5
              text-sm
              text-[#CBD5E1]
              outline-none
              focus:border-[#7C3AED]
              focus:ring-1
              focus:ring-[#7C3AED]
            "
          >
            {[year - 1, year, year + 1].map((yearNumber) => (
              <option key={yearNumber} value={yearNumber}>
                {yearNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================
          OVERVIEW
      ===================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BudgetSummaryCard
          title="Total budget"
          value={formatCurrency(totals.budget)}
          icon="◫"
          iconClass="bg-[#211A52] text-[#A78BFA]"
        />

        <BudgetSummaryCard
          title="Total spent"
          value={formatCurrency(totals.spent)}
          icon="↗"
          iconClass="bg-[#3D1833] text-[#F43F5E]"
        />

        <BudgetSummaryCard
          title="Remaining"
          value={formatCurrency(totals.remaining)}
          icon="₹"
          iconClass={
            totals.remaining >= 0
              ? "bg-[#063B3A] text-[#00D6A3]"
              : "bg-[#3D1833] text-[#F43F5E]"
          }
        />

        <BudgetSummaryCard
          title="Budget used"
          value={`${totals.percentage.toFixed(1)}%`}
          icon="◎"
          iconClass={
            totals.percentage > 100
              ? "bg-[#3D1833] text-[#F43F5E]"
              : totals.percentage >= 80
                ? "bg-[#3D3011] text-[#F59E0B]"
                : "bg-[#211A52] text-[#A78BFA]"
          }
        />
      </div>

      {/* =====================================
          BUDGETS
      ===================================== */}

      <div className="mb-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[#F8FAFC]">Your budgets</h2>

          <p className="mt-1 text-sm text-[#64748B]">{monthName}</p>
        </div>

         <div className="mb-4 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00D6A3]" />
                  <span className="text-xs text-[#94A3B8]">Healthy Budget</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
                  <span className="text-xs text-[#94A3B8]">Normal Budget</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-xs text-[#94A3B8]">Near Budget</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F43F5E]" />
                  <span className="text-xs text-[#94A3B8]">Over Budget</span>
                </div>
              </div>

        {budgets.length === 0 ? (
          <EmptyBudgets onCreate={openCreateModal} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                formatCurrency={formatCurrency}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* =====================================
          CREATE / EDIT MODAL
      ===================================== */}

      {showModal && (
        <BudgetModal
          form={form}
          editingBudget={editingBudget}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// =============================================
// SUMMARY CARD
// =============================================

function BudgetSummaryCard({ title, value, icon, iconClass }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#1E293B]
        bg-[#0F172A]
        p-5
        transition
        hover:border-[#293754]
        hover:bg-[#131D33]
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#94A3B8]">{title}</p>

          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">{value}</p>
        </div>

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-lg
            font-bold
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
// BUDGET CARD
// =============================================

function BudgetCard({ budget, formatCurrency, onEdit, onDelete }) {
  const percentage = Number(budget.percentage || 0);

  const isOverBudget = percentage > 100;
  const isNearLimit = percentage >= 80 && percentage <= 100;
  const isNotNearToBudget = percentage <= 30;

  const remaining = Number(budget.remaining || 0);

  let progressClass = "from-[#7C3AED] to-[#A855F7]";

  if (isNearLimit) {
    progressClass = "from-[#D97706] to-[#F59E0B]";
  }

  if (isOverBudget) {
    progressClass = "from-[#E11D48] to-[#F43F5E]";
  }
  if (isNotNearToBudget) {
    progressClass = "from-[#2ff016] to-[#42A341]"
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-[#1E293B]
        bg-[#0F172A]
        p-5
        transition
        hover:border-[#293754]
        hover:bg-[#131D33]
      "
    >
      {/* Header */}

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#F8FAFC]">
            {budget.category}
          </h3>

          <p className="mt-1 text-xs text-[#64748B]">Monthly budget</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="
              rounded-lg
              px-2.5
              py-2
              text-xs
              text-[#64748B]
              transition
              hover:bg-[#1E293B]
              hover:text-[#CBD5E1]
            "
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(budget._id)}
            className="
              rounded-lg
              px-2.5
              py-2
              text-xs
              text-[#64748B]
              transition
              hover:bg-[#3D1833]
              hover:text-[#F43F5E]
            "
          >
            Delete
          </button>
        </div>
      </div>

      {/* Amount */}

      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-[#F8FAFC]">
            {formatCurrency(budget.spent)}
          </p>

          <p className="mt-1 text-xs text-[#64748B]">
            of {formatCurrency(budget.amount)}
          </p>
        </div>

        <p
          className={`
            text-sm
            font-semibold
            ${
              isOverBudget
                ? "text-[#F43F5E]"
                : isNearLimit
                  ? "text-[#F59E0B]"
                  : isNotNearToBudget
                  ? "text-[#2ff016]"
                  : "text-[#A78BFA]" 
            }
          `}
        >
          {percentage.toFixed(1)}%
        </p>
      </div>

      {/* Progress */}

      <div className="h-2 overflow-hidden rounded-full bg-[#1E293B]">
        <div
          className={`
            h-full
            rounded-full
            bg-linear-to-r
            ${progressClass}
            transition-all
            duration-500
          `}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>

      {/* Footer */}

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`
            text-xs
            ${
              isOverBudget
                ? "text-[#F43F5E]"
                : isNearLimit
                  ? "text-[#F59E0B]"
                  : isNotNearToBudget
                  ? "text-[#2ff016]"
                  : "text-[#A78BFA]"
            }
          `}
        >
          {isOverBudget
            ? `${formatCurrency(Math.abs(remaining))} over budget`
            : `${formatCurrency(remaining)} remaining`}
        </span>

        <span className="text-xs text-[#475569]">
          Limit {formatCurrency(budget.amount)}
        </span>
      </div>
    </div>
  );
}

// =============================================
// EMPTY STATE
// =============================================

function EmptyBudgets({ onCreate }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#293754] bg-[#0F172A] px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#211A52] text-xl text-[#A78BFA]">
        ◫
      </div>

      <h3 className="text-base font-semibold text-[#F8FAFC]">
        No budgets for this month
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
        Create a spending limit for a category and Nalvion will track your
        progress.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="
          mt-6
          rounded-xl
          bg-linear-to-r
          from-[#7C3AED]
          to-[#9333EA]
          px-5
          py-3
          text-sm
          font-semibold
          text-white
          transition
          hover:from-[#8B5CF6]
          hover:to-[#A855F7]
        "
      >
        Create your first budget
      </button>
    </div>
  );
}

// =============================================
// MODAL
// =============================================

function BudgetModal({
  form,
  editingBudget,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-[#293754]
          bg-[#0F172A]
          p-6
          shadow-2xl
          shadow-black/50
        "
      >
        {/* Header */}

        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">
              Budget
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#F8FAFC]">
              {editingBudget ? "Edit budget" : "Create budget"}
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Set a monthly spending limit.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
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

        {/* Form */}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Category */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={onChange}
              disabled={Boolean(editingBudget)}
              className="
                w-full
                rounded-xl
                border
                border-[#1E293B]
                bg-[#070A18]
                px-4
                py-3
                text-sm
                text-[#F8FAFC]
                outline-none
                transition
                focus:border-[#7C3AED]
                focus:ring-1
                focus:ring-[#7C3AED]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Monthly limit
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">
                ₹
              </span>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={onChange}
                min="1"
                step="1"
                placeholder="10,000"
                required
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#1E293B]
                  bg-[#070A18]
                  py-3
                  pl-9
                  pr-4
                  text-sm
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

          {/* Buttons */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                flex-1
                rounded-xl
                border
                border-[#1E293B]
                bg-[#070A18]
                px-4
                py-3
                text-sm
                font-semibold
                text-[#CBD5E1]
                transition
                hover:bg-[#1E293B]
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                flex-1
                rounded-xl
                bg-linear-to-r
                from-[#7C3AED]
                to-[#9333EA]
                px-4
                py-3
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
              {saving
                ? "Saving..."
                : editingBudget
                  ? "Save changes"
                  : "Create budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Budgets;
