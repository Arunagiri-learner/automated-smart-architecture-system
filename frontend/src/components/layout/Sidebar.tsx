import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Upload,
  Layers,
  Grid3X3,
  Calculator,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface SidebarProps {
  currentProjectId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentProjectId }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const location = useLocation();

  const activeProjectId = currentProjectId || 'proj-demo-01';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Upload Plan', path: `/upload?projectId=${activeProjectId}`, icon: Upload },
    { label: 'Analysis', path: `/analysis?projectId=${activeProjectId}`, icon: Layers },
    { label: 'Rooms', path: `/rooms?projectId=${activeProjectId}`, icon: Grid3X3 },
    { label: 'Budget Estimator', path: `/budget?projectId=${activeProjectId}`, icon: Calculator },
    { label: 'Reports', path: `/reports?projectId=${activeProjectId}`, icon: FileSpreadsheet },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 relative select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
        <Logo showText={!collapsed} size="md" />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {!collapsed && 'Main Menu'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path.includes('?') && location.pathname === item.path.split('?')[0]);

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive: isLinkActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isLinkActive || isActive
                    ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 stroke-[1.75]" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Demo Indicator */}
        {!collapsed && (
          <div className="mt-6 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Workspace</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Modern Office Building (48 rooms, 24,850 sq.ft, Budget: ₹4.66 Cr).
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 shrink-0 stroke-[1.75]" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};
