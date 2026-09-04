import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  Info,
  Maximize,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { IRoom } from '../../types';

interface FloorPlanViewerProps {
  rooms: IRoom[];
  selectedFloor: string;
  onFloorChange: (floorName: string) => void;
  selectedRoom: IRoom | null;
  onSelectRoom: (room: IRoom | null) => void;
  onEditRoom?: (room: IRoom) => void;
  isDemo?: boolean;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  rooms,
  selectedFloor,
  onFloorChange,
  selectedRoom,
  onSelectRoom,
  onEditRoom,
  isDemo = true,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Layer visibility controls
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showDoors, setShowDoors] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const availableFloors = ['Ground', 'First', 'Second', 'Third'];

  // Filter rooms for the currently selected floor
  const floorRooms = rooms.filter((r) => r.floor.toLowerCase() === selectedFloor.toLowerCase());

  // Handle Zoom
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-white select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[650px]'
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* LEFT CONTROL PANEL (Floors, Layers, Visibility) */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full md:w-64 bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 z-10">
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Analysis Layers
              </h3>
            </div>
            {isDemo && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                DEMO MODE
              </span>
            )}
          </div>

          {/* Floor Switcher */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Floor
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {availableFloors.map((floor) => (
                <button
                  key={floor}
                  onClick={() => {
                    onFloorChange(floor);
                    onSelectRoom(null);
                  }}
                  className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-all ${
                    selectedFloor.toLowerCase() === floor.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>
          </div>

          {/* Layer Toggles */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Visibility Toggles
            </label>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <GridIcon className="w-3.5 h-3.5 text-slate-400" />
                Architectural Grid
              </span>
              {showGrid ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => setShowLabels(!showLabels)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Room Labels & Names
              </span>
              {showLabels ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Dimensions & Areas
              </span>
              {showDimensions ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => setShowDoors(!showDoors)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Doors & Core Walls
              </span>
              {showDoors ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Floor Level Quick Metric */}
        <div className="pt-4 border-t border-slate-800 hidden md:block">
          <div className="text-[11px] text-slate-400 mb-1">Floor Extracted Summary</div>
          <div className="text-sm font-bold text-white">
            {floorRooms.reduce((sum, r) => sum + r.areaSqFt, 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">sq.ft</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{floorRooms.length} Total Rooms</div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTER INTERACTIVE SVG CANVAS */}
      {/* ------------------------------------------------------------- */}
      <div
        className="flex-1 relative overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing blueprint-grid"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Top Control Bar Floating */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg backdrop-blur-md shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Fit to Screen & Reset Pan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* SVG Viewport */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <svg
            viewBox="0 0 950 680"
            className="w-full h-full max-w-[900px] max-h-[620px] drop-shadow-xl"
          >
            {/* Outer Perimeter Building Wall */}
            <rect
              x="30"
              y="30"
              width="880"
              height="600"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeDasharray="6 3"
              rx="4"
            />

            {/* Grid Overlay */}
            {showGrid && (
              <g stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={`v-${i}`} x1={(i + 1) * 95} y1="30" x2={(i + 1) * 95} y2="630" />
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`h-${i}`} x1="30" y1={(i + 1) * 95} x2="910" y2={(i + 1) * 95} />
                ))}
              </g>
            )}

            {/* Render Rooms */}
            {floorRooms.map((room) => {
              const coords = room.coordinates || { x: 50, y: 50, width: 150, height: 120 };
              const isSelected = selectedRoom?.id === room.id;

              return (
                <g
                  key={room.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRoom(isSelected ? null : room);
                  }}
                  className="cursor-pointer transition-all duration-200"
                >
                  {/* Room Boundary Shape */}
                  <rect
                    x={coords.x}
                    y={coords.y}
                    width={coords.width}
                    height={coords.height}
                    fill={isSelected ? '#2563EB' : '#1E293B'}
                    fillOpacity={isSelected ? '0.45' : '0.75'}
                    stroke={isSelected ? '#60A5FA' : '#475569'}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    rx="3"
                    className="hover:fill-blue-600/30 hover:stroke-blue-400"
                  />

                  {/* Doors indicator */}
                  {showDoors && (
                    <path
                      d={`M ${coords.x + 10} ${coords.y + coords.height} A 15 15 0 0 1 ${coords.x + 25} ${coords.y + coords.height - 15}`}
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Room Label */}
                  {showLabels && (
                    <text
                      x={coords.x + coords.width / 2}
                      y={coords.y + coords.height / 2 - (showDimensions ? 6 : 0)}
                      fill={isSelected ? '#FFFFFF' : '#E2E8F0'}
                      fontSize="11"
                      fontWeight={isSelected ? 'bold' : '600'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                    >
                      {room.location}
                    </text>
                  )}

                  {/* Dimensions & Area Text */}
                  {showDimensions && (
                    <text
                      x={coords.x + coords.width / 2}
                      y={coords.y + coords.height / 2 + 10}
                      fill={isSelected ? '#93C5FD' : '#94A3B8'}
                      fontSize="9.5"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                    >
                      {room.areaSqFt} sq.ft
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT PANEL (Selected Room Information) */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full md:w-72 bg-slate-950/95 border-t md:border-t-0 md:border-l border-slate-800 p-5 flex flex-col justify-between shrink-0 z-10">
        {selectedRoom ? (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                Selected Room Details
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-semibold">
                SL #{selectedRoom.slNo}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mb-1">
              {selectedRoom.location}
            </h4>
            <p className="text-xs text-slate-400 mb-5">
              Located on {selectedRoom.floor} Floor
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-medium text-slate-400 uppercase">Calculated Area</span>
                <div className="text-lg font-bold text-blue-400 mt-0.5">
                  {selectedRoom.areaSqFt} <span className="text-xs font-normal text-slate-400">sq.ft</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-medium text-slate-400 uppercase">Clear Height</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {selectedRoom.heightFt} <span className="text-xs font-normal text-slate-400">ft</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-medium text-slate-400 uppercase">Occupancy</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {selectedRoom.occupancy} <span className="text-xs font-normal text-slate-400">persons</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-medium text-slate-400 uppercase">Status</span>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  {selectedRoom.status}
                </div>
              </div>
            </div>

            {selectedRoom.features && selectedRoom.features.length > 0 && (
              <div className="mb-5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Architectural Specifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoom.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-800 text-slate-300 rounded"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {onEditRoom && (
              <button
                onClick={() => onEditRoom(selectedRoom)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Edit Room Specifications
              </button>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <Info className="w-8 h-8 stroke-1 text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-300">No Room Selected</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click any room boundary polygon on the floor plan canvas to inspect details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);
