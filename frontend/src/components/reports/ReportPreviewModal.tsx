import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { IProject } from '../../types';
import { formatINR, calculateLocalBudget } from '../../services/api';

interface ReportPreviewModalProps {
  project: IProject | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  project,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [activeSheet, setActiveSheet] = useState<number>(1);

  if (!project) return null;

  const budget = project.budget || calculateLocalBudget(project.totalAreaSqFt);
  const ratePerSqFt = budget.assumptions.ratePerSqFt;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Building & Budget Report Preview"
      subtitle={`Structured 5-Worksheet Excel Workbook for ${project.name}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Document Banner */}
        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
            <div>
              <h4 className="text-sm font-bold text-white">{project.name}_ASAS_Complete_Report.xlsx</h4>
              <p className="text-xs text-slate-400">ExcelJS Formatted Spreadsheet (5 Worksheets)</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
            5 Worksheets Ready
          </span>
        </div>

        {/* Sheet Tabs */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold overflow-x-auto">
          {[
            { id: 1, name: 'Sheet 1: Building Summary' },
            { id: 2, name: 'Sheet 2: Room Details' },
            { id: 3, name: 'Sheet 3: Floor Summary' },
            { id: 4, name: 'Sheet 4: Cost Breakdown' },
            { id: 5, name: 'Sheet 5: Assumptions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSheet(tab.id)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeSheet === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* SHEET 1 PREVIEW */}
        {activeSheet === 1 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-3 font-bold border-b border-slate-800 flex items-center justify-between">
              <span>BUILDING SUMMARY & ESTIMATED CONSTRUCTION BUDGET</span>
              {project.dwgFileName && <span className="font-mono text-slate-400 font-normal">{project.dwgFileName}</span>}
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 space-y-2">
              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Project Name:</span>
                <span className="text-slate-900 dark:text-white font-medium">{project.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">DWG Source File:</span>
                <span className="text-slate-900 dark:text-white font-mono">{project.dwgFileName || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Building Floors / Spaces:</span>
                <span className="text-slate-900 dark:text-white font-medium">{project.floorsCount} Levels • {project.roomsCount} Spaces</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Total Room & Space Area:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{project.totalAreaSqFt.toLocaleString()} sq.ft</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Construction Quality Tier:</span>
                <span className="text-slate-900 dark:text-white font-medium">{budget.assumptions?.quality || 'Standard'} Finish</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Base Construction Rate / Sq.ft:</span>
                <span className="font-mono text-slate-900 dark:text-white">₹ {ratePerSqFt.toLocaleString('en-IN')} / sq.ft</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900 font-bold text-sm">
                <span className="text-blue-800 dark:text-blue-200">ESTIMATED CONSTRUCTION BUDGET:</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono text-right">{formatINR(budget.breakdown?.totalEstimatedCostINR || (project.totalAreaSqFt * ratePerSqFt * 1.05))}</span>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-2">
                "Area is calculated from detected CAD room/space geometry and is an estimate. It may differ from certified built-up area, BOQ, or contractor measurements."
              </p>
            </div>
          </div>
        )}

        {/* SHEET 2 PREVIEW */}
        {activeSheet === 2 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[320px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-sans sticky top-0">
                  <tr>
                    <th className="p-2.5">SL NO</th>
                    <th className="p-2.5">FLOOR</th>
                    <th className="p-2.5 font-sans">LOCATION</th>
                    <th className="p-2.5 text-right">AREA (SQ.FT)</th>
                    <th className="p-2.5 text-right">HEIGHT (FT)</th>
                    <th className="p-2.5 text-right">OCCUPANCY</th>
                    <th className="p-2.5 text-right">RATE / SQ.FT</th>
                    <th className="p-2.5 text-right font-sans">ESTIMATED ROOM COST (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {project.rooms.map((r, idx) => {
                    const roomCost = Math.round(r.areaSqFt * ratePerSqFt * 1.05);
                    return (
                      <tr key={r.id || idx}>
                        <td className="p-2.5 text-slate-400">{r.slNo || idx + 1}</td>
                        <td className="p-2.5">{r.floor}</td>
                        <td className="p-2.5 font-sans font-semibold text-slate-900 dark:text-white">{r.location}</td>
                        <td className="p-2.5 text-right">{r.areaSqFt}</td>
                        <td className="p-2.5 text-right">{r.heightFt}</td>
                        <td className="p-2.5 text-right">{r.occupancy} (est.)</td>
                        <td className="p-2.5 text-right text-slate-500">₹ {ratePerSqFt}</td>
                        <td className="p-2.5 text-right font-bold text-blue-600 dark:text-blue-400">{formatINR(roomCost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SHEET 3 PREVIEW */}
        {activeSheet === 3 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Floor Summary & Cost Distribution</h4>
            {(() => {
              const floorMap = new Map<string, { rooms: number; area: number }>();
              project.rooms.forEach((r) => {
                const existing = floorMap.get(r.floor) || { rooms: 0, area: 0 };
                existing.rooms += 1;
                existing.area += r.areaSqFt;
                floorMap.set(r.floor, existing);
              });
              return Array.from(floorMap.entries()).map(([floorName, val]) => {
                const totalCost = Math.round(val.area * ratePerSqFt * 1.05);
                return (
                  <div key={floorName} className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg font-semibold border border-slate-200 dark:border-slate-700">
                    <span>{floorName} Floor ({val.rooms} Spaces, {val.area.toLocaleString()} sq.ft)</span>
                    <span className="text-right text-slate-500 font-mono">Rate: ₹ {ratePerSqFt}/sq.ft</span>
                    <span className="text-right font-mono text-blue-600 dark:text-blue-400 font-bold">{formatINR(totalCost)}</span>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* SHEET 4 PREVIEW */}
        {activeSheet === 4 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Category Cost Breakdown</h4>
            {(budget.breakdown?.items || [
              { category: 'Structural Materials', percentage: 50, costINR: project.totalAreaSqFt * ratePerSqFt * 0.5 },
              { category: 'Site Labour & Masonry', percentage: 20, costINR: project.totalAreaSqFt * ratePerSqFt * 0.2 },
            ]).map((item: any) => (
              <div key={item.category} className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{item.category} ({item.percentage}%):</span>
                <span className="text-right font-mono font-semibold text-slate-900 dark:text-white">{formatINR(item.costINR)}</span>
              </div>
            ))}
          </div>
        )}

        {/* SHEET 5 PREVIEW */}
        {activeSheet === 5 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Assumptions & Architectural Disclaimer</h4>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg space-y-1.5 text-slate-600 dark:text-slate-300">
              <p>• Area is calculated from detected CAD closed room/space geometry (Total Room & Space Area: {project.totalAreaSqFt.toLocaleString()} sq.ft).</p>
              <p>• Occupancy is estimated based on standard architectural space density standards.</p>
              <p>• Construction budget is an estimate based on configurable rate parameters and percentage allocations.</p>
              <p>• Construction rate per sq.ft is configurable (Current active rate: ₹ {ratePerSqFt.toLocaleString('en-IN')}/sq.ft).</p>
              <p>• This estimation is not a contractor quotation or certified BOQ.</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Close Preview
          </button>
          <button
            onClick={() => {
              onDownload();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            Download Complete 5-Sheet Excel Workbook (.xlsx)
          </button>
        </div>
      </div>
    </Modal>
  );
};
