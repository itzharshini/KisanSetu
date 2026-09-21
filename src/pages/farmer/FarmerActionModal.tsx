import React from 'react';
import {
  Wheat,
  Calendar,
  MapPin,
  Truck,
  Package,
  CreditCard,
  Bot,
  ExternalLink,
  Info,
  Clock,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { DemoBadge } from '../../components/common/DemoBadge';
import { Farmer } from '../../types';

export type FarmerActionType =
  | 'sell'
  | 'book'
  | 'token'
  | 'centre'
  | 'track'
  | 'produce'
  | 'payments'
  | 'ask'
  | null;

export interface FarmerActionModalProps {
  actionType: FarmerActionType;
  onClose: () => void;
  farmer: Farmer;
  onNavigateToTab?: (tab: 'home' | 'bookings' | 'token' | 'assistant' | 'profile') => void;
}

export const FarmerActionModal: React.FC<FarmerActionModalProps> = ({
  actionType,
  onClose,
  farmer,
  onNavigateToTab
}) => {
  if (!actionType) return null;

  const contentMap: Record<
    Exclude<FarmerActionType, null>,
    {
      title: string;
      icon: React.ComponentType<{ className?: string }>;
      subtitle: string;
      comingModule: string;
      renderContent: () => React.ReactNode;
    }
  > = {
    sell: {
      title: 'Sell Produce',
      icon: Wheat,
      subtitle: 'Instant direct procurement booking at government MSP',
      comingModule: 'Stage 2: Direct E-Procurement & Digital Weighbridge Handshake',
      renderContent: () => (
        <div className="space-y-3">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 uppercase">Registered Harvest for Sale</h4>
            <div className="mt-2 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-emerald-200/60">
                <span className="font-semibold">Paddy (CR 1009 / Ponni Deluxe)</span>
                <span className="font-bold text-emerald-800">45 Quintals ready</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Government MSP: <strong>₹2,320 / quintal</strong></span>
                <span className="text-emerald-700 font-semibold">Est. Value: ₹1,04,400</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            In the upcoming module, farmers can initiate immediate slot locking, sample test pre-verification, and doorstep vehicle assignment.
          </p>
        </div>
      )
    },
    book: {
      title: 'Book Procurement Slot',
      icon: Calendar,
      subtitle: 'Schedule your arrival window at nearest mandi',
      comingModule: 'Stage 2: Dynamic Capacity-Aware Slot Engine',
      renderContent: () => (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Next Available Slots at Poonamallee DPC</span>
              <span className="text-emerald-700">Today</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-center font-bold">
                10:30 AM (Booked #TN-204)
              </div>
              <div className="p-2 rounded-lg bg-white text-slate-700 border border-slate-200 text-center">
                02:15 PM (12 slots left)
              </div>
              <div className="p-2 rounded-lg bg-white text-slate-700 border border-slate-200 text-center">
                03:45 PM (18 slots left)
              </div>
              <div className="p-2 rounded-lg bg-white text-slate-700 border border-slate-200 text-center">
                Tomorrow 09:00 AM (Open)
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            KisanSetu slot scheduling prevents tractor queues by balancing arrivals against live weighbridge discharge rates.
          </p>
        </div>
      )
    },
    token: {
      title: 'Digital Mandi Token',
      icon: Ticket,
      subtitle: 'Live gate check-in and queue tracking',
      comingModule: 'KisanSetu Live Queue Engine',
      renderContent: () => (
        <div className="space-y-3">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-950">Active Token: #TN-204</span>
              <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                Active
              </span>
            </div>
            <p className="text-slate-600">
              Poonamallee Procurement Centre • Paddy (Grade A)
            </p>
          </div>
          {onNavigateToTab && (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                onNavigateToTab('token');
                onClose();
              }}
            >
              Open Full Token Screen
            </Button>
          )}
        </div>
      )
    },
    centre: {
      title: 'Find Procurement Centre',
      icon: MapPin,
      subtitle: 'Nearest government purchase points and current queues',
      comingModule: 'Stage 2: Geospatial Mandi Locator & Congestion Heatmap',
      renderContent: () => (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Poonamallee Procurement Centre</span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Nearest (6.2 km)
              </span>
            </div>
            <p className="text-slate-600">Trunk Road, Poonamallee • Open 08:00 AM - 05:30 PM</p>
            <div className="pt-2 flex items-center justify-between text-slate-700 border-t border-emerald-200/60 font-medium">
              <span>Wait Time: <strong>~18 mins</strong></span>
              <span>Load: <strong className="text-amber-700">Moderate</strong></span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Thiruvallur Central Mandi</span>
              <span className="text-[11px] text-slate-500">11.4 km</span>
            </div>
            <p className="text-slate-500">Near Old Bus Stand • Heavy harvest congestion</p>
            <div className="pt-2 flex items-center justify-between text-slate-600 border-t border-slate-100">
              <span>Wait Time: <strong>~42 mins</strong></span>
              <span className="text-rose-700 font-bold">High Traffic</span>
            </div>
          </div>
        </div>
      )
    },
    track: {
      title: 'Track Transport',
      icon: Truck,
      subtitle: 'Monitor assigned pickup vehicle and drop-off journey',
      comingModule: 'Stage 2: Real-time GPS Telematics & Gate ETA Sync',
      renderContent: () => (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Self-Transport Registered</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                Active Pass
              </span>
            </div>
            <p className="text-slate-600">
              Vehicle: <strong>Tractor Trolley (TN 20 BK 9942)</strong>
            </p>
            <p className="text-slate-500">
              Assigned Route: Thiruvallur Village Farm → Poonamallee DPC (Gate 2)
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Stage 2 introduces shared agricultural truck booking for smallholder farmers with less than 20 quintals.
          </p>
        </div>
      )
    },
    produce: {
      title: 'My Produce Registry',
      icon: Package,
      subtitle: 'Registered farm acreage, harvest estimates, and crop passes',
      comingModule: 'Stage 2: Digital Crop Pass & Aadhaar Land-Record Sync',
      renderContent: () => (
        <div className="space-y-3">
          {farmer.registeredProduce.map((crop) => (
            <div key={crop.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{crop.cropName}</span>
                <span className="text-emerald-700">{crop.estimatedQuantityQuintals} Qtl</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-slate-500">
                <span>Variety: {crop.variety}</span>
                <span>Harvested: {crop.harvestDate}</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    payments: {
      title: 'Procurement Payments (DBT)',
      icon: CreditCard,
      subtitle: 'Direct Benefit Transfer payouts and weighbridge receipts',
      comingModule: 'Stage 2: PFMS / NPCI Instant Aadhaar Settlement Tracker',
      renderContent: () => (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-emerald-900">
              <span>Verified Bank Account</span>
              <span className="text-[11px] bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-950">
                DBT Active
              </span>
            </div>
            <p className="text-slate-700">{farmer.bankAccountMasked}</p>
            <p className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200">
              Last Disbursal: <strong>₹88,160 credited</strong> for Booking #KS-TN-118
            </p>
          </div>
          <p className="text-xs text-slate-500">
            All MSP disbursements are routed directly to your linked bank account within 24-48 hours of weighbridge receipt generation.
          </p>
        </div>
      )
    },
    ask: {
      title: 'Ask KisanSetu AI',
      icon: Bot,
      subtitle: 'Instant procurement answers in your native language',
      comingModule: 'Stage 2: Voice & Generative Agri-Procurement Copilot',
      renderContent: () => (
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Ask any question regarding procurement rules, today's queue wait, current MSP price, or moisture tolerance:
          </p>
          <div className="space-y-1.5">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
              💡 "What documents do I need to bring to the centre?"
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
              💡 "How is the deduction calculated if moisture is 18%?"
            </div>
          </div>
        </div>
      )
    }
  };

  const activeContent = contentMap[actionType];
  const Icon = activeContent.icon;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={activeContent.title}
      subtitle={activeContent.subtitle}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <DemoBadge type="data" />
          <Button variant="primary" size="sm" onClick={onClose}>
            Got it
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Module Badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs font-semibold">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{activeContent.comingModule}</span>
        </div>

        {/* Dynamic Mock Details */}
        {activeContent.renderContent()}

        {/* Action button redirection if applicable */}
        {actionType === 'book' && onNavigateToTab && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => {
              onClose();
              onNavigateToTab('bookings');
            }}
          >
            View Existing Bookings Tab →
          </Button>
        )}

        {actionType === 'ask' && onNavigateToTab && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => {
              onClose();
              onNavigateToTab('assistant');
            }}
          >
            Open Full Voice Assistant Tab →
          </Button>
        )}
      </div>
    </Modal>
  );
};
