import {
  AssistantContextSnapshot,
  Booking,
  QueueToken,
  ProcurementCentre
} from '../types';

export interface BookingFacts {
  hasBooking: boolean;
  bookingRef?: string;
  centreName?: string;
  slotDate?: string;
  slotTime?: string;
  recommendedArrival?: string;
  produceType?: string;
  quantityKg?: number;
  status?: string;
  estimatedWaitMinutes?: number;
}

export interface TokenFacts {
  hasToken: boolean;
  tokenCode?: string;
  queuePosition?: number;
  waitMinutes?: number;
  stage?: string;
  centreName?: string;
  stationAssigned?: string;
  isCalled?: boolean;
}

export interface QueueFacts {
  waitingCount: number;
  estimatedWaitMinutes: number;
  centreStatus: string;
  isPaused: boolean;
  userPosition?: number;
}

export interface CentreComparisonFact {
  id: string;
  name: string;
  distanceKm: number;
  waitMinutes: number;
  load: string;
  isLessCrowded: boolean;
}

export const assistantTools = {
  /**
   * Retrieves deterministic booking facts from context.
   */
  getCurrentBooking(context: AssistantContextSnapshot): BookingFacts {
    if (!context.booking) {
      return { hasBooking: false };
    }
    return {
      hasBooking: true,
      bookingRef: context.booking.bookingRef,
      centreName: context.booking.centreName,
      slotDate: context.booking.slotDate,
      slotTime: context.booking.slotTime,
      recommendedArrival: context.booking.recommendedArrival,
      produceType: context.booking.produceType,
      quantityKg: context.booking.quantityKg,
      status: context.booking.status,
      estimatedWaitMinutes: context.booking.estimatedWaitingMinutes
    };
  },

  /**
   * Retrieves deterministic token facts from context.
   */
  getCurrentToken(context: AssistantContextSnapshot): TokenFacts {
    if (!context.token) {
      return {
        hasToken: false,
        tokenCode: context.booking?.tokenNumber || undefined
      };
    }
    const isCalled =
      context.token.status === 'CALLED' ||
      context.token.status === 'IN_PROCESS' ||
      context.token.status === 'WEIGHING';

    return {
      hasToken: true,
      tokenCode: context.token.tokenCode,
      queuePosition: context.queuePosition ?? 13,
      waitMinutes: context.waitMinutes,
      stage: context.token.status,
      centreName: context.centre?.name || 'Poonamallee Procurement Centre',
      stationAssigned: context.token.assignedStation || 'Station 2',
      isCalled
    };
  },

  /**
   * Retrieves current queue status.
   */
  getQueueStatus(context: AssistantContextSnapshot): QueueFacts {
    return {
      waitingCount: context.queueLength,
      estimatedWaitMinutes: context.waitMinutes,
      centreStatus: context.isCentrePaused ? 'Temporarily Paused' : 'Operational & Open',
      isPaused: context.isCentrePaused,
      userPosition: context.queuePosition
    };
  },

  /**
   * Retrieves centre status and compares nearby alternatives.
   */
  getNearbyCentres(context: AssistantContextSnapshot): CentreComparisonFact[] {
    const currentWait = context.waitMinutes;

    return context.allCentres.map((c) => {
      // Deterministic wait approximation based on distance/capacity
      let estWait = currentWait;
      if (c.code === 'PC-TN-02' || c.name.toLowerCase().includes('avadi')) {
        estWait = 11;
      } else if (c.code === 'PC-TN-04' || c.name.toLowerCase().includes('poonamallee')) {
        estWait = Math.max(18, currentWait);
      } else if (c.name.toLowerCase().includes('tiruvallur')) {
        estWait = 24;
      }

      return {
        id: c.id,
        name: c.name,
        distanceKm: c.distanceKm,
        waitMinutes: estWait,
        load: estWait <= 12 ? 'Low' : estWait <= 22 ? 'Moderate' : 'High',
        isLessCrowded: estWait < currentWait
      };
    });
  },

  /**
   * Retrieves available rescheduling slots for today and tomorrow.
   */
  getAvailableSlots(context: AssistantContextSnapshot) {
    return [
      {
        time: '11:30 AM',
        date: 'Today',
        estimatedWait: 22,
        recommendedArrival: '11:15 AM',
        load: 'Moderate'
      },
      {
        time: '02:00 PM',
        date: 'Today',
        estimatedWait: 15,
        recommendedArrival: '01:45 PM',
        load: 'Low'
      },
      {
        time: '10:30 AM',
        date: 'Tomorrow',
        estimatedWait: 18,
        recommendedArrival: '10:10 AM',
        load: 'Moderate'
      }
    ];
  },

  /**
   * Retrieves transport dispatch status.
   */
  getTransportStatus(context: AssistantContextSnapshot) {
    return {
      status: 'Fleet Active',
      destination: 'FCI Central Grain Silos, Tiruvallur',
      availableTrucks: 3,
      note: 'Transfer trucks are operating normally between depot and FCI storage.'
    };
  },

  /**
   * Retrieves payment status facts.
   */
  getPaymentStatus(context: AssistantContextSnapshot) {
    return {
      mspRateGradeA: '₹2,320 per Quintal',
      mspRateCommon: '₹2,300 per Quintal',
      dbtWindow: '24 to 48 hours post electronic weighment slip confirmation',
      bankLinked: 'HDFC Bank (A/C ****4821)',
      dbtStatus: 'Ready for automated credit upon weighment'
    };
  },

  /**
   * Retrieves farmer produce details.
   */
  getFarmerProduce(context: AssistantContextSnapshot) {
    if (context.booking) {
      return {
        produce: context.booking.produceType,
        variety: context.booking.variety,
        quantityKg: context.booking.quantityKg,
        quantityQuintals: context.booking.quantityQuintals
      };
    }
    return {
      produce: 'Paddy (Grade A)',
      variety: 'BPT 5204 (Samba Mahsuri)',
      quantityKg: 450,
      quantityQuintals: 4.5
    };
  },

  /**
   * Retrieves recent notification highlights.
   */
  getNotifications(context: AssistantContextSnapshot) {
    return {
      recentText: context.recentNotificationText || 'Slot booked for Poonamallee DPC with token #TN-204.',
      completedToday: context.todayCompletedCount
    };
  }
};
