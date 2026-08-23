import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiUserPlus,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password
      );

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Visual section */}

        <section className="relative hidden overflow-hidden lg:flex">

          <div className="absolute inset-0 bg-linear-to-br from-indigo-950 via-slate-950 to-violet-950" />

          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold shadow-lg shadow-violet-600/30">
                N
              </div>

              <span className="text-xl font-semibold tracking-tight">
                Nalvion
              </span>

            </div>

            <div className="max-w-lg">

              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
                Your financial companion
              </p>

              <h2 className="text-5xl font-semibold leading-tight tracking-tight">
                Turn financial
                <span className="text-violet-400">
                  {" "}data into decisions.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                Nalvion brings your income, expenses,
                budgets and financial goals together in
                one intelligent workspace.
              </p>

            </div>

            <div className="grid max-w-md grid-cols-3 gap-3">

              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-lg font-semibold">
                  Track
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Expenses
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-lg font-semibold">
                  Plan
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Budgets
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-lg font-semibold">
                  Grow
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Goals
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* Form section */}

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">

          <div className="w-full max-w-md">

            {/* Mobile logo */}

            <div className="mb-12 flex items-center gap-3 lg:hidden">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold shadow-lg shadow-violet-600/30">
                N
              </div>

              <span className="text-xl font-semibold">
                Nalvion
              </span>

            </div>

            <div className="mb-8">

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-400">
                <FiUserPlus />
                Get started
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Build better money habits.
              </h1>

              <p className="mt-3 leading-6 text-slate-400">
                Create your Nalvion account and start
                understanding your finances.
              </p>

            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 text-left"
            >

              {/* Name */}

              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Full name*
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />

              </div>

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email address*
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />

              </div>

              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password*
                </label>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-300"
                  >
                    {showPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Use at least 6 characters.
                </p>

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}

                {!loading && <FiArrowRight />}
              </button>

            </form>

            <p className="mt-8 text-center text-sm text-slate-500">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-medium text-violet-400 hover:text-violet-300"
              >
                Sign in
              </Link>

            </p>

          </div>

        </section>

      </div>

    </main>
  );
};

export default Register;