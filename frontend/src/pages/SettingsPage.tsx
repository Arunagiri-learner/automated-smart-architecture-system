import React, { useState } from 'react';
import { Sun, Moon, Monitor, User, ShieldCheck, Database, Info } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from '../components/common/Toast';
import { ThemeMode, IToast } from '../types';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<IToast[]>([]);

  const addToast = (type: IToast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="System Settings" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Application Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure profile specifications, visual theme, and system integrations.
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-base">
              <User className="w-5 h-5 text-blue-500" />
              <span>User Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium">
                  {user?.name || 'Alex Morgan'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium">
                  {user?.email || 'alex.morgan@asas-studio.com'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Architectural Role</label>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium">
                  {user?.role || 'Architect'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Session Mode</label>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-emerald-600 dark:text-emerald-400 font-medium">
                  {user?.isDemo ? 'Demo Access Mode' : 'Authenticated User'}
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Theme Switcher */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-base">
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Appearance & Theme</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your preferred visual interface mode for technical workspace rendering.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'dark', label: 'Dark Slate Mode', icon: Moon },
                { id: 'system', label: 'System Default', icon: Monitor },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTheme(item.id as ThemeMode);
                      addToast('info', `Switched theme to ${item.label}`);
                    }}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* About System */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-base">
              <Info className="w-5 h-5 text-slate-500" />
              <span>System & Engine Information</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Application Name:</span>
                <span className="font-semibold text-slate-900 dark:text-white">AUTOMATED SMART ARCHITECTURE SYSTEM (ASAS)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>System Version:</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-white">v1.0.0 Production Release</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>FloorPlanProcessor Service:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">DemoFloorPlanProcessor Active</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Excel Generation Engine:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">ExcelJS v4.4.0 (Multi-Sheet Stream)</span>
              </div>
            </div>
          </div>
        </main>

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </div>
  );
};
