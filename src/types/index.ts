export type UserRole = 'farmer' | 'operator' | 'transporter' | 'admin';

export type AppView = 'landing' | 'role-selection' | UserRole;

export type SupportedLanguage = 'en' | 'ta' | 'hi';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  avatar?: string;
  language: SupportedLanguage;
}

export interface RegisteredProduce {
  id: string;
  cropName: string;
  variety: string;
  estimatedQuantityQuintals: number;
  harvestDate: string;
  mspPerQuintal: number;
  expectedDeliveryDate?: string;
  status?: 'Scheduled' | 'Harvested' | 'Growing';
}

export interface Farmer extends User {
  role: 'farmer';
  village: string;
  district: string;
  state: string;
  aadhaarMasked: string;
  kisanId: string;
  landAreaAcres: number;
  bankAccountMasked: string;
  registeredProduce: RegisteredProduce[];
  easyMode?: boolean;
}

export type CentreStatus = 'open' | 'congested' | 'optimal' | 'closed';

export interface ProcurementCentre {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  address: string;
  distanceKm: number;
  status: CentreStatus;
  loadLabel: 'Low' | 'Moderate' | 'High';
  currentWaitMinutes: number;
  capacityUtilizationPercent: number;
  capacityStatus: 'Good' | 'Limited' | 'Full';
  dailySlotsTotal: number;
  dailySlotsBooked: number;
  activeCounters: number;
  activeWeighingStations: number;
  totalWeighingStations: number;
  storageUtilizationPercent: number;
  vehiclesAvailable: number;
  operatingHours: string;
  contactNumber: string;
  weighbridgesAvailable: number;
  commoditiesAccepted: string[];
  farmersWaitingCount: number;
  humanizedLoadText: string;
  humanizedSpaceText: string;

  // Section 8: Dynamic Capacity Fields
  maximumDailyCapacity: number;
  currentProcessed: number;
  currentQueue: number;
  activeStations: number;
  totalStations: number;
  processingRate: number; // in farmers / station / hour
  storageCapacity: number; // in quintals
  storageUsed: number;     // in quintals
  vehicleAvailability: number;
  workingHours: string;
  bookingCount: number;
  predictedArrivals: number;
}

// Section 10: Slot Availability States
export type SlotAvailabilityState = 'AVAILABLE' | 'LIMITED' | 'BUSY' | 'FULL' | 'CLOSED';

// Section 9: Time Slot Model
export interface TimeSlot {
  id: string;
  centreId: string;
  date: string; // e.g., '2026-10-15'
  time: string; // e.g., '10:30 AM'
  category: 'Morning' | 'Afternoon' | 'Evening';
  availability: SlotAvailabilityState;
  availabilityLabel: string;
  maxCapacity: number;
  bookingCount: number;
  expectedQueue: number;
  expectedWaitMinutes: number;
  expectedArrivals: number;
  capacityStatus: 'Good' | 'Limited' | 'Busy' | 'Full' | 'Closed';
}

// Section 3: Scheduling Scoring Factors
export interface SchedulingFactors {
  queueScore: number;       // 0-100 (lower queue = higher score)
  capacityScore: number;    // 0-100 (more available capacity = higher score)
  travelScore: number;      // 0-100 (shorter travel = higher score)
  processingScore: number;  // 0-100 (quantity-aware processing speed)
  transportScore: number;   // 0-100 (vehicle availability)
  totalScore: number;       // 0-100 normalized
}

// Section 4 & 5: Slot Recommendation Model
export interface SlotRecommendation {
  slot: TimeSlot;
  centre: ProcurementCentre;
  score: SchedulingFactors;
  statusMatch: 'BEST MATCH' | 'GOOD MATCH' | 'BUSY' | 'NOT RECOMMENDED';
  expectedWaitRange: string; // e.g. '15–20 min'
  recommendedArrival: string; // e.g. '10:10 AM'
  travelDistanceKm: number;
  travelTimeMinutes: number;
  reasons: string[];
  technicalExplanation: {
    queueBreakdown: string;
    capacityBreakdown: string;
    travelBreakdown: string;
    processingBreakdown: string;
    transportBreakdown: string;
  };
}

// Section 6: Alternative Slot & Centre Models
export interface AlternativeSlotOption {
  type: 'EARLIER' | 'LATER';
  slot: TimeSlot;
  centre: ProcurementCentre;
  expectedWaitMinutes: number;
  recommendedArrival: string;
  reason: string;
}

export interface AlternativeCentreOption {
  centre: ProcurementCentre;
  slot: TimeSlot;
  distanceKm: number;
  expectedWaitMinutes: number;
  capacityStatus: string;
  reason: string;
}

// Section 14: What-If Slot Comparison
export interface SlotComparisonItem {
  time: string;
  waitMinutes: number;
  centreLoad: 'Low' | 'Moderate' | 'High';
  recommendedArrival: string;
  availability: SlotAvailabilityState;
  slotId: string;
  isRecommended?: boolean;
}

export interface SchedulingResult {
  bestRecommendation: SlotRecommendation;
  alternatives: {
    earlierSlot?: AlternativeSlotOption;
    laterSlot?: AlternativeSlotOption;
    nearbyCentre?: AlternativeCentreOption;
  };
  comparisonSlots: SlotComparisonItem[];
  evaluatedSlotsCount: number;
  evaluatedCentresCount: number;
  calculationTimestamp: string;
}

export type BookingStatus = 'confirmed' | 'arrived' | 'weighed' | 'completed' | 'cancelled' | 'missed';

export interface Booking {
  id: string;
  bookingRef: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerVillage: string;
  centreId: string;
  centreName: string;
  produceType: string;
  variety: string;
  quantityQuintals: number;
  quantityKg: number;
  slotDate: string;
  slotTime: string;
  recommendedArrival: string;
  estimatedWaitingMinutes: number;
  status: BookingStatus;
  tokenNumber: string;
  centreLoad: 'Low' | 'Moderate' | 'High';
  vehicleType?: string;
  vehicleNumber?: string;
  whyThisSlot?: string[];
}

export type QueueState =
  | 'BOOKED'
  | 'ARRIVING'
  | 'WAITING'
  | 'CALLED'
  | 'IN_PROCESS'
  | 'QUALITY_CHECK'
  | 'WEIGHING'
  | 'PROCUREMENT'
  | 'COMPLETED'
  | 'MISSED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'waiting'
  | 'called'
  | 'at_gate'
  | 'weighing'
  | 'completed';

export type TokenStatus =
  | 'BOOKED'
  | 'ARRIVING'
  | 'WAITING'
  | 'CALLED'
  | 'IN_PROCESS'
  | 'QUALITY_CHECK'
  | 'WEIGHING'
  | 'PROCUREMENT'
  | 'COMPLETED'
  | 'MISSED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export type ArrivalStatus = 'not_arrived' | 'early' | 'on_time' | 'late' | 'arrived';

export interface QueueToken {
  id: string;
  tokenCode: string;
  tokenNumber?: string;
  bookingId: string;
  farmerId?: string;
  farmerName: string;
  farmerPhone?: string;
  farmerVillage?: string;
  produceType: string;
  quantityKg: number;
  slotTime: string;
  scheduledTime?: string;
  status: TokenStatus;
  currentStatus: QueueState;
  arrivalStatus?: ArrivalStatus;
  queuePosition: number;
  farmersAhead: number;
  currentlyServingToken: string;
  estimatedWaitMinutes: number;
  centreId?: string;
  centreName: string;
  centreLoad: 'Low' | 'Moderate' | 'High';
  bayNumber?: number;
  assignedStation?: string;
  assignedStationId?: string;
  recommendedGateArrival: string;
  createdAt?: string;
  updatedAt?: string;
  arrivalTime?: string;
  completedTime?: string;
  priorityReason?: string;
  notes?: string;
  queueList?: string[];
}

export interface ProcessingStation {
  id: string;
  number: number;
  name: string;
  counterName: string;
  status: 'active' | 'available' | 'closed';
  currentTokenId?: string;
  currentTokenCode?: string;
  currentFarmerName?: string;
  currentProduce?: string;
  processingStage?: TokenStatus;
  startedAt?: string;
}

export interface CentreQueueState {
  centreId: string;
  currentToken: string;
  waitingTokens: number;
  arrivedTokens: number;
  processingTokens: number;
  completedTodayCount: number;
  activeStationsCount: number;
  totalStationsCount: number;
  averageProcessingMinutes: number;
  estimatedWaitMinutes: number;
  estimatedQueueClearanceTime: string;
}

export interface QueueHistoryItem {
  id: string;
  tokenCode: string;
  farmerName: string;
  produceType: string;
  quantityKg: number;
  completedTime: string;
  processingDurationMinutes: number;
  stationName: string;
  status: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  bookingRef: string;
  produceType: string;
  quantityKg: number;
  amount: number;
  status: 'Processing' | 'Completed' | 'Pending';
  date: string;
  bankAccountMasked: string;
  utrNumber?: string;
}

export type VehicleStatus = 'idle' | 'in_transit' | 'at_centre' | 'maintenance';

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  capacityTonnes: number;
  currentStatus: VehicleStatus;
  assignedRoute: string;
  origin: string;
  destination: string;
  eta: string;
  loadType: string;
  utilizationPercent: number;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'critical';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: NotificationType;
  isRead: boolean;
  roleTarget: UserRole | 'all';
  actionLabel?: string;
  linkTo?: string;
}

export interface EcosystemStats {
  farmersRegistered: number;
  procurementCentresActive: number;
  metricTonnesToday: number;
  avgWaitTimeMinutes: number;
  activeTransporters: number;
  paymentsDisbursedCrores: number;
  operationalDistricts: number;
  queueEfficiencyPercent: number;
}

export type FarmerNavTab =
  | 'home'
  | 'book-slot'
  | 'bookings'
  | 'token'
  | 'centre-status'
  | 'centre'
  | 'produce'
  | 'payments'
  | 'notifications'
  | 'assistant'
  | 'profile';

export type OperatorNavTab = 'overview' | 'queue' | 'digital-twin' | 'capacity' | 'alerts';
export type TransporterNavTab = 'overview' | 'trips' | 'routes' | 'deliveries';
export type AdminNavTab = 'overview' | 'centres' | 'farmers' | 'transport' | 'analytics' | 'ai-insights';

// ==========================================
// PART 5: DIGITAL TWIN & OPERATIONS SYSTEM
// ==========================================

export type DigitalTwinZoneId =
  | 'ENTRY'
  | 'WAITING'
  | 'CHECK_IN'
  | 'QUALITY'
  | 'WEIGHING'
  | 'PROCUREMENT'
  | 'STORAGE'
  | 'LOADING'
  | 'EXIT';

export interface CentreZone {
  id: DigitalTwinZoneId;
  name: string;
  description: string;
  status: 'operational' | 'busy' | 'attention' | 'critical' | 'paused';
  capacity: number;
  currentLoad: number;
  occupancyPercent: number;
  activeTokenCodes: string[];
  details?: Record<string, any>;
}

export interface LoadingBayVehicle {
  id: string;
  plateNumber: string; // e.g. TN-38-AZ-1234
  type: string;        // e.g. '10-Tonne Tipper'
  status: 'Loading' | 'Waiting' | 'Available' | 'Departing';
  capacityKg: number;
  currentLoadKg: number;
  destination: string;
  driverName: string;
  bayNumber: number;
}

export interface CentreHealthScore {
  overall: number; // 0-100
  statusLabel: 'Healthy' | 'Moderate Attention' | 'High Stress' | 'Critical Bottleneck';
  queueHealth: number;    // 0-100
  capacityHealth: number; // 0-100
  storageHealth: number;  // 0-100
  transportHealth: number;// 0-100
  bottleneckFactor?: string;
}

export interface OperationalAlert {
  id: string;
  type: 'queue' | 'storage' | 'station' | 'transport' | 'delay';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  problem: string;
  impact: string;
  suggestedAction: string;
  actionType: 'OPEN_STATION' | 'REQUEST_TRANSPORT' | 'PAUSE_QUEUE' | 'EXTEND_HOURS';
  actionLabel: string;
  resolved?: boolean;
}

export interface OperationalEvent {
  id: string;
  timestamp: string; // e.g. '10:45 AM'
  type:
    | 'FARMER_ARRIVED'
    | 'TOKEN_CALLED'
    | 'PROCESSING_STARTED'
    | 'QUALITY_STARTED'
    | 'WEIGHING_STARTED'
    | 'PROCUREMENT_STARTED'
    | 'PROCUREMENT_COMPLETED'
    | 'STATION_OPENED'
    | 'STATION_CLOSED'
    | 'VEHICLE_ARRIVED'
    | 'STORAGE_UPDATED'
    | 'CENTRE_PAUSED'
    | 'CENTRE_RESUMED'
    | 'SIMULATION_TRIGGERED';
  title: string;
  description: string;
  tokenCode?: string;
  stationName?: string;
  badgeVariant?: 'success' | 'info' | 'warning' | 'error';
}

export interface WhatIfScenarioConfig {
  additionalFarmers: number;
  activeStations: number;
  processingSpeed: 'slow' | 'normal' | 'fast';
  storageCapacityKg: number;
  vehicleAvailability: number;
  staffCount: number;
}

export interface WhatIfScenarioResult {
  current: {
    waitingFarmers: number;
    avgWaitMinutes: number;
    centreLoadPercent: number;
    activeStations: number;
  };
  predicted: {
    waitingFarmers: number;
    avgWaitMinutes: number;
    centreLoadPercent: number;
    activeStations: number;
    bottleneckRisk: string;
  };
  recommendedAction: {
    title: string;
    description: string;
    stationToActivate?: number;
  };
  afterAction: {
    waitingFarmers: number;
    avgWaitMinutes: number;
    centreLoadPercent: number;
    activeStations: number;
  };
}

export type ScenarioPresetKey =
  | 'NORMAL_DAY'
  | 'BUSY_MORNING'
  | 'FESTIVAL_PEAK'
  | 'VEHICLE_SHORTAGE'
  | 'STORAGE_CONSTRAINT'
  | 'STAFF_SHORTAGE';

// ==========================================
// PART 6: KISANSETU MITRA AI & VOICE TYPES
// ==========================================

export type AssistantIntent =
  | 'CHECK_BOOKING'
  | 'CHECK_TOKEN'
  | 'CHECK_QUEUE'
  | 'CHECK_CENTRE_STATUS'
  | 'FIND_CENTRE'
  | 'FIND_SLOT'
  | 'RESCHEDULE'
  | 'CANCEL_BOOKING'
  | 'TRACK_TRANSPORT'
  | 'CHECK_PAYMENT'
  | 'CHECK_PRODUCE'
  | 'HELP'
  | 'EXPLAIN_RECOMMENDATION'
  | 'CENTRE_ALERTS'
  | 'MISSED_SLOT'
  | 'GENERAL_QUESTION';

export type AssistantVoiceState =
  | 'READY'
  | 'LISTENING'
  | 'PROCESSING'
  | 'RESPONDING'
  | 'ERROR';

export type AssistantActionType =
  | 'VIEW_BOOKING'
  | 'VIEW_TOKEN'
  | 'VIEW_CENTRE'
  | 'FIND_SLOT'
  | 'TRACK_TRANSPORT'
  | 'RESCHEDULE'
  | 'CHOOSE_CENTRE'
  | 'CONFIRM_ACTION'
  | 'CANCEL_ACTION'
  | 'CALL_ASSISTANCE';

export interface AssistantActionConfirmation {
  type: 'RESCHEDULE' | 'CANCEL' | 'BOOK_ALTERNATIVE' | 'SELECT_CENTRE';
  title: string;
  description: string;
  payload?: any;
  confirmLabel: string;
  cancelLabel: string;
}

export interface AssistantMessageAction {
  label: string;
  action: AssistantActionType;
  payload?: any;
  variant?: 'primary' | 'outline' | 'ghost';
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  intent?: AssistantIntent;
  actions?: AssistantMessageAction[];
  confirmation?: AssistantActionConfirmation;
  dataSnippet?: {
    type: 'token' | 'booking' | 'centre' | 'queue';
    data: any;
  };
  isSpoken?: boolean;
  isError?: boolean;
  source?: 'gemini' | 'local_rules' | 'offline_cache';
  isSimulated?: boolean;
}

export interface AssistantContextSnapshot {
  farmerName: string;
  farmerPhone: string;
  farmerVillage: string;
  language: SupportedLanguage;
  booking?: Booking | null;
  token?: QueueToken | null;
  centre?: ProcurementCentre | null;
  queueLength: number;
  waitMinutes: number;
  queuePosition?: number;
  allCentres: ProcurementCentre[];
  isCentrePaused: boolean;
  todayCompletedCount: number;
  recentNotificationText?: string;
  todayProduceSummary?: string;
}


