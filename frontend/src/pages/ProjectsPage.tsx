import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FolderKanban, Trash2, Copy, ExternalLink, Edit } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { Modal } from '../components/common/Modal';
import { ToastContainer } from '../components/common/Toast';
import { api } from '../services/api';
import { IProject, BuildingType, IToast } from '../types';
import { INITIAL_PROJECTS } from '../../../backend/src/data/demoData';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [buildingTypeFilter, setBuildingTypeFilter] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals & Toasts
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<IToast[]>([]);

  // Create Project Form State
  const [newName, setNewName] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newBuildingType, setNewBuildingType] = useState<BuildingType>('Office');
  const [newDesc, setNewDesc] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.length ? data : INITIAL_PROJECTS);
    } catch (err) {
      setProjects(INITIAL_PROJECTS);
    }
  };

  const addToast = (type: IToast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocation) return;

    try {
      const created = await api.createProject({
        name: newName,
        location: newLocation,
        buildingType: newBuildingType,
        description: newDesc,
      });

      setProjects((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewName('');
      setNewLocation('');
      setNewDesc('');
      addToast('success', `Project '${created.name}' created successfully.`);
      navigate(`/upload?projectId=${created.id}`);
    } catch (err: any) {
      addToast('error', 'Failed to create project.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    const proj = projects.find((p) => p.id === id);
    const success = await api.deleteProject(id);
    if (success || true) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      addToast('info', `Project '${proj?.name || id}' deleted.`);
    }
  };

  const handleDuplicateProject = (project: IProject) => {
    const dup: IProject = {
      ...JSON.parse(JSON.stringify(project)),
      id: `proj-${Date.now()}`,
      name: `${project.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [dup, ...prev]);
    addToast('success', `Duplicated project '${project.name}'.`);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = buildingTypeFilter === 'all' || p.buildingType === buildingTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Project Management" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Building Projects
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage architectural workspaces, floor plan analyses, and reports.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search project name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={buildingTypeFilter}
                onChange={(e) => setBuildingTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Building Types</option>
                <option value="Office">Office</option>
                <option value="Hospital">Hospital</option>
                <option value="School">School</option>
                <option value="Hotel">Hotel</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                      {project.buildingType}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {project.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{project.location}</p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg text-center text-xs mb-4">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Floors</span>
                      <span className="font-bold text-slate-900 dark:text-white">{project.floorsCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Rooms</span>
                      <span className="font-bold text-slate-900 dark:text-white">{project.roomsCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Total Area</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {project.totalAreaSqFt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <button
                    onClick={() => navigate(`/analysis?projectId=${project.id}`)}
                    className="flex-1 py-2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Workspace
                  </button>
                  <button
                    onClick={() => handleDuplicateProject(project)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Duplicate Project"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(project.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ------------------------------------------------------------- */}
        {/* NEW PROJECT MODAL */}
        {/* ------------------------------------------------------------- */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Architectural Project"
          subtitle="Initialize building workspace for floor plan analysis"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Modern Office Building"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chennai, TN"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Building Type
              </label>
              <select
                value={newBuildingType}
                onChange={(e) => setNewBuildingType(e.target.value as BuildingType)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="Office">Office Building</option>
                <option value="Hospital">Hospital / Healthcare</option>
                <option value="School">School / Educational Campus</option>
                <option value="Hotel">Hotel / Hospitality</option>
                <option value="Other">Other Architectural Structure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Description (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Notes on building scope, levels, and structural requirements..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
              >
                Create Workspace
              </button>
            </div>
          </form>
        </Modal>

        {/* DELETE CONFIRMATION MODAL */}
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Project Confirmation"
          subtitle="Are you sure you want to delete this architectural workspace?"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This action cannot be undone. All extracted room data and generated Excel reports for this project will be permanently removed.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirmId && handleDeleteProject(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </Modal>

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </div>
  );
};
