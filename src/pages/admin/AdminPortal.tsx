import React from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  Truck,
  BarChart3,
  BrainCircuit,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';
import { EcosystemStats, ProcurementCentre } from '../../types';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';

export interface AdminPortalProps {
  stats: EcosystemStats;
  centres: ProcurementCentre[];
  activeTab: string;
  onChangeTab: (tabId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  stats,
  centres,
  activeTab,
  onChangeTab
}) => {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Ecosystem Administration Console"
        description="Macro coordination, district mandi capacities, and AI congestion balancing across state agricultural hubs"
        badge={<DemoBadge type="mode" />}
      />

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Ecosystem KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Registered Farmers"
              value={stats.farmersRegistered.toLocaleString()}
              subtitle={`${stats.operationalDistricts} Active Districts`}
              badgeText="+1,420 this week"
              badgeVariant="success"
              icon={<Users className="w-5 h-5" />}
            />
            <KPICard
              title="Procured Today"
              value={stats.metricTonnesToday.toLocaleString()}
              unit="Tonnes"
              subtitle="Paddy, Maize & Pulses"
              badgeText="Surge Day"
              badgeVariant="info"
              icon={<Activity className="w-5 h-5" />}
            />
            <KPICard
              title="Active Centres"
              value={`${stats.procurementCentresActive}`}
              subtitle="118 Optimal, 6 Congested"
              badgeText="95% Normal"
              badgeVariant="success"
              icon={<Building2 className="w-5 h-5" />}
            />
            <KPICard
              title="DBT Disbursed"
              value={`₹${stats.paymentsDisbursedCrores}`}
              unit="Cr"
              subtitle="Direct to farmer bank accounts"
              badgeText="Zero Backlog"
              badgeVariant="success"
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>

          {/* District Centres Status Table */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>District Procurement Centres Overview</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Thiruvallur District Cluster
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-2.5">Centre Name</th>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Wait Time</th>
                    <th className="p-2.5">Capacity Load</th>
                    <th className="p-2.5">Slots Booked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {centres.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900">{c.name}</td>
                      <td className="p-2.5 font-mono text-slate-500">{c.code}</td>
                      <td className="p-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="p-2.5 font-medium">{c.currentWaitMinutes} mins</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                c.capacityUtilizationPercent > 85
                                  ? 'bg-rose-500'
                                  : c.capacityUtilizationPercent > 65
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${c.capacityUtilizationPercent}%` }}
                            />
                          </div>
                          <span>{c.capacityUtilizationPercent}%</span>
                        </div>
                      </td>
                      <td className="p-2.5">
                        {c.dailySlotsBooked} / {c.dailySlotsTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Centres */}
      {activeTab === 'centres' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">Centre Administration & Provisioning</h3>
          <p className="text-xs text-slate-500">
            Coming in the next KisanSetu module: Provision new government mandi depots, manage weighing scale hardware telemetry, and calibrate moisture meters.
          </p>
        </Card>
      )}

      {/* Tab: Farmers */}
      {activeTab === 'farmers' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">State Farmer Registry & DBT Audit</h3>
          <p className="text-xs text-slate-500">
            Coming in the next KisanSetu module: Revenue record verification, biometric authentication logs, and PM-KISAN database synchronization.
          </p>
        </Card>
      )}

      {/* Tab: Transport */}
      {activeTab === 'transport' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">State Logistics Fleet Orchestration</h3>
          <p className="text-xs text-slate-500">
            Coming in the next KisanSetu module: Contractor rate cards, freight allocation, and railhead transshipment hub tracking.
          </p>
        </Card>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">Macro Procurement Analytics & Forecasting</h3>
          <p className="text-xs text-slate-500">
            Coming in the next KisanSetu module: Historical year-on-year MSP uptake, district yield disparity analysis, and storage fill-rate curves.
          </p>
        </Card>
      )}

      {/* Tab: AI Insights */}
      {activeTab === 'ai-insights' && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <BrainCircuit className="w-5 h-5 text-emerald-700" />
            <span>AI Congestion Prediction & Load Balancing</span>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-bold">
              Surge Alert Predicted for Thiruvallur Central Mandi (+40% harvest arrivals tomorrow)
            </p>
            <p className="text-amber-800 leading-relaxed">
              Recommendation Engine has auto-suggested diverting 35 tractor slots to Poonamallee DPC and Tiruttani Grain Depot to maintain average wait under 20 minutes.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Coming in the next KisanSetu module: Automated slot throttling models and weather-linked harvest surge forecasting.
          </p>
        </Card>
      )}
    </div>
  );
};
