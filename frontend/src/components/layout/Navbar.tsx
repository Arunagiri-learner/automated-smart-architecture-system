import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, LogOut, Sparkles, UserCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, title }) => {
  const { setTheme, isDark } = useTheme();
  const { user, isDemo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Left: Menu Toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="md:hidden">
          <Logo size="sm" showText={true} />
        </div>

        {title && (
          <h1 className="hidden md:block text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Workspace Mode Tag */}
        <span
          className={`hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold rounded uppercase items-center gap-1 ${
            isDemo
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {isDemo ? (
            <>
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>DEMO MODE</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>REAL WORKSPACE</span>
            </>
          )}
        </span>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="text-xs font-medium text-slate-900 dark:text-white">
              {user?.name || 'Architect'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.role || 'User'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 ml-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
