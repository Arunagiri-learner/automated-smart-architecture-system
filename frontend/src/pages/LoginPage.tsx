import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('alex.morgan@asas-studio.com');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [role, setRole] = useState<string>('Architect');

  const navigate = useNavigate();
  const { login, continueAsDemo } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate('/dashboard');
  };

  const handleDemoAccess = () => {
    continueAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="lg" className="mb-4" />
          <h2 className="text-xl font-bold text-white">Sign In to ASAS Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated Smart Architecture System for Professionals
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="architect@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Professional Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Architect">Architect</option>
              <option value="Construction Manager">Construction Manager</option>
              <option value="Facility Manager">Facility Manager</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            Sign In to Workspace
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 shrink-0">
            or explore without account
          </span>
        </div>

        {/* Demo Button */}
        <button
          onClick={handleDemoAccess}
          className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-amber-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Continue with Demo Access
        </button>

        <p className="text-[11px] text-slate-500 text-center mt-6">
          Demo mode loads pre-configured architectural plans & calculated room data instantly.
        </p>
      </div>
    </div>
  );
};
