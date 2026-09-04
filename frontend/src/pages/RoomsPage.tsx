import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid3X3, Download, Layers, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { RoomTable } from '../components/rooms/RoomTable';
import { RoomDetailModal } from '../components/rooms/RoomDetailModal';
import { ToastContainer } from '../components/common/Toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IProject, IRoom, IToast } from '../types';
import { DEMO_PROJECT_1 } from '../data/demoData';

export const RoomsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [project, setProject] = useState<IProject | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<IToast[]>([]);

  const navigate = useNavigate();
  const { isDemo } = useAuth();

  useEffect(() => {
    fetchProject();
  }, [projectId, isDemo]);

  const fetchProject = async () => {
    setErrorMessage(null);
    if (isDemo) {
      setProject(DEMO_PROJECT_1);
      return;
    }

    if (!projectId) {
      setProject(null);
      setErrorMessage('No project selected. Please choose a project from your workspace.');
      return;
    }

    try {
      const data = await api.getProjectById(projectId);
      if (data) {
        setProject(data);
      } else {
        setProject(null);
        setErrorMessage(`Project '${projectId}' was not found.`);
      }
    } catch (err: any) {
      setProject(null);
      setErrorMessage(err.message || 'Unable to load room schedule from server.');
    }
  };

  const addToast = (type: IToast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const handleUpdateRoom = async (updatedRoom: IRoom) => {
    if (!project) return;
    try {
      if (!isDemo) {
        await api.updateRoom(project.id, updatedRoom.id, updatedRoom);
      }

      const newRooms = project.rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r));
      setProject({
        ...project,
        rooms: newRooms,
        totalAreaSqFt: newRooms.reduce((s, r) => s + r.areaSqFt, 0),
        totalOccupancy: newRooms.reduce((s, r) => s + r.occupancy, 0),
      });

      setSelectedRoom(null);
      addToast('success', `Room '${updatedRoom.location}' details updated.`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update room.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={project?.id} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={project?.id} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Room Data Management" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Room Data Schedule
                </h1>
                {isDemo && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    DEMO MODE
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {project ? `Extracted space inventory for ${project.name}` : 'Manage room locations, dimensions, and occupancy'}
              </p>
            </div>
          </div>

          {/* Error / Empty State */}
          {errorMessage && (
            <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
              <AlertCircle className="w-12 h-12 stroke-1 text-rose-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Unable to Load Room Data</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{errorMessage}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/projects')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Projects
                </button>
                <button
                  onClick={fetchProject}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Table Render */}
          {!errorMessage && project && (
            <RoomTable
              rooms={project.rooms}
              onSelectRoom={(room) => setSelectedRoom(room)}
              onEditRoom={(room) => setSelectedRoom(room)}
            />
          )}

          {/* Edit Modal */}
          {selectedRoom && (
            <RoomDetailModal
              isOpen={!!selectedRoom}
              onClose={() => setSelectedRoom(null)}
              room={selectedRoom}
              onSave={handleUpdateRoom}
            />
          )}

          <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
        </main>
      </div>
    </div>
  );
};
