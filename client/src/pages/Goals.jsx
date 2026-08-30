import { useEffect, useMemo, useState } from "react";
import {
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
} from "../services/goalService";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    savedAmount: "",
    targetDate: "",
  });

  // =========================================
  // LOAD GOALS
  // =========================================

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getGoals();

      setGoals(data.goals || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load goals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
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
  // DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) return "No target date";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // =========================================
  // SUMMARY
  // =========================================

  const totals = useMemo(() => {
    const target = goals.reduce(
      (sum, goal) =>
        sum + Number(goal.targetAmount || 0),
      0
    );

    const saved = goals.reduce(
      (sum, goal) =>
        sum + Number(goal.savedAmount || 0),
      0
    );

    const remaining = goals.reduce(
      (sum, goal) =>
        sum + Number(goal.remaining || 0),
      0
    );

    const percentage =
      target > 0
        ? (saved / target) * 100
        : 0;

    return {
      target,
      saved,
      remaining,
      percentage,
    };
  }, [goals]);

  // =========================================
  // OPEN CREATE
  // =========================================

  const openCreateModal = () => {
    setEditingGoal(null);

    setForm({
      name: "",
      targetAmount: "",
      savedAmount: "",
      targetDate: "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================================
  // OPEN EDIT
  // =========================================

  const openEditModal = (goal) => {
    setEditingGoal(goal);

    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      targetDate: goal.targetDate
        ? new Date(goal.targetDate)
            .toISOString()
            .split("T")[0]
        : "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================================
  // CLOSE MODAL
  // =========================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingGoal(null);
  };

  // =========================================
  // CHANGE
  // =========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const targetAmount = Number(
      form.targetAmount
    );

    const savedAmount = Number(
      form.savedAmount || 0
    );

    if (!form.name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (
      !targetAmount ||
      targetAmount <= 0
    ) {
      setError(
        "Please enter a valid target amount."
      );
      return;
    }

    if (
      savedAmount < 0 ||
      savedAmount > targetAmount
    ) {
      setError(
        "Saved amount must be between ₹0 and the target amount."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const goalData = {
        name: form.name.trim(),
        targetAmount,
        savedAmount,
        targetDate:
          form.targetDate || null,
      };

      if (editingGoal) {
        await updateGoal(
          editingGoal._id,
          goalData
        );
      } else {
        await createGoal(goalData);
      }

      setShowModal(false);
      setEditingGoal(null);

      await loadGoals();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to save goal."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteGoal(id);

      await loadGoals();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to delete goal."
      );
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
            Financial goals
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-4xl">
            Goals & Savings
          </h1>

          <p className="mt-3 text-sm text-[#94A3B8]">
            Turn your financial plans into achievable goals.
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
          <span className="text-lg leading-none">
            +
          </span>

          Create goal
        </button>
      </div>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && !showModal && (
        <div className="mb-6 rounded-xl border border-[#3D1833] bg-[#170D18] px-4 py-3 text-sm text-[#F43F5E]">
          {error}
        </div>
      )}

      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <GoalSummaryCard
          title="Total target"
          value={formatCurrency(
            totals.target
          )}
          icon="◎"
          iconClass="bg-[#211A52] text-[#A78BFA]"
        />

        <GoalSummaryCard
          title="Total saved"
          value={formatCurrency(
            totals.saved
          )}
          icon="↗"
          iconClass="bg-[#063B3A] text-[#00D6A3]"
        />

        <GoalSummaryCard
          title="Remaining"
          value={formatCurrency(
            totals.remaining
          )}
          icon="◫"
          iconClass="bg-[#3D3011] text-[#F59E0B]"
        />

        <GoalSummaryCard
          title="Overall progress"
          value={`${Math.min(
            totals.percentage,
            100
          ).toFixed(1)}%`}
          icon="✦"
          iconClass="bg-[#211A52] text-[#A78BFA]"
        />
      </div>

      {/* =====================================
          GOALS
      ===================================== */}

      <div>

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[#F8FAFC]">
            Your goals
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Track your progress toward what matters.
          </p>
        </div>

        {goals.length === 0 ? (
          <EmptyGoals
            onCreate={openCreateModal}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                formatCurrency={
                  formatCurrency
                }
                formatDate={formatDate}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* =====================================
          MODAL
      ===================================== */}

      {showModal && (
        <GoalModal
          form={form}
          editingGoal={editingGoal}
          saving={saving}
          error={error}
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

function GoalSummaryCard({
  title,
  value,
  icon,
  iconClass,
}) {
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
          <p className="text-sm font-medium text-[#94A3B8]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
            {value}
          </p>
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
// GOAL CARD
// =============================================

function GoalCard({
  goal,
  formatCurrency,
  formatDate,
  onEdit,
  onDelete,
}) {
  const percentage = Number(
    goal.percentage || 0
  );

  const isComplete =
    percentage >= 100;

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

      <div className="mb-6 flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#211A52] text-lg text-[#A78BFA]">
            {isComplete ? "✓" : "◎"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#F8FAFC]">
              {goal.name}
            </h3>

            <p className="mt-1 text-xs text-[#64748B]">
              Target:{" "}
              {formatDate(goal.targetDate)}
            </p>
          </div>

        </div>

        <div className="flex shrink-0 gap-1">

          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="
              rounded-lg
              px-2
              py-1.5
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
            onClick={() =>
              onDelete(goal._id)
            }
            className="
              rounded-lg
              px-2
              py-1.5
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
            {formatCurrency(
              goal.savedAmount
            )}
          </p>

          <p className="mt-1 text-xs text-[#64748B]">
            of{" "}
            {formatCurrency(
              goal.targetAmount
            )}
          </p>
        </div>

        <span
          className={`
            text-sm
            font-semibold
            ${
              isComplete
                ? "text-[#00D6A3]"
                : "text-[#A78BFA]"
            }
          `}
        >
          {percentage.toFixed(1)}%
        </span>

      </div>

      {/* Progress */}

      <div className="h-2 overflow-hidden rounded-full bg-[#1E293B]">

        <div
          className={`
            h-full
            rounded-full
            bg-linear-to-r
            ${
              isComplete
                ? "from-[#00A884] to-[#00D6A3]"
                : "from-[#7C3AED] to-[#A855F7]"
            }
            transition-all
            duration-500
          `}
          style={{
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />

      </div>

      {/* Footer */}

      <div className="mt-4 flex items-center justify-between">

        <span
          className={`
            text-xs
            ${
              isComplete
                ? "font-medium text-[#00D6A3]"
                : "text-[#64748B]"
            }
          `}
        >
          {isComplete
            ? "Goal completed 🎉"
            : `${formatCurrency(
                goal.remaining
              )} remaining`}
        </span>

        {goal.targetDate && (
          <span className="text-xs text-[#475569]">
            {formatDate(
              goal.targetDate
            )}
          </span>
        )}

      </div>

    </div>
  );
}

// =============================================
// EMPTY STATE
// =============================================

function EmptyGoals({
  onCreate,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#293754] bg-[#0F172A] px-6 py-16 text-center">

      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#211A52] text-xl text-[#A78BFA]">
        ◎
      </div>

      <h3 className="text-base font-semibold text-[#F8FAFC]">
        No financial goals yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
        Create a goal and start tracking your
        progress toward something important.
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
        Create your first goal
      </button>

    </div>
  );
}

// =============================================
// MODAL
// =============================================

function GoalModal({
  form,
  editingGoal,
  saving,
  error,
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
        if (
          event.target === event.currentTarget
        ) {
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
              Savings goal
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#F8FAFC]">
              {editingGoal
                ? "Edit goal"
                : "Create goal"}
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Define what you're saving for.
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

        {/* Modal Error */}

        {error && (
          <div className="mb-5 rounded-xl border border-[#3D1833] bg-[#170D18] px-4 py-3 text-sm text-[#F43F5E]">
            {error}
          </div>
        )}

        {/* Form */}

        <form
          onSubmit={onSubmit}
          className="space-y-5"
        >

          {/* Name */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Goal name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g. New Laptop"
              required
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
                placeholder:text-[#475569]
                outline-none
                transition
                focus:border-[#7C3AED]
                focus:ring-1
                focus:ring-[#7C3AED]
              "
            />
          </div>

          {/* Target */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Target amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">
                ₹
              </span>

              <input
                type="number"
                name="targetAmount"
                value={form.targetAmount}
                onChange={onChange}
                placeholder="80,000"
                min="1"
                step="1"
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

          {/* Saved */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Amount already saved
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">
                ₹
              </span>

              <input
                type="number"
                name="savedAmount"
                value={form.savedAmount}
                onChange={onChange}
                placeholder="0"
                min="0"
                step="1"
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

          {/* Date */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Target date
              <span className="ml-2 text-xs font-normal text-[#475569]">
                Optional
              </span>
            </label>

            <input
              type="date"
              name="targetDate"
              value={form.targetDate}
              onChange={onChange}
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
              "
            />
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
                : editingGoal
                ? "Save changes"
                : "Create goal"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default Goals;