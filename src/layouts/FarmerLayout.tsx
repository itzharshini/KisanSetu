import React from 'react';
import { Header } from '../components/navigation/Header';
import { BottomNavigation } from '../components/navigation/BottomNavigation';
import { FarmerNavTab, SupportedLanguage, UserRole } from '../types';

export interface FarmerLayoutProps {
  children: React.ReactNode;
  activeTab: FarmerNavTab;
  onChangeTab: (tab: FarmerNavTab) => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenVoiceAssistant: () => void;
  onSwitchRole: () => void;
  onGoHome: () => void;
}

export const FarmerLayout: React.FC<FarmerLayoutProps> = ({
  children,
  activeTab,
  onChangeTab,
  selectedLanguage,
  onLanguageChange,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenVoiceAssistant,
  onSwitchRole,
  onGoHome
}) => {
  const desktopTabs: { id: FarmerNavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'book-slot', label: 'Book Slot' },
    { id: 'token', label: 'My Token' },
    { id: 'centre-status', label: 'Centre Status' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'produce', label: 'My Produce' },
    { id: 'payments', label: 'Payments' },
    { id: 'assistant', label: 'Assistant' },
    { id: 'profile', label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header
        currentRole="farmer"
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={onOpenNotifications}
        onOpenVoiceAssistant={onOpenVoiceAssistant}
        onSwitchRole={onSwitchRole}
        onGoHome={onGoHome}
      />

      {/* Desktop secondary tab strip for comfortable navigation */}
      <div className="hidden md:block bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-5 overflow-x-auto no-scrollbar">
          {desktopTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-950'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {children}
      </main>

      {/* Mobile-first bottom navigation */}
      <BottomNavigation activeTab={activeTab} onChangeTab={onChangeTab} />
    </div>
  );
};
