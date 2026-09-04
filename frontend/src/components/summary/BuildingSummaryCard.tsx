import React from 'react';
import { Building2, Layers, Grid3X3, Users, FileCode2, AlertCircle } from 'lucide-react';
import { IProject } from '../../types';

interface BuildingSummaryCardProps {
  project: IProject;
}

export const BuildingSummaryCard: React.FC<BuildingSummaryCardProps> = ({ project }) => {
  // Dynamically calculate floor breakdown areas from project rooms
  const floorBreakdown = (project.rooms || []).reduce((acc, room) => {
    const key = room.floor;
    acc[key] = (acc[key] || 0) + room.areaSqFt;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 relative overflow-hidden space-y-6">
      {/* Background Architectural Watermark */}
      <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-5 pointer-events-none">
        <Building2 className="w-64 h-64 text-white" />
      </div>

      {/* Header Info Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded uppercase tracking-wider">
              Building Architectural Summary
            </span>
            {project.dwgFileName && (
              <span className="px-2.5 py-1 text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
                {project.dwgFileName}
              </span>
            )}
          </div>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Room & Space Area
          </span>
          <div className="text-3xl font-extrabold text-blue-400 font-mono">
            {project.totalAreaSqFt.toLocaleString()} <span className="text-sm font-normal text-slate-400">sq.ft</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Spaces Analyzed
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

      {/* Floor Breakdown Sub-bar */}
      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs">
        <span className="text-slate-400 font-medium">Floor Area Distribution:</span>
        {Object.entries(floorBreakdown).map(([floorName, area]) => (
          <div key={floorName} className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="font-semibold text-slate-200">{floorName} Floor:</span>
            <span className="font-mono font-bold text-blue-400">{area.toLocaleString()} sq.ft</span>
          </div>
        ))}
      </div>

      {/* Disclaimer Banner */}
      <div className="pt-2 text-[11px] text-slate-400 flex items-start gap-2 italic">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Area is calculated from detected CAD room/space geometry and is an estimate. It may differ from certified built-up area, BOQ, or contractor measurements.
        </span>
      </div>
    </div>
  );
};

