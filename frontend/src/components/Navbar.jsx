import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { LogOut, LayoutDashboard, History, Trophy, Volume2, VolumeX, Sun, Moon, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { logout, currentUser } = useAuth();
  const { soundEnabled, toggleSound, theme, toggleTheme, apiKey, setApiKey } = useSettings();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-panel !rounded-none !border-t-0 !border-l-0 !border-r-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-gradient">J.A.R.V.I.S. Reviewer</span>
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
                  <Link
                    to="/leaderboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                      isActive("/leaderboard") ? "text-accent-cyan bg-white/5" : "text-text-secondary hover:text-white"
                    }`}
                  >
                    <Trophy size={16} /> Leaderboard
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              
              <button onClick={toggleSound} className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-all" title="Toggle Sound">
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              <button onClick={toggleTheme} className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-all" title="Toggle Theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button onClick={() => setShowSettings(true)} className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-all" title="Settings">
                <Settings size={18} />
              </button>

              <span className="text-sm text-text-secondary hidden sm:block border-l border-white/10 pl-4">
                {currentUser?.email}
              </span>
              
              <button onClick={logout} className="p-2 rounded-full text-status-low hover:bg-status-low/10 transition-all" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Settings size={20} /> System Preferences
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Voice & Audio</h3>
                    <p className="text-sm text-text-secondary">Enable J.A.R.V.I.S. TTS and sound effects.</p>
                  </div>
                  <button 
                    onClick={toggleSound}
                    className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-accent-cyan' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Theme Mode</h3>
                    <p className="text-sm text-text-secondary">Switch between dark and light terminal mode.</p>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'light' ? 'bg-accent-cyan' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'light' ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-medium text-white mb-1">Bring Your Own Key (BYOK)</h3>
                  <p className="text-sm text-text-secondary mb-3">Optional: Use your custom Gemini API key.</p>
                  <input 
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="glass-input w-full text-sm"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
