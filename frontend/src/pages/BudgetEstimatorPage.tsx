import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calculator,
  Building2,
  DollarSign,
  TrendingUp,
  Sliders,
  FileSpreadsheet,
  AlertCircle,
  Info,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  Edit2,
  Save,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { ToastContainer } from '../components/common/Toast';
import { api, formatINR, calculateLocalBudget, DEFAULT_QUALITY_RATES } from '../services/api';
import {
  IProject,
  IBudgetAssumptions,
  IBudgetBreakdown,
  ConstructionQuality,
  IToast,
} from '../types';
import { DEMO_PROJECT_1 } from '../../../backend/src/data/demoData';

export const BudgetEstimatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'proj-demo-01';

  const [project, setProject] = useState<IProject>(DEMO_PROJECT_1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<IToast[]>([]);

  // Budget State
  const [quality, setQuality] = useState<ConstructionQuality>('Standard');
  const [ratePerSqFt, setRatePerSqFt] = useState<number>(2200);
  const [isEditingRate, setIsEditingRate] = useState<boolean>(false);
  const [customRateInput, setCustomRateInput] = useState<string>('2200');

  // Assumptions Percentages State
  const [materialPct, setMaterialPct] = useState<number>(50);
  const [labourPct, setLabourPct] = useState<number>(20);
  const [electricalPct, setElectricalPct] = useState<number>(5);
  const [plumbingPct, setPlumbingPct] = useState<number>(4);
  const [finishingPct, setFinishingPct] = useState<number>(6);
  const [doorsWindowsPct, setDoorsWindowsPct] = useState<number>(4);
  const [paintingPct, setPaintingPct] = useState<number>(3);
  const [roofingPct, setRoofingPct] = useState<number>(3);
  const [otherPct, setOtherPct] = useState<number>(5);
  const [contingencyPct, setContingencyPct] = useState<number>(5);

  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'floors' | 'rooms' | 'scenarios' | 'assumptions'>('overview');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getProjectById(projectId);
        if (data) {
          setProject(data);
          if (data.budget?.assumptions) {
            setQuality(data.budget.assumptions.quality);
            setRatePerSqFt(data.budget.assumptions.ratePerSqFt);
            setCustomRateInput(data.budget.assumptions.ratePerSqFt.toString());
            setMaterialPct(data.budget.assumptions.materialPercentage);
            setLabourPct(data.budget.assumptions.labourPercentage);
            setElectricalPct(data.budget.assumptions.electricalPercentage);
            setPlumbingPct(data.budget.assumptions.plumbingPercentage);
            setFinishingPct(data.budget.assumptions.finishingPercentage);
            setDoorsWindowsPct(data.budget.assumptions.doorsWindowsPercentage);
            setPaintingPct(data.budget.assumptions.paintingPercentage);
            setRoofingPct(data.budget.assumptions.roofingPercentage);
            setOtherPct(data.budget.assumptions.otherPercentage);
            setContingencyPct(data.budget.assumptions.contingencyPercentage);
          }
        }
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

  // Dynamic Live Calculation Engine
  const budgetResult = useMemo(() => {
    const assumptions: Partial<IBudgetAssumptions> = {
      quality,
      ratePerSqFt,
      materialPercentage: materialPct,
      labourPercentage: labourPct,
      electricalPercentage: electricalPct,
      plumbingPercentage: plumbingPct,
      finishingPercentage: finishingPct,
      doorsWindowsPercentage: doorsWindowsPct,
      paintingPercentage: paintingPct,
      roofingPercentage: roofingPct,
      otherPercentage: otherPct,
      contingencyPercentage: contingencyPct,
    };

    return calculateLocalBudget(project.totalAreaSqFt || 24850, assumptions);
  }, [
    project.totalAreaSqFt,
    quality,
    ratePerSqFt,
    materialPct,
    labourPct,
    electricalPct,
    plumbingPct,
    finishingPct,
    doorsWindowsPct,
    paintingPct,
    roofingPct,
    otherPct,
    contingencyPct,
  ]);

  const handleQualityChange = (q: ConstructionQuality) => {
    setQuality(q);
    if (q !== 'Custom') {
      const defaultRate = DEFAULT_QUALITY_RATES[q];
      setRatePerSqFt(defaultRate);
      setCustomRateInput(defaultRate.toString());
    }
  };

  const handleApplyCustomRate = () => {
    const val = parseFloat(customRateInput);
    if (!isNaN(val) && val > 0) {
      setRatePerSqFt(val);
      setIsEditingRate(false);
      addToast('success', `Applied custom construction rate: ₹ ${val.toLocaleString('en-IN')}/sq.ft`);
    }
  };

  const handleSaveBudget = async () => {
    try {
      await api.updateProjectBudget(project.id, budgetResult.assumptions);
      addToast('success', 'Construction budget assumptions saved to workspace.');
    } catch (err) {
      addToast('info', 'Budget updated locally.');
    }
  };

  // Floor-wise calculated cost distribution
  const floorSummaries = useMemo(() => {
    const floorMap = new Map<string, { rooms: number; area: number }>();
    (project.rooms || []).forEach((r) => {
      const existing = floorMap.get(r.floor) || { rooms: 0, area: 0 };
      existing.rooms += 1;
      existing.area += r.areaSqFt;
      floorMap.set(r.floor, existing);
    });

    const floorOrder = ['Ground', 'First', 'Second', 'Third'];
    return Array.from(floorMap.entries())
      .map(([floorName, val]) => {
        const baseCost = Math.round(val.area * ratePerSqFt);
        const totalCost = Math.round(baseCost * (1 + contingencyPct / 100));
        return {
          floorName: `${floorName} Floor`,
          roomsCount: val.rooms,
          areaSqFt: val.area,
          baseCostINR: baseCost,
          totalCostINR: totalCost,
        };
      })
      .sort((a, b) => floorOrder.indexOf(a.floorName.split(' ')[0]) - floorOrder.indexOf(b.floorName.split(' ')[0]));
  }, [project.rooms, ratePerSqFt, contingencyPct]);

  // Scenario Comparison Matrix
  const scenarios = useMemo(() => {
    const qualities: ConstructionQuality[] = ['Basic', 'Standard', 'Premium', 'Luxury'];
    return qualities.map((q) => {
      const rate = DEFAULT_QUALITY_RATES[q];
      const res = calculateLocalBudget(project.totalAreaSqFt || 24850, {
        quality: q,
        ratePerSqFt: rate,
        materialPercentage: materialPct,
        labourPercentage: labourPct,
        contingencyPercentage: contingencyPct,
      });
      return {
        quality: q,
        ratePerSqFt: rate,
        totalCostINR: res.breakdown.totalEstimatedCostINR,
        isSelected: quality === q && ratePerSqFt === rate,
      };
    });
  }, [project.totalAreaSqFt, quality, ratePerSqFt, materialPct, labourPct, contingencyPct]);

  const COLORS = ['#2563EB', '#38BDF8', '#818CF8', '#A7F3D0', '#FBBF24', '#F472B6', '#C084FC', '#34D399', '#64748B', '#F87171'];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <Sidebar currentProjectId={project.id} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentProjectId={project.id} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} title="Construction Budget Estimator" />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded uppercase">
                  Spatial Financial Intelligence
                </span>
                <span className="text-xs text-slate-400">• {project.location}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Construction Budget Estimator
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Estimate the approximate construction cost of your building using analyzed floor area and configurable cost parameters.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveBudget}
                className="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Estimate
              </button>
              <button
                onClick={() => navigate(`/reports?projectId=${project.id}`)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Complete Excel Report
              </button>
            </div>
          </div>

          {/* Top Building Metrics Summary Header Card */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded uppercase tracking-wider">
                  Target Building
                </span>
                <h3 className="text-2xl font-bold text-white mt-1.5">{project.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{project.buildingType} Architecture • {project.location}</p>

                <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">TOTAL AREA</span>
                    <span className="text-lg font-bold text-blue-400 font-mono">
                      {project.totalAreaSqFt.toLocaleString()} <span className="text-xs text-slate-400 font-normal">sq.ft</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">FLOORS</span>
                    <span className="text-lg font-bold text-white">{project.floorsCount} Levels</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">ROOMS</span>
                    <span className="text-lg font-bold text-white">{project.roomsCount} Spaces</span>
                  </div>
                </div>
              </div>

              {/* PROMINENT TOTAL ESTIMATED BUDGET BOX */}
              <div className="p-5 bg-gradient-to-br from-slate-950 to-blue-950/80 rounded-xl border border-blue-500/40 text-right min-w-[280px]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-1">
                  TOTAL ESTIMATED CONSTRUCTION BUDGET
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                  {formatINR(budgetResult.breakdown.totalEstimatedCostINR)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                  <span>Based on ₹ {ratePerSqFt.toLocaleString('en-IN')}/sq.ft</span>
                  <span>• {quality} Finish</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Disclaimer Alert */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Estimated Construction Cost Notice:</span> Actual cost may vary based on location, materials, labour rates, design specifications, site conditions and market prices. This is an analytical estimation tool, not an official contractor quotation.
            </div>
          </div>

          {/* QUALITY SELECTOR & RATE EDITOR */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Construction Quality & Rate / Sq.ft
                </h3>
                <p className="text-xs text-slate-500">Select a finish quality tier or enter your own custom construction rate.</p>
              </div>

              {/* Rate Editor */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Active Rate:</span>
                {isEditingRate ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold">₹</span>
                    <input
                      type="number"
                      value={customRateInput}
                      onChange={(e) => setCustomRateInput(e.target.value)}
                      className="w-28 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-blue-500 rounded text-sm font-bold font-mono text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={handleApplyCustomRate}
                      className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-500"
                      title="Apply Rate"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
                      ₹ {ratePerSqFt.toLocaleString('en-IN')} / sq.ft
                    </span>
                    <button
                      onClick={() => {
                        setQuality('Custom');
                        setIsEditingRate(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Edit Custom Rate"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Tier Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Basic', rate: 1800, desc: 'Standard cement, basic tiles, standard fixtures' },
                { id: 'Standard', rate: 2200, desc: 'Vitrified tiles, branded plumbing & electrical' },
                { id: 'Premium', rate: 2800, desc: 'Granite/hardwood, concealed AC, smart lighting' },
                { id: 'Luxury', rate: 3500, desc: 'Italian marble, high-end HVAC, acoustic glass' },
              ].map((tier) => {
                const isSelected = quality === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => {
                      handleQualityChange(tier.id as ConstructionQuality);
                      setIsEditingRate(false);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{tier.id}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono mb-1">
                      ₹ {tier.rate.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400">/sq.ft</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">{tier.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN BREAKDOWN CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { title: 'MATERIALS', cost: budgetResult.breakdown.materialsCostINR, pct: materialPct, color: 'text-blue-600 dark:text-blue-400' },
              { title: 'LABOUR', cost: budgetResult.breakdown.labourCostINR, pct: labourPct, color: 'text-sky-500' },
              { title: 'ELECTRICAL', cost: budgetResult.breakdown.electricalCostINR, pct: electricalPct, color: 'text-indigo-500' },
              { title: 'PLUMBING', cost: budgetResult.breakdown.plumbingCostINR, pct: plumbingPct, color: 'text-emerald-500' },
              { title: 'FINISHING', cost: budgetResult.breakdown.finishingCostINR, pct: finishingPct, color: 'text-amber-500' },
              { title: 'OTHER WORKS', cost: budgetResult.breakdown.otherCostINR, pct: otherPct, color: 'text-purple-500' },
              { title: 'CONTINGENCY', cost: budgetResult.breakdown.contingencyCostINR, pct: contingencyPct, color: 'text-rose-500' },
            ].map((card) => (
              <div key={card.title} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-subtle">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                  <span>{card.title}</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{card.pct}%</span>
                </div>
                <div className={`text-sm sm:text-base font-extrabold font-mono ${card.color}`}>
                  {formatINR(card.cost)}
                </div>
              </div>
            ))}
          </div>

          {/* TABBED INTERFACE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-subtle overflow-hidden">
            <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Cost Breakdown Charts' },
                { id: 'floors', label: 'Floor-Wise Budget' },
                { id: 'rooms', label: 'Room-Wise Costs' },
                { id: 'scenarios', label: 'Scenario Comparison' },
                { id: 'assumptions', label: 'Cost Assumptions Config' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* TAB 1: VISUAL CHARTS */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      Cost Share Distribution by Category (%)
                    </h4>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={budgetResult.breakdown.items}
                            dataKey="costINR"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={(entry: any) => `${entry.category.split(' ')[0]} (${entry.percentage}%)`}
                          >
                            {budgetResult.breakdown.items.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [formatINR(value), 'Cost']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      Floor-Wise Estimated Construction Budget (₹)
                    </h4>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={floorSummaries}>
                          <XAxis dataKey="floorName" stroke="#94A3B8" fontSize={11} />
                          <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                          <Tooltip formatter={(value: number) => [formatINR(value), 'Estimated Cost']} />
                          <Bar dataKey="totalCostINR" fill="#2563EB" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FLOOR-WISE BUDGET */}
              {activeTab === 'floors' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-3 px-4">FLOOR NAME</th>
                          <th className="py-3 px-4 text-right">TOTAL ROOMS</th>
                          <th className="py-3 px-4 text-right">TOTAL AREA (SQ.FT)</th>
                          <th className="py-3 px-4 text-right">RATE / SQ.FT</th>
                          <th className="py-3 px-4 text-right">ESTIMATED BASE COST (₹)</th>
                          <th className="py-3 px-4 text-right">ESTIMATED TOTAL COST (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {floorSummaries.map((f) => (
                          <tr key={f.floorName} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">{f.floorName}</td>
                            <td className="py-3 px-4 text-right font-sans">{f.roomsCount}</td>
                            <td className="py-3 px-4 text-right">{f.areaSqFt.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">₹ {ratePerSqFt.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{formatINR(f.baseCostINR)}</td>
                            <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">{formatINR(f.totalCostINR)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-900 text-white font-bold font-mono">
                        <tr>
                          <td className="py-3 px-4 font-sans">TOTAL BUILDING</td>
                          <td className="py-3 px-4 text-right font-sans">{project.roomsCount}</td>
                          <td className="py-3 px-4 text-right">{project.totalAreaSqFt.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">₹ {ratePerSqFt.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right">{formatINR(Math.round(project.totalAreaSqFt * ratePerSqFt))}</td>
                          <td className="py-3 px-4 text-right text-blue-400">{formatINR(budgetResult.breakdown.totalEstimatedCostINR)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ROOM-WISE COSTS */}
              {activeTab === 'rooms' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
                        <tr>
                          <th className="py-3 px-4">SL NO</th>
                          <th className="py-3 px-4">FLOOR</th>
                          <th className="py-3 px-4">LOCATION / ROOM NAME</th>
                          <th className="py-3 px-4 text-right">AREA (SQ.FT)</th>
                          <th className="py-3 px-4 text-right">RATE / SQ.FT</th>
                          <th className="py-3 px-4 text-right">ESTIMATED ROOM COST (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {(project.rooms || []).map((room, idx) => {
                          const roomCost = Math.round(room.areaSqFt * ratePerSqFt * (1 + contingencyPct / 100));
                          return (
                            <tr key={room.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-4 font-sans text-slate-400">{room.slNo || idx + 1}</td>
                              <td className="py-2.5 px-4 font-sans">{room.floor}</td>
                              <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 dark:text-white">{room.location}</td>
                              <td className="py-2.5 px-4 text-right">{room.areaSqFt}</td>
                              <td className="py-2.5 px-4 text-right text-slate-500">₹ {ratePerSqFt.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-4 text-right font-bold text-blue-600 dark:text-blue-400">{formatINR(roomCost)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SCENARIO COMPARISON */}
              {activeTab === 'scenarios' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-3 px-4">CONSTRUCTION QUALITY TIER</th>
                          <th className="py-3 px-4 text-right">RATE / SQ.FT</th>
                          <th className="py-3 px-4 text-right">TOTAL BUILT-UP AREA</th>
                          <th className="py-3 px-4 text-right">ESTIMATED CONSTRUCTION COST</th>
                          <th className="py-3 px-4 text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {scenarios.map((sc) => (
                          <tr
                            key={sc.quality}
                            className={`transition-colors ${
                              sc.isSelected ? 'bg-blue-50/60 dark:bg-blue-950/40 font-bold' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                              {sc.quality} {sc.isSelected && <span className="text-[10px] text-blue-600 dark:text-blue-400 ml-1.5">(Selected)</span>}
                            </td>
                            <td className="py-3.5 px-4 text-right">₹ {sc.ratePerSqFt.toLocaleString('en-IN')}</td>
                            <td className="py-3.5 px-4 text-right font-sans">{project.totalAreaSqFt.toLocaleString()} sq.ft</td>
                            <td className="py-3.5 px-4 text-right text-base font-extrabold text-blue-600 dark:text-blue-400">{formatINR(sc.totalCostINR)}</td>
                            <td className="py-3.5 px-4 text-center font-sans">
                              <button
                                onClick={() => handleQualityChange(sc.quality)}
                                className={`px-3 py-1 text-xs font-semibold rounded ${
                                  sc.isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {sc.isSelected ? 'Active' : 'Apply Tier'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: COST ASSUMPTIONS CONFIG */}
              {activeTab === 'assumptions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Configure Component Percentage Shares (%)
                      </h4>
                      <p className="text-xs text-slate-500">Adjust individual cost shares to fit specific project requirements.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {[
                      { label: 'Structural Materials %', val: materialPct, set: setMaterialPct },
                      { label: 'Site Labour & Masonry %', val: labourPct, set: setLabourPct },
                      { label: 'Electrical Works %', val: electricalPct, set: setElectricalPct },
                      { label: 'Plumbing & Sanitation %', val: plumbingPct, set: setPlumbingPct },
                      { label: 'Flooring & Tile Finishing %', val: finishingPct, set: setFinishingPct },
                      { label: 'Doors & Windows %', val: doorsWindowsPct, set: setDoorsWindowsPct },
                      { label: 'Painting %', val: paintingPct, set: setPaintingPct },
                      { label: 'Roofing & Waterproofing %', val: roofingPct, set: setRoofingPct },
                      { label: 'Other Costs %', val: otherPct, set: setOtherPct },
                      { label: 'Contingency Buffer %', val: contingencyPct, set: setContingencyPct },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between gap-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                        <input
                          type="number"
                          value={item.val}
                          onChange={(e) => item.set(Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-right font-mono font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </div>
  );
};
