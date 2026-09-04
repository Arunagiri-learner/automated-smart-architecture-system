import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid3X3, Download, Layers } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { RoomTable } from '../components/rooms/RoomTable';
import { RoomDetailModal } from '../components/rooms/RoomDetailModal';
import { ToastContainer } from '../components/common/Toast';
import { api } from '../services/api';
import { IProject, IRoom, IToast } from '../types';
import { DEMO_PROJECT_1 } from '../../../backend/src/data/demoData';

export const RoomsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'proj-demo-01';

  const [project, setProject] = useState<IProject>(DEMO_PROJECT_1);
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

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
      setProject({
        ...project,
        rooms: newRooms,
        totalAreaSqFt: newRooms.reduce((s, r) => s + r.areaSqFt, 0),
        totalOccupancy: newRooms.reduce((s, r) => s + r.occupancy, 0),
      });

      setSelectedRoom(null);
      addToast('success', `Updated room '${updatedRoom.location}' and recalculated totals.`);
    } catch (err) {
      addToast('error', 'Failed to update room.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={project.id} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={project.id} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Room Information & Datasets" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Extracted Room Data — {project.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {project.roomsCount} total rooms across {project.floorsCount} levels • Total Building Area: {project.totalAreaSqFt.toLocaleString()} sq.ft
              </p>
            </div>

            <button
              onClick={() => navigate(`/reports?projectId=${project.id}`)}
              className="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          {/* Desktop Table / Mobile Responsive Cards */}
          <RoomTable
            rooms={project.rooms || []}
            onSelectRoom={(r) => setSelectedRoom(r)}
            onEditRoom={(r) => setSelectedRoom(r)}
          />
        </main>

        <RoomDetailModal
          room={selectedRoom}
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSave={handleUpdateRoom}
        />

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </div>
  );
};
