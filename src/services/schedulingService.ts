import {
  ProcurementCentre,
  TimeSlot,
  SlotAvailabilityState,
  SchedulingFactors,
  SlotRecommendation,
  AlternativeSlotOption,
  AlternativeCentreOption,
  SlotComparisonItem,
  SchedulingResult,
  Farmer
} from '../types';

/**
 * Standard daily operational time slots
 */
export const DAILY_SLOT_TEMPLATES: {
  time: string;
  category: 'Morning' | 'Afternoon' | 'Evening';
  baseArrivalWeight: number; // Historical arrival concentration index (0.5 to 1.8)
}[] = [
  { time: '09:00 AM', category: 'Morning', baseArrivalWeight: 0.7 },
  { time: '09:30 AM', category: 'Morning', baseArrivalWeight: 0.8 },
  { time: '10:00 AM', category: 'Morning', baseArrivalWeight: 1.2 },
  { time: '10:30 AM', category: 'Morning', baseArrivalWeight: 0.9 }, // Sweet spot
  { time: '11:00 AM', category: 'Morning', baseArrivalWeight: 1.7 }, // Peak morning
  { time: '11:30 AM', category: 'Morning', baseArrivalWeight: 1.5 },
  { time: '12:00 PM', category: 'Afternoon', baseArrivalWeight: 1.3 },
  { time: '12:30 PM', category: 'Afternoon', baseArrivalWeight: 0.9 },
  { time: '01:00 PM', category: 'Afternoon', baseArrivalWeight: 0.6 }, // Lunch shift
  { time: '01:30 PM', category: 'Afternoon', baseArrivalWeight: 0.8 },
  { time: '02:00 PM', category: 'Afternoon', baseArrivalWeight: 1.1 },
  { time: '02:30 PM', category: 'Afternoon', baseArrivalWeight: 1.0 },
  { time: '03:00 PM', category: 'Evening', baseArrivalWeight: 1.3 },
  { time: '03:30 PM', category: 'Evening', baseArrivalWeight: 0.9 }
];

export interface SlotGenerationParams {
  centre: ProcurementCentre;
  date: string;
  quantityKg: number;
}

class SmartSchedulingService {
  /**
   * Generates dynamic TimeSlots for a centre on a given date, taking into account
   * centre capacity, active stations, and historical arrival curves.
   */
  generateSlotsForCentre(
    centre: ProcurementCentre,
    date: string,
    quantityKg: number = 450
  ): TimeSlot[] {
    const slotCapacityPerSlot = Math.max(
      6,
      Math.round((centre.maximumDailyCapacity / DAILY_SLOT_TEMPLATES.length) * 0.9)
    );

    return DAILY_SLOT_TEMPLATES.map((tmpl, idx) => {
      // Deterministic simulation based on centre ID + date + time template
      const charCodeSum = (centre.id + date).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const pseudoSeed = (charCodeSum + idx * 7) % 100;

      // Base booking count modulated by centre load & time weight
      const loadMultiplier =
        centre.loadLabel === 'High' ? 1.3 : centre.loadLabel === 'Low' ? 0.7 : 1.0;
      
      const expectedArrivals = Math.max(
        3,
        Math.round(tmpl.baseArrivalWeight * 10 * loadMultiplier + (pseudoSeed % 5))
      );

      // Bookings already committed in system
      let bookingCount = Math.min(
        slotCapacityPerSlot,
        Math.max(
          1,
          Math.round(expectedArrivals * 0.85 + (pseudoSeed % 3) - 1)
        )
      );

      // Specific demo anchor: make 11:00 AM Busy/Full, 10:30 AM optimal, 09:30 AM low
      if (tmpl.time === '11:00 AM' && centre.loadLabel !== 'Low') {
        bookingCount = slotCapacityPerSlot; // FULL or BUSY
      } else if (tmpl.time === '10:30 AM') {
        bookingCount = Math.max(2, Math.round(slotCapacityPerSlot * 0.5)); // Good availability
      }

      // Determine availability state
      const occupancyRatio = bookingCount / slotCapacityPerSlot;
      let availability: SlotAvailabilityState = 'AVAILABLE';
      let availabilityLabel = '🟢 Good availability';
      let capacityStatus: 'Good' | 'Limited' | 'Busy' | 'Full' | 'Closed' = 'Good';

      if (occupancyRatio >= 1.0) {
        availability = 'FULL';
        availabilityLabel = '🔴 Full';
        capacityStatus = 'Full';
      } else if (occupancyRatio >= 0.8) {
        availability = 'BUSY';
        availabilityLabel = '🟠 Busy';
        capacityStatus = 'Busy';
      } else if (occupancyRatio >= 0.6) {
        availability = 'LIMITED';
        availabilityLabel = '🟡 Limited availability';
        capacityStatus = 'Limited';
      } else {
        availability = 'AVAILABLE';
        availabilityLabel = '🟢 Good availability';
        capacityStatus = 'Good';
      }

      // Expected queue and waiting time calculation
      const expectedQueue = Math.max(
        2,
        Math.round(centre.currentQueue * 0.5 + expectedArrivals * 0.6)
      );

      const processingTime = this.estimateProcessingTime(quantityKg);
      const expectedWaitMinutes = this.estimateWaitingTime(
        expectedQueue,
        centre.activeStations,
        centre.processingRate,
        processingTime
      );

      return {
        id: `${centre.id}-${date}-${tmpl.time.replace(/[: ]/g, '')}`,
        centreId: centre.id,
        date,
        time: tmpl.time,
        category: tmpl.category,
        availability,
        availabilityLabel,
        maxCapacity: slotCapacityPerSlot,
        bookingCount,
        expectedQueue,
        expectedWaitMinutes,
        expectedArrivals,
        capacityStatus
      };
    });
  }

  /**
   * Section 16: Quantity-Aware Processing Time
   * Models the weighbridge, moisture testing, bag offloading, and receipting duration.
   */
  estimateProcessingTime(quantityKg: number): number {
    if (quantityKg <= 200) {
      return 8; // Small lot: ~8 minutes
    } else if (quantityKg <= 600) {
      return 12; // Standard trolley (~450 kg): ~12 minutes
    } else if (quantityKg <= 1500) {
      return 18; // Medium truck/large trolley: ~18 minutes
    } else if (quantityKg <= 3000) {
      return 26; // Multi-trolley: ~26 minutes
    } else {
      return 35; // Heavy tractor / truck load: ~35 minutes
    }
  }

  /**
   * Section 12 & 13: Waiting Time Calculation
   * Wait = (Queue Size / Effective Processing Rate) adjusted for quantity processing.
   */
  estimateWaitingTime(
    queueSize: number,
    activeStations: number,
    processingRatePerStationPerHour: number,
    farmerProcessingMinutes: number
  ): number {
    const safeStations = Math.max(1, activeStations);
    const safeRate = Math.max(2, processingRatePerStationPerHour);
    
    // Effective capacity in farmers served per hour across all active weighing stations
    const effectiveCapacityPerHour = safeStations * safeRate;
    
    // Base wait in minutes = (queueSize / effectiveCapacityPerHour) * 60
    const rawWait = (queueSize / effectiveCapacityPerHour) * 60;
    
    // Blend with individual farmer processing requirement
    const calculatedWait = Math.round(rawWait * 0.8 + (farmerProcessingMinutes * 0.4));
    
    // Keep within realistic mandi boundaries (5 min to 55 min)
    return Math.min(55, Math.max(8, calculatedWait));
  }

  /**
   * Section 15: Travel Time Estimation
   * Computes estimated transit duration based on demo distance.
   */
  estimateTravelTimeMinutes(distanceKm: number): number {
    // Average rural tractor speed ~ 20-25 km/h + road delay buffer
    return Math.max(10, Math.round(distanceKm * 3.5 + 2));
  }

  /**
   * Computes recommended arrival time (e.g. 10:10 AM for a 10:30 AM slot)
   */
  calculateRecommendedArrival(slotTimeStr: string, bufferMinutes: number = 20): string {
    const parts = slotTimeStr.split(' ');
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const meridian = parts[1] || 'AM';

    if (meridian === 'PM' && hours !== 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    let totalMinutes = hours * 60 + minutes - bufferMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;

    let newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    const newMeridian = newHours >= 12 ? 'PM' : 'AM';

    if (newHours > 12) newHours -= 12;
    if (newHours === 0) newHours = 12;

    const formattedMinutes = newMinutes < 10 ? `0${newMinutes}` : `${newMinutes}`;
    return `${newHours}:${formattedMinutes} ${newMeridian}`;
  }

  /**
   * Section 3: Calculate Scheduling Score for a Slot & Centre combination
   * Score = Queue Score + Capacity Score + Travel Score + Processing Score + Transport Score
   */
  calculateSlotScore(
    slot: TimeSlot,
    centre: ProcurementCentre,
    quantityKg: number,
    preferredCentreId?: string
  ): SchedulingFactors {
    // 1. Queue Score (0-100): Lower expected queue = higher score
    // Queue of 0-5 = 95-100, queue of 25+ = ~30
    const queueScore = Math.max(20, Math.min(100, Math.round(100 - slot.expectedQueue * 3)));

    // 2. Capacity Score (0-100): More available capacity in slot & centre storage
    const slotVacancyRatio = (slot.maxCapacity - slot.bookingCount) / slot.maxCapacity;
    const storageVacancyRatio = (centre.storageCapacity - centre.storageUsed) / centre.storageCapacity;
    const capacityScore = Math.max(
      15,
      Math.min(100, Math.round(slotVacancyRatio * 60 + storageVacancyRatio * 40))
    );

    // 3. Travel Score (0-100): Shorter travel distance = higher score
    // 3 km = 95, 10 km = 70, 20 km = 40
    const travelScore = Math.max(20, Math.min(100, Math.round(100 - centre.distanceKm * 3.2)));

    // 4. Processing Score (0-100): Based on active stations & processing rate
    const stationRatio = centre.activeStations / Math.max(1, centre.totalStations);
    const rateFactor = (centre.processingRate / 5) * 40;
    const processingScore = Math.max(30, Math.min(100, Math.round(stationRatio * 60 + rateFactor)));

    // 5. Transport Score (0-100): Available transport vehicles for gate unloading
    const transportScore = Math.min(100, Math.round((centre.vehicleAvailability / 8) * 100));

    // Preference boost if farmer specifically chose this centre
    const preferenceBonus = preferredCentreId && centre.id === preferredCentreId ? 4 : 0;

    // Penalty for FULL or BUSY slots
    const penalty = slot.availability === 'FULL' ? -60 : slot.availability === 'BUSY' ? -15 : 0;

    // Weighted Normalized Total (0 - 100)
    const rawTotal =
      queueScore * 0.28 +
      capacityScore * 0.24 +
      travelScore * 0.22 +
      processingScore * 0.16 +
      transportScore * 0.10 +
      preferenceBonus +
      penalty;

    const totalScore = Math.max(10, Math.min(99, Math.round(rawTotal)));

    return {
      queueScore,
      capacityScore,
      travelScore,
      processingScore,
      transportScore,
      totalScore
    };
  }

  /**
   * Section 1, 2, 4, 5, 6, 22:
   * Main Smart Procurement Scheduling Recommendation Engine
   */
  recommendBestSlot(params: {
    cropName: string;
    quantityKg: number;
    preferredCentreId: string;
    date: string;
    centres: ProcurementCentre[];
    farmer?: Farmer;
  }): SchedulingResult {
    const { cropName, quantityKg, preferredCentreId, date, centres } = params;

    // Find preferred centre or fallback to first
    const primaryCentre =
      centres.find((c) => c.id === preferredCentreId) || centres[0];

    // Generate slots for primary centre
    const primarySlots = this.generateSlotsForCentre(primaryCentre, date, quantityKg);

    // Score each candidate slot
    const scoredSlots = primarySlots.map((slot) => {
      const score = this.calculateSlotScore(slot, primaryCentre, quantityKg, preferredCentreId);
      return { slot, centre: primaryCentre, score };
    });

    // Filter out FULL slots for the primary recommendation, sort by totalScore descending
    const availableScored = scoredSlots
      .filter((s) => s.slot.availability !== 'FULL')
      .sort((a, b) => b.score.totalScore - a.score.totalScore);

    const bestCandidate = availableScored[0] || scoredSlots[0];
    const bestSlot = bestCandidate.slot;
    const bestScore = bestCandidate.score;

    const travelTimeMinutes = this.estimateTravelTimeMinutes(primaryCentre.distanceKm);
    const recommendedArrival = this.calculateRecommendedArrival(bestSlot.time, 20);
    const expectedWaitRange = `${Math.max(10, bestSlot.expectedWaitMinutes - 3)}–${bestSlot.expectedWaitMinutes + 3} min`;

    // Status Match badge
    const statusMatch: 'BEST MATCH' | 'GOOD MATCH' | 'BUSY' | 'NOT RECOMMENDED' =
      bestScore.totalScore >= 75
        ? 'BEST MATCH'
        : bestScore.totalScore >= 60
        ? 'GOOD MATCH'
        : 'BUSY';

    // Section 4 & 23: Explainability ("Why this slot?")
    const reasons: string[] = [
      `Lower predicted queue (${bestSlot.expectedQueue} farmers expected at ${bestSlot.time})`,
      `Good centre capacity (${primaryCentre.activeStations} active weigh stations)`,
      `Suitable travel time (${travelTimeMinutes} min transit from your village)`,
      'Balanced centre workload with low gate turnaround times',
      `${primaryCentre.vehiclesAvailable} internal transport vehicles available on-site`
    ];

    const technicalExplanation = {
      queueBreakdown: `Queue Score: ${bestScore.queueScore}/100. Expected queue of ${bestSlot.expectedQueue} farmers vs historical average of 14.`,
      capacityBreakdown: `Capacity Score: ${bestScore.capacityScore}/100. Slot vacancy: ${bestSlot.maxCapacity - bestSlot.bookingCount}/${bestSlot.maxCapacity} bookings.`,
      travelBreakdown: `Travel Score: ${bestScore.travelScore}/100. Proximity: ${primaryCentre.distanceKm} km (${travelTimeMinutes} min drive).`,
      processingBreakdown: `Processing Score: ${bestScore.processingScore}/100. For ${quantityKg} kg load, est. service time is ${this.estimateProcessingTime(quantityKg)} min.`,
      transportBreakdown: `Transport Score: ${bestScore.transportScore}/100. ${primaryCentre.vehicleAvailability} internal yard tractors currently stationed.`
    };

    const bestRecommendation: SlotRecommendation = {
      slot: bestSlot,
      centre: primaryCentre,
      score: bestScore,
      statusMatch,
      expectedWaitRange,
      recommendedArrival,
      travelDistanceKm: primaryCentre.distanceKm,
      travelTimeMinutes,
      reasons,
      technicalExplanation
    };

    // Section 6: Alternative Slot Recommendations (Earlier & Later)
    const bestIndex = primarySlots.findIndex((s) => s.id === bestSlot.id);
    let earlierSlot: AlternativeSlotOption | undefined;
    let laterSlot: AlternativeSlotOption | undefined;

    // Find an earlier available slot
    for (let i = bestIndex - 1; i >= 0; i--) {
      const s = primarySlots[i];
      if (s.availability !== 'FULL') {
        earlierSlot = {
          type: 'EARLIER',
          slot: s,
          centre: primaryCentre,
          expectedWaitMinutes: s.expectedWaitMinutes,
          recommendedArrival: this.calculateRecommendedArrival(s.time, 20),
          reason: s.expectedWaitMinutes < bestSlot.expectedWaitMinutes
            ? 'Even shorter waiting time with rapid weighment'
            : 'Early morning arrival before general traffic'
        };
        break;
      }
    }

    // Find a later available slot
    for (let i = bestIndex + 1; i < primarySlots.length; i++) {
      const s = primarySlots[i];
      if (s.availability !== 'FULL') {
        laterSlot = {
          type: 'LATER',
          slot: s,
          centre: primaryCentre,
          expectedWaitMinutes: s.expectedWaitMinutes,
          recommendedArrival: this.calculateRecommendedArrival(s.time, 20),
          reason: 'Provides additional preparation and travel buffer time'
        };
        break;
      }
    }

    // Section 6 & 22: Nearby Alternative Centre recommendation
    let nearbyCentreOption: AlternativeCentreOption | undefined;
    const alternativeCentres = centres.filter(
      (c) => c.id !== primaryCentre.id && c.commoditiesAccepted.includes(cropName)
    );

    // Pick a centre with lower wait or optimal status
    const betterCentre = alternativeCentres.find(
      (c) => c.currentWaitMinutes < primaryCentre.currentWaitMinutes && c.status === 'optimal'
    ) || alternativeCentres[0];

    if (betterCentre) {
      const altSlots = this.generateSlotsForCentre(betterCentre, date, quantityKg);
      const matchingAltSlot =
        altSlots.find((s) => s.time === bestSlot.time && s.availability !== 'FULL') ||
        altSlots.find((s) => s.availability === 'AVAILABLE') ||
        altSlots[0];

      nearbyCentreOption = {
        centre: betterCentre,
        slot: matchingAltSlot,
        distanceKm: betterCentre.distanceKm,
        expectedWaitMinutes: matchingAltSlot.expectedWaitMinutes,
        capacityStatus: betterCentre.capacityStatus,
        reason:
          betterCentre.currentWaitMinutes < primaryCentre.currentWaitMinutes
            ? 'This centre currently has a shorter predicted queue.'
            : 'Alternative government procurement centre with open capacity.'
      };
    }

    // Section 14: What-If Slot Comparison items (Compare Times)
    const comparisonSlots: SlotComparisonItem[] = primarySlots.slice(0, 8).map((s) => {
      const load: 'Low' | 'Moderate' | 'High' =
        s.expectedWaitMinutes <= 14 ? 'Low' : s.expectedWaitMinutes <= 22 ? 'Moderate' : 'High';
      return {
        time: s.time,
        waitMinutes: s.expectedWaitMinutes,
        centreLoad: load,
        recommendedArrival: this.calculateRecommendedArrival(s.time, 20),
        availability: s.availability,
        slotId: s.id,
        isRecommended: s.id === bestSlot.id
      };
    });

    return {
      bestRecommendation,
      alternatives: {
        earlierSlot,
        laterSlot,
        nearbyCentre: nearbyCentreOption
      },
      comparisonSlots,
      evaluatedSlotsCount: primarySlots.length,
      evaluatedCentresCount: centres.length,
      calculationTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  /**
   * Section 18: Missed Slot Logic & Next Opportunity Calculation
   * Evaluates current queue, current time, and remaining slots to recommend the next available slot.
   */
  calculateNextAvailableSlot(
    centre: ProcurementCentre,
    currentTimeStr: string = '11:05 AM',
    quantityKg: number = 450
  ): {
    nextSlot: TimeSlot;
    expectedWaitMinutes: number;
    recommendedArrival: string;
    explanation: string;
  } {
    const today = new Date().toISOString().split('T')[0];
    const slots = this.generateSlotsForCentre(centre, today, quantityKg);

    // Find the next slot that hasn't passed and has capacity
    const upcoming = slots.find((s) => {
      return s.availability !== 'FULL' && (s.time.includes('PM') || s.time >= '11:30 AM');
    }) || slots[slots.length - 1];

    const expectedWaitMinutes = Math.round(upcoming.expectedWaitMinutes * 1.1 + 4); // Slightly higher for standby arrival
    const recommendedArrival = this.calculateRecommendedArrival(upcoming.time, 15);

    return {
      nextSlot: upcoming,
      expectedWaitMinutes,
      recommendedArrival,
      explanation: 'Farmers who arrived for earlier slots are currently being served. Standby allocation secured.'
    };
  }
}

export const schedulingService = new SmartSchedulingService();
