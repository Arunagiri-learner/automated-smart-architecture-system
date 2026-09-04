import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Layers,
  Grid3X3,
  Maximize2,
  Plus,
  ArrowRight,
  Calculator,
  BarChart2,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { api, formatINR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IProject } from '../types';

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const { user, isDemo } = useAuth();

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      if (isDemo) {
        const { INITIAL_PROJECTS } = await import('../data/demoData');
        setProjects(INITIAL_PROJECTS);
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getProjects();
        setProjects(data || []);
      } catch (err: any) {
        setProjects([]);
        setErrorMessage(err.message || 'Unable to connect to ASAS server to load workspace statistics.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [isDemo]);

  // Statistics calculated ONLY from real projects (or demo projects in demo mode)
  const totalProjects = projects.length;
  const totalFloors = projects.reduce((s, p) => s + (p.floorsCount || 0), 0);
  const totalRooms = projects.reduce((s, p) => s + (p.roomsCount || 0), 0);
  const totalAreaSqFt = projects.reduce((s, p) => s + (p.totalAreaSqFt || 0), 0);

  const featuredProject = projects[0] || null;
  const featuredEstBudget = featuredProject
    ? featuredProject.budget?.breakdown?.totalEstimatedCostINR || (featuredProject.totalAreaSqFt * 2200 * 1.05)
    : 0;

  const floorChartData = (featuredProject?.rooms || []).reduce((acc: any[], room) => {
    const existing = acc.find((item) => item.name === `${room.floor} Floor`);
    if (existing) {
      existing.area += room.areaSqFt;
      existing.rooms += 1;
    } else {
      acc.push({ name: `${room.floor} Floor`, area: room.areaSqFt, rooms: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={featuredProject?.id} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={featuredProject?.id} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Dashboard Overview" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  ASAS Workspace
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                    isDemo
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isDemo ? 'DEMO MODE' : 'REAL WORKSPACE'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Welcome back, {user?.name || 'Architect'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Analyze your building plans & construction budget estimates with precision.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">TOTAL PROJECTS</span>
                <FolderKanban className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalProjects}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                {isDemo ? 'Demo Projects' : 'User Workspaces'}
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">TOTAL FLOORS</span>
                <Layers className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalFloors}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">Processed levels</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">ROOMS ANALYZED</span>
                <Grid3X3 className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalRooms}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">Extracted spaces</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">TOTAL AREA</span>
                <Maximize2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {totalAreaSqFt.toLocaleString()} <span className="text-xs font-normal text-slate-400">sq.ft</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">Calculated footprint</span>
            </div>
          </div>

          {/* Overview Chart & Active Project Banner */}
          {!isLoading && projects.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
              <UploadCloud className="w-12 h-12 stroke-1 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Projects Analyzed Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Create a new project workspace and upload your AutoCAD DWG floor plan to generate room area schedules and construction cost estimates.
              </p>
              <button
                onClick={() => navigate('/projects')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Floor-Wise Area Distribution (Sq.ft)
                    </h3>
                    <p className="text-xs text-slate-500">
                      {featuredProject ? `Programmatic extraction for ${featuredProject.name}` : 'No floor data'}
                    </p>
                  </div>
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                </div>

                <div className="h-64 w-full pt-2">
                  {floorChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={floorChartData}>
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#1E293B',
                            borderRadius: '8px',
                            color: '#FFF',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="area" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40}>
                          {floorChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563EB' : '#38BDF8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No room floor distribution available
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Active Project Card */}
              {featuredProject && (
                <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded uppercase">
                        {isDemo ? 'Active Demo Project' : 'Active Project'}
                      </span>
                      <span className="text-xs text-emerald-400 font-medium">
                        {featuredProject.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{featuredProject.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{featuredProject.location}</p>

                    {/* Construction Budget Highlight Box */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-blue-500/30 mb-4">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Estimated Construction Budget
                      </span>
                      <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-0.5">
                        {formatINR(featuredEstBudget)}
                      </div>
                      <span className="text-[10px] text-slate-400">Rate: ₹ 2,200/sq.ft • Standard Finish</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/budget?projectId=${featuredProject.id}`)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Estimate Construction Budget
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
