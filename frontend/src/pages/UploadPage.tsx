import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { ToastContainer } from '../components/common/Toast';
import { api } from '../services/api';
import { IToast } from '../types';

type UploadState = 'EMPTY' | 'UPLOADING' | 'PROCESSING' | 'COMPLETE' | 'ERROR';

export const UploadPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'proj-demo-01';

  const [state, setState] = useState<UploadState>('EMPTY');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<IToast[]>([]);

  const navigate = useNavigate();

  const addToast = (type: IToast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const handleFileSelect = (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!['.dwg', '.dxf'].includes(ext)) {
      setErrorMessage(`Unsupported file type '${ext}'. Please upload an AutoCAD DWG or DXF floor plan.`);
      setState('ERROR');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds 50 MB limit.`);
      setState('ERROR');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setState('EMPTY');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const startAnalysisProcess = async () => {
    if (!selectedFile && state !== 'EMPTY') return;

    // Default sample DWG if none selected explicitly
    const fileToUpload = selectedFile || new File(['dwg-header-bytes-demo'], 'modern_office_level1-4_v3.dwg', { type: 'application/octet-stream' });

    setState('UPLOADING');
    setProgressStep(1);

    setTimeout(() => {
      setProgressStep(2);
      setState('PROCESSING');
    }, 600);

    setTimeout(() => {
      setProgressStep(3);
    }, 1200);

    setTimeout(() => {
      setProgressStep(4);
    }, 1800);

    try {
      await api.uploadAndAnalyze(projectId, fileToUpload);
      setTimeout(() => {
        setProgressStep(5);
        setState('COMPLETE');
        addToast('success', 'Floor plan analyzed successfully!');
      }, 2400);
    } catch (err: any) {
      setTimeout(() => {
        setState('ERROR');
        setErrorMessage(err.message || 'Analysis failed. Please ensure the DWG file contains valid vector geometry.');
        addToast('error', 'Analysis failed.');
      }, 1000);
    }
  };

  const steps = [
    { num: 1, label: 'Uploading DWG' },
    { num: 2, label: 'Reading Floor Plan' },
    { num: 3, label: 'Analyzing Rooms' },
    { num: 4, label: 'Calculating Areas' },
    { num: 5, label: 'Preparing Results' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={projectId} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={projectId} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Upload Floor Plan" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Upload Architectural Floor Plan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload AutoCAD DWG drawings for room boundary extraction and square footage calculations.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-subtle text-center">
            {state === 'EMPTY' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-8 sm:p-12 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-blue-500">
                  <Upload className="w-8 h-8 stroke-[1.5]" />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Upload your floor plan
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  Drop your DWG file here or browse from your device.
                </p>

                <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-sm mb-4">
                  Browse Device Files
                  <input
                    type="file"
                    accept=".dwg,.dxf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                </label>

                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>Supported Formats: AutoCAD DWG, DXF</p>
                  <p>Maximum File Size: 50 MB</p>
                </div>
              </div>
            )}

            {/* Selected File Details & Start Button */}
            {selectedFile && state === 'EMPTY' && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedFile.name}</h4>
                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={startAnalysisProcess}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  Analyze Floor Plan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Demo Upload Action */}
            {state === 'EMPTY' && !selectedFile && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 mb-3">Don't have a DWG file on hand?</p>
                <button
                  onClick={startAnalysisProcess}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Load Sample Modern Office DWG
                </button>
              </div>
            )}

            {/* ERROR STATE */}
            {state === 'ERROR' && (
              <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-center">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-rose-800 dark:text-rose-200 mb-1">
                  Upload Validation Error
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-300 max-w-md mx-auto mb-4">{errorMessage}</p>
                <button
                  onClick={() => {
                    setState('EMPTY');
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-500 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* PROCESSING & PROGRESS STATE */}
            {(state === 'UPLOADING' || state === 'PROCESSING') && (
              <div className="py-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Processing Architectural Drawing...
                </h3>

                {/* Step Indicators */}
                <div className="max-w-md mx-auto space-y-3 text-left">
                  {steps.map((step) => {
                    const isDone = progressStep > step.num;
                    const isCurrent = progressStep === step.num;

                    return (
                      <div
                        key={step.num}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
                            : isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-mono font-bold">STEP 0{step.num}</span>
                          <span>{step.label}</span>
                        </span>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {isCurrent && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COMPLETE STATE */}
            {state === 'COMPLETE' && (
              <div className="py-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Floor plan uploaded successfully.
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    48 rooms and 4 floor levels extracted and ready for spatial inspection.
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/analysis?projectId=${projectId}`)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mx-auto"
                >
                  Analyze Floor Plan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </div>
  );
};
