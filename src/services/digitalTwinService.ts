import {
  CentreZone,
  DigitalTwinZoneId,
  LoadingBayVehicle,
  CentreHealthScore,
  OperationalAlert,
  OperationalEvent,
  WhatIfScenarioConfig,
  WhatIfScenarioResult,
  ScenarioPresetKey,
  QueueToken,
  ProcessingStation
} from '../types';

export const INITIAL_LOADING_VEHICLES: LoadingBayVehicle[] = [
  {
    id: 'VEH-01',
    plateNumber: 'TN-38-AZ-1234',
    type: '10-Tonne Tipper Truck',
    status: 'Loading',
    capacityKg: 10000,
    currentLoadKg: 7200,
    destination: 'FCI Central Silo, Avadi',
    driverName: 'R. Soundararajan',
    bayNumber: 1
  },
  {
    id: 'VEH-02',
    plateNumber: 'TN-39-BD-4211',
    type: '12-Tonne Multi-Axle',
    status: 'Waiting',
    capacityKg: 12000,
    currentLoadKg: 0,
    destination: 'TNCSC Rice Mill, Kanchipuram',
    driverName: 'M. Kathirvel',
    bayNumber: 2
  },
  {
    id: 'VEH-03',
    plateNumber: 'TN-37-CX-8821',
    type: '8-Tonne Flatbed Carrier',
    status: 'Available',
    capacityKg: 8000,
    currentLoadKg: 0,
    destination: 'Civil Supplies Godown, Ambattur',
    driverName: 'V. Prakash',
    bayNumber: 3
  },
  {
    id: 'VEH-04',
    plateNumber: 'TN-41-EK-9032',
    type: '10-Tonne Tipper Truck',
    status: 'Departing',
    capacityKg: 10000,
    currentLoadKg: 9800,
    destination: 'TNCSC District Hub, Chengalpattu',
    driverName: 'S. Munusamy',
    bayNumber: 4
  }
];

export const INITIAL_OPERATIONAL_EVENTS: OperationalEvent[] = [
  {
    id: 'EVT-01',
    timestamp: '08:00 AM',
    type: 'CENTRE_RESUMED',
    title: 'Procurement Centre Opened',
    description: 'Bays 1 & 2 operational. Weighbridges calibrated at 07:45 AM.',
    badgeVariant: 'info'
  },
  {
    id: 'EVT-02',
    timestamp: '09:15 AM',
    type: 'STATION_OPENED',
    title: 'Station 3 Activated',
    description: 'Auxiliary weighbridge opened due to morning arrival surge.',
    stationName: 'Weighbridge Counter 3',
    badgeVariant: 'success'
  },
  {
    id: 'EVT-03',
    timestamp: '09:40 AM',
    type: 'VEHICLE_ARRIVED',
    title: 'Transport Truck Docked',
    description: 'TN-38-AZ-1234 docked at Loading Bay 1 for bulk grain evacuation.',
    badgeVariant: 'info'
  },
  {
    id: 'EVT-04',
    timestamp: '10:15 AM',
    type: 'WEIGHING_STARTED',
    title: 'Intake at Station 2',
    description: 'Token A-130 gross weighing underway (Produce: Paddy 450 kg).',
    tokenCode: 'A-130',
    stationName: 'Counter 2',
    badgeVariant: 'info'
  },
  {
    id: 'EVT-05',
    timestamp: '10:35 AM',
    type: 'STORAGE_UPDATED',
    title: 'Storage Utilization 68%',
    description: 'Warehouse holding 6,800 kg. Evacuation truck loading active.',
    badgeVariant: 'warning'
  }
];

export const digitalTwinService = {
  /**
   * Derive dynamic digital twin zones from the shared operational state.
   */
  getZones(
    tokens: QueueToken[],
    stations: ProcessingStation[],
    storageUsedKg: number,
    storageCapacityKg: number,
    vehicles: LoadingBayVehicle[],
    isPaused: boolean
  ): Record<DigitalTwinZoneId, CentreZone> {
    // Partition tokens by status/stage
    const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
    const calledTokens = tokens.filter((t) => t.status === 'CALLED');
    const qualityTokens = tokens.filter((t) => t.status === 'QUALITY_CHECK');
    const weighingTokens = tokens.filter((t) => t.status === 'WEIGHING');
    const procurementTokens = tokens.filter((t) => t.status === 'PROCUREMENT');
    const bookedTokens = tokens.filter((t) => t.arrivalStatus !== 'arrived' && t.status !== 'COMPLETED');
    const completedToday = tokens.filter((t) => t.status === 'COMPLETED');

    const storagePercent = Math.min(100, Math.round((storageUsedKg / storageCapacityKg) * 100));

    return {
      ENTRY: {
        id: 'ENTRY',
        name: 'Entry Gate & Inbound Lane',
        description: 'Security barrier, RFID barcode check-in, and tractor trolley queue entry',
        status: isPaused ? 'paused' : bookedTokens.length > 5 ? 'busy' : 'operational',
        capacity: 25,
        currentLoad: bookedTokens.length,
        occupancyPercent: Math.min(100, Math.round((bookedTokens.length / 25) * 100)),
        activeTokenCodes: bookedTokens.slice(0, 4).map((t) => t.tokenCode),
        details: {
          gateOfficer: 'Sub-Inspector M. Natarajan',
          inboundLanes: 'Lane 1 (Tractors), Lane 2 (Light Trucks)',
          barrierStatus: isPaused ? 'Held / Paused' : 'Automatic Open on Token'
        }
      },

      WAITING: {
        id: 'WAITING',
        name: 'Farmer Holding Yard',
        description: 'Designated shaded parking bays with live token display & public address',
        status: isPaused
          ? 'paused'
          : waitingTokens.length > 15
          ? 'critical'
          : waitingTokens.length > 8
          ? 'busy'
          : 'operational',
        capacity: 30,
        currentLoad: waitingTokens.length,
        occupancyPercent: Math.min(100, Math.round((waitingTokens.length / 30) * 100)),
        activeTokenCodes: waitingTokens.map((t) => t.tokenCode),
        details: {
          shadedBays: '30 Vehicle Capacity',
          facilities: 'Drinking Water, Digital Display Board, Resting Shed',
          pacingStatus: waitingTokens.length > 15 ? 'High Congestion' : 'Normal Flow'
        }
      },

      CHECK_IN: {
        id: 'CHECK_IN',
        name: 'Token Verification Desk',
        description: 'Gate pass barcode scanner & slot time matching kiosk',
        status: 'operational',
        capacity: 4,
        currentLoad: Math.min(4, Math.max(1, calledTokens.length)),
        occupancyPercent: Math.min(100, Math.round((calledTokens.length / 4) * 100)),
        activeTokenCodes: calledTokens.map((t) => t.tokenCode),
        details: {
          kioskType: 'Automated QR Scanner + Operator Desk',
          operator: 'Desk Officer K. Revathi'
        }
      },

      QUALITY: {
        id: 'QUALITY',
        name: 'Grain Quality & Moisture Lab',
        description: 'Electronic moisture meter, foreign matter sieve, and FAQ Grade grading',
        status: qualityTokens.length > 2 ? 'busy' : 'operational',
        capacity: 4,
        currentLoad: qualityTokens.length,
        occupancyPercent: Math.min(100, Math.round((qualityTokens.length / 4) * 100)),
        activeTokenCodes: qualityTokens.map((t) => t.tokenCode),
        details: {
          testApparatus: 'Digital Grain Moisture Meter #04 (Govt Calibrated)',
          standardMaxMoisture: '17.0%',
          labTechnician: 'Agronomist Dr. S. Annamalai'
        }
      },

      WEIGHING: {
        id: 'WEIGHING',
        name: 'Electronic Weighbridges (Bays 1–4)',
        description: 'Heavy duty pitless electronic weighbridges with digital tare memory',
        status: isPaused
          ? 'paused'
          : stations.filter((s) => s.status === 'active').length === 4
          ? 'busy'
          : 'operational',
        capacity: 4,
        currentLoad: stations.filter((s) => s.status === 'active' && s.currentTokenCode).length,
        occupancyPercent: Math.round(
          (stations.filter((s) => s.status === 'active' && s.currentTokenCode).length / 4) * 100
        ),
        activeTokenCodes: stations
          .filter((s) => s.status === 'active' && s.currentTokenCode)
          .map((s) => s.currentTokenCode as string),
        details: {
          activeBays: stations.filter((s) => s.status === 'active').length,
          totalBays: stations.length,
          calibrationCert: 'Valid until Nov 2026'
        }
      },

      PROCUREMENT: {
        id: 'PROCUREMENT',
        name: 'Intake Counter & Digital Payouts',
        description: 'Weighment slip generation, DBT account check, and warehouse bin tag issuance',
        status: procurementTokens.length > 2 ? 'busy' : 'operational',
        capacity: 4,
        currentLoad: procurementTokens.length,
        occupancyPercent: Math.min(100, Math.round((procurementTokens.length / 4) * 100)),
        activeTokenCodes: procurementTokens.map((t) => t.tokenCode),
        details: {
          mspRatePerQtl: '₹2,320 / quintal (Paddy Common)',
          paymentMode: 'Direct Benefit Transfer (DBT) to Aadhaar Bank Account',
          receiptPrinter: 'Online Thermal High-Speed'
        }
      },

      STORAGE: {
        id: 'STORAGE',
        name: 'Covered Godown & Grain Bins',
        description: 'Moisture-safe warehouse with palletized gunny bag stacking',
        status:
          storagePercent >= 90 ? 'critical' : storagePercent >= 75 ? 'attention' : 'operational',
        capacity: storageCapacityKg,
        currentLoad: storageUsedKg,
        occupancyPercent: storagePercent,
        activeTokenCodes: [],
        details: {
          usedKg: storageUsedKg,
          availableKg: Math.max(0, storageCapacityKg - storageUsedKg),
          gunnyBagsStock: '4,800 Empty Bags',
          storageStatus:
            storagePercent >= 90
              ? 'Critical Storage Level — Evacuation Required'
              : storagePercent >= 75
              ? 'Storage space is getting limited'
              : 'Storage space is currently sufficient'
        }
      },

      LOADING: {
        id: 'LOADING',
        name: 'Dispatch & Evacuation Bay',
        description: 'Direct conveyer loading to transport fleet heading to central godowns and mills',
        status: vehicles.some((v) => v.status === 'Loading') ? 'busy' : 'operational',
        capacity: 4,
        currentLoad: vehicles.filter((v) => v.status === 'Loading' || v.status === 'Waiting').length,
        occupancyPercent: Math.round(
          (vehicles.filter((v) => v.status === 'Loading' || v.status === 'Waiting').length / 4) * 100
        ),
        activeTokenCodes: [],
        details: {
          dockedVehicles: vehicles.length,
          loadingNow: vehicles.filter((v) => v.status === 'Loading').length,
          availableFleet: vehicles.filter((v) => v.status === 'Available').length
        }
      },

      EXIT: {
        id: 'EXIT',
        name: 'Exit Gate & Outbound Weighment',
        description: 'Empty vehicle tare confirmation, gate pass clearance, and SMS payout acknowledgment',
        status: 'operational',
        capacity: 20,
        currentLoad: completedToday.length,
        occupancyPercent: 100,
        activeTokenCodes: completedToday.slice(-3).map((t) => t.tokenCode),
        details: {
          completedTodayCount: completedToday.length,
          outboundLane: 'Clear with automatic barcode scan'
        }
      }
    };
  },

  /**
   * Calculate deterministic Centre Health Score (0-100).
   */
  calculateCentreHealth(
    waitingCount: number,
    activeStationsCount: number,
    totalStationsCount: number,
    storageUsedKg: number,
    storageCapacityKg: number,
    vehiclesCount: number,
    avgWaitMinutes: number
  ): CentreHealthScore {
    // 1. Queue Health (0-100): Lower waiting is better
    let queueHealth = 100;
    if (waitingCount > 25) queueHealth = 35;
    else if (waitingCount > 18) queueHealth = 55;
    else if (waitingCount > 10) queueHealth = 75;
    else if (waitingCount > 5) queueHealth = 90;

    // 2. Capacity Health (0-100): Active stations ratio and wait time
    let capacityHealth = Math.round((activeStationsCount / totalStationsCount) * 100);
    if (avgWaitMinutes > 30) capacityHealth = Math.max(30, capacityHealth - 30);
    else if (avgWaitMinutes > 20) capacityHealth = Math.max(50, capacityHealth - 15);

    // 3. Storage Health (0-100): <75% is healthy
    const storagePercent = (storageUsedKg / storageCapacityKg) * 100;
    let storageHealth = 100;
    if (storagePercent >= 95) storageHealth = 20;
    else if (storagePercent >= 85) storageHealth = 45;
    else if (storagePercent >= 75) storageHealth = 70;
    else if (storagePercent >= 60) storageHealth = 85;

    // 4. Transport Health (0-100): Having available trucks
    let transportHealth = Math.min(100, Math.max(30, vehiclesCount * 25));

    // Weighted Overall
    const overall = Math.round(
      queueHealth * 0.35 + capacityHealth * 0.25 + storageHealth * 0.25 + transportHealth * 0.15
    );

    let statusLabel: CentreHealthScore['statusLabel'] = 'Healthy';
    let bottleneckFactor: string | undefined = undefined;

    if (overall < 50) {
      statusLabel = 'Critical Bottleneck';
      bottleneckFactor = queueHealth < 50 ? 'Excessive Queue' : 'Storage Near Full';
    } else if (overall < 70) {
      statusLabel = 'High Stress';
      bottleneckFactor =
        queueHealth < 60 ? 'Queue Congestion' : storageHealth < 60 ? 'Storage Limited' : 'Wait Time Delay';
    } else if (overall < 85) {
      statusLabel = 'Moderate Attention';
    }

    return {
      overall,
      statusLabel,
      queueHealth,
      capacityHealth,
      storageHealth,
      transportHealth,
      bottleneckFactor
    };
  },

  /**
   * Evaluate operational alerts based on real state.
   */
  getOperationalAlerts(
    waitingCount: number,
    storageUsedKg: number,
    storageCapacityKg: number,
    activeStations: number,
    totalStations: number,
    avgWaitMinutes: number,
    vehicles: LoadingBayVehicle[]
  ): OperationalAlert[] {
    const alerts: OperationalAlert[] = [];
    const storagePercent = Math.round((storageUsedKg / storageCapacityKg) * 100);

    // Alert 1: Queue congestion
    if (waitingCount >= 14 && activeStations < totalStations) {
      alerts.push({
        id: 'ALT-QUEUE',
        type: 'queue',
        severity: waitingCount >= 20 ? 'critical' : 'high',
        title: 'Depot Yard Queue Surge',
        problem: `${waitingCount} farmers waiting in holding yard. Average wait: ~${avgWaitMinutes} min.`,
        impact: 'High tractor parking backlog; possible spillover to NH 48 highway road.',
        suggestedAction: `Activate Station ${activeStations + 1} to increase intake throughput by +33%.`,
        actionType: 'OPEN_STATION',
        actionLabel: `Activate Station ${activeStations + 1}`
      });
    }

    // Alert 2: Storage capacity
    if (storagePercent >= 80) {
      alerts.push({
        id: 'ALT-STORAGE',
        type: 'storage',
        severity: storagePercent >= 90 ? 'critical' : 'high',
        title: 'Storage Capacity Constraint',
        problem: `Storage utilization is at ${storagePercent}% (${(storageUsedKg / 1000).toFixed(1)} / ${(storageCapacityKg / 1000).toFixed(1)} Tonnes).`,
        impact: 'Warehouse nearing maximum intake ceiling; newly procured grain cannot be safely stacked.',
        suggestedAction: 'Dispatch evacuation transport vehicles to transfer bagged grain to FCI Godown.',
        actionType: 'REQUEST_TRANSPORT',
        actionLabel: 'Request Evacuation Fleet'
      });
    }

    // Alert 3: Long wait time
    if (avgWaitMinutes > 25 && waitingCount >= 10) {
      alerts.push({
        id: 'ALT-WAIT',
        type: 'delay',
        severity: 'medium',
        title: 'Processing Pacing Advisory',
        problem: `Intake turnaround time has risen to ${avgWaitMinutes} minutes per farmer.`,
        impact: 'Arrival schedule delay for subsequent afternoon slot bookings.',
        suggestedAction: 'Pace inbound arrivals or fast-track moisture checks with duplicate testers.',
        actionType: 'PAUSE_QUEUE',
        actionLabel: 'Pace Inbound Gate'
      });
    }

    // Alert 4: Vehicle shortage
    const availableTrucks = vehicles.filter((v) => v.status === 'Available' || v.status === 'Waiting').length;
    if (availableTrucks <= 1 && storagePercent > 65) {
      alerts.push({
        id: 'ALT-FLEET',
        type: 'transport',
        severity: 'medium',
        title: 'Evacuation Fleet Shortage',
        problem: 'Only 1 transport truck currently available in loading bay.',
        impact: 'Grain buildup may cause bottlenecks if afternoon harvest intake spikes.',
        suggestedAction: 'Notify Transporter Hub to dispatch 2 additional 10-tonne multi-axle trucks.',
        actionType: 'REQUEST_TRANSPORT',
        actionLabel: 'Call +2 Transport Trucks'
      });
    }

    return alerts;
  },

  /**
   * Run What-If simulation without modifying real state.
   */
  simulateScenario(
    config: WhatIfScenarioConfig,
    currentWaiting: number,
    currentWaitMinutes: number,
    currentActiveStations: number
  ): WhatIfScenarioResult {
    // Baseline current
    const current = {
      waitingFarmers: currentWaiting,
      avgWaitMinutes: currentWaitMinutes,
      centreLoadPercent: Math.min(100, Math.round((currentWaiting / 25) * 100)),
      activeStations: currentActiveStations
    };

    // Predict scenario
    const simulatedWaiting = currentWaiting + config.additionalFarmers;
    const speedFactor = config.processingSpeed === 'fast' ? 0.8 : config.processingSpeed === 'slow' ? 1.3 : 1.0;
    const processingBase = 11 * speedFactor;

    // Predicted wait with CURRENT stations
    const predictedWait = Math.round((simulatedWaiting * processingBase) / Math.max(1, currentActiveStations));
    const predictedLoad = Math.min(100, Math.round((simulatedWaiting / (currentActiveStations * 8)) * 100));

    // After Action (e.g. activating 4 stations)
    const improvedStations = Math.min(4, Math.max(config.activeStations, currentActiveStations + 1));
    const afterActionWait = Math.round((simulatedWaiting * processingBase) / improvedStations);
    const afterActionLoad = Math.min(100, Math.round((simulatedWaiting / (improvedStations * 8)) * 100));

    return {
      current,
      predicted: {
        waitingFarmers: simulatedWaiting,
        avgWaitMinutes: predictedWait,
        centreLoadPercent: predictedLoad,
        activeStations: currentActiveStations,
        bottleneckRisk:
          predictedWait > 35
            ? 'Severe Yard Congestion & Traffic Delay'
            : predictedWait > 25
            ? 'Moderate Intake Delay'
            : 'Manageable Flow'
      },
      recommendedAction: {
        title: `Activate Auxiliary Weighbridge Station ${improvedStations}`,
        description: `Adding Station ${improvedStations} expands intake capacity by +${Math.round(
          (1 / currentActiveStations) * 100
        )}%, reducing farmer waiting time from ~${predictedWait}m to ~${afterActionWait}m.`,
        stationToActivate: improvedStations
      },
      afterAction: {
        waitingFarmers: Math.max(1, Math.round(simulatedWaiting * 0.65)),
        avgWaitMinutes: afterActionWait,
        centreLoadPercent: afterActionLoad,
        activeStations: improvedStations
      }
    };
  },

  /**
   * Scenario Presets for 1-click SIH Demo testing.
   */
  getPresetConfig(preset: ScenarioPresetKey): WhatIfScenarioConfig {
    switch (preset) {
      case 'NORMAL_DAY':
        return {
          additionalFarmers: 5,
          activeStations: 3,
          processingSpeed: 'normal',
          storageCapacityKg: 10000,
          vehicleAvailability: 4,
          staffCount: 10
        };
      case 'BUSY_MORNING':
        return {
          additionalFarmers: 30,
          activeStations: 3,
          processingSpeed: 'normal',
          storageCapacityKg: 10000,
          vehicleAvailability: 3,
          staffCount: 8
        };
      case 'FESTIVAL_PEAK':
        return {
          additionalFarmers: 50,
          activeStations: 2,
          processingSpeed: 'slow',
          storageCapacityKg: 10000,
          vehicleAvailability: 2,
          staffCount: 7
        };
      case 'VEHICLE_SHORTAGE':
        return {
          additionalFarmers: 15,
          activeStations: 3,
          processingSpeed: 'normal',
          storageCapacityKg: 10000,
          vehicleAvailability: 0,
          staffCount: 10
        };
      case 'STORAGE_CONSTRAINT':
        return {
          additionalFarmers: 20,
          activeStations: 3,
          processingSpeed: 'normal',
          storageCapacityKg: 7500,
          vehicleAvailability: 1,
          staffCount: 9
        };
      case 'STAFF_SHORTAGE':
        return {
          additionalFarmers: 18,
          activeStations: 2,
          processingSpeed: 'slow',
          storageCapacityKg: 10000,
          vehicleAvailability: 2,
          staffCount: 4
        };
      default:
        return {
          additionalFarmers: 10,
          activeStations: 3,
          processingSpeed: 'normal',
          storageCapacityKg: 10000,
          vehicleAvailability: 3,
          staffCount: 9
        };
    }
  }
};
