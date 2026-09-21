import React from 'react';
import {
  User,
  MapPin,
  Phone,
  ShieldCheck,
  CreditCard,
  Wheat,
  FileText,
  BadgeCheck,
  Languages,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Farmer, SupportedLanguage } from '../../types';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { useTranslation } from '../../utils/translations';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';

export interface FarmerProfileProps {
  farmer: Farmer;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const FarmerProfile: React.FC<FarmerProfileProps> = () => {
  const { farmer, language, setLanguage, easyMode, toggleEasyMode } = useKisanSetu();
  const { t } = useTranslation(language);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 md:pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Farmer Profile & Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Aadhaar-linked farmer registration under Agriculture & Farmers Welfare Department
          </p>
        </div>
        <DemoBadge type="data" />
      </div>

      {/* SECTION 27: EASY MODE TOGGLE & PREFERENCES */}
      <Card padding="md" className="space-y-4 border-2 border-emerald-600/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Accessibility Preference</span>
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
              Easy Mode (பெரிய எழுத்து / आसान मोड)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simplified interface with extra-large touch buttons, high contrast, and direct actions.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleEasyMode}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
              easyMode
                ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {easyMode ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-300" />
                <span>Easy Mode: ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-slate-400" />
                <span>Easy Mode: OFF</span>
              </>
            )}
          </button>
        </div>

        {/* SECTION 28: LANGUAGE TOGGLE */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Preferred Language (மொழி / भाषा):
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-bold'
                  }`}
                >
                  <div className="text-sm">{lang.nativeLabel}</div>
                  <div className="text-[11px] text-slate-400 font-normal">{lang.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Main Profile Card */}
      <Card padding="md" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-bold font-display border border-emerald-300">
              AK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 font-display">{farmer.name}</h2>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                  DBT Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kisan ID: <strong className="text-slate-800 font-mono">{farmer.kisanId}</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500">Aadhaar Linked</span>
            <p className="text-sm font-semibold text-slate-700 font-mono">{farmer.aadhaarMasked}</p>
          </div>
        </div>

        {/* Particulars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Location & Revenue Village</span>
            </div>
            <p className="text-slate-600">
              Village: <strong>{farmer.village}</strong>
            </p>
            <p className="text-slate-600">
              Taluk & District: <strong>{farmer.district}, {farmer.state}</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>Contact & SMS Alerts</span>
            </div>
            <p className="text-slate-600">
              Mobile: <strong>{farmer.phone}</strong> (Primary)
            </p>
            <p className="text-slate-600">
              Email: <strong>{farmer.email}</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Registered Land Holding</span>
            </div>
            <p className="text-slate-600">
              Total Cultivated Area: <strong>{farmer.landAreaAcres} Acres</strong>
            </p>
            <p className="text-slate-600">
              Survey Numbers: <strong>114/2B, 114/3A (Thiruvallur Taluk)</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Direct Benefit Transfer (DBT)</span>
            </div>
            <p className="text-slate-700 font-mono font-medium">
              {farmer.bankAccountMasked}
            </p>
            <p className="text-[11px] text-emerald-800">
              Aadhaar Payment Bridge System (APBS) active
            </p>
          </div>
        </div>

        {/* Crop Pass / Registered Harvest */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-700" />
              <span>Registered Crop Passes for Kharif 2026</span>
            </h3>
            <span className="text-xs text-slate-500">{farmer.registeredProduce.length} Crops</span>
          </div>

          <div className="space-y-2.5">
            {farmer.registeredProduce.map((crop) => (
              <div
                key={crop.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{crop.cropName}</h4>
                  <p className="text-slate-500 mt-0.5">
                    Variety: {crop.variety} • Harvest: {crop.harvestDate}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-800 text-sm">
                    {crop.estimatedQuantityQuintals} Quintals
                  </span>
                  <p className="text-[11px] text-slate-500">MSP ₹{crop.mspPerQuintal}/Qtl</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
