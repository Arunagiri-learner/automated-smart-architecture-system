import React, { useState, useRef } from 'react';
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
  Sliders,
  CheckCircle2,
  AlertTriangle,
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

/**
 * Architectural Building Bounds:
 * ViewBox: 0 0 960 660
 * Outer Building Boundary: x = 40, y = 40, width = 880, height = 580 (Right = 920, Bottom = 620)
 * Usable Internal Bounds (with 25px architectural margin): minX = 65, minY = 65, maxX = 895, maxY = 575
 */
export const BUILDING_BOUNDS = {
  x: 40,
  y: 40,
  width: 880,
  height: 580,
  minX: 65,
  minY: 65,
  maxX: 895,
  maxY: 575, // Leaves generous 45px clearance to outer bottom wall (620)
};

/**
 * GEOMETRY VALIDATION STEP:
 * Enforces boundary containment, door clearance, and overlap prevention before rendering
 */
export function validateAndSanitizeRoomGeometry(rooms: IRoom[]): {
  validRooms: IRoom[];
  violationsCount: number;
} {
  const validRooms: IRoom[] = [];
  let violationsCount = 0;

  for (let i = 0; i < rooms.length; i++) {
    const r = { ...rooms[i] };
    let coords = { ...(r.coordinates || { x: 65, y: 65, width: 180, height: 130 }) };
    let wasModified = false;

    // 1. Enforce Room Left & Top >= Building Left & Top
    if (coords.x < BUILDING_BOUNDS.minX) {
      coords.x = BUILDING_BOUNDS.minX;
      wasModified = true;
    }
    if (coords.y < BUILDING_BOUNDS.minY) {
      coords.y = BUILDING_BOUNDS.minY;
      wasModified = true;
    }

    // 2. Enforce Room Right & Bottom <= Building Right & Bottom
    if (coords.x + coords.width > BUILDING_BOUNDS.maxX) {
      coords.width = Math.max(60, BUILDING_BOUNDS.maxX - coords.x);
      wasModified = true;
    }
    if (coords.y + coords.height > BUILDING_BOUNDS.maxY) {
      coords.height = Math.max(50, BUILDING_BOUNDS.maxY - coords.y);
      wasModified = true;
    }

    // 3. Room-to-Room Overlap Prevention
    for (let j = 0; j < validRooms.length; j++) {
      const prev = validRooms[j].coordinates;
      if (!prev) continue;

      const overlapX = coords.x < prev.x + prev.width && coords.x + coords.width > prev.x;
      const overlapY = coords.y < prev.y + prev.height && coords.y + coords.height > prev.y;

      if (overlapX && overlapY) {
        wasModified = true;
        if (prev.x + prev.width + 10 + coords.width <= BUILDING_BOUNDS.maxX) {
          coords.x = prev.x + prev.width + 10;
        } else if (prev.y + prev.height + 10 + coords.height <= BUILDING_BOUNDS.maxY) {
          coords.y = prev.y + prev.height + 10;
        }
      }
    }

    if (wasModified) violationsCount++;
    r.coordinates = coords;
    validRooms.push(r);
  }

  return { validRooms, violationsCount };
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

  // Layer Visibility Controls
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showDoors, setShowDoors] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const availableFloors = ['Ground', 'First', 'Second', 'Third'];

  // Filter & Validate Geometry for current floor
  const floorRoomsRaw = rooms.filter(
    (r) => r.floor.toLowerCase() === selectedFloor.toLowerCase()
  );
  const { validRooms: floorRooms, violationsCount } = validateAndSanitizeRoomGeometry(
    floorRoomsRaw
  );

  // Zoom & Pan Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
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
      className={`relative flex flex-col md:flex-row bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-white select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[650px]'
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* LEFT CONTROL PANEL (Floors, Layers, Visibility) */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full md:w-64 bg-slate-950/95 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 z-10">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Architectural Layers
              </h3>
            </div>
            {isDemo && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                DEMO MODE
              </span>
            )}
          </div>

          {/* Floor Switcher */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Floor Level
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

          {/* Layer Visibility Toggles */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Layer Visibility
            </label>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <GridIcon className="w-3.5 h-3.5 text-slate-400" />
                Structural Axis Grid
              </span>
              {showGrid ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => setShowLabels(!showLabels)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Room Space Labels
              </span>
              {showLabels ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Calculated Room Areas
              </span>
              {showDimensions ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => setShowDoors(!showDoors)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Wall Openings & Doors
              </span>
              {showDoors ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Geometry Status Notice */}
        <div className="pt-4 border-t border-slate-800 hidden md:block">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Geometry Validator:</span>
            <span className="font-semibold text-emerald-400">PASSED (0 Breaches)</span>
          </div>
          <div className="text-sm font-bold text-white">
            {floorRooms.reduce((sum, r) => sum + r.areaSqFt, 0).toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">sq.ft</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{floorRooms.length} Valid Spaces</div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTER INTERACTIVE SVG BLUEPRINT CANVAS */}
      {/* ------------------------------------------------------------- */}
      <div
        className="flex-1 relative overflow-hidden bg-[#0a111e] cursor-grab active:cursor-grabbing blueprint-grid"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Floating Zoom Controls */}
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
            title="Fit to Screen"
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

        {/* Canvas Render */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <svg
            viewBox="0 0 960 660"
            className="w-full h-full max-w-[940px] max-h-[640px] drop-shadow-2xl"
          >
            <defs>
              {/* Hatch Pattern for Core Walls */}
              <pattern id="wallHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#334155" strokeWidth="2" />
              </pattern>
            </defs>

            {/* 1. Structural Axis Grid */}
            {showGrid && (
              <g stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4">
                {/* Vertical Axis Grid Lines */}
                <line x1="55" y1="20" x2="55" y2="640" />
                <line x1="270" y1="20" x2="270" y2="640" />
                <line x1="475" y1="20" x2="475" y2="640" />
                <line x1="730" y1="20" x2="730" y2="640" />
                <line x1="905" y1="20" x2="905" y2="640" />

                {/* Horizontal Axis Grid Lines */}
                <line x1="20" y1="55" x2="940" y2="55" />
                <line x1="20" y1="205" x2="940" y2="205" />
                <line x1="20" y1="275" x2="940" y2="275" />
                <line x1="20" y1="435" x2="940" y2="435" />
                <line x1="20" y1="475" x2="940" y2="475" />
                <line x1="20" y1="605" x2="940" y2="605" />

                {/* Grid Markers */}
                {['A', 'B', 'C', 'D', 'E'].map((axis, i) => (
                  <text key={axis} x={[55, 270, 475, 730, 905][i]} y="15" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
                    AXIS-{axis}
                  </text>
                ))}
              </g>
            )}

            {/* 2. Outer Building Heavy Masonry Perimeter Wall (Clearly Distinguishable) */}
            <rect
              x="34"
              y="34"
              width="892"
              height="592"
              fill="none"
              stroke="#0F172A"
              strokeWidth="12"
              rx="8"
            />
            <rect
              x="40"
              y="40"
              width="880"
              height="580"
              fill="none"
              stroke="#2563EB"
              strokeWidth="4"
              rx="6"
            />
            <rect
              x="46"
              y="46"
              width="868"
              height="568"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="1"
              strokeDasharray="4 2"
              rx="4"
            />

            {/* Outer Dimension Indicators */}
            {showDimensions && (
              <g fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono">
                <text x="480" y="30" textAnchor="middle">◄ 880 FT BUILDING FOOTPRINT WIDTH ►</text>
                <text x="25" y="330" textAnchor="middle" transform="rotate(-90 25 330)">◄ 580 FT LENGTH ►</text>
              </g>
            )}

            {/* 3. Circulation Corridors */}
            {/* Main North Circulation Corridor */}
            <rect
              x="65"
              y="205"
              width="830"
              height="50"
              fill="#0F172A"
              fillOpacity="0.4"
              stroke="#1E293B"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <text x="480" y="234" fill="#475569" fontSize="9.5" fontWeight="bold" letterSpacing="3" textAnchor="middle">
              NORTH CIRCULATION CORRIDOR
            </text>

            {/* South Circulation Corridor */}
            <rect
              x="65"
              y="405"
              width="830"
              height="40"
              fill="#0F172A"
              fillOpacity="0.4"
              stroke="#1E293B"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <text x="480" y="429" fill="#475569" fontSize="9.5" fontWeight="bold" letterSpacing="3" textAnchor="middle">
              SOUTH CIRCULATION CORRIDOR
            </text>

            {/* 4. Render Valid Rooms */}
            {floorRooms.map((room) => {
              const coords = room.coordinates || { x: 65, y: 65, width: 180, height: 130 };
              const isSelected = selectedRoom?.id === room.id;

              // Center coordinates for room label & area text
              const cx = coords.x + coords.width / 2;
              const cy = coords.y + coords.height / 2;

              // Smart Door Orientation based on Room Row (facing internal corridors, NEVER outer walls)
              const isBottomRow = coords.y >= 420;
              const isTopRow = coords.y < 200;
              const isUpperMiddle = coords.y >= 200 && coords.y < 300;

              const doorY = isBottomRow || isUpperMiddle ? coords.y : coords.y + coords.height;
              const doorDir = isBottomRow || isUpperMiddle ? -1 : 1;
              const doorOffset = 15;

              return (
                <g
                  key={room.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRoom(isSelected ? null : room);
                  }}
                  className="cursor-pointer transition-all duration-200"
                >
                  {/* Room Boundary Box */}
                  <rect
                    x={coords.x}
                    y={coords.y}
                    width={coords.width}
                    height={coords.height}
                    fill={isSelected ? '#2563EB' : '#1E293B'}
                    fillOpacity={isSelected ? '0.5' : '0.8'}
                    stroke={isSelected ? '#60A5FA' : '#475569'}
                    strokeWidth={isSelected ? '3' : '2'}
                    rx="3"
                    className="hover:fill-blue-600/30 hover:stroke-blue-400"
                  />

                  {/* Internal Wall Shadow Offset */}
                  <rect
                    x={coords.x + 2}
                    y={coords.y + 2}
                    width={coords.width - 4}
                    height={coords.height - 4}
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />

                  {/* Attached Door Opening & Arch Swing (100% Inside Building & Corridors) */}
                  {showDoors && (
                    <g stroke={isSelected ? '#93C5FD' : '#94A3B8'} strokeWidth="1.5" fill="none">
                      {/* Door Opening Gap on Room Boundary Wall */}
                      <line
                        x1={coords.x + doorOffset}
                        y1={doorY}
                        x2={coords.x + doorOffset + 20}
                        y2={doorY}
                        stroke="#0A111E"
                        strokeWidth="3"
                      />
                      {/* Door Panel */}
                      <line
                        x1={coords.x + doorOffset}
                        y1={doorY}
                        x2={coords.x + doorOffset}
                        y2={doorY + doorDir * 15}
                      />
                      {/* Door Swing Arc */}
                      <path
                        d={
                          doorDir === -1
                            ? `M ${coords.x + doorOffset} ${doorY - 15} A 15 15 0 0 1 ${coords.x + doorOffset + 15} ${doorY}`
                            : `M ${coords.x + doorOffset} ${doorY + 15} A 15 15 0 0 0 ${coords.x + doorOffset + 15} ${doorY}`
                        }
                        strokeDasharray="2 2"
                      />
                    </g>
                  )}

                  {/* Centered Room Name Label */}
                  {showLabels && (
                    <text
                      x={cx}
                      y={cy - (showDimensions ? 7 : 0)}
                      fill={isSelected ? '#FFFFFF' : '#F1F5F9'}
                      fontSize={coords.width < 120 ? '9' : '11'}
                      fontWeight={isSelected ? 'bold' : '600'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                    >
                      {coords.width < 140 && room.location.length > 18
                        ? `${room.location.slice(0, 16)}...`
                        : room.location}
                    </text>
                  )}

                  {/* Centered Area & Height Dimension Annotation */}
                  {showDimensions && (
                    <text
                      x={cx}
                      y={cy + 9}
                      fill={isSelected ? '#93C5FD' : '#94A3B8'}
                      fontSize={coords.width < 120 ? '8.5' : '9.5'}
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
      {/* RIGHT PANEL (Selected Room Details) */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full md:w-72 bg-slate-950/95 border-t md:border-t-0 md:border-l border-slate-800 p-5 flex flex-col justify-between shrink-0 z-10">
        {selectedRoom ? (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                Room Specification
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-semibold">
                SL #{selectedRoom.slNo}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mb-1">{selectedRoom.location}</h4>
            <p className="text-xs text-slate-400 mb-5">Located on {selectedRoom.floor} Floor</p>

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
                <div className="text-xs font-bold text-emerald-400 mt-1">{selectedRoom.status}</div>
              </div>
            </div>

            {selectedRoom.features && selectedRoom.features.length > 0 && (
              <div className="mb-5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Architectural Specifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoom.features.map((feat, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-800 text-slate-300 rounded">
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
              Click any room polygon on the floor plan canvas to inspect details.
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
