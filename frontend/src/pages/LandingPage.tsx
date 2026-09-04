import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Compass,
  Cpu,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { continueAsDemo } = useAuth();

  const handleStartAnalysis = () => {
    navigate('/login');
  };

  const handleExploreDemo = () => {
    continueAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* LANDING NAVBAR */}
      {/* ------------------------------------------------------------- */}
      <nav className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between">
        <Logo size="md" />

        <div className="flex items-center gap-3">
          <button
            onClick={handleExploreDemo}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Explore Demo
          </button>
          <button
            onClick={handleStartAnalysis}
            className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-md hover:shadow-blue-600/20"
          >
            Start Analysis
          </button>
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full text-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-blue-400 mb-6 animate-fade-in">
          <Cpu className="w-3.5 h-3.5" />
          <span>Next-Gen Architectural Space Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
          From Floor Plans to <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
            Precise Space Insights.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Analyze architectural floor plans, organize room data, calculate building areas, and generate structured reports from one unified workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={handleStartAnalysis}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25"
          >
            Start Analysis
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleExploreDemo}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Explore Demo Project
          </button>
        </div>

        {/* HERO VISUALIZATION — Impressive Blueprint Dashboard Mockup */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-2xl overflow-hidden text-left max-w-5xl mx-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="font-mono text-slate-300 ml-2">ASAS_Modern_Office_Level1-4.dwg</span>
            </div>
            <span className="font-mono text-emerald-400">STATUS: ANALYSIS COMPLETE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 bg-slate-950 rounded-xl p-4 border border-slate-800 blueprint-grid relative min-h-[320px] flex items-center justify-center">
              {/* Simulated SVG floor plan preview */}
              <svg viewBox="0 0 600 300" className="w-full h-full max-h-[280px]">
                <rect x="20" y="20" width="560" height="260" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 2" />
                <rect x="40" y="40" width="160" height="100" fill="#1E293B" fillOpacity="0.8" stroke="#3B82F6" strokeWidth="2" />
                <text x="120" y="85" fill="#E2E8F0" fontSize="12" fontWeight="bold" textAnchor="middle">Executive Boardroom</text>
                <text x="120" y="105" fill="#93C5FD" fontSize="10" fontFamily="monospace" textAnchor="middle">650 sq.ft</text>

                <rect x="220" y="40" width="180" height="100" fill="#2563EB" fillOpacity="0.3" stroke="#60A5FA" strokeWidth="2" />
                <text x="310" y="85" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">Reception & Lounge</text>
                <text x="310" y="105" fill="#93C5FD" fontSize="10" fontFamily="monospace" textAnchor="middle">520 sq.ft</text>

                <rect x="420" y="40" width="140" height="220" fill="#1E293B" fillOpacity="0.8" stroke="#3B82F6" strokeWidth="2" />
                <text x="490" y="140" fill="#E2E8F0" fontSize="12" fontWeight="bold" textAnchor="middle">Open Workspace Bay</text>
                <text x="490" y="160" fill="#93C5FD" fontSize="10" fontFamily="monospace" textAnchor="middle">1,420 sq.ft</text>
              </svg>
            </div>

            {/* Quick Metrics Column */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Building Area</span>
                <span className="text-xl font-bold text-blue-400">24,850 sq.ft</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Extracted Floors</span>
                <span className="text-xl font-bold text-white">4 Levels</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Extracted Rooms</span>
                <span className="text-xl font-bold text-white">48 Spaces</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PROBLEM & SOLUTION SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 px-4 sm:px-8 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">The Problem</span>
            <h2 className="text-3xl font-bold text-white mt-2 mb-4">
              Manual Area Calculations Are Slow & Error-Prone.
            </h2>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <span className="p-1 bg-rose-500/20 text-rose-400 rounded mt-0.5">✕</span>
                <span>Manual room-area measurement is time-consuming, especially for multi-story buildings.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="p-1 bg-rose-500/20 text-rose-400 rounded mt-0.5">✕</span>
                <span>Human calculation errors occur easily with complex geometry and non-rectangular rooms.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="p-1 bg-rose-500/20 text-rose-400 rounded mt-0.5">✕</span>
                <span>Managing occupancy and spatial metrics for hundreds of rooms is fragmented across spreadsheets.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">The ASAS Solution</span>
            <h3 className="text-2xl font-bold text-white mt-2 mb-4">Automated & Programmatic Precision</h3>
            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Instant floor plan boundary analysis & room data extraction</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Programmatic total area aggregation per floor and per building</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>One-click structured Excel report generation with formatted sheets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* HOW IT WORKS (4 STEPS) */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">How ASAS Works in 4 Steps</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Upload Floor Plan', desc: 'Drop your DWG floor plan file with secure file type and header validation.' },
            { step: '02', title: 'Analyze Spaces', desc: 'System identifies room boundaries, calculates clear room heights, and measures square footage.' },
            { step: '03', title: 'Review Results', desc: 'Inspect interactive floor plans, search room tables, and adjust occupancy data.' },
            { step: '04', title: 'Generate Report', desc: 'Export formatted Excel spreadsheets containing building totals and room breakdown.' },
          ].map((item) => (
            <div key={item.step} className="p-6 bg-slate-900 border border-slate-800 rounded-xl relative">
              <span className="text-4xl font-extrabold text-blue-500/20 font-mono block mb-2">{item.step}</span>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p>© {new Date().getFullYear()} ASAS — Automated Smart Architecture System. Built for Precision.</p>
        </div>
      </footer>
    </div>
  );
};
