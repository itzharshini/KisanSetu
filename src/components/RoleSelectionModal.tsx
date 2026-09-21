import React from 'react';
import { ArrowRight, UserCheck, Building2, Truck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { DemoBadge } from './common/DemoBadge';

export interface RoleSelectionModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  id,
  isOpen,
  onClose,
  onSelectRole
}) => {
  const roles: {
    role: UserRole;
    name: string;
    emoji: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    cta: string;
    highlight: string;
  }[] = [
    {
      role: 'farmer',
      name: 'Farmer',
      emoji: '👨🌾',
      icon: UserCheck,
      description: 'Book procurement slots, track your token and get assistance.',
      cta: 'Explore Farmer Portal',
      highlight: 'Arun Kumar • Thiruvallur'
    },
    {
      role: 'operator',
      name: 'Procurement Centre',
      emoji: '🏢',
      icon: Building2,
      description: 'Manage queues, capacity and daily operations.',
      cta: 'Enter Centre Operator',
      highlight: 'Poonamallee DPC #04'
    },
    {
      role: 'transporter',
      name: 'Transporter',
      emoji: '🚚',
      icon: Truck,
      description: 'Manage assigned pickups, routes and deliveries.',
      cta: 'Open Logistics Hub',
      highlight: 'TN Logistics Cluster'
    },
    {
      role: 'admin',
      name: 'Administrator',
      emoji: '🧑💼',
      icon: ShieldAlert,
      description: 'Monitor the entire procurement ecosystem.',
      cta: 'View Admin Console',
      highlight: 'State Operations HQ'
    }
  ];

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to KisanSetu"
      subtitle="Choose how you'd like to explore the platform."
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <DemoBadge type="mode" />
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          No sign-in or credentials required in Stage 1 Demo Mode. Select any stakeholder role to preview the customized environment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {roles.map((item) => (
            <div
              key={item.role}
              onClick={() => onSelectRole(item.role)}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-sm"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectRole(item.role);
                }
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-2xl" role="img" aria-label={item.name}>
                    {item.emoji}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60">
                    {item.highlight}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 font-display">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-950">
                <span>{item.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
