import React, { useState } from 'react';
import {
  Sprout,
  Bell,
  Mic,
  Globe,
  ArrowLeftRight,
  Home,
  Check
} from 'lucide-react';
import { UserRole, SupportedLanguage } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { DemoBadge } from '../common/DemoBadge';

export interface HeaderProps {
  id?: string;
  currentRole: UserRole | 'landing';
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenVoiceAssistant?: () => void;
  onSwitchRole?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  id,
  currentRole,
  selectedLanguage,
  onLanguageChange,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenVoiceAssistant,
  onSwitchRole,
  onGoHome
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);

  const roleLabels: Record<string, { label: string; icon: string }> = {
    farmer: { label: 'Farmer Portal', icon: '👨🌾' },
    operator: { label: 'Procurement Centre', icon: '🏢' },
    transporter: { label: 'Transporter Hub', icon: '🚚' },
    admin: { label: 'Admin Console', icon: '🧑💼' },
    landing: { label: 'Public Portal', icon: '🌾' }
  };

  const activeRole = roleLabels[currentRole] || roleLabels.farmer;

  return (
    <header
      id={id}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded-lg p-1 transition-all"
            title="KisanSetu Home"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs border border-emerald-800/20 shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">
                  Kisan<span className="text-emerald-700">Setu</span>
                </span>
                <DemoBadge type="mode" className="hidden sm:inline-flex" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block leading-none">
                Connecting Farmers to Smarter Procurement
              </p>
            </div>
          </button>

          {currentRole !== 'landing' && (
            <div className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-slate-200 ml-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/60 flex items-center gap-1">
                <span>{activeRole.icon}</span>
                <span>{activeRole.label}</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Voice Assistant button - Prominent on Farmer role */}
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200 font-medium text-xs sm:text-sm transition-all shadow-2xs min-h-[40px] active:scale-95"
              title="Voice-first assistant in your language"
              aria-label="Voice Assistant"
            >
              <Mic className="w-4 h-4 text-emerald-700 animate-pulse shrink-0" />
              <span className="hidden xs:inline">Voice Help</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors min-h-[40px]"
              aria-expanded={isLangOpen}
              aria-label="Change Language"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="uppercase font-semibold tracking-wider">
                {selectedLanguage}
              </span>
            </button>

            {isLangOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-900 transition-colors ${
                        selectedLanguage === lang.code
                          ? 'bg-emerald-50/60 font-semibold text-emerald-800'
                          : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <span>{lang.nativeLabel}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">
                          ({lang.label})
                        </span>
                      </div>
                      {selectedLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notification Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label={`Notifications (${unreadNotificationsCount} unread)`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Switch Role / Exit to Portal */}
          {currentRole !== 'landing' ? (
            <button
              onClick={onSwitchRole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs sm:text-sm transition-colors min-h-[40px]"
              title="Switch to another demo role"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>
          ) : (
            <button
              onClick={onSwitchRole}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors min-h-[40px]"
            >
              <span>Launch Demo</span>
            </button>
          )}

          {/* Home Link if in sub-portal */}
          {currentRole !== 'landing' && onGoHome && (
            <button
              onClick={onGoHome}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:flex"
              title="Return to KisanSetu Overview"
              aria-label="Back to landing page"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
