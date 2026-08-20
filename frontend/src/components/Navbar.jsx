import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, History } from "lucide-react";

const Navbar = () => {
  const { logout, currentUser } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel !rounded-none !border-t-0 !border-l-0 !border-r-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-gradient">Jarvis Reviewer</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                    isActive("/dashboard") ? "text-accent-cyan bg-white/5" : "text-text-secondary hover:text-white"
                  }`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                    isActive("/history") ? "text-accent-cyan bg-white/5" : "text-text-secondary hover:text-white"
                  }`}
                >
                  <History size={16} /> History
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary hidden sm:block">
              {currentUser?.email}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
