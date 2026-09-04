import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Download, Eye, Calculator, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { BuildingSummaryCard } from '../components/summary/BuildingSummaryCard';
import { FloorSummaryCards } from '../components/summary/FloorSummaryCards';
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal';
import { ToastContainer } from '../components/common/Toast';
import { api, formatINR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IProject, IToast } from '../types';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [project, setProject] = useState<IProject | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
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
      const { DEMO_PROJECT_1 } = await import('../data/demoData');
      setProject(DEMO_PROJECT_1);
      return;
    }

    if (!projectId) {
      setProject(null);
      setErrorMessage('No project selected. Please select a project workspace.');
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
      setErrorMessage(err.message || 'Unable to load report data from server.');
    }
  };

  const addToast = (type: IToast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const handleDownloadExcel = async () => {
    if (!project) return;
    setIsDownloading(true);
    try {
      await api.downloadExcelReport(project.id, project.name);
      addToast('success', '5-Worksheet Excel report downloaded successfully!');
    } catch (err: any) {
      addToast('error', err.message || 'Report download failed.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={project?.id} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={project?.id} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Structured Report Generation" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Architectural & Budget Reports
                </h1>
                {isDemo && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    DEMO MODE
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {project ? `Building summary for ${project.name}` : 'Generate structured Excel report workbooks'}
              </p>
            </div>

            {project && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview 5-Sheet Excel Report
                </button>

                <button
                  onClick={handleDownloadExcel}
                  disabled={isDownloading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'Generating Excel...' : 'Download Excel (.xlsx)'}
                </button>
              </div>
            )}
          </div>

          {/* Error / Empty State */}
          {errorMessage && (
            <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
              <AlertCircle className="w-12 h-12 stroke-1 text-rose-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Unable to Load Project Report</h3>
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

          {/* Report Summaries */}
          {!errorMessage && project && (
            <>
              <BuildingSummaryCard project={project} />
              <FloorSummaryCards rooms={project.rooms} />

              <ReportPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                project={project}
                onDownload={handleDownloadExcel}
              />
            </>
          )}

          <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
        </main>
      </div>
    </div>
  );
};
