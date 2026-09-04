import React from 'react';
import { Building2, Layers, Grid3X3, Users, ArrowUpRight } from 'lucide-react';
import { IProject } from '../../types';

interface BuildingSummaryCardProps {
  project: IProject;
}

export const BuildingSummaryCard: React.FC<BuildingSummaryCardProps> = ({ project }) => {
  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Background Architectural Watermark */}
      <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-5 pointer-events-none">
        <Building2 className="w-64 h-64 text-white" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded uppercase tracking-wider">
            Building Summary Report
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">{project.name}</h2>
          <p className="text-xs text-slate-400 mt-1">{project.location} • {project.buildingType} Architecture</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold">
            Status: {project.status}
          </span>
        </div>
      </div>

      {/* Grid of Key Aggregation Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Building Area
          </span>
          <div className="text-3xl font-extrabold text-blue-400">
            {project.totalAreaSqFt.toLocaleString()} <span className="text-sm font-normal text-slate-400">sq.ft</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Rooms
          </span>
          <div className="text-3xl font-extrabold text-white">
            {project.roomsCount} <span className="text-sm font-normal text-slate-400">spaces</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Building Floors
          </span>
          <div className="text-3xl font-extrabold text-white">
            {project.floorsCount} <span className="text-sm font-normal text-slate-400">levels</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Occupancy
          </span>
          <div className="text-3xl font-extrabold text-white">
            {project.totalOccupancy} <span className="text-sm font-normal text-slate-400">capacity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
