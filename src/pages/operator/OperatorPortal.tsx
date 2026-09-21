import React, { useState } from 'react';
import {
  Building2,
  CalendarClock,
  Layers,
  Gauge,
  Bell,
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Info,
  Truck,
  Warehouse,
  ArrowRight,
  UserCheck,
  Pause,
  Play,
  Sparkles
} from 'lucide-react';
import { ProcurementCentre, QueueToken } from '../../types';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { OperatorQueueDashboard } from './OperatorQueueDashboard';
import { DigitalTwinView } from './DigitalTwinView';

export interface OperatorPortalProps {
  centre: ProcurementCentre;
  activeTab: string;
  onChangeTab: (tabId: string) => void;
}

export const OperatorPortal: React.FC<OperatorPortalProps> = ({
  centre,
  activeTab,
  onChangeTab
}) => {
  const {
    queueTokens,
    stations,
    completedTodayCount,
    storageUsedKg,
    storageCapacityKg,
    isProcurementPaused,
    loadingVehicles,
    simulatedTime,
    callNextFarmer,
    openAdditionalStation,
    closeStationById,
    pauseProcurement,
    resumeProcurement,
    requestTransportFleet,
    advanceTokenStage,
    getCentreQueueState
  } = useKisanSetu();

  const [calledNotice, setCalledNotice] = useState<string | null>(null);

  const centreQueueState = getCentreQueueState(centre.id);

  // Operational pipeline counts
  const arrivedCount = queueTokens.filter((t) => t.status === 'ARRIVED').length;
  const waitingCount = queueTokens.filter((t) => t.status === 'WAITING').length;
  const qualityCount = queueTokens.filter((t) => t.status === 'QUALITY_CHECK').length;
  const weighingCount = queueTokens.filter((t) => t.status === 'WEIGHING').length;
  const procurementCount = queueTokens.filter((t) => t.status === 'PROCUREMENT').length;
  const activeStationsCount = stations.filter((s) => s.status === 'active').length;
  const storagePercent = Math.min(100, Math.round((storageUsedKg / storageCapacityKg) * 100));

  const handleCallFarmerClick = () => {
    const res = callNextFarmer();
    if (res.success && res.calledToken) {
      setCalledNotice(`Token ${res.calledToken.tokenCode} (${res.calledToken.farmerName}) called to weighbridge!`);
      setTimeout(() => setCalledNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={centre.name}
        description={`Code: ${centre.code} • District: ${centre.district} • Contact: ${centre.contactNumber}`}
        badge={<StatusBadge status={centre.status} />}
        actions={<DemoBadge type="mode" />}
      />

      {/* Tab 1: Overview (Enhanced with Part 5 Operational Intelligence) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 6 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPICard
              title="Farmers Waiting"
              value={waitingCount}
              unit="farmers"
              subtitle="In holding yard"
              badgeText={waitingCount > 15 ? 'High Load' : 'Normal'}
              badgeVariant={waitingCount > 15 ? 'warning' : 'info'}
              icon={<Users className="w-4 h-4" />}
            />
            <KPICard
              title="In Processing"
              value={qualityCount + weighingCount + procurementCount}
              unit="active"
              subtitle="At inspection & scale"
              badgeText="Active Bays"
              badgeVariant="info"
              icon={<Scale className="w-4 h-4" />}
            />
            <KPICard
              title="Avg Wait Time"
              value={centreQueueState.estimatedWaitMinutes}
              unit="min"
              subtitle="Target < 25 min"
              badgeText={centreQueueState.estimatedWaitMinutes > 25 ? 'High' : 'Optimal'}
              badgeVariant={centreQueueState.estimatedWaitMinutes > 25 ? 'warning' : 'success'}
              icon={<Clock className="w-4 h-4" />}
            />
            <KPICard
              title="Completed Today"
              value={completedTodayCount}
              unit="receipts"
              subtitle="Dispatched with slip"
              badgeText="On Schedule"
              badgeVariant="success"
              icon={<CheckCircle2 className="w-4 h-4" />}
            />
            <KPICard
              title="Storage Full"
              value={storagePercent}
              unit="%"
              subtitle={`${(storageUsedKg / 1000).toFixed(1)}t / ${(storageCapacityKg / 1000).toFixed(1)}t`}
              badgeText={storagePercent > 85 ? 'Limited' : 'Normal'}
              badgeVariant={storagePercent > 85 ? 'warning' : 'info'}
              icon={<Warehouse className="w-4 h-4" />}
            />
            <KPICard
              title="Station Utilization"
              value={`${activeStationsCount} / 4`}
              unit="bays"
              subtitle="Calibrated scales"
              badgeText="Operational"
              badgeVariant="success"
              icon={<Gauge className="w-4 h-4" />}
            />
          </div>

          {/* Launch Digital Twin Highlight Card */}
          <div className="bg-linear-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-800/60 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  Interactive Digital Twin Active
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
                  DEMO SIMULATION
                </span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg">
                Full 2D Spatial Floorplan & What-If Simulation Engine
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspect 8 depot zones (Entry, Holding Yard, Quality Lab, Weighbridges 1–4, Storage Godown, and Loading Bays). Predict bottlenecks with autonomous What-If stress tests.
              </p>
            </div>

            <Button
              size="md"
              onClick={() => onChangeTab('digital-twin')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-0 shadow-md flex items-center gap-2 text-xs"
            >
              <Layers className="w-4 h-4" />
              <span>Launch Digital Twin View →</span>
            </Button>
          </div>

          {/* Operational Flow Pipeline */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Real-Time Operational Intake Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500">Live counts across physical movement zones</p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Depot Clock: <strong>{simulatedTime}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  1. Arrived
                </span>
                <strong className="text-base font-mono font-bold text-slate-900 block mt-1">
                  {arrivedCount}
                </strong>
                <span className="text-[10px] text-slate-500">At Gate Barrier</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-blue-900 block text-[10px] uppercase font-bold tracking-wider">
                  2. Holding Yard
                </span>
                <strong className="text-base font-mono font-bold text-blue-950 block mt-1">
                  {waitingCount}
                </strong>
                <span className="text-[10px] text-blue-700">Waiting for call</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-purple-900 block text-[10px] uppercase font-bold tracking-wider">
                  3. Quality Lab
                </span>
                <strong className="text-base font-mono font-bold text-purple-950 block mt-1">
                  {qualityCount}
                </strong>
                <span className="text-[10px] text-purple-700">Moisture check</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-amber-900 block text-[10px] uppercase font-bold tracking-wider">
                  4. Weighbridge
                </span>
                <strong className="text-base font-mono font-bold text-amber-950 block mt-1">
                  {weighingCount}
                </strong>
                <span className="text-[10px] text-amber-700">Scale gross weight</span>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-teal-900 block text-[10px] uppercase font-bold tracking-wider">
                  5. Procurement
                </span>
                <strong className="text-base font-mono font-bold text-teal-950 block mt-1">
                  {procurementCount}
                </strong>
                <span className="text-[10px] text-teal-700">Slip & DBT pay</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-900 block text-[10px] uppercase font-bold tracking-wider">
                  6. Completed
                </span>
                <strong className="text-base font-mono font-bold text-emerald-950 block mt-1">
                  {completedTodayCount}
                </strong>
                <span className="text-[10px] text-emerald-700">Tare & exited</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Rapid Operations Dispatch:
              </span>
              <span className="text-slate-500">Affects physical queues and digital twin</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleCallFarmerClick} className="flex items-center gap-1.5 text-xs">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Call Next Farmer</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={openAdditionalStation}
                disabled={activeStationsCount >= 4}
                className="flex items-center gap-1.5 text-xs"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Open Station ({activeStationsCount < 4 ? `Bay ${activeStationsCount + 1}` : 'Max'})</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (isProcurementPaused) {
                    resumeProcurement();
                  } else {
                    pauseProcurement();
                  }
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                {isProcurementPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isProcurementPaused ? 'Resume Intake' : 'Pause Intake'}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => requestTransportFleet(2)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>+2 Evacuation Trucks</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onChangeTab('digital-twin')}
                className="text-emerald-800 hover:text-emerald-900 font-semibold text-xs ml-auto flex items-center gap-1"
              >
                <span>View Spatial Twin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Live Gate Intake Feed (Powered by Real QueueTokens) */}
          <Card padding="md" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>Live Queue Management & Farmer Dispatch</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time tokens sequenced by arrival window and truck queue
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {queueTokens.filter((t) => t.status !== 'COMPLETED').length} Active In Yard
              </span>
            </div>

            {calledNotice && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-pulse">
                <span>{calledNotice}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-2.5">Token</th>
                    <th className="p-2.5">Farmer Name</th>
                    <th className="p-2.5">Commodity</th>
                    <th className="p-2.5">Slot Time</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Assigned Bay</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {queueTokens
                    .filter((t) => t.status !== 'COMPLETED')
                    .slice(0, 8)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 font-bold font-mono text-emerald-900">{item.tokenCode}</td>
                        <td className="p-2.5 font-medium text-slate-900">{item.farmerName}</td>
                        <td className="p-2.5">{item.produceType} ({item.quantityKg} kg)</td>
                        <td className="p-2.5">{item.slotTime}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === 'WAITING'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : item.status === 'CALLED'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">
                          {item.assignedStationNumber ? `Bay ${item.assignedStationNumber}` : '—'}
                        </td>
                        <td className="p-2.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => advanceTokenStage(item.id)}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Advance Stage →
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Queue Management */}
      {activeTab === 'queue' && (
        <OperatorQueueDashboard />
      )}

      {/* Tab 3: Interactive Digital Twin */}
      {activeTab === 'digital-twin' && (
        <DigitalTwinView />
      )}

      {/* Tab 4: Capacity & Storage */}
      {activeTab === 'capacity' && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Gauge className="w-5 h-5 text-emerald-700" />
              <span>Yard Holding & Covered Godown Capacity</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => onChangeTab('digital-twin')} className="text-xs">
              View in Digital Twin →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Grain Stacking Godown</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {(storageUsedKg / 1000).toFixed(1)}k / {(storageCapacityKg / 1000).toFixed(1)}k kg
              </p>
              <span className="text-emerald-700 font-semibold">{storagePercent}% capacity utilized</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Tractor Parking Yard</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {waitingCount} / 25 Vehicles
              </p>
              <span className="text-emerald-700 font-semibold">
                {25 - waitingCount} vehicle spaces free
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">FCI Evacuation Trucks</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {loadingVehicles.length} Allocated
              </p>
              <span className="text-emerald-700 font-semibold">Ready at loading bay</span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Alerts & Incidents */}
      {activeTab === 'alerts' && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-700" />
              <span>Centre Alerts & Broadcasts</span>
            </h3>
            <span className="text-xs text-slate-500">Operational Notices</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <span>Traffic Congestion Advisory on Trunk Road</span>
              <span className="text-[10px] text-amber-700">10:15 AM</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Inbound tractors from Poonamallee villages arriving at steady pace. Holding yard queue is currently managed under nominal thresholds.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
