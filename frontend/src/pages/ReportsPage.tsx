import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileSpreadsheet, Download, Eye, Calculator } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { BuildingSummaryCard } from '../components/summary/BuildingSummaryCard';
import { FloorSummaryCards } from '../components/summary/FloorSummaryCards';
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal';
import { ToastContainer } from '../components/common/Toast';
import { api, formatINR } from '../services/api';
import { IProject, IToast } from '../types';
import { DEMO_PROJECT_1 } from '../../../backend/src/data/demoData';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'proj-demo-01';

  const [project, setProject] = useState<IProject>(DEMO_PROJECT_1);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<IToast[]>([]);

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

  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      await api.downloadExcelReport(project.id, project.name);
      addToast('success', '5-Worksheet Excel report downloaded successfully!');
    } catch (err: any) {
      addToast('error', 'Report download failed.');
    } finally {
      setIsDownloading(false);
    }
  };

  const estimatedTotalBudget = project.budget?.breakdown?.totalEstimatedCostINR || (project.totalAreaSqFt * 2200 * 1.05);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={project.id} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={project.id} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Complete Building & Budget Reports" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Complete Building & Budget Excel Report
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Programmatically calculated room metrics and 5-sheet Excel workbook for {project.name}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview 5-Sheet Report
              </button>
              <button
                onClick={handleDownloadExcel}
                disabled={isDownloading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Generating Workbook...' : 'Download Excel (.xlsx)'}
              </button>
            </div>
          </div>

          {/* Budget Summary Banner */}
          <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                Calculated Budget Summary
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Estimated Total Construction Cost</h3>
              <p className="text-xs text-slate-400 mt-0.5">Includes base construction, material/labour breakdown, and 5% contingency.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-blue-400 font-mono">
                {formatINR(estimatedTotalBudget)}
              </div>
              <span className="text-[11px] text-slate-400">Total Built-up Area: {project.totalAreaSqFt.toLocaleString()} sq.ft</span>
            </div>
          </div>

          {/* Building Summary Card */}
          <BuildingSummaryCard project={project} />

          {/* Floor Summary Cards */}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Floor-Wise Area Breakdown
            </h2>
            <FloorSummaryCards rooms={project.rooms || []} />
          </div>
        </main>

        <ReportPreviewModal
          project={project}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={handleDownloadExcel}
        />

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </div>
  );
};
