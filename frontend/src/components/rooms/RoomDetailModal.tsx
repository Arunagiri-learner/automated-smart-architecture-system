import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { IRoom } from '../../types';

interface RoomDetailModalProps {
  room: IRoom | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedRoom: IRoom) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  isOpen,
  onClose,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('');
  const [areaSqFt, setAreaSqFt] = useState<number>(0);
  const [heightFt, setHeightFt] = useState<number>(0);
  const [occupancy, setOccupancy] = useState<number>(0);

  useEffect(() => {
    if (room) {
      setLocation(room.location);
      setAreaSqFt(room.areaSqFt);
      setHeightFt(room.heightFt);
      setOccupancy(room.occupancy);
      setIsEditing(false);
    }
  }, [room]);

  if (!room) return null;

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...room,
        location,
        areaSqFt: Number(areaSqFt),
        heightFt: Number(heightFt),
        occupancy: Number(occupancy),
      });
    }
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={room.location}
      subtitle={`Room Serial #${room.slNo} • ${room.floor} Floor`}
    >
      <div className="space-y-6">
        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">
              Area
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {areaSqFt} <span className="text-xs text-slate-500 font-normal">sq.ft</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">
              Clear Height
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {heightFt} <span className="text-xs text-slate-500 font-normal">ft</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">
              Max Occupancy
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {occupancy} <span className="text-xs text-slate-500 font-normal">pts</span>
            </span>
          </div>
        </div>

        {/* Edit Form or View Specs */}
        {isEditing ? (
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room Name / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Area (Sq.ft)
                </label>
                <input
                  type="number"
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Height (Ft)
                </label>
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Occupancy
                </label>
                <input
                  type="number"
                  value={occupancy}
                  onChange={(e) => setOccupancy(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Analysis Status:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {room.status}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Floor Level:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {room.floor} Floor (Index {room.floorIndex})
              </span>
            </div>
            {room.features && room.features.length > 0 && (
              <div>
                <span className="text-slate-500 block mb-1">Extracted Features:</span>
                <div className="flex flex-wrap gap-1">
                  {room.features.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-sm"
              >
                Save & Recalculate Totals
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 shadow-sm"
              >
                Edit Specification
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
