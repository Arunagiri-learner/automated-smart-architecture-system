import React from 'react';
import { Layers, Users, Maximize2 } from 'lucide-react';
import { IRoom } from '../../types';

interface FloorSummaryCardsProps {
  rooms: IRoom[];
}

export const FloorSummaryCards: React.FC<FloorSummaryCardsProps> = ({ rooms }) => {
  // Aggregate data programmatically by floor
  const floorMap = new Map<
    string,
    { floorName: string; areaSqFt: number; roomCount: number; totalOccupancy: number }
  >();

  const floorOrder = ['Ground', 'First', 'Second', 'Third'];

  rooms.forEach((room) => {
    const floorKey = room.floor;
    const existing = floorMap.get(floorKey) || {
      floorName: floorKey,
      areaSqFt: 0,
      roomCount: 0,
      totalOccupancy: 0,
    };

    existing.areaSqFt += room.areaSqFt;
    existing.roomCount += 1;
    existing.totalOccupancy += room.occupancy;

    floorMap.set(floorKey, existing);
  });

  const floorSummaries = Array.from(floorMap.values()).sort(
    (a, b) => floorOrder.indexOf(a.floorName) - floorOrder.indexOf(b.floorName)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {floorSummaries.map((summary) => (
        <div
          key={summary.floorName}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {summary.floorName} FLOOR
            </span>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
              {summary.roomCount} Rooms
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                Total Floor Area
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                {summary.areaSqFt.toLocaleString()}
                <span className="text-xs font-normal text-slate-500">sq.ft</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Floor Occupancy
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {summary.totalOccupancy} Persons
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
