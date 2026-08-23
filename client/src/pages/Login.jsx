import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff, FiLock } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
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
    setLoading(true);

    try {
      await login(formData.email, formData.password);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand / Visual Section */}

        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-linear-to-br from-violet-950 via-slate-950 to-indigo-950" />

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
                Smart finance
              </p>

              <h2 className="text-5xl font-semibold leading-tight tracking-tight">
                Understand your money.
                <span className="text-violet-400"> Build your future.</span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                Track your spending, plan your goals, and get intelligent
                insights that help you make better financial decisions.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Your finances. Your future. Your control.
            </p>
          </div>
        </section>

        {/* Login Section */}

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}

            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold shadow-lg shadow-violet-600/30">
                N
              </div>

              <span className="text-xl font-semibold">Nalvion</span>
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-400">
                <FiLock />
                Welcome back
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Take control of your money.
              </h1>

              <p className="mt-3 leading-6 text-slate-400">
                Sign in to continue managing your finances with Nalvion.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email address
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-violet-400 transition hover:text-violet-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="true"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-300"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}

                {!loading && <FiArrowRight />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-violet-400 hover:text-violet-300"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
