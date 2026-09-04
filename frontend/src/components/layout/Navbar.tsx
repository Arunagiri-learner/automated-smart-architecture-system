import React from 'react';
import { Sun, Moon, User, Menu, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, title }) => {
  const { theme, setTheme, isDark } = useTheme();
  const { user } = useAuth();

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
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AM'}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="text-xs font-medium text-slate-900 dark:text-white">
              {user?.name || 'Alex Morgan'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.role || 'Architect'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
