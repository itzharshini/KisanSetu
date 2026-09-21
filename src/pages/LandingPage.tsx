import React from 'react';
import {
  Sprout,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  Building2,
  Cpu,
  Truck,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Users,
  Layers,
  BrainCircuit,
  Mic,
  Languages,
  WifiOff,
  Radio,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { DemoBadge } from '../components/common/DemoBadge';

export interface LandingPageProps {
  onLaunchDemo: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDemo,
  onSelectRole
}) => {
  const scrollToExplore = () => {
    const el = document.getElementById('explore-ecosystem');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ecosystemSteps = [
    {
      step: '01',
      title: 'Farmer',
      subtitle: 'Registers harvest, books slot via voice or app',
      icon: Users,
      badge: 'Demand Signal'
    },
    {
      step: '02',
      title: 'Smart Booking',
      subtitle: 'Allocates verified arrival window & digital token',
      icon: CalendarCheck,
      badge: 'Zero Waiting'
    },
    {
      step: '03',
      title: 'Procurement Centre',
      subtitle: 'Prepares weighbridges, bags & staff for incoming load',
      icon: Building2,
      badge: 'Capacity Sync'
    },
    {
      step: '04',
      title: 'AI Optimization',
      subtitle: 'Predicts choke points & load-balances across depots',
      icon: Cpu,
      badge: 'Congestion AI'
    },
    {
      step: '05',
      title: 'Transport',
      subtitle: 'Dynamic vehicle dispatch synchronized with weighment',
      icon: Truck,
      badge: 'Rapid Clearance'
    },
    {
      step: '06',
      title: 'Successful Procurement',
      subtitle: 'Instant digital receipt & Direct Benefit Transfer (DBT)',
      icon: CheckCircle2,
      badge: 'Guaranteed MSP'
    }
  ];

  const bottlenecks = [
    { title: 'Long queues', desc: 'Farmers wait hours or overnight in lines with loaded tractors' },
    { title: 'Unpredictable waiting', desc: 'No visibility into weighbridge availability or daily queue count' },
    { title: 'Centre overcrowding', desc: 'Depots overwhelmed on peak harvest days without pacing' },
    { title: 'Transport delays', desc: 'Procured grain sits exposed while empty trucks are stuck in traffic' },
    { title: 'Poor visibility', desc: 'Administrators lack unified real-time district procurement data' },
    { title: 'Connectivity challenges', desc: 'Rural edge areas suffer intermittent mobile network dead zones' },
    { title: 'Language barriers', desc: 'Complex portals exclude farmers who prefer regional voice guidance' }
  ];

  const coreCapabilities = [
    {
      title: 'Smart Slot Allocation',
      desc: 'Predictive scheduling maps farmer arrival times directly to weighbridge capacity, preventing roadside bottlenecks.',
      icon: CalendarCheck,
      status: 'Foundation Ready'
    },
    {
      title: 'Real-Time Queue Visibility',
      desc: 'Live digital tokens show accurate waiting minutes, current queue position, and exact recommended gate arrival.',
      icon: Clock,
      status: 'Foundation Ready'
    },
    {
      title: 'Procurement Centre Digital Twin',
      desc: 'Interactive 2D/3D depot schematic monitoring truck intake bays, grain inspection, and bag stacking density.',
      icon: Layers,
      status: 'Planned Module'
    },
    {
      title: 'AI Congestion Prediction',
      desc: 'Machine learning forecasts depot surge loads 48 hours in advance and reroutes trucks to neighboring mandis.',
      icon: BrainCircuit,
      status: 'Planned Module'
    },
    {
      title: 'Logistics Coordination',
      desc: 'Automated fleet dispatch syncing state warehouse trucks with real-time grain bag packaging rates.',
      icon: Truck,
      status: 'Planned Module'
    },
    {
      title: 'Voice-First Farmer Assistance',
      desc: 'Conversational voice guidance for hands-free slot checking, crop registration, and MSP rate inquiries.',
      icon: Mic,
      status: 'Foundation Ready'
    },
    {
      title: 'Multilingual Support',
      desc: 'Native localization in Tamil, Hindi, Telugu, and English ensuring zero digital literacy barrier.',
      icon: Languages,
      status: 'Foundation Ready'
    },
    {
      title: 'Offline / Low-Network Support',
      desc: 'Resilient local-first token caching and SMS fallbacks engineered for remote rural procurement outposts.',
      icon: WifiOff,
      status: 'Planned Module'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-linear-to-b from-emerald-50/50 via-white to-[#F8FAFC]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Tag / Identity badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold tracking-tight shadow-2xs">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>KisanSetu • Smart Agricultural Coordination Ecosystem</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-display">
              Kisan<span className="text-emerald-700">Setu</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-slate-700 tracking-tight font-display">
              "Connecting Farmers to Smarter Procurement."
            </p>
          </div>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            AI-powered procurement coordination, intelligent scheduling and real-time operational visibility — built around the farmer.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              id="cta-launch-demo"
              size="xl"
              variant="primary"
              onClick={onLaunchDemo}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
              className="w-full sm:w-auto shadow-md"
            >
              Launch Demo
            </Button>
            <Button
              id="cta-explore-ecosystem"
              size="xl"
              variant="outline"
              onClick={scrollToExplore}
              icon={<ChevronDown className="w-5 h-5" />}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Explore KisanSetu
            </Button>
          </div>

          {/* Ecosystem Visual: Farmer -> Smart Booking -> Procurement Centre -> AI Optimization -> Transport -> Successful Procurement */}
          <div id="explore-ecosystem" className="pt-12 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                The KisanSetu Connected Ecosystem
              </h2>
              <DemoBadge type="mode" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {ecosystemSteps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                        <span>{item.step}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.badge}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 border border-emerald-100">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 font-display">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        {item.subtitle}
                      </p>
                    </div>

                    {idx < ecosystemSteps.length - 1 && (
                      <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shadow-xs">
                        →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM -> SOLUTION SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Operational Imperative
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Why KisanSetu?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Traditional agricultural procurement suffers from fragmented handoffs and lack of queue predictability.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Bottlenecks Column */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <AlertOctagon className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900 font-display">
                Current Procurement Bottlenecks
              </h3>
            </div>
            <div className="space-y-3">
              {bottlenecks.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Column */}
          <div className="lg:col-span-6 bg-linear-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                The KisanSetu Solution
              </div>

              <h3 className="text-2xl font-extrabold font-display tracking-tight text-white">
                One connected ecosystem.
              </h3>

              <p className="text-sm text-emerald-100/90 leading-relaxed">
                KisanSetu coordinates farmers, procurement centres, transport and administrators through one intelligent platform.
              </p>

              <div className="space-y-3 pt-3 border-t border-emerald-800/60 text-xs text-emerald-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Synchronized slots eliminate overnight mandi line-ups</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time weighbridge telematics prevent centre overcrowding</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated truck dispatch prevents grain spoilage during storage handoff</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Voice-first vernacular interaction for complete rural accessibility</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-emerald-800/80">
              <Button
                variant="outline"
                size="md"
                onClick={onLaunchDemo}
                className="w-full bg-white text-emerald-900 hover:bg-emerald-50 border-white font-semibold"
              >
                Experience the Platform Demo →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE CAPABILITIES PREVIEW */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/80 border-t border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              System Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Built for Scale, Simplicity, and Speed
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Architecture preview of modules designed to handle peak harvest surge across thousands of procurement points.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreCapabilities.map((item, idx) => {
              const Icon = item.icon;
              const isReady = item.status === 'Foundation Ready';

              return (
                <Card
                  key={idx}
                  padding="md"
                  className="flex flex-col justify-between hover:border-emerald-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          isReady
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. EXPLORE BY STAKEHOLDER ROLE SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Role Selection
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Explore KisanSetu in Demo Mode
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Switch between tailored user experiences built for farmers, centre supervisors, logistics partners, and administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onSelectRole('farmer')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl" role="img" aria-label="Farmer">👨🌾</span>
              <h3 className="text-base font-bold text-slate-900 font-display mt-3">
                Farmer
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Book procurement slots, track your token and get assistance.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Enter Farmer Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onSelectRole('operator')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl" role="img" aria-label="Procurement Centre">🏢</span>
              <h3 className="text-base font-bold text-slate-900 font-display mt-3">
                Procurement Centre
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage queues, capacity and daily operations.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Enter Centre Operator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onSelectRole('transporter')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl" role="img" aria-label="Transporter">🚚</span>
              <h3 className="text-base font-bold text-slate-900 font-display mt-3">
                Transporter
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage assigned pickups, routes and deliveries.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Enter Transporter Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onSelectRole('admin')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl" role="img" aria-label="Administrator">🧑💼</span>
              <h3 className="text-base font-bold text-slate-900 font-display mt-3">
                Administrator
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Monitor the entire procurement ecosystem.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Enter Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-800 font-display">KisanSetu</span>
            <span>• Stage 1 Application Foundation</span>
          </div>
          <p className="text-slate-400">
            A public ag-tech demonstration. All figures and tokens are simulated demo records.
          </p>
        </div>
      </footer>
    </div>
  );
};
