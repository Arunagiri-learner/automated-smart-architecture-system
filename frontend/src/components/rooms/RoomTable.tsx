import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { IRoom } from '../../types';

interface RoomTableProps {
  rooms: IRoom[];
  onSelectRoom: (room: IRoom) => void;
  onEditRoom?: (room: IRoom) => void;
}

export const RoomTable: React.FC<RoomTableProps> = ({ rooms, onSelectRoom, onEditRoom }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'slNo' | 'areaSqFt' | 'occupancy' | 'location'>('slNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const floors = ['all', 'Ground', 'First', 'Second', 'Third'];

  // Filter & Search & Sort logic
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        const matchesSearch =
          room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.floor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.slNo.toString().includes(searchTerm);

        const matchesFloor = floorFilter === 'all' || room.floor.toLowerCase() === floorFilter.toLowerCase();

        return matchesSearch && matchesFloor;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [rooms, searchTerm, floorFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage) || 1;
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(start, start + itemsPerPage);
  }, [filteredRooms, currentPage]);

  const handleSort = (field: 'slNo' | 'areaSqFt' | 'occupancy' | 'location') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search room name, location, or serial..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={floorFilter}
            onChange={(e) => {
              setFloorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {floors.map((f) => (
              <option key={f} value={f}>
                {f === 'all' ? 'All Floors' : `${f} Floor`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP TABLE VIEW (Visible md and above) */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('slNo')}
                >
                  <div className="flex items-center gap-1">
                    SL NO
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">FLOOR</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center gap-1">
                    LOCATION / ROOM NAME
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('areaSqFt')}
                >
                  <div className="flex items-center justify-end gap-1">
                    AREA (SQ.FT)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">HEIGHT (FT)</th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('occupancy')}
                >
                  <div className="flex items-center justify-end gap-1">
                    OCCUPANCY
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedRooms.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-slate-500">
                    {String(room.slNo).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                      {room.floor}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {room.location}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {room.areaSqFt.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{room.heightFt} ft</td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    {room.occupancy}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded">
                      {room.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => onSelectRoom(room)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onEditRoom && (
                      <button
                        onClick={() => onEditRoom(room)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Edit Room"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE CARD VIEW (Transforms records into responsive cards) */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {paginatedRooms.map((room) => (
          <div
            key={room.id}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400">SL #{room.slNo}</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                  {room.floor} Floor
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                {room.location}
              </h4>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg text-center mb-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Area</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {room.areaSqFt} <span className="text-[10px] font-normal text-slate-500">sq.ft</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Height</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {room.heightFt} ft
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Occupancy</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {room.occupancy}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectRoom(room)}
              className="w-full py-2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-sm"
            >
              View Room Details
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing {paginatedRooms.length} of {filteredRooms.length} rooms
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
