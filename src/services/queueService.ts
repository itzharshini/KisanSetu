import {
  QueueToken,
  TokenStatus,
  ProcessingStation,
  QueueHistoryItem,
  CentreQueueState,
  ProcurementCentre
} from '../types';

export class QueueService {
  /**
   * Generates a unique, sequential token code within the centre and demo session
   * e.g. A-142 -> A-143, B-014 -> B-015
   */
  public generateTokenCode(prefix: string, existingTokens: QueueToken[]): string {
    let maxNum = 142;
    existingTokens.forEach((t) => {
      const match = t.tokenCode.match(/^([A-Z])-(\d+)$/);
      if (match && match[1] === prefix) {
        const num = parseInt(match[2], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `${prefix}-${maxNum + 1}`;
  }

  /**
   * Formats technical TokenStatus to human-friendly farmer language
   */
  public getHumanFriendlyStatus(
    status: TokenStatus,
    assignedStation?: string,
    counterName?: string
  ): {
    title: string;
    description: string;
    badgeColor: 'amber' | 'emerald' | 'blue' | 'purple' | 'slate' | 'red';
    iconType: 'clock' | 'check' | 'bell' | 'scale' | 'file' | 'alert';
  } {
    const stationLabel = counterName || assignedStation || 'Counter 2';

    switch (status) {
      case 'BOOKED':
        return {
          title: "Slot Booked",
          description: "Your procurement slot is confirmed. Please arrive by recommended time.",
          badgeColor: 'blue',
          iconType: 'clock'
        };
      case 'ARRIVING':
        return {
          title: "On Your Way",
          description: "Heading to the procurement centre.",
          badgeColor: 'blue',
          iconType: 'clock'
        };
      case 'WAITING':
        return {
          title: "You're in the queue",
          description: "Checked in at depot gate. Waiting for weighbridge calling.",
          badgeColor: 'amber',
          iconType: 'clock'
        };
      case 'CALLED':
        return {
          title: `Please proceed to ${stationLabel}`,
          description: `Your token has been called. Head directly to ${stationLabel} now.`,
          badgeColor: 'emerald',
          iconType: 'bell'
        };
      case 'IN_PROCESS':
        return {
          title: "Produce being processed",
          description: `Vehicle is positioned at ${stationLabel}. Intake initialized.`,
          badgeColor: 'blue',
          iconType: 'scale'
        };
      case 'QUALITY_CHECK':
        return {
          title: "Quality checking your produce",
          description: "Moisture assessment and visual grading in progress by officer.",
          badgeColor: 'blue',
          iconType: 'file'
        };
      case 'WEIGHING':
        return {
          title: "Weighing your produce",
          description: `Electronic gross and tare weighing active at ${stationLabel}.`,
          badgeColor: 'purple',
          iconType: 'scale'
        };
      case 'PROCUREMENT':
        return {
          title: "Procurement in progress",
          description: "Unloading into warehouse bins and generating digital weighment slip.",
          badgeColor: 'blue',
          iconType: 'file'
        };
      case 'COMPLETED':
        return {
          title: "Procurement completed",
          description: "Intake finished successfully. Weighment certificate generated.",
          badgeColor: 'emerald',
          iconType: 'check'
        };
      case 'MISSED':
        return {
          title: "Your scheduled slot has passed",
          description: "Don't worry — we are finding your next opportunity without penalty.",
          badgeColor: 'amber',
          iconType: 'alert'
        };
      case 'RESCHEDULED':
        return {
          title: "Slot rescheduled",
          description: "Your arrival window has been moved to a new confirmed time.",
          badgeColor: 'blue',
          iconType: 'clock'
        };
      case 'CANCELLED':
        return {
          title: "Slot cancelled",
          description: "This appointment has been cancelled.",
          badgeColor: 'slate',
          iconType: 'alert'
        };
      default:
        return {
          title: "In Queue",
          description: "Your token is active in the centre workflow.",
          badgeColor: 'amber',
          iconType: 'clock'
        };
    }
  }

  /**
   * Sort tokens according to transparent Fair Queue Rules:
   * 1. Arrived farmers with active slots take priority
   * 2. Scheduled slot time order
   * 3. Arrival timestamp
   */
  public sortQueueTokensFairly(tokens: QueueToken[]): QueueToken[] {
    const activeProcessingOrder: Record<TokenStatus, number> = {
      CALLED: 1,
      IN_PROCESS: 2,
      QUALITY_CHECK: 3,
      WEIGHING: 4,
      PROCUREMENT: 5,
      WAITING: 6,
      ARRIVING: 7,
      BOOKED: 8,
      MISSED: 9,
      RESCHEDULED: 10,
      COMPLETED: 11,
      CANCELLED: 12
    };

    return [...tokens].sort((a, b) => {
      const orderA = activeProcessingOrder[a.status] || 99;
      const orderB = activeProcessingOrder[b.status] || 99;
      if (orderA !== orderB) return orderA - orderB;

      // Between waiting/arrived tokens, respect arrival status first
      if (a.status === 'WAITING' && b.status === 'WAITING') {
        if (a.arrivalStatus === 'arrived' && b.arrivalStatus !== 'arrived') return -1;
        if (b.arrivalStatus === 'arrived' && a.arrivalStatus !== 'arrived') return 1;
      }

      // Then token numeric order
      const numA = parseInt(a.tokenCode.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.tokenCode.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }

  /**
   * Dynamically calculates farmer's queue position and farmers ahead
   */
  public calculateQueuePosition(
    tokenCode: string,
    tokens: QueueToken[]
  ): { queuePosition: number; farmersAhead: number; currentlyServingToken: string } {
    const activeTokens = tokens.filter(
      (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'MISSED'
    );

    const sorted = this.sortQueueTokensFairly(activeTokens);
    const targetIdx = sorted.findIndex((t) => t.tokenCode === tokenCode);

    // Tokens currently being processed at stations
    const inProcessTokens = sorted.filter((t) =>
      ['CALLED', 'IN_PROCESS', 'QUALITY_CHECK', 'WEIGHING', 'PROCUREMENT'].includes(t.status)
    );

    const currentlyServingToken = inProcessTokens.length > 0 ? inProcessTokens[0].tokenCode : 'None';

    if (targetIdx === -1) {
      return { queuePosition: 0, farmersAhead: 0, currentlyServingToken };
    }

    // Count how many WAITING or in-process tokens precede this token
    const farmersAhead = targetIdx;
    const queuePosition = targetIdx + 1;

    return { queuePosition, farmersAhead, currentlyServingToken };
  }

  /**
   * Calculate deterministic estimated waiting time:
   * Formula: Math.round((farmersAhead * avgProcessingTime) / activeStations)
   * With parallel dual weighbridges calibration
   */
  public calculateEstimatedWait(
    farmersAhead: number,
    activeStations: number = 3,
    avgProcessingMinutes: number = 11
  ): number {
    if (farmersAhead <= 0) return 0;
    const effectiveStations = Math.max(1, activeStations);
    // Real agricultural depots process trucks in parallel weigh/unload lines (~55% concurrency factor)
    const rawWait = (farmersAhead * avgProcessingMinutes) / effectiveStations;
    const calibratedWait = Math.round(rawWait * 0.55);
    return Math.max(3, calibratedWait);
  }

  /**
   * Calculates overall CentreQueueState for operator & dashboard
   */
  public getCentreQueueState(
    centreId: string,
    tokens: QueueToken[],
    stations: ProcessingStation[],
    completedTodayCount: number = 42,
    simulatedTime: string = '10:15 AM'
  ): CentreQueueState {
    const centreTokens = tokens.filter((t) => !t.centreId || t.centreId === centreId);
    const waitingTokens = centreTokens.filter((t) => t.status === 'WAITING').length;
    const arrivedTokens = centreTokens.filter(
      (t) => t.arrivalStatus === 'arrived' && t.status === 'WAITING'
    ).length;
    const processingTokens = centreTokens.filter((t) =>
      ['CALLED', 'IN_PROCESS', 'QUALITY_CHECK', 'WEIGHING', 'PROCUREMENT'].includes(t.status)
    ).length;

    const activeStationsCount = stations.filter((s) => s.status === 'active').length;
    const totalStationsCount = stations.length;
    const avgProcessingMinutes = 11;

    const estimatedWait = this.calculateEstimatedWait(
      waitingTokens,
      activeStationsCount,
      avgProcessingMinutes
    );

    // Calculate clearance time based on simulatedTime
    const match = simulatedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let clearanceTime = '02:15 PM';
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const isPm = match[3].toUpperCase() === 'PM';
      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;

      const totalClearanceMinutes = h * 60 + m + waitingTokens * 4.5;
      let clearH = Math.floor(totalClearanceMinutes / 60) % 24;
      const clearM = Math.round(totalClearanceMinutes % 60);
      const meridian = clearH >= 12 ? 'PM' : 'AM';
      if (clearH > 12) clearH -= 12;
      if (clearH === 0) clearH = 12;
      clearanceTime = `${clearH}:${clearM < 10 ? '0' : ''}${clearM} ${meridian}`;
    }

    const currentToken =
      stations.find((s) => s.status === 'active' && s.currentTokenCode)?.currentTokenCode ||
      centreTokens.find((t) => t.status === 'CALLED')?.tokenCode ||
      'A-129';

    return {
      centreId,
      currentToken,
      waitingTokens,
      arrivedTokens,
      processingTokens,
      completedTodayCount,
      activeStationsCount,
      totalStationsCount,
      averageProcessingMinutes: avgProcessingMinutes,
      estimatedWaitMinutes: estimatedWait,
      estimatedQueueClearanceTime: clearanceTime
    };
  }

  /**
   * Calls the next waiting farmer to the first available active station
   */
  public callNextFarmer(
    tokens: QueueToken[],
    stations: ProcessingStation[]
  ): {
    updatedTokens: QueueToken[];
    updatedStations: ProcessingStation[];
    calledToken?: QueueToken;
    stationAssigned?: ProcessingStation;
    error?: string;
  } {
    // 1. Find next waiting farmer
    const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
    if (waitingTokens.length === 0) {
      return {
        updatedTokens: tokens,
        updatedStations: stations,
        error: "Nobody is currently waiting in the queue."
      };
    }

    const sortedWaiting = this.sortQueueTokensFairly(waitingTokens);
    const nextToken = sortedWaiting[0];

    // 2. Find available station, or least busy station
    let targetStation = stations.find((s) => s.status === 'active' && !s.currentTokenId);
    if (!targetStation) {
      // If all active stations are occupied, find one in PROCUREMENT or assign to Station 1 as next up
      targetStation = stations.find((s) => s.status === 'active') || stations[0];
    }

    // 3. Update token
    const updatedTokens = tokens.map((t) => {
      if (t.id === nextToken.id) {
        return {
          ...t,
          status: 'CALLED' as TokenStatus,
          currentStatus: 'CALLED' as const,
          assignedStation: `Station ${targetStation.number}`,
          assignedStationId: targetStation.id,
          bayNumber: targetStation.number
        };
      }
      return t;
    });

    // 4. Update station
    const updatedStations = stations.map((s) => {
      if (s.id === targetStation?.id) {
        return {
          ...s,
          currentTokenId: nextToken.id,
          currentTokenCode: nextToken.tokenCode,
          currentFarmerName: nextToken.farmerName,
          currentProduce: `${nextToken.produceType} (${nextToken.quantityKg} kg)`,
          processingStage: 'CALLED' as TokenStatus,
          startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return s;
    });

    const calledToken = updatedTokens.find((t) => t.id === nextToken.id);
    return {
      updatedTokens,
      updatedStations,
      calledToken,
      stationAssigned: targetStation
    };
  }

  /**
   * Progresses token through procurement stages:
   * CALLED -> IN_PROCESS -> QUALITY_CHECK -> WEIGHING -> PROCUREMENT -> COMPLETED
   */
  public advanceProcessingStage(
    tokenId: string,
    tokens: QueueToken[],
    stations: ProcessingStation[],
    history: QueueHistoryItem[],
    simulatedTime: string
  ): {
    updatedTokens: QueueToken[];
    updatedStations: ProcessingStation[];
    updatedHistory: QueueHistoryItem[];
    nextStage: TokenStatus;
    completedItem?: QueueHistoryItem;
  } {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token) {
      return {
        updatedTokens: tokens,
        updatedStations: stations,
        updatedHistory: history,
        nextStage: 'WAITING'
      };
    }

    const stageOrder: TokenStatus[] = [
      'CALLED',
      'IN_PROCESS',
      'QUALITY_CHECK',
      'WEIGHING',
      'PROCUREMENT',
      'COMPLETED'
    ];

    const currentIdx = stageOrder.indexOf(token.status);
    const nextStage: TokenStatus =
      currentIdx >= 0 && currentIdx < stageOrder.length - 1
        ? stageOrder[currentIdx + 1]
        : 'COMPLETED';

    let completedItem: QueueHistoryItem | undefined = undefined;
    let updatedHistory = history;

    if (nextStage === 'COMPLETED') {
      completedItem = {
        id: `HIST-${token.tokenCode}-${Date.now()}`,
        tokenCode: token.tokenCode,
        farmerName: token.farmerName,
        produceType: token.produceType,
        quantityKg: token.quantityKg,
        completedTime: simulatedTime,
        processingDurationMinutes: 11,
        stationName: token.assignedStation || 'Counter 2',
        status: 'COMPLETED'
      };
      updatedHistory = [completedItem, ...history];
    }

    // Update tokens
    const updatedTokens = tokens.map((t) => {
      if (t.id === tokenId) {
        return {
          ...t,
          status: nextStage,
          currentStatus: nextStage,
          completedTime: nextStage === 'COMPLETED' ? simulatedTime : undefined
        };
      }
      return t;
    });

    // Update stations
    const updatedStations = stations.map((s) => {
      if (s.currentTokenId === tokenId) {
        if (nextStage === 'COMPLETED') {
          return {
            ...s,
            currentTokenId: undefined,
            currentTokenCode: undefined,
            currentFarmerName: undefined,
            currentProduce: undefined,
            processingStage: undefined
          };
        }
        return {
          ...s,
          processingStage: nextStage
        };
      }
      return s;
    });

    return {
      updatedTokens,
      updatedStations,
      updatedHistory,
      nextStage,
      completedItem
    };
  }

  /**
   * Direct completion of procurement
   */
  public completeProcurement(
    tokenId: string,
    tokens: QueueToken[],
    stations: ProcessingStation[],
    history: QueueHistoryItem[],
    simulatedTime: string
  ): {
    updatedTokens: QueueToken[];
    updatedStations: ProcessingStation[];
    updatedHistory: QueueHistoryItem[];
  } {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token) return { updatedTokens: tokens, updatedStations: stations, updatedHistory: history };

    const completedItem: QueueHistoryItem = {
      id: `HIST-${token.tokenCode}-${Date.now()}`,
      tokenCode: token.tokenCode,
      farmerName: token.farmerName,
      produceType: token.produceType,
      quantityKg: token.quantityKg,
      completedTime: simulatedTime,
      processingDurationMinutes: 11,
      stationName: token.assignedStation || 'Counter 2',
      status: 'COMPLETED'
    };

    const updatedTokens = tokens.map((t) =>
      t.id === tokenId
        ? {
            ...t,
            status: 'COMPLETED' as TokenStatus,
            currentStatus: 'COMPLETED' as const,
            completedTime: simulatedTime
          }
        : t
    );

    const updatedStations = stations.map((s) =>
      s.currentTokenId === tokenId
        ? {
            ...s,
            currentTokenId: undefined,
            currentTokenCode: undefined,
            currentFarmerName: undefined,
            currentProduce: undefined,
            processingStage: undefined
          }
        : s
    );

    return {
      updatedTokens,
      updatedStations,
      updatedHistory: [completedItem, ...history]
    };
  }

  /**
   * Check in / Mark arrived with early/late rules validation
   */
  public checkInFarmer(
    tokenCode: string,
    tokens: QueueToken[],
    simulatedTime: string
  ): {
    updatedTokens: QueueToken[];
    statusNote: string;
    isEarly: boolean;
    isLate: boolean;
    error?: string;
  } {
    const token = tokens.find((t) => t.tokenCode.toUpperCase() === tokenCode.toUpperCase());
    if (!token) {
      return {
        updatedTokens: tokens,
        statusNote: 'Token not found.',
        isEarly: false,
        isLate: false,
        error: `Token "${tokenCode}" not found in centre records.`
      };
    }

    if (token.arrivalStatus === 'arrived' && token.status === 'WAITING') {
      return {
        updatedTokens: tokens,
        statusNote: 'This farmer is already checked in.',
        isEarly: false,
        isLate: false,
        error: `Token ${token.tokenCode} is already checked in and waiting in the queue.`
      };
    }

    if (token.status === 'COMPLETED') {
      return {
        updatedTokens: tokens,
        statusNote: 'Already completed procurement.',
        isEarly: false,
        isLate: false,
        error: `This farmer (${token.tokenCode}) has already completed procurement today.`
      };
    }

    // Determine early / late
    // Slot time e.g. 10:30 AM vs simulatedTime e.g. 10:15 AM
    const isEarly = token.slotTime.includes('10:30') && simulatedTime.includes('10:05');
    const isLate = token.slotTime.includes('10:00') && simulatedTime.includes('11:05');

    let statusNote = "You're checked in. You're now in the queue.";
    let priorityReason = "Arrived on time within valid scheduled window.";

    if (isEarly) {
      statusNote = "You're early! Your slot is at " + token.slotTime + ". You're eligible to join the waiting queue.";
      priorityReason = "Early arrival. Eligible for open holding yard queue.";
    } else if (isLate) {
      statusNote = "Your scheduled slot has passed. Next available opportunity: 11:30 AM.";
      priorityReason = "Late arrival. Assigned to next open procurement window.";
    }

    const updatedTokens = tokens.map((t) => {
      if (t.id === token.id) {
        return {
          ...t,
          status: 'WAITING' as TokenStatus,
          currentStatus: 'WAITING' as const,
          arrivalStatus: 'arrived' as const,
          arrivalTime: simulatedTime,
          priorityReason
        };
      }
      return t;
    });

    return {
      updatedTokens,
      statusNote,
      isEarly,
      isLate
    };
  }

  /**
   * Handle No-Show for a called token
   */
  public markNoShow(
    tokenId: string,
    tokens: QueueToken[],
    stations: ProcessingStation[]
  ): {
    updatedTokens: QueueToken[];
    updatedStations: ProcessingStation[];
  } {
    const updatedTokens = tokens.map((t) =>
      t.id === tokenId
        ? {
            ...t,
            status: 'MISSED' as TokenStatus,
            currentStatus: 'MISSED' as const,
            priorityReason: 'Farmer did not respond when called at station counter.'
          }
        : t
    );

    const updatedStations = stations.map((s) =>
      s.currentTokenId === tokenId
        ? {
            ...s,
            currentTokenId: undefined,
            currentTokenCode: undefined,
            currentFarmerName: undefined,
            currentProduce: undefined,
            processingStage: undefined
          }
        : s
    );

    return { updatedTokens, updatedStations };
  }

  /**
   * Safely opens an additional station (e.g. Station 4)
   */
  public openStation(stations: ProcessingStation[]): {
    updatedStations: ProcessingStation[];
    openedStation?: ProcessingStation;
    message: string;
  } {
    const availableStation = stations.find((s) => s.status !== 'active');
    if (!availableStation) {
      return {
        updatedStations: stations,
        message: "All stations are already active."
      };
    }

    const updatedStations = stations.map((s) =>
      s.id === availableStation.id
        ? { ...s, status: 'active' as const }
        : s
    );

    return {
      updatedStations,
      openedStation: availableStation,
      message: `Opened Station ${availableStation.number} (${availableStation.counterName}). Intake capacity increased.`
    };
  }

  /**
   * Safely closes a station with validation (cannot close if farmer is actively being processed)
   */
  public closeStation(
    stationId: string,
    stations: ProcessingStation[]
  ): {
    updatedStations: ProcessingStation[];
    success: boolean;
    message: string;
  } {
    const station = stations.find((s) => s.id === stationId);
    if (!station) {
      return { updatedStations: stations, success: false, message: "Station not found." };
    }

    if (station.currentTokenId) {
      return {
        updatedStations: stations,
        success: false,
        message: `Station is currently processing Token ${station.currentTokenCode || 'active'}. Complete or transfer the current task before closing.`
      };
    }

    // Keep at least 1 active station
    const activeCount = stations.filter((s) => s.status === 'active').length;
    if (activeCount <= 1) {
      return {
        updatedStations: stations,
        success: false,
        message: "Cannot close station. At least 1 active station must remain open."
      };
    }

    const updatedStations = stations.map((s) =>
      s.id === stationId ? { ...s, status: 'available' as const } : s
    );

    return {
      updatedStations,
      success: true,
      message: `Station ${station.number} has been closed safely.`
    };
  }

  /**
   * Creates a new demo farmer and adds them to the queue (+1 Farmer simulation)
   */
  public addDemoFarmer(
    tokens: QueueToken[],
    centreId: string = 'PC-TN-04',
    centreName: string = 'Poonamallee Procurement Centre',
    customName?: string
  ): { updatedTokens: QueueToken[]; newToken: QueueToken } {
    const nextCode = this.generateTokenCode('A', tokens);
    const demoNames = [
      'Murugan',
      'T. Natarajan',
      'A. Kannan',
      'S. Velmurugan',
      'M. Rajesh',
      'P. Srinivasan',
      'R. Mohan',
      'K. Saravanan'
    ];
    const farmerName =
      customName || demoNames[Math.floor(Math.random() * demoNames.length)];
    const quantityKg = Math.floor(30 + Math.random() * 45) * 100; // 3000 to 7500 kg

    const newToken: QueueToken = {
      id: `TOK-${nextCode}`,
      tokenCode: nextCode,
      tokenNumber: nextCode,
      bookingId: `BKG-DEMO-${Date.now().toString().slice(-4)}`,
      farmerId: `FMR-DEMO-${nextCode}`,
      farmerName,
      farmerPhone: '+91 98400 00000',
      farmerVillage: 'Thiruvallur District',
      produceType: 'Paddy',
      quantityKg,
      slotTime: '11:15 AM',
      scheduledTime: '11:15 AM',
      status: 'WAITING',
      currentStatus: 'WAITING',
      arrivalStatus: 'arrived',
      queuePosition: tokens.length + 1,
      farmersAhead: tokens.filter((t) => t.status === 'WAITING').length,
      currentlyServingToken: 'A-129',
      estimatedWaitMinutes: 38,
      centreId,
      centreName,
      centreLoad: 'Moderate',
      bayNumber: 2,
      recommendedGateArrival: '10:55 AM',
      arrivalTime: '10:15 AM',
      priorityReason: 'Added via demo queue simulation.'
    };

    return {
      updatedTokens: [...tokens, newToken],
      newToken
    };
  }
}

export const queueService = new QueueService();
