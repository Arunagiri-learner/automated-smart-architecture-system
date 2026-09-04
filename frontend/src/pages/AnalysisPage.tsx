import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layers, Grid3X3, FileSpreadsheet, Calculator } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { FloorPlanViewer } from '../components/floorplan/FloorPlanViewer';
import { RoomDetailModal } from '../components/rooms/RoomDetailModal';
import { ToastContainer } from '../components/common/Toast';
import { api } from '../services/api';
import { IProject, IRoom, IToast } from '../types';
import { DEMO_PROJECT_1 } from '../../../backend/src/data/demoData';

export const AnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'proj-demo-01';

  const [project, setProject] = useState<IProject>(DEMO_PROJECT_1);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground');
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [activeModalRoom, setActiveModalRoom] = useState<IRoom | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<IToast[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getProjectById(projectId);
        if (data) setProject(data);
      } catch (err) {
        setProject(DEMO_PROJECT_1);
      }
    };
    fetchProject();
  }, [projectId]);

  const addToast = (type: IToast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const handleUpdateRoom = async (updatedRoom: IRoom) => {
    try {
      await api.updateRoom(project.id, updatedRoom.id, updatedRoom);

      const newRooms = project.rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r));
      const newTotalArea = newRooms.reduce((s, r) => s + r.areaSqFt, 0);
      const newTotalOccupancy = newRooms.reduce((s, r) => s + r.occupancy, 0);

      setProject({
        ...project,
        rooms: newRooms,
        totalAreaSqFt: newTotalArea,
        totalOccupancy: newTotalOccupancy,
      });

      setSelectedRoom(updatedRoom);
      setActiveModalRoom(null);
      addToast('success', `Updated '${updatedRoom.location}' and recalculated building totals.`);
    } catch (err) {
      addToast('error', 'Failed to update room data.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={project.id} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={project.id} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Floor Plan Analysis Workspace" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded uppercase">
                  {project.buildingType} Architecture
                </span>
                <span className="text-xs text-slate-400">• {project.location}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {project.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/budget?projectId=${project.id}`)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                Estimate Construction Cost
              </button>
              <button
                onClick={() => navigate(`/rooms?projectId=${project.id}`)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Grid3X3 className="w-4 h-4" />
                View Room Table
              </button>
            </div>
          </div>

          {/* Interactive Floor Plan Viewer Container */}
          <FloorPlanViewer
            rooms={project.rooms || []}
            selectedFloor={selectedFloor}
            onFloorChange={(f) => setSelectedFloor(f)}
            selectedRoom={selectedRoom}
            onSelectRoom={(r) => setSelectedRoom(r)}
            onEditRoom={(r) => setActiveModalRoom(r)}
            isDemo={project.isDemo}
          />
        </main>

        <RoomDetailModal
          room={activeModalRoom}
          isOpen={!!activeModalRoom}
          onClose={() => setActiveModalRoom(null)}
          onSave={handleUpdateRoom}
        />

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </div>
  );
};
