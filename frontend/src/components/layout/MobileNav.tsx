import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Upload,
  Layers,
  Grid3X3,
  Calculator,
  FileSpreadsheet,
  Settings,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, currentProjectId }) => {
  const activeProjectId = currentProjectId || 'proj-demo-01';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Upload DWG', path: `/upload?projectId=${activeProjectId}`, icon: Upload },
    { label: 'Analysis', path: `/analysis?projectId=${activeProjectId}`, icon: Layers },
    { label: 'Room List', path: `/rooms?projectId=${activeProjectId}`, icon: Grid3X3 },
    { label: 'Budget Estimator', path: `/budget?projectId=${activeProjectId}`, icon: Calculator },
    { label: 'Excel Reports', path: `/reports?projectId=${activeProjectId}`, icon: FileSpreadsheet },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const bottomBarItems = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Analyze', path: `/analysis?projectId=${activeProjectId}`, icon: Layers },
    { label: 'Rooms', path: `/rooms?projectId=${activeProjectId}`, icon: Grid3X3 },
    { label: 'Budget', path: `/budget?projectId=${activeProjectId}`, icon: Calculator },
    { label: 'Reports', path: `/reports?projectId=${activeProjectId}`, icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop & Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col p-4 z-10 animate-slide-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <Logo size="sm" />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar for Handheld Phones */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around">
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
};
