import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  BarChart3,
  Bell,
  Truck,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Building2,
  BrainCircuit,
  Gauge,
  CalendarClock
} from 'lucide-react';
import { UserRole } from '../../types';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface SidebarProps {
  id?: string;
  role: UserRole;
  activeTab: string;
  onChangeTab: (tabId: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  id,
  role,
  activeTab,
  onChangeTab,
  className = ''
}) => {
  const getNavItems = (): SidebarItem[] => {
    switch (role) {
      case 'operator':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'queue', label: 'Queue Management', icon: CalendarClock, badge: 'Live 14' },
          { id: 'digital-twin', label: 'Digital Twin', icon: Layers, badge: 'Live 2D' },
          { id: 'capacity', label: 'Capacity & Bays', icon: Gauge },
          { id: 'alerts', label: 'Alerts & Incidents', icon: Bell, badge: '1' }
        ];
      case 'transporter':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'trips', label: 'Active Trips', icon: Truck, badge: '3 Active' },
          { id: 'routes', label: 'Route Coordination', icon: MapPin },
          { id: 'deliveries', label: 'Deliveries & Drops', icon: PackageCheck }
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'centres', label: 'Procurement Centres', icon: Building2 },
          { id: 'farmers', label: 'Farmer Registry', icon: Users },
          { id: 'transport', label: 'Logistics Fleet', icon: Truck },
          { id: 'analytics', label: 'Ecosystem Analytics', icon: BarChart3 },
          { id: 'ai-insights', label: 'AI Congestion Insights', icon: BrainCircuit, badge: 'AI Engine' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const roleMeta = {
    operator: { title: 'Procurement Centre', subtitle: 'Poonamallee DPC #04' },
    transporter: { title: 'Logistics Operations', subtitle: 'Thiruvallur Fleet Hub' },
    admin: { title: 'System Administration', subtitle: 'State Ag-Procurement Cell' },
    farmer: { title: 'Farmer Portal', subtitle: 'Arun Kumar' }
  };

  const currentMeta = roleMeta[role] || roleMeta.operator;

  return (
    <aside
      id={id}
      className={`w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 ${className}`}
    >
      <div className="space-y-6">
        {/* Portal Role Box */}
        <div className="px-3 py-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            {currentMeta.title}
          </span>
          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1" aria-label="Portal section navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left select-none ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-emerald-200/70 text-emerald-900'
                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between font-medium">
          <span>KisanSetu Platform</span>
          <span className="text-emerald-700 font-bold">v1.0-FDN</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Architecture Foundation Stage 1
        </p>
      </div>
    </aside>
  );
};
