import React, { useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  QrCode,
  Scale,
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  Building2,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { QueueToken, TokenStatus } from '../../types';
import { StationStatusList } from '../../components/operator/StationStatusList';
import { FarmerProcessingModal } from '../../components/operator/FarmerProcessingModal';
import { ArrivalCheckInModal } from '../../components/operator/ArrivalCheckInModal';
import { OperatorSimulationBar } from '../../components/operator/OperatorSimulationBar';
import { DemoBadge } from '../../components/common/DemoBadge';
import { queueService } from '../../services/queueService';

export const OperatorQueueDashboard: React.FC = () => {
  const {
    selectedCentre,
    queueTokens,
    stations,
    queueHistory,
    completedTodayCount,
    simulatedTime,
    callNextFarmer,
    advanceTokenStage,
    completeTokenProcurement,
    checkInToken,
    markTokenNoShow,
    openAdditionalStation,
    closeStationById,
    getCentreQueueState,
    updateTokenPriorityReason
  } = useKisanSetu();

  const [activeTab, setActiveTab] = useState<
    'all' | 'waiting' | 'processing' | 'booked' | 'history'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTokenForProcessing, setSelectedTokenForProcessing] = useState<QueueToken | null>(
    null
  );
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [whyPositionModalToken, setWhyPositionModalToken] = useState<QueueToken | null>(null);

  const centreQueueState = getCentreQueueState(selectedCentre.id);

  // Filter queue tokens according to tab and search
  const filteredTokens = queueTokens.filter((t) => {
    // Tab filter
    if (activeTab === 'waiting') {
      if (t.status !== 'WAITING') return false;
    } else if (activeTab === 'processing') {
      if (!['CALLED', 'IN_PROCESS', 'QUALITY_CHECK', 'WEIGHING', 'PROCUREMENT'].includes(t.status))
        return false;
    } else if (activeTab === 'booked') {
      if (t.arrivalStatus === 'arrived' || t.status === 'COMPLETED') return false;
    } else if (activeTab === 'all') {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.tokenCode.toLowerCase().includes(q) ||
        t.farmerName.toLowerCase().includes(q) ||
        t.produceType.toLowerCase().includes(q) ||
        (t.farmerVillage && t.farmerVillage.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const getStatusBadge = (status: TokenStatus) => {
    switch (status) {
      case 'WAITING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>In Queue</span>
          </span>
        );
      case 'CALLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Called to Station</span>
          </span>
        );
      case 'IN_PROCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Processing</span>
          </span>
        );
      case 'QUALITY_CHECK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span>Quality Grading</span>
          </span>
        );
      case 'WEIGHING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>Gross/Tare Weighing</span>
          </span>
        );
      case 'PROCUREMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Warehouse Intake</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'MISSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>No-Show / Missed</span>
          </span>
        );
      case 'BOOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Booked (Pending Arrival)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleCallNext = () => {
    const res = callNextFarmer();
    if (res.calledToken) {
      setSelectedTokenForProcessing(res.calledToken);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              {selectedCentre.name}
            </span>
            <DemoBadge type="mode" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
            Live Queue & Station Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time procurement gate control, weighbridge allocation, and farmer calling system
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCheckInModal(true)}
            className="py-3 px-4 rounded-2xl bg-white border-2 border-emerald-600 hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-2xs"
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            <span>Farmer Check-In</span>
          </button>

          <button
            type="button"
            onClick={handleCallNext}
            className="py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <Megaphone className="w-4 h-4" />
            <span>Call Next Farmer</span>
          </button>
        </div>
      </div>

      {/* Demo Simulation Controls Toolbar */}
      <OperatorSimulationBar />

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Waiting */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Waiting in Queue
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {centreQueueState.waitingTokens}
            </span>
            <span className="text-xs text-slate-400 font-medium">farmers</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold block">In holding yard</span>
        </div>

        {/* Currently Processing */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            At Processing Bays
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-blue-900 font-mono">
              {centreQueueState.processingTokens}
            </span>
            <span className="text-xs text-slate-400 font-medium">active</span>
          </div>
          <span className="text-[10px] text-blue-700 font-bold block">Weighbridge & intake</span>
        </div>

        {/* Active Stations */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Active Stations
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono">
              {centreQueueState.activeStationsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">of {centreQueueState.totalStationsCount}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">Operational bays</span>
        </div>

        {/* Estimated Wait */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Average Wait Time
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              ~{centreQueueState.estimatedWaitMinutes}
            </span>
            <span className="text-xs text-slate-400 font-medium">mins</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">Intake rate: ~11m</span>
        </div>

        {/* Completed Today */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Processed Today
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono">
              {completedTodayCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">farmers</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            {((completedTodayCount * 45) / 10).toFixed(0)} Tonnes intake
          </span>
        </div>

        {/* Clearance Time */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Queue Clearance
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono truncate">
              {centreQueueState.estimatedQueueClearanceTime}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">All arrivals cleared</span>
        </div>
      </div>

      {/* Station Status & Controls Component */}
      <StationStatusList
        stations={stations}
        onOpenStation={openAdditionalStation}
        onCloseStation={closeStationById}
        onSelectStationToken={(tokenId) => {
          const matched = queueTokens.find((t) => t.id === tokenId);
          if (matched) setSelectedTokenForProcessing(matched);
        }}
      />

      {/* Operational Queue Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Table Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Active Queue ({queueTokens.filter((t) => t.status !== 'COMPLETED').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('waiting')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'waiting'
                  ? 'bg-amber-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Waiting Yard ({queueTokens.filter((t) => t.status === 'WAITING').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('processing')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'processing'
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Processing ({centreQueueState.processingTokens})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('booked')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'booked'
                  ? 'bg-purple-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending Arrival (
              {queueTokens.filter((t) => t.arrivalStatus !== 'arrived' && t.status !== 'COMPLETED').length}
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'history'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Completed ({queueHistory.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token or farmer..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* SECTION 41: OPERATIONAL QUEUE LIST / CARDS */}
        {activeTab === 'history' ? (
          /* COMPLETED INTAKE LOG */
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block pb-1">
              Procurement Receipts Generated Today ({queueHistory.length})
            </span>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {queueHistory.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                      {item.tokenCode}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{item.farmerName}</span>
                      <span className="text-slate-400 block text-[11px]">
                        {item.produceType} • {item.quantityKg.toLocaleString('en-IN')} kg • {item.stationName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="font-mono font-bold text-slate-700">{item.completedTime}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">✓ Weighment Slip Issued</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Weighment Slip #KS-${item.tokenCode}\nFarmer: ${item.farmerName}\nNet: ${item.quantityKg} kg\nTime: ${item.completedTime}`)}
                      className="py-1 px-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span>Slip</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* LIVE ACTIVE QUEUE TABLE & MOBILE CARDS */
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Token</th>
                    <th className="py-2.5 px-3">Farmer & Location</th>
                    <th className="py-2.5 px-3">Produce Declared</th>
                    <th className="py-2.5 px-3">Slot / Arrival</th>
                    <th className="py-2.5 px-3">Live Status</th>
                    <th className="py-2.5 px-3">Station / Bay</th>
                    <th className="py-2.5 px-3 text-center">Priority Rule</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTokens.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No tokens match the active filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTokens.map((t, index) => {
                      const isArun = t.tokenCode === 'A-142';
                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isArun ? 'bg-emerald-50/50 font-medium' : ''
                          }`}
                        >
                          {/* Token */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                {t.tokenCode}
                              </span>
                              {isArun && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Farmer & Location */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{t.farmerName}</span>
                            <span className="text-[11px] text-slate-400 block">
                              {t.farmerVillage || 'Thiruvallur'} • {t.farmerPhone || '+91 98400 00000'}
                            </span>
                          </td>

                          {/* Produce */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 block">{t.produceType}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {t.quantityKg.toLocaleString('en-IN')} kg
                            </span>
                          </td>

                          {/* Slot & Arrival */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-700 block">{t.slotTime}</span>
                            <span
                              className={`text-[10px] font-bold block ${
                                t.arrivalStatus === 'arrived'
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {t.arrivalStatus === 'arrived' ? '✓ Arrived at Gate' : 'Awaiting Arrival'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">{getStatusBadge(t.status)}</td>

                          {/* Station */}
                          <td className="py-3 px-3">
                            <span className="font-mono text-slate-700 font-semibold">
                              {t.assignedStation || 'Holding Yard'}
                            </span>
                          </td>

                          {/* Priority Rule info */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setWhyPositionModalToken(t)}
                              className="p-1 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                              title="View transparent fair queue ordering rule"
                            >
                              <Info className="w-4 h-4 mx-auto" />
                            </button>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 text-right">
                            {['CALLED', 'IN_PROCESS', 'QUALITY_CHECK', 'WEIGHING', 'PROCUREMENT'].includes(
                              t.status
                            ) ? (
                              <button
                                type="button"
                                onClick={() => setSelectedTokenForProcessing(t)}
                                className="py-1.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors"
                              >
                                Manage Intake
                              </button>
                            ) : t.status === 'WAITING' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTokenForProcessing(t);
                                }}
                                className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
                              >
                                Call Station
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => checkInToken(t.tokenCode)}
                                className="py-1.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                              >
                                Admit Gate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-2.5">
              {filteredTokens.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No tokens match the active filter.
                </div>
              ) : (
                filteredTokens.map((t) => {
                  const isArun = t.tokenCode === 'A-142';
                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                        isArun
                          ? 'border-emerald-400 bg-emerald-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                            {t.tokenCode}
                          </span>
                          {isArun && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                              YOU
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-800">{t.farmerName}</span>
                        </div>
                        {getStatusBadge(t.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Produce:</span>
                          <span className="font-bold text-slate-800">
                            {t.produceType} ({t.quantityKg} kg)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Slot & Arrival:</span>
                          <span className="font-medium text-slate-800">
                            {t.slotTime} • {t.arrivalStatus === 'arrived' ? '✓ Arrived' : 'Not at gate'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setWhyPositionModalToken(t)}
                          className="text-[11px] text-slate-500 hover:text-emerald-800 font-semibold flex items-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          <span>Why this position?</span>
                        </button>

                        {['CALLED', 'IN_PROCESS', 'QUALITY_CHECK', 'WEIGHING', 'PROCUREMENT'].includes(
                          t.status
                        ) ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTokenForProcessing(t)}
                            className="py-1.5 px-3 rounded-xl bg-blue-700 text-white font-bold text-xs"
                          >
                            Manage Intake
                          </button>
                        ) : t.status === 'WAITING' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTokenForProcessing(t)}
                            className="py-1.5 px-3 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                          >
                            Call Station
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => checkInToken(t.tokenCode)}
                            className="py-1.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                          >
                            Admit Gate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* SECTION 45: TRANSPARENT QUEUE RULES EXPLAINER */}
      <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Transparent Agricultural Procurement Fairness Rules
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          KisanSetu enforces an audit-logged, deterministic queue algorithm. Token sequencing respects:
          (1) Arrived farmers at gate before non-arrived, (2) Confirmed booking slot window,
          (3) Holding yard check-in timestamp, and (4) Station capacity balance.
        </p>
      </div>

      {/* Modals */}
      {selectedTokenForProcessing && (
        <FarmerProcessingModal
          token={selectedTokenForProcessing}
          onClose={() => setSelectedTokenForProcessing(null)}
          onAdvanceStage={(tokenId) => {
            advanceTokenStage(tokenId);
            const updated = queueTokens.find((t) => t.id === tokenId);
            if (updated) setSelectedTokenForProcessing(updated);
          }}
          onCompleteProcurement={(tokenId) => {
            completeTokenProcurement(tokenId);
            setSelectedTokenForProcessing(null);
          }}
          onMarkNoShow={(tokenId) => {
            markTokenNoShow(tokenId);
            setSelectedTokenForProcessing(null);
          }}
        />
      )}

      {showCheckInModal && (
        <ArrivalCheckInModal
          tokens={queueTokens}
          onClose={() => setShowCheckInModal(false)}
          onCheckIn={checkInToken}
        />
      )}

      {/* Why This Position Modal */}
      {whyPositionModalToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="font-mono font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                  Token {whyPositionModalToken.tokenCode}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display mt-1">
                  Queue Position Justification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWhyPositionModalToken(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium">
                {whyPositionModalToken.priorityReason ||
                  `Farmer checked in on-time for the ${whyPositionModalToken.slotTime} scheduled window. Arrived at gate with active token.`}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Scheduled Slot:</span>
                  <span className="font-bold text-slate-800">{whyPositionModalToken.slotTime}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gate Arrival:</span>
                  <span className="font-bold text-slate-800">
                    {whyPositionModalToken.arrivalTime || whyPositionModalToken.recommendedGateArrival}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Intake Scale Assignment:</span>
                  <span className="font-bold text-slate-800">
                    {whyPositionModalToken.assignedStation || 'Next Available Bay'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWhyPositionModalToken(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
