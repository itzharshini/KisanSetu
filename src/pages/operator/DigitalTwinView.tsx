import React, { useState } from 'react';
import {
  Layers,
  Activity,
  Sliders,
  RotateCcw,
  Sparkles,
  Clock,
  Warehouse,
  Scale,
  Users,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Truck,
  Eye,
  Pause,
  Play,
  ArrowRight
} from 'lucide-react';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { digitalTwinService } from '../../services/digitalTwinService';
import {
  DigitalTwinZoneId,
  CentreZone,
  QueueToken,
  LoadingBayVehicle,
  OperationalAlert
} from '../../types';

import { DigitalTwinMap } from '../../components/digitaltwin/DigitalTwinMap';
import { ZoneDetailModal } from '../../components/digitaltwin/ZoneDetailModal';
import { TokenDetailModal } from '../../components/digitaltwin/TokenDetailModal';
import { VehicleDetailModal } from '../../components/digitaltwin/VehicleDetailModal';
import { CentreHealthCard } from '../../components/digitaltwin/CentreHealthCard';
import { OperationalAlertsList } from '../../components/digitaltwin/OperationalAlertsList';
import { WhatIfSimulationModal } from '../../components/digitaltwin/WhatIfSimulationModal';
import { SIHDemoWalkthrough } from '../../components/digitaltwin/SIHDemoWalkthrough';
import { OperatorActionsPanel } from '../../components/digitaltwin/OperatorActionsPanel';
import { OperationsTimeline } from '../../components/digitaltwin/OperationsTimeline';
import { OperationsCharts } from '../../components/digitaltwin/OperationsCharts';
import { Button } from '../../components/common/Button';
import { KPICard } from '../../components/common/KPICard';

export const DigitalTwinView: React.FC = () => {
  const {
    selectedCentre,
    queueTokens,
    stations,
    completedTodayCount,
    storageUsedKg,
    storageCapacityKg,
    isProcurementPaused,
    loadingVehicles,
    operationalEvents,
    simulatedTime,
    activeBooking,
    callNextFarmer,
    openAdditionalStation,
    closeStationById,
    pauseProcurement,
    resumeProcurement,
    requestTransportFleet,
    broadcastAnnouncement,
    resetDigitalTwinDemo,
    advanceTokenStage,
    markTokenNoShow,
    addOperationalEvent,
    addFiveDemoFarmers,
    applyWhatIfScenarioAction,
    getCentreQueueState
  } = useKisanSetu();

  // Modals & Selection state
  const [selectedZoneId, setSelectedZoneId] = useState<DigitalTwinZoneId | null>(null);
  const [selectedToken, setSelectedToken] = useState<QueueToken | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<LoadingBayVehicle | null>(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [showSIHWalkthrough, setShowSIHWalkthrough] = useState(false);

  // Derive digital twin dynamic data from pure shared state
  const centreQueueState = getCentreQueueState(selectedCentre.id);
  const activeStationsCount = stations.filter((s) => s.status === 'active').length;

  const zones = digitalTwinService.getZones(
    queueTokens,
    stations,
    storageUsedKg,
    storageCapacityKg,
    loadingVehicles,
    isProcurementPaused
  );

  const healthScore = digitalTwinService.calculateCentreHealth(
    centreQueueState.waitingCount,
    activeStationsCount,
    stations.length,
    storageUsedKg,
    storageCapacityKg,
    loadingVehicles.length,
    centreQueueState.estimatedWaitMinutes
  );

  const operationalAlerts = digitalTwinService.getOperationalAlerts(
    centreQueueState.waitingCount,
    storageUsedKg,
    storageCapacityKg,
    activeStationsCount,
    stations.length,
    centreQueueState.estimatedWaitMinutes,
    loadingVehicles
  );

  const selectedZoneObj: CentreZone | null = selectedZoneId ? zones[selectedZoneId] : null;

  // Handlers for 1-click recommendations from alerts
  const handleApplyAlertAction = (alert: OperationalAlert) => {
    switch (alert.actionType) {
      case 'OPEN_STATION':
        openAdditionalStation();
        break;
      case 'REQUEST_TRANSPORT':
        requestTransportFleet(2);
        break;
      case 'PAUSE_QUEUE':
        if (isProcurementPaused) {
          resumeProcurement();
        } else {
          pauseProcurement();
        }
        break;
      case 'EXTEND_HOURS':
        openAdditionalStation();
        break;
    }
  };

  // Handler for SIH walkthrough step triggers
  const handleSIHStepAction = (stepNumber: number) => {
    switch (stepNumber) {
      case 2: // Farmers arrive
        addFiveDemoFarmers();
        break;
      case 3: // Queue increases
        addFiveDemoFarmers();
        break;
      case 4: // Congestion advisory
        addOperationalEvent({
          type: 'STORAGE_UPDATED',
          title: 'Holding Yard Capacity Surge Detected',
          description: 'Arrival pacing threshold breached. High volume of tractor arrivals recorded at gate.',
          badgeVariant: 'warning'
        });
        break;
      case 5: // Recommendation
        setIsSimulationOpen(true);
        break;
      case 6: // Activate Station 4
        openAdditionalStation();
        break;
      case 7: // Queue clears
        callNextFarmer();
        break;
      case 8: // Complete procurement
        if (queueTokens.some((t) => t.status === 'PROCUREMENT' || t.status === 'WEIGHING')) {
          const tok = queueTokens.find((t) => t.status === 'PROCUREMENT' || t.status === 'WEIGHING');
          if (tok) advanceTokenStage(tok.id);
        }
        break;
      case 9: // Storage check
        addOperationalEvent({
          type: 'STORAGE_UPDATED',
          title: 'Covered Godown Level Check',
          description: 'Godown inventory reached 72% capacity. Warehouse space pacing optimal.',
          badgeVariant: 'info'
        });
        break;
      case 10: // Transport requested
        requestTransportFleet(2);
        break;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Control Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
                  Procurement Centre Digital Twin
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                  DEMO SIMULATION
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {selectedCentre.name} ({selectedCentre.code}) • District: {selectedCentre.district}
              </p>
            </div>
          </div>
        </div>

        {/* Status + Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Centre Operational Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-50 text-slate-800 border-slate-200 font-semibold">
            {isProcurementPaused ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Intake Paused</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Operational (Open)</span>
              </>
            )}
            <span className="text-slate-400">|</span>
            <span className="font-mono font-bold text-slate-900">{simulatedTime}</span>
          </div>

          {/* Toggle SIH Walkthrough */}
          <Button
            size="sm"
            variant={showSIHWalkthrough ? 'primary' : 'outline'}
            onClick={() => setShowSIHWalkthrough(!showSIHWalkthrough)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showSIHWalkthrough ? 'Close SIH Tour' : 'Run SIH Demo'}</span>
          </Button>

          {/* What-If Simulator Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSimulationOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If Simulator</span>
          </Button>

          {/* Reset Demo State */}
          <Button
            size="sm"
            variant="ghost"
            onClick={resetDigitalTwinDemo}
            className="text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1"
            title="Reset operational state to clean baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* SIH Guided Demo Walkthrough (Optional / Expandable) */}
      {showSIHWalkthrough && (
        <SIHDemoWalkthrough
          onStepAction={handleSIHStepAction}
          onResetDemo={resetDigitalTwinDemo}
        />
      )}

      {/* Top Operational Metrics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          title="Waiting Farmers"
          value={centreQueueState.waitingCount}
          unit="trolleys"
          subtitle="In holding yard"
          badgeText="Live"
          badgeVariant="info"
          icon={<Users className="w-4 h-4" />}
        />
        <KPICard
          title="Active Weighbridges"
          value={`${activeStationsCount} / 4`}
          subtitle="Electronic scales"
          badgeText="Calibrated"
          badgeVariant="success"
          icon={<Scale className="w-4 h-4" />}
        />
        <KPICard
          title="Avg Wait Time"
          value={centreQueueState.estimatedWaitMinutes}
          unit="min"
          subtitle="Target < 25 min"
          badgeText={centreQueueState.estimatedWaitMinutes > 25 ? 'Elevated' : 'Nominal'}
          badgeVariant={centreQueueState.estimatedWaitMinutes > 25 ? 'warning' : 'success'}
          icon={<Clock className="w-4 h-4" />}
        />
        <KPICard
          title="Completed Today"
          value={completedTodayCount}
          unit="farmers"
          subtitle="Dispatched with slip"
          badgeText="On Schedule"
          badgeVariant="success"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <KPICard
          title="Godown Storage"
          value={Math.round((storageUsedKg / storageCapacityKg) * 100)}
          unit="%"
          subtitle={`${(storageUsedKg / 1000).toFixed(1)}t / ${(storageCapacityKg / 1000).toFixed(1)}t`}
          badgeText={storageUsedKg / storageCapacityKg > 0.85 ? 'Limited' : 'Normal'}
          badgeVariant={storageUsedKg / storageCapacityKg > 0.85 ? 'warning' : 'info'}
          icon={<Warehouse className="w-4 h-4" />}
        />
        <KPICard
          title="Transport Fleet"
          value={loadingVehicles.length}
          unit="trucks"
          subtitle="At loading bay"
          badgeText="FCI Logistics"
          badgeVariant="info"
          icon={<Truck className="w-4 h-4" />}
        />
      </div>

      {/* Row 2: Health Card + Operational Bottleneck Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <CentreHealthCard health={healthScore} />
        </div>
        <div className="lg:col-span-2">
          <OperationalAlertsList
            alerts={operationalAlerts}
            onApplyAction={handleApplyAlertAction}
          />
        </div>
      </div>

      {/* Row 3: Operator Action Panel */}
      <OperatorActionsPanel
        stations={stations}
        isPaused={isProcurementPaused}
        onCallNext={callNextFarmer}
        onOpenStation={openAdditionalStation}
        onCloseStation={closeStationById}
        onPauseToggle={() => {
          if (isProcurementPaused) {
            resumeProcurement();
          } else {
            pauseProcurement();
          }
        }}
        onRequestTransport={() => requestTransportFleet(2)}
        onBroadcastAnnouncement={broadcastAnnouncement}
        onReportDelay={(mins, reason) => {
          addOperationalEvent({
            type: 'STORAGE_UPDATED',
            title: `Operational Delay Logged (+${mins} min)`,
            description: reason,
            badgeVariant: 'warning'
          });
        }}
      />

      {/* Row 4: Core Interactive Digital Twin Map (2D Floorplan) */}
      <DigitalTwinMap
        zones={zones}
        stations={stations}
        queueTokens={queueTokens}
        storageUsedKg={storageUsedKg}
        storageCapacityKg={storageCapacityKg}
        vehicles={loadingVehicles}
        isPaused={isProcurementPaused}
        activeBookingTokenCode={activeBooking?.tokenNumber || 'A-142'}
        onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
        onSelectToken={(token) => setSelectedToken(token)}
        onSelectVehicle={(veh) => setSelectedVehicle(veh)}
      />

      {/* Row 5: Real-time Operational Log & Analytical Charts */}
      <div className="space-y-4">
        <OperationsCharts
          stations={stations}
          storageUsedKg={storageUsedKg}
          storageCapacityKg={storageCapacityKg}
          currentQueueLength={centreQueueState.waitingCount}
        />
        <OperationsTimeline events={operationalEvents} />
      </div>

      {/* Modals */}
      {selectedZoneObj && (
        <ZoneDetailModal
          zone={selectedZoneObj}
          onClose={() => setSelectedZoneId(null)}
          onCallFarmer={callNextFarmer}
          onOpenStation={openAdditionalStation}
          onRequestTransport={() => requestTransportFleet(2)}
        />
      )}

      {selectedToken && (
        <TokenDetailModal
          token={selectedToken}
          activeBookingTokenCode={activeBooking?.tokenNumber || 'A-142'}
          onClose={() => setSelectedToken(null)}
          onAdvanceStage={advanceTokenStage}
          onCallToken={() => callNextFarmer()}
          onMarkNoShow={markTokenNoShow}
        />
      )}

      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onUpdateStatus={(vehId, st) => {
            addOperationalEvent({
              type: 'VEHICLE_ARRIVED',
              title: `Transport Fleet Updated: ${selectedVehicle.plateNumber}`,
              description: `Status changed to ${st} heading to ${selectedVehicle.destination}`,
              badgeVariant: 'success'
            });
          }}
        />
      )}

      {isSimulationOpen && (
        <WhatIfSimulationModal
          isOpen={isSimulationOpen}
          onClose={() => setIsSimulationOpen(false)}
          waitingCount={centreQueueState.waitingCount}
          avgWaitMinutes={centreQueueState.estimatedWaitMinutes}
          activeStations={activeStationsCount}
          storageCapacityKg={storageCapacityKg}
          onApplyRecommendation={(stationNum) => {
            applyWhatIfScenarioAction(stationNum);
          }}
        />
      )}
    </div>
  );
};
