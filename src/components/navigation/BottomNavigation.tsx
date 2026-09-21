import React from 'react';
import { Home, CalendarPlus, Ticket, MapPin, User, Calendar } from 'lucide-react';
import { FarmerNavTab } from '../../types';

export interface BottomNavigationProps {
  id?: string;
  activeTab: FarmerNavTab;
  onChangeTab: (tab: FarmerNavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  id,
  activeTab,
  onChangeTab
}) => {
  const tabs: { id: FarmerNavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'book-slot', label: 'Book Slot', icon: CalendarPlus },
    { id: 'token', label: 'My Token', icon: Ticket },
    { id: 'centre-status', label: 'Centres', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      id={id}
      aria-label="Farmer navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 sm:px-6 py-1.5 md:hidden"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[50px] py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-emerald-100/70 scale-110' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-emerald-800 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[58px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-4 h-1 bg-emerald-700 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
