import {
  FiBell,
  FiMenu,
  FiSearch,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

const Header = ({ setMobileOpen }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/90">

      <div className="flex items-center gap-3">

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-900"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex dark:border-slate-800 dark:bg-slate-900">

          <FiSearch className="text-slate-400" />

          <input
            type="text"
            placeholder="Search transactions..."
            className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-500"
          />

        </div>

      </div>

      <div className="flex items-center gap-3">

        <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">

          <FiBell className="h-5 w-5" />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500" />

        </button>

        <div className="hidden h-7 w-px bg-slate-200 sm:block dark:bg-slate-800" />

        <div className="flex items-center gap-3">

          <div className="hidden text-right sm:block">

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {user?.name || "User"}
            </p>

            <p className="text-xs text-slate-400">
              Personal account
            </p>

          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

        </div>

      </div>

    </header>
  );
};

export default Header;