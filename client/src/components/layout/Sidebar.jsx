import { NavLink } from "react-router-dom";
import {
  FiBarChart2,
  FiCreditCard,
  FiHome,
  FiLogOut,
  FiPieChart,
  FiTarget,
  FiSettings,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: FiHome,
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: FiCreditCard,
  },
  {
    name: "Budgets",
    path: "/budgets",
    icon: FiPieChart,
  },
  {
    name: "Goals",
    path: "/goals",
    icon: FiTarget,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: FiBarChart2,
  },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 
          flex-col border-r border-slate-200 bg-white
          transition-transform duration-300
          dark:border-slate-800 dark:bg-slate-950
          lg:static lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* Logo */}

        <div className="flex h-20 items-center justify-between px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 font-bold text-white shadow-lg shadow-violet-600/20">
              N
            </div>

            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Nalvion
            </span>

          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-900"
          >
            <FiX />
          </button>

        </div>

        {/* Navigation */}

        <nav className="flex-1 px-4 py-5">

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Overview
          </p>

          <div className="space-y-1">

            {navigation.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 rounded-xl
                    px-3 py-2.5 text-sm font-medium
                    transition
                    ${
                      isActive
                        ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                    }
                    `
                  }
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </NavLink>
              );
            })}

          </div>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            System
          </p>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `
              flex items-center gap-3 rounded-xl px-3 py-2.5
              text-sm font-medium transition
              ${
                isActive
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              }
              `
            }
          >
            <FiSettings className="h-4.5 w-4.5" />
            Settings
          </NavLink>

        </nav>

        {/* Bottom */}

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <FiLogOut className="h-4.5 w-4.5" />
            Sign out
          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;