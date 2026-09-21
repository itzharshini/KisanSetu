import React, { useState } from 'react';
import {
  Megaphone,
  Pause,
  Play,
  Scale,
  Truck,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  X,
  Radio,
  Clock,
  Send
} from 'lucide-react';
import { ProcessingStation, QueueToken } from '../../types';
import { Button } from '../common/Button';

export interface OperatorActionsPanelProps {
  stations: ProcessingStation[];
  isPaused: boolean;
  onCallNext: () => void;
  onOpenStation: () => void;
  onCloseStation: (stationId: string) => void;
  onPauseToggle: () => void;
  onRequestTransport: () => void;
  onBroadcastAnnouncement: (title: string, message: string) => void;
  onReportDelay: (minutes: number, reason: string) => void;
}

export const OperatorActionsPanel: React.FC<OperatorActionsPanelProps> = ({
  stations,
  isPaused,
  onCallNext,
  onOpenStation,
  onCloseStation,
  onPauseToggle,
  onRequestTransport,
  onBroadcastAnnouncement,
  onReportDelay
}) => {
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('Inbound Traffic Pacing Advisory');
  const [broadcastMessage, setBroadcastMessage] = useState('Please keep vehicles in designated shaded bays. Weighbridge intake running on schedule.');

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [delayReason, setDelayReason] = useState('Electronic tare scale recalibration & moisture meter test');

  const [closeTargetStation, setCloseTargetStation] = useState<ProcessingStation | null>(null);

  const activeStations = stations.filter((s) => s.status === 'active');
  const closedStations = stations.filter((s) => s.status !== 'active');

  const handleCloseStationClick = (st: ProcessingStation) => {
    setCloseTargetStation(st);
  };

  const confirmCloseStation = () => {
    if (closeTargetStation) {
      onCloseStation(closeTargetStation.id);
      setCloseTargetStation(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
            <span>Operational Command & Action Controls</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Real-time mutations update both physical queues and digital twin telemetry
          </p>
        </div>

        <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
          {activeStations.length} Active Weighbridges
        </span>
      </div>

      {/* Main Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. Call Next Farmer */}
        <button
          type="button"
          onClick={onCallNext}
          className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs group"
        >
          <UserCheck className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
          <span className="text-xs">Call Next Farmer</span>
          <span className="text-[9px] text-emerald-800 font-normal">Next in queue to bay</span>
        </button>

        {/* 2. Open Station */}
        <button
          type="button"
          onClick={onOpenStation}
          disabled={closedStations.length === 0}
          className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs group ${
            closedStations.length === 0
              ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              : 'border-blue-300 bg-blue-50 hover:bg-blue-100/80 text-blue-950'
          }`}
        >
          <Scale className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform" />
          <span className="text-xs">Open Station</span>
          <span className="text-[9px] text-blue-800 font-normal">
            {closedStations.length > 0 ? `Activate Station ${closedStations[0].number}` : 'All 4 bays active'}
          </span>
        </button>

        {/* 3. Close Station (with guard) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (activeStations.length > 0) {
                handleCloseStationClick(activeStations[activeStations.length - 1]);
              }
            }}
            disabled={activeStations.length <= 1}
            className={`w-full h-full p-3 rounded-xl border font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs group ${
              activeStations.length <= 1
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <Scale className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs">Close Station</span>
            <span className="text-[9px] text-slate-500 font-normal">Safe shutdown bay</span>
          </button>
        </div>

        {/* 4. Pause / Resume */}
        <button
          type="button"
          onClick={onPauseToggle}
          className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs group ${
            isPaused
              ? 'border-emerald-400 bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
              : 'border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="text-xs">Resume Intake</span>
              <span className="text-[9px] text-emerald-800 font-normal">Restore admissions</span>
            </>
          ) : (
            <>
              <Pause className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform" />
              <span className="text-xs">Pause Intake</span>
              <span className="text-[9px] text-amber-800 font-normal">Hold gate entries</span>
            </>
          )}
        </button>

        {/* 5. Request Transport */}
        <button
          type="button"
          onClick={onRequestTransport}
          className="p-3 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-950 font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs group"
        >
          <Truck className="w-5 h-5 text-indigo-700 group-hover:scale-110 transition-transform" />
          <span className="text-xs">Request Fleet</span>
          <span className="text-[9px] text-indigo-800 font-normal">+2 evacuation trucks</span>
        </button>

        {/* 6. Broadcast Announcement */}
        <button
          type="button"
          onClick={() => setIsBroadcastModalOpen(true)}
          className="p-3 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100/80 text-purple-950 font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs group"
        >
          <Megaphone className="w-5 h-5 text-purple-700 group-hover:scale-110 transition-transform" />
          <span className="text-xs">Broadcast SMS</span>
          <span className="text-[9px] text-purple-800 font-normal">Loudspeaker & alert</span>
        </button>
      </div>

      {/* Secondary Action Link */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Need to log an unanticipated yard or weather delay?</span>
        <button
          type="button"
          onClick={() => setIsDelayModalOpen(true)}
          className="text-amber-800 font-semibold hover:underline flex items-center gap-1"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Report Operating Delay →</span>
        </button>
      </div>

      {/* Broadcast Announcement Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-700" />
                <span>Broadcast Depot Announcement</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Preset Templates:</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTitle('Weighbridge Calibration Brief Pause');
                      setBroadcastMessage('Electronic scale 2 undergoing 10-minute recalibration. Remaining bays are operating normally.');
                    }}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-medium"
                  >
                    Scale Calibration
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTitle('Rain Protection Advisory');
                      setBroadcastMessage('Incoming drizzle reported. Please ensure tarpaulin covers on all grain trolleys in holding yard.');
                    }}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-medium"
                  >
                    Weather Advisory
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTitle('Lunch Hour Pacing Schedule');
                      setBroadcastMessage('Staff rotation active between 1:00 PM and 2:00 PM. Station 1 & 2 remain active.');
                    }}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-medium"
                  >
                    Shift Rotation
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Announcement Headline:</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-purple-400 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Message Content:</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-purple-400 outline-hidden"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-[11px]">
                Broadcast sends instant in-app alerts to all farmers currently in holding yard + queues.
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setIsBroadcastModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => {
                  onBroadcastAnnouncement(broadcastTitle, broadcastMessage);
                  setIsBroadcastModalOpen(false);
                }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Operating Delay Modal */}
      {isDelayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Log Operating Delay</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDelayModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Expected Delay Duration:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDelayMinutes(mins)}
                      className={`py-1.5 rounded-lg border font-bold text-center transition-all ${
                        delayMinutes === mins
                          ? 'bg-amber-100 text-amber-950 border-amber-400'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      +{mins} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Operational Reason:</label>
                <input
                  type="text"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-amber-400 outline-hidden"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
                Logs an operational event and auto-adjusts ETA display for downstream farmers.
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setIsDelayModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onReportDelay(delayMinutes, delayReason);
                  setIsDelayModalOpen(false);
                }}
              >
                Apply Delay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Station Close Confirmation Modal */}
      {closeTargetStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <h3 className="font-display font-bold text-amber-950 text-sm">
                  Confirm Close Station {closeTargetStation.number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCloseTargetStation(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {closeTargetStation.currentTokenId ? (
                <div className="space-y-2">
                  <p className="text-slate-700 leading-relaxed">
                    Station {closeTargetStation.number} is currently processing{' '}
                    <strong className="text-slate-950 font-bold">
                      Token {closeTargetStation.currentTokenCode} ({closeTargetStation.currentFarmerName})
                    </strong>
                    .
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-100/70 border border-amber-300 text-amber-950 font-medium text-[11px]">
                    Closing immediately will suspend this weighment. Please finish the current farmer or route them to another bay.
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  Station {closeTargetStation.number} is currently idle. It can be safely shut down to conserve operational power.
                </p>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setCloseTargetStation(null)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-700 border-rose-200 hover:bg-rose-50"
                onClick={confirmCloseStation}
              >
                Confirm Station Shutdown
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
