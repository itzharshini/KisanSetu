import React from 'react';
import {
  Truck,
  MapPin,
  PackageCheck,
  Clock,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Vehicle } from '../../types';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';

export interface TransporterPortalProps {
  vehicles: Vehicle[];
  activeTab: string;
  onChangeTab: (tabId: string) => void;
}

export const TransporterPortal: React.FC<TransporterPortalProps> = ({
  vehicles,
  activeTab,
  onChangeTab
}) => {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Logistics & Transporter Hub"
        description="Coordinated transport fleet syncing procurement centre clearance with state grain silos"
        badge={<DemoBadge type="mode" />}
      />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard
              title="Active Fleet"
              value="3 Vehicles"
              subtitle="2 On Route, 1 Standby"
              badgeText="Operational"
              badgeVariant="success"
              icon={<Truck className="w-5 h-5" />}
            />
            <KPICard
              title="Today's Grain Moved"
              value="42.5"
              unit="Tonnes"
              subtitle="Target: 60 Tonnes"
              badgeText="71% of target"
              badgeVariant="info"
              icon={<PackageCheck className="w-5 h-5" />}
            />
            <KPICard
              title="Avg Gate Turnaround"
              value="34"
              unit="min"
              subtitle="Weigh-in to weigh-out"
              badgeText="Optimal"
              badgeVariant="success"
              icon={<Clock className="w-5 h-5" />}
            />
          </div>

          {/* Fleet Status List */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-700" />
                <span>Assigned Fleet Movements</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">GPS Telematics Active</span>
            </div>

            <div className="space-y-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        {v.vehicleNumber}
                      </span>
                      <StatusBadge status={v.currentStatus} />
                      <span className="text-slate-500">• {v.vehicleType}</span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      Route: {v.assignedRoute}
                    </p>
                    <p className="text-slate-500">
                      Driver: {v.driverName} ({v.driverPhone})
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1 shrink-0">
                    <span className="text-emerald-800 font-bold block">
                      {v.eta}
                    </span>
                    <span className="text-slate-500 block">
                      Load: {v.loadType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">Active & Dispatched Trips</h3>
          <p className="text-xs text-slate-500">
            Coming in the next KisanSetu module: Live waypoint route tracing and digital gate pass QR generation for toll plazas and depot security.
          </p>
        </Card>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">Logistics Corridor Routes</h3>
          <p className="text-xs text-slate-500">
            Coming in the next KisanSetu module: Dynamic multi-centre routing algorithm preventing dead-heading of empty trucks after silo delivery.
          </p>
        </Card>
      )}

      {/* Deliveries Tab */}
      {activeTab === 'deliveries' && (
        <Card padding="lg" className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">Delivery Acknowledgements (POD)</h3>
          <p className="text-xs text-slate-500">
            Coming in the next KisanSetu module: Automated electronic Proof of Delivery (e-POD) signed via warehouse biometric scanner.
          </p>
        </Card>
      )}
    </div>
  );
};
