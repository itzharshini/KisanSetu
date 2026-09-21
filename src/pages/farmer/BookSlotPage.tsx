import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  AlertCircle,
  Cpu,
  Building2,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { StepIndicator } from '../../components/farmer/StepIndicator';
import { CropSelector } from '../../components/farmer/CropSelector';
import { QuantitySelector } from '../../components/farmer/QuantitySelector';
import { CentreCard } from '../../components/farmer/CentreCard';
import { SlotCard } from '../../components/farmer/SlotCard';
import { RecommendationCard } from '../../components/farmer/RecommendationCard';
import { PlanSummaryCard, BookingConfirmedCard } from '../../components/farmer/ConfirmationCard';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { Booking, ProcurementCentre } from '../../types';
import { schedulingService } from '../../services/schedulingService';

export interface BookSlotPageProps {
  onNavigateToTab: (tab: 'home' | 'token' | 'centre-status' | 'bookings') => void;
}

export const BookSlotPage: React.FC<BookSlotPageProps> = ({ onNavigateToTab }) => {
  const { centres, confirmBooking, simulatedTime } = useKisanSetu();

  // Booking Flow State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedProduce, setSelectedProduce] = useState<string>('Paddy');
  const [quantityKg, setQuantityKg] = useState<number>(450);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [selectedCentreId, setSelectedCentreId] = useState<string>('PC-TN-04');
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow');
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  const [recommendedArrival, setRecommendedArrival] = useState<string>('10:10 AM');
  const [estimatedWait, setEstimatedWait] = useState<number>(18);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Section 2: Calculation / Computing State
  const [isComputingSchedule, setIsComputingSchedule] = useState<boolean>(false);
  const [computingStage, setComputingStage] = useState<string>('');

  const selectedCentre = centres.find((c) => c.id === selectedCentreId) || centres[0];

  // Section 7: Dynamic centre recommendation based on capacity, queue and distance
  const sortedCentres = [...centres].sort((a, b) => {
    // If one is congested and other is optimal, prioritize optimal
    if (a.loadLabel === 'High' && b.loadLabel !== 'High') return 1;
    if (b.loadLabel === 'High' && a.loadLabel !== 'High') return -1;
    return a.currentWaitMinutes - b.currentWaitMinutes;
  });

  const topRecommendedCentre = sortedCentres[0];

  // Auto-set initial recommended arrival & wait
  useEffect(() => {
    if (selectedTime === '10:30 AM') {
      setRecommendedArrival('10:10 AM');
      setEstimatedWait(18);
    } else if (selectedTime === '09:30 AM') {
      setRecommendedArrival('09:15 AM');
      setEstimatedWait(12);
    } else if (selectedTime === '11:30 AM') {
      setRecommendedArrival('11:10 AM');
      setEstimatedWait(22);
    }
  }, [selectedTime]);

  // Step Navigation & Validation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedProduce) return;
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 2) {
      if (!quantityKg || quantityKg <= 0) {
        setQuantityError('Please enter the approximate quantity.');
        return;
      }
      setQuantityError(null);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 4) {
      // Section 2: Trigger Smart Scheduling Engine Computing Animation
      setIsComputingSchedule(true);
      setComputingStage('Checking centre capacity & weigh stations...');
      
      setTimeout(() => {
        setComputingStage('Evaluating queue load and travel transit time...');
      }, 350);

      setTimeout(() => {
        setComputingStage('Optimizing gate arrival window...');
      }, 700);

      setTimeout(() => {
        setIsComputingSchedule(false);
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1050);
      return;
    }

    if (currentStep === 5) {
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Confirmation Handler (Updates shared application state)
  const handleFinalConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const newBooking = confirmBooking({
          produceType: selectedProduce,
          variety: selectedProduce === 'Paddy' ? 'Ponni (Grade A)' : 'Standard Grade',
          quantityKg,
          centreId: selectedCentre.id,
          slotDate: selectedDate,
          slotTime: selectedTime,
          recommendedArrival,
          estimatedWaitingMinutes: estimatedWait,
          whyThisSlot: [
            `Lower predicted queue during ${selectedTime} arrival window`,
            `Centre has ${selectedCentre.activeStations} active weighing stations and sufficient yard space`,
            `Suitable for travel distance (${selectedCentre.distanceKm} km)`,
            'Balanced centre workload and open gate bays'
          ]
        });

        setIsSubmitting(false);
        setConfirmedBooking(newBooking);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: any) {
        setIsSubmitting(false);
        alert(err?.message || 'Unable to confirm slot. Please select another time.');
      }
    }, 600);
  };

  // If already confirmed, render success screen
  if (confirmedBooking) {
    return (
      <div className="py-6 max-w-xl mx-auto px-2">
        <BookingConfirmedCard
          booking={confirmedBooking}
          onViewToken={() => onNavigateToTab('token')}
          onViewCentreStatus={() => onNavigateToTab('centre-status')}
          onBackToHome={() => onNavigateToTab('home')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Book Procurement Slot
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Intelligent scheduling designed for easy rural access
          </p>
        </div>
        <DemoBadge type="mode" />
      </div>

      {/* Step Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <StepIndicator
          currentStep={currentStep}
          totalSteps={6}
          onStepClick={(step) => {
            if (step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />
      </div>

      {/* Section 2: Computing Overlay / State */}
      {isComputingSchedule && (
        <div className="p-8 bg-white rounded-3xl border-2 border-emerald-500 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto animate-pulse">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 font-display">
              Finding the best procurement time for you...
            </h3>
            <p className="text-xs text-emerald-800 font-medium mt-1">
              {computingStage}
            </p>
          </div>
          <div className="max-w-xs mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full animate-[progress_1s_ease-in-out_infinite] w-3/4" />
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Deterministic Rule-Based Scheduling Engine • KisanSetu
          </div>
        </div>
      )}

      {/* STEP 1: Select Produce */}
      {!isComputingSchedule && currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Step 1 — Choose your crop
            </h2>
            <span className="text-xs text-slate-500 font-medium">Tap crop card to select</span>
          </div>

          <CropSelector
            selectedCrop={selectedProduce}
            onSelectCrop={(crop) => {
              setSelectedProduce(crop);
            }}
          />
        </div>
      )}

      {/* STEP 2: Quantity */}
      {!isComputingSchedule && currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Step 2 — Quantity to Bring
            </h2>
            <span className="text-xs text-slate-500 font-medium">Produce: {selectedProduce}</span>
          </div>

          <QuantitySelector
            quantityKg={quantityKg}
            onChangeQuantity={(qty) => {
              setQuantityKg(qty);
              if (qty > 0) setQuantityError(null);
            }}
            error={quantityError}
          />
        </div>
      )}

      {/* STEP 3: Select Centre (Section 7 Intelligence) */}
      {!isComputingSchedule && currentStep === 3 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Step 3 — Select Procurement Centre
              </h2>
              <p className="text-xs text-slate-500">
                Recommended by shortest wait time and active weigh stations
              </p>
            </div>
            <DemoBadge type="data" />
          </div>

          {/* Recommended Centre Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                RECOMMENDED FOR YOUR VILLAGE
              </span>
              <span className="text-[11px] text-slate-500">Lowest queue latency</span>
            </div>

            <CentreCard
              centre={topRecommendedCentre}
              isSelected={selectedCentreId === topRecommendedCentre.id}
              isRecommended={true}
              whyRecommended={[
                'Shorter expected waiting time today',
                `Good capacity (${topRecommendedCentre.activeStations} active stations)`,
                `Suitable for your ${quantityKg} kg payload`
              ]}
              onSelect={(id) => setSelectedCentreId(id)}
            />
          </div>

          {/* Other Centres Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
              OTHER OPTIONS:
            </h4>
            <div className="space-y-3">
              {centres
                .filter((c) => c.id !== topRecommendedCentre.id)
                .map((centre) => (
                  <CentreCard
                    key={centre.id}
                    centre={centre}
                    isSelected={selectedCentreId === centre.id}
                    isRecommended={false}
                    onSelect={(id) => setSelectedCentreId(id)}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Date & Time */}
      {!isComputingSchedule && currentStep === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Step 4 — Select Date & Time
              </h2>
              <p className="text-xs text-slate-500">
                Centre: <strong>{selectedCentre.name}</strong>
              </p>
            </div>
          </div>

          <SlotCard
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            selectedTime={selectedTime}
            onChangeTime={setSelectedTime}
            centreId={selectedCentre.id}
          />
        </div>
      )}

      {/* STEP 5: Smart Recommendation */}
      {!isComputingSchedule && currentStep === 5 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Step 5 — Recommended Arrival Window
              </h2>
              <p className="text-xs text-slate-500">
                Optimized to minimize your queue waiting time
              </p>
            </div>
            <DemoBadge type="data" />
          </div>

          <RecommendationCard
            centre={selectedCentre}
            produceName={selectedProduce}
            quantityKg={quantityKg}
            selectedSlotTime={selectedTime}
            onSelectSlot={(time, arrival, wait) => {
              setSelectedTime(time);
              setRecommendedArrival(arrival);
              setEstimatedWait(wait);
            }}
            onSelectCentre={(newCentreId) => {
              setSelectedCentreId(newCentreId);
            }}
            onProceedToConfirm={() => setCurrentStep(6)}
          />
        </div>
      )}

      {/* STEP 6: Confirm Booking */}
      {!isComputingSchedule && currentStep === 6 && (
        <div className="space-y-4">
          <PlanSummaryCard
            produce={selectedProduce}
            quantityKg={quantityKg}
            centreName={selectedCentre.name}
            date={selectedDate}
            slotTime={selectedTime}
            expectedWait={`${estimatedWait} min`}
            recommendedArrival={recommendedArrival}
            onConfirm={handleFinalConfirm}
            onChangeDetails={() => setCurrentStep(1)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Bottom Navigation Buttons */}
      {!isComputingSchedule && currentStep < 6 && (
        <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="flex-1 py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-[0.99]"
          >
            <span>
              {currentStep === 4 ? 'Compute Smart Recommendation' : `Continue to Step ${currentStep + 1}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
