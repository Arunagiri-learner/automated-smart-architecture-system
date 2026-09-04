import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layers, Grid3X3, FileSpreadsheet, Calculator, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { FloorPlanViewer } from '../components/floorplan/FloorPlanViewer';
import { BuildingSummaryCard } from '../components/summary/BuildingSummaryCard';
import { RoomDetailModal } from '../components/rooms/RoomDetailModal';
import { ToastContainer } from '../components/common/Toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IProject, IRoom, IToast } from '../types';

export const AnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [project, setProject] = useState<IProject | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground');
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [activeModalRoom, setActiveModalRoom] = useState<IRoom | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<IToast[]>([]);

  const navigate = useNavigate();
  const { isDemo } = useAuth();

  useEffect(() => {
    fetchProject();
  }, [projectId, isDemo]);

  const fetchProject = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (isDemo) {
      const { DEMO_PROJECT_1 } = await import('../data/demoData');
      setProject(DEMO_PROJECT_1);
      setIsLoading(false);
      return;
    }

    if (!projectId) {
      setProject(null);
      setErrorMessage('No project selected. Please choose a project from your workspace.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getProjectById(projectId);
      if (data) {
        setProject(data);
      } else {
        setProject(null);
        setErrorMessage(`Project '${projectId}' was not found or access was denied.`);
      }
    } catch (err: any) {
      setProject(null);
      setErrorMessage(err.message || 'Unable to load project from server. Please check your connection.');
    } finally {
      setIsLoading(false);
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
      const newTotalArea = newRooms.reduce((s, r) => s + r.areaSqFt, 0);
      const newTotalOccupancy = newRooms.reduce((s, r) => s + r.occupancy, 0);

      setProject({
        ...project,
        rooms: newRooms,
        totalAreaSqFt: newTotalArea,
        totalOccupancy: newTotalOccupancy,
      });

      setSelectedRoom(updatedRoom);
      addToast('success', `Room '${updatedRoom.location}' updated.`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update room.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={project?.id} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={project?.id} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Floor Plan Analysis & Viewer" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {project ? project.name : 'Floor Plan Analysis'}
                </h1>
                {isDemo && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    DEMO MODE
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {project ? `${project.location} • ${project.buildingType}` : 'Interactive 2D architectural blueprint viewer'}
              </p>
            </div>

            {project && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate(`/rooms?projectId=${project.id}`)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  Room Schedule
                </button>

                <button
                  onClick={() => navigate(`/budget?projectId=${project.id}`)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Budget Estimator
                </button>
              </div>
            )}
          </div>

          {/* Error / Empty State */}
          {errorMessage && (
            <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
              <AlertCircle className="w-12 h-12 stroke-1 text-rose-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Unable to Load Project</h3>
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

          {/* Summary & Viewer Render */}
          {!errorMessage && project && (
            <>
              <BuildingSummaryCard project={project} />
              <FloorPlanViewer
                rooms={project.rooms}
                selectedFloor={selectedFloor}
                onFloorChange={setSelectedFloor}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                onEditRoom={(room) => setActiveModalRoom(room)}
                isDemo={isDemo}
              />
            </>
          )}

          {/* Edit Room Modal */}
          {activeModalRoom && (
            <RoomDetailModal
              isOpen={!!activeModalRoom}
              onClose={() => setActiveModalRoom(null)}
              room={activeModalRoom}
              onSave={handleUpdateRoom}
            />
          )}

          <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
        </main>
      </div>
    </div>
  );
};
