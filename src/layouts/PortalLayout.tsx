import React, { useState } from 'react';
import { Header } from '../components/navigation/Header';
import { Sidebar } from '../components/navigation/Sidebar';
import { UserRole, SupportedLanguage } from '../types';
import { Menu, X } from 'lucide-react';

export interface PortalLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  activeTab: string;
  onChangeTab: (tabId: string) => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onSwitchRole: () => void;
  onGoHome: () => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  role,
  activeTab,
  onChangeTab,
  selectedLanguage,
  onLanguageChange,
  unreadNotificationsCount,
  onOpenNotifications,
  onSwitchRole,
  onGoHome
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header
        currentRole={role}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={onOpenNotifications}
        onSwitchRole={onSwitchRole}
        onGoHome={onGoHome}
      />

      {/* Mobile Sidebar toggle bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Section: <span className="text-emerald-700 capitalize">{activeTab}</span>
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
          aria-label="Toggle Portal Menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{mobileMenuOpen ? 'Close Menu' : 'Menu'}</span>
        </button>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          role={role}
          activeTab={activeTab}
          onChangeTab={onChangeTab}
          className="hidden md:flex"
        />

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-white z-50 flex flex-col shadow-xl">
              <Sidebar
                role={role}
                activeTab={activeTab}
                onChangeTab={(t) => {
                  onChangeTab(t);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex-1"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
