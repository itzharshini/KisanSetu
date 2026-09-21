import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Farmer,
  ProcurementCentre,
  Booking,
  QueueToken,
  Vehicle,
  Notification,
  EcosystemStats,
  SupportedLanguage,
  PaymentRecord,
  RegisteredProduce,
  ProcessingStation,
  QueueHistoryItem,
  CentreQueueState,
  TokenStatus,
  LoadingBayVehicle,
  OperationalEvent,
  CentreZone,
  DigitalTwinZoneId
} from '../types';
import {
  MOCK_FARMER,
  MOCK_CENTRES,
  MOCK_ACTIVE_BOOKING,
  MOCK_BOOKINGS,
  MOCK_VEHICLES,
  MOCK_NOTIFICATIONS,
  MOCK_ECOSYSTEM_STATS,
  MOCK_PAYMENTS
} from '../data/mockData';
import {
  INITIAL_STATIONS,
  INITIAL_QUEUE_TOKENS,
  INITIAL_COMPLETED_HISTORY
} from '../data/mockQueueData';
import {
  INITIAL_LOADING_VEHICLES,
  INITIAL_OPERATIONAL_EVENTS,
  digitalTwinService
} from '../services/digitalTwinService';
import { schedulingService } from '../services/schedulingService';
import { queueService } from '../services/queueService';

export interface BookingInput {
  produceType: string;
  variety?: string;
  quantityKg: number;
  centreId: string;
  slotDate: string;
  slotTime: string;
  recommendedArrival: string;
  estimatedWaitingMinutes: number;
  whyThisSlot?: string[];
}

export interface KisanSetuContextType {
  farmer: Farmer;
  centres: ProcurementCentre[];
  selectedCentre: ProcurementCentre;
  bookings: Booking[];
  activeBooking: Booking | null;
  currentToken: QueueToken | null;
  vehicles: Vehicle[];
  notifications: Notification[];
  payments: PaymentRecord[];
  ecosystemStats: EcosystemStats;
  language: SupportedLanguage;
  easyMode: boolean;
  isMissedSlotActive: boolean;
  simulatedTime: string;
  slotBookingsMap: Record<string, number>;

  // Section 35: Unified Shared Queue State
  queueTokens: QueueToken[];
  stations: ProcessingStation[];
  queueHistory: QueueHistoryItem[];
  completedTodayCount: number;

  // Section 38: Part 5 Centre Operations & Digital Twin State
  storageUsedKg: number;
  storageCapacityKg: number;
  isProcurementPaused: boolean;
  loadingVehicles: LoadingBayVehicle[];
  operationalEvents: OperationalEvent[];

  // Actions
  setLanguage: (lang: SupportedLanguage) => void;
  toggleEasyMode: () => void;
  confirmBooking: (input: BookingInput) => Booking;
  rescheduleBooking: (newSlotTime: string, newArrival: string, newWait: number) => void;
  takeNextAvailableSlot: () => void;
  toggleMissedSlotDemo: () => void;
  simulateNextFarmer: () => void;
  simulateFiveMinutes: () => void;
  advanceSimulatedClock: (minutes?: number) => void;
  simulateCongestion: (centreId: string) => void;
  clearActiveBooking: () => void;
  restoreActiveBooking: () => void;
  addProduce: (produce: RegisteredProduce) => void;
  markAllNotificationsRead: () => void;
  isSlotFull: (centreId: string, slotTime: string, date: string) => boolean;

  // Section 36: Queue Operations
  callNextFarmer: () => { success: boolean; message: string; calledToken?: QueueToken };
  advanceTokenStage: (tokenId: string) => { nextStage: TokenStatus; message: string };
  completeTokenProcurement: (tokenId: string) => void;
  checkInToken: (tokenCode: string) => { success: boolean; message: string; isEarly?: boolean; isLate?: boolean };
  markTokenNoShow: (tokenId: string) => void;
  openAdditionalStation: () => { success: boolean; message: string };
  closeStationById: (stationId: string) => { success: boolean; message: string };
  checkStationCanClose: (stationId: string) => { canClose: boolean; currentTokenCode?: string; farmerName?: string; stationNumber?: number };
  addOneDemoFarmer: (customName?: string) => QueueToken;
  addFiveDemoFarmers: () => void;
  processNextActiveFarmer: () => void;
  getCentreQueueState: (centreId?: string) => CentreQueueState;
  updateTokenPriorityReason: (tokenId: string, reason: string) => void;

  // Part 5: Operations Actions
  pauseProcurement: () => void;
  resumeProcurement: () => void;
  broadcastAnnouncement: (title: string, message: string, category?: string) => void;
  requestTransportFleet: (count?: number) => void;
  resetDigitalTwinDemo: () => void;
  applyWhatIfScenarioAction: (stationToActivate?: number) => void;
  addOperationalEvent: (event: Omit<OperationalEvent, 'id' | 'timestamp'> & { timestamp?: string }) => void;
}

const KisanSetuContext = createContext<KisanSetuContextType | undefined>(undefined);

export const KisanSetuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmer, setFarmer] = useState<Farmer>(MOCK_FARMER);
  const [centres, setCentres] = useState<ProcurementCentre[]>(MOCK_CENTRES);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(MOCK_ACTIVE_BOOKING);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [ecosystemStats, setEcosystemStats] = useState<EcosystemStats>(MOCK_ECOSYSTEM_STATS);
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [easyMode, setEasyMode] = useState<boolean>(false);
  const [isMissedSlotActive, setIsMissedSlotActive] = useState<boolean>(false);

  // Section 35: Central Operational State (Queue, Stations, History)
  const [queueTokens, setQueueTokens] = useState<QueueToken[]>(INITIAL_QUEUE_TOKENS);
  const [stations, setStations] = useState<ProcessingStation[]>(INITIAL_STATIONS);
  const [queueHistory, setQueueHistory] = useState<QueueHistoryItem[]>(INITIAL_COMPLETED_HISTORY);
  const [completedTodayCount, setCompletedTodayCount] = useState<number>(42);

  // Part 5: Storage & Digital Twin State
  const [storageUsedKg, setStorageUsedKg] = useState<number>(6800);
  const [storageCapacityKg, setStorageCapacityKg] = useState<number>(10000);
  const [isProcurementPaused, setIsProcurementPaused] = useState<boolean>(false);
  const [loadingVehicles, setLoadingVehicles] = useState<LoadingBayVehicle[]>(INITIAL_LOADING_VEHICLES);
  const [operationalEvents, setOperationalEvents] = useState<OperationalEvent[]>(INITIAL_OPERATIONAL_EVENTS);

  // Section 20: Simulated Operational Clock State (starts at 10:15 AM)
  const [simulatedMinutes, setSimulatedMinutes] = useState<number>(615); // 10 * 60 + 15

  // In-memory slot booking counter by key `${centreId}_${date}_${time}`
  const [slotBookingsMap, setSlotBookingsMap] = useState<Record<string, number>>({
    'PC-TN-04_Tomorrow_11:00 AM': 12,
    'PC-TN-02_Tomorrow_11:00 AM': 12
  });

  const formatSimulatedTime = (totalMinutes: number): string => {
    let hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const meridian = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hours}:${formattedMins} ${meridian}`;
  };

  const simulatedTime = formatSimulatedTime(simulatedMinutes);

  // Selected centre helper
  const selectedCentre =
    centres.find((c) => c.id === (activeBooking?.centreId || 'PC-TN-04')) || centres[0];

  // Dynamic derivation of Arun Kumar's current token from the unified queueTokens state!
  const currentToken: QueueToken | null = useMemo(() => {
    if (!activeBooking) return null;
    const matchedToken = queueTokens.find(
      (t) => t.tokenCode === activeBooking.tokenNumber || t.bookingId === activeBooking.id
    );
    if (!matchedToken) {
      return queueTokens.find((t) => t.tokenCode === 'A-142') || null;
    }

    // Dynamically calculate dynamic queue position and farmers ahead
    const positionInfo = queueService.calculateQueuePosition(matchedToken.tokenCode, queueTokens);
    const activeStationsCount = stations.filter((s) => s.status === 'active').length;
    const dynamicWait = queueService.calculateEstimatedWait(
      positionInfo.farmersAhead,
      activeStationsCount,
      11
    );

    return {
      ...matchedToken,
      queuePosition: positionInfo.queuePosition,
      farmersAhead: positionInfo.farmersAhead,
      currentlyServingToken: positionInfo.currentlyServingToken,
      estimatedWaitMinutes: dynamicWait
    };
  }, [activeBooking, queueTokens, stations]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    setFarmer((prev) => ({ ...prev, language: lang }));
  };

  const toggleEasyMode = () => {
    setEasyMode((prev) => !prev);
    setFarmer((prev) => ({ ...prev, easyMode: !prev.easyMode }));
  };

  const isSlotFull = (centreId: string, slotTime: string, date: string): boolean => {
    const key = `${centreId}_${date}_${slotTime}`;
    const count = slotBookingsMap[key] || 0;
    return count >= 12 || (slotTime === '11:00 AM' && centreId === 'PC-TN-04');
  };

  // Section 2 & 44: Create Token on Confirmed Booking
  const confirmBooking = (input: BookingInput): Booking => {
    const chosenCentre = centres.find((c) => c.id === input.centreId) || centres[0];

    if (isSlotFull(chosenCentre.id, input.slotTime, input.slotDate)) {
      throw new Error(`Slot ${input.slotTime} at ${chosenCentre.name} is completely full. Please choose another time.`);
    }

    const slotKey = `${chosenCentre.id}_${input.slotDate}_${input.slotTime}`;
    const currentSlotBookings = (slotBookingsMap[slotKey] || 4) + 1;
    setSlotBookingsMap((prev) => ({
      ...prev,
      [slotKey]: currentSlotBookings
    }));

    // Keep existing A-142 token if Arun Kumar books, or generate next unique sequential token code
    const generatedToken = activeBooking?.tokenNumber === 'A-142' ? 'A-142' : queueService.generateTokenCode('A', queueTokens);
    const bookingRef = `KS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: `BKG-${Date.now()}`,
      bookingRef,
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerVillage: farmer.village,
      centreId: chosenCentre.id,
      centreName: chosenCentre.name,
      produceType: input.produceType,
      variety: input.variety || 'Standard Grade',
      quantityQuintals: +(input.quantityKg / 100).toFixed(1),
      quantityKg: input.quantityKg,
      slotDate: input.slotDate,
      slotTime: input.slotTime,
      recommendedArrival: input.recommendedArrival,
      estimatedWaitingMinutes: input.estimatedWaitingMinutes,
      status: 'confirmed',
      tokenNumber: generatedToken,
      centreLoad: chosenCentre.loadLabel,
      vehicleType: 'Tractor Trolley',
      whyThisSlot: input.whyThisSlot || [
        `Lower predicted queue during ${input.slotTime} arrival window`,
        `Centre has ${chosenCentre.activeStations} active weighing stations and open yard bays`,
        `Optimal travel timing from ${farmer.village}`,
        'Balanced gate intake schedule'
      ]
    };

    setActiveBooking(newBooking);
    setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);

    // Insert or update this token in the unified shared queueTokens list!
    const existingIndex = queueTokens.findIndex((t) => t.tokenCode === generatedToken);
    const newQueueToken: QueueToken = {
      id: `TOK-${generatedToken}`,
      tokenCode: generatedToken,
      tokenNumber: generatedToken,
      bookingId: newBooking.id,
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerVillage: farmer.village,
      produceType: input.produceType,
      quantityKg: input.quantityKg,
      slotTime: input.slotTime,
      scheduledTime: input.slotTime,
      status: 'WAITING',
      currentStatus: 'WAITING',
      arrivalStatus: 'arrived',
      queuePosition: queueTokens.length + 1,
      farmersAhead: queueTokens.filter((t) => t.status === 'WAITING').length,
      currentlyServingToken: 'A-129',
      estimatedWaitMinutes: input.estimatedWaitingMinutes || 24,
      centreId: chosenCentre.id,
      centreName: chosenCentre.name,
      centreLoad: chosenCentre.loadLabel,
      bayNumber: 2,
      recommendedGateArrival: input.recommendedArrival,
      createdAt: simulatedTime,
      priorityReason: 'Confirmed slot booking.'
    };

    if (existingIndex >= 0) {
      setQueueTokens((prev) =>
        prev.map((t, i) => (i === existingIndex ? newQueueToken : t))
      );
    } else {
      setQueueTokens((prev) => [...prev, newQueueToken]);
    }

    // Update centre metrics
    setCentres((prev) =>
      prev.map((c) => {
        if (c.id === chosenCentre.id) {
          const newWaiting = c.farmersWaitingCount + 1;
          const newBooked = c.dailySlotsBooked + 1;
          return {
            ...c,
            farmersWaitingCount: newWaiting,
            dailySlotsBooked: newBooked,
            currentQueue: newWaiting,
            bookingCount: (c.bookingCount || 94) + 1,
            humanizedLoadText: `${newWaiting} farmers currently waiting.`
          };
        }
        return c;
      })
    );

    // Notification
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: '✓ Your slot is confirmed.',
      message: `Your procurement slot is ${input.slotDate} at ${input.slotTime} at ${chosenCentre.name}. Token: ${generatedToken}`,
      timeAgo: 'Just now',
      type: 'success',
      isRead: false,
      roleTarget: 'farmer'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Payment record
    const mspPrice = 23.2;
    const expectedAmount = Math.round(input.quantityKg * mspPrice);
    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      bookingId: newBooking.id,
      bookingRef,
      produceType: input.produceType,
      quantityKg: input.quantityKg,
      amount: expectedAmount,
      status: 'Processing',
      date: 'Expected after weighment',
      bankAccountMasked: farmer.bankAccountMasked
    };
    setPayments((prev) => [newPayment, ...prev]);

    setIsMissedSlotActive(false);
    return newBooking;
  };

  const rescheduleBooking = (newSlotTime: string, newArrival: string, newWait: number) => {
    if (!activeBooking) return;

    const updatedBooking: Booking = {
      ...activeBooking,
      slotTime: newSlotTime,
      recommendedArrival: newArrival,
      estimatedWaitingMinutes: newWait,
      status: 'confirmed'
    };

    setActiveBooking(updatedBooking);
    setBookings((prev) =>
      prev.map((b) => (b.id === activeBooking.id ? updatedBooking : b))
    );

    setQueueTokens((prev) =>
      prev.map((t) =>
        t.tokenCode === activeBooking.tokenNumber
          ? {
              ...t,
              slotTime: newSlotTime,
              recommendedGateArrival: newArrival,
              estimatedWaitMinutes: newWait,
              status: 'RESCHEDULED',
              currentStatus: 'RESCHEDULED'
            }
          : t
      )
    );

    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Slot Rescheduled Successfully',
      message: `Your appointment is now at ${newSlotTime}. Please arrive by ${newArrival}.`,
      timeAgo: 'Just now',
      type: 'info',
      isRead: false,
      roleTarget: 'farmer'
    };
    setNotifications((prev) => [notif, ...prev]);
    setIsMissedSlotActive(false);
  };

  const takeNextAvailableSlot = () => {
    if (!activeBooking) return;
    const centre = centres.find((c) => c.id === activeBooking.centreId) || centres[0];
    const nextOpp = schedulingService.calculateNextAvailableSlot(centre, simulatedTime, activeBooking.quantityKg);

    rescheduleBooking(nextOpp.nextSlot.time, nextOpp.recommendedArrival, nextOpp.expectedWaitMinutes);
    setIsMissedSlotActive(false);

    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Next Available Slot Assigned',
      message: `Allocated next open slot at ${nextOpp.nextSlot.time}. Expected wait: ${nextOpp.expectedWaitMinutes} min.`,
      timeAgo: 'Just now',
      type: 'warning',
      isRead: false,
      roleTarget: 'farmer'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const toggleMissedSlotDemo = () => {
    setIsMissedSlotActive((prev) => {
      const nextVal = !prev;
      if (activeBooking) {
        setActiveBooking({
          ...activeBooking,
          status: nextVal ? 'missed' : 'confirmed'
        });
      }
      setQueueTokens((tokens) =>
        tokens.map((t) =>
          t.tokenCode === activeBooking?.tokenNumber
            ? { ...t, status: nextVal ? 'MISSED' : 'WAITING', currentStatus: nextVal ? 'MISSED' : 'WAITING' }
            : t
        )
      );
      return nextVal;
    });
  };

  // Section 10 & 36: Call Next Farmer (Operator Action)
  const callNextFarmer = () => {
    const result = queueService.callNextFarmer(queueTokens, stations);
    if (result.error) {
      return { success: false, message: result.error };
    }

    setQueueTokens(result.updatedTokens);
    setStations(result.updatedStations);

    if (result.calledToken) {
      const stationName = result.stationAssigned?.counterName || result.stationAssigned?.name || 'Counter 2';

      // Send immediate notification
      const notif: Notification = {
        id: `NOTIF-${Date.now()}`,
        title: `Gate Call: Token ${result.calledToken.tokenCode}`,
        message: `Token ${result.calledToken.tokenCode} (${result.calledToken.farmerName}) called to ${stationName}.`,
        timeAgo: 'Just now',
        type: 'info',
        isRead: false,
        roleTarget: result.calledToken.tokenCode === activeBooking?.tokenNumber ? 'farmer' : 'all'
      };
      setNotifications((prev) => [notif, ...prev]);

      return {
        success: true,
        message: `Called ${result.calledToken.tokenCode} to ${stationName}`,
        calledToken: result.calledToken
      };
    }

    return { success: true, message: 'Called next farmer successfully' };
  };

  // Section 11 & 12: Advance Token Stage
  const advanceTokenStage = (tokenId: string) => {
    const result = queueService.advanceProcessingStage(
      tokenId,
      queueTokens,
      stations,
      queueHistory,
      simulatedTime
    );

    setQueueTokens(result.updatedTokens);
    setStations(result.updatedStations);
    setQueueHistory(result.updatedHistory);

    if (result.nextStage === 'COMPLETED') {
      setCompletedTodayCount((prev) => prev + 1);

      // Update centre metrics
      setCentres((prevCentres) =>
        prevCentres.map((c) => {
          if (c.id === selectedCentre.id) {
            const nextProcessed = c.currentProcessed + 1;
            const nextQueue = Math.max(0, c.currentQueue - 1);
            return {
              ...c,
              currentProcessed: nextProcessed,
              currentQueue: nextQueue,
              farmersWaitingCount: nextQueue,
              storageUsed: c.storageUsed + 45
            };
          }
          return c;
        })
      );
    }

    const token = queueTokens.find((t) => t.id === tokenId);
    const friendlyStatus = queueService.getHumanFriendlyStatus(result.nextStage, token?.assignedStation);

    // If this token is Arun Kumar's token, add notification
    if (token && token.tokenCode === activeBooking?.tokenNumber) {
      const notif: Notification = {
        id: `NOTIF-${Date.now()}`,
        title: friendlyStatus.title,
        message: friendlyStatus.description,
        timeAgo: 'Just now',
        type: result.nextStage === 'COMPLETED' ? 'success' : 'info',
        isRead: false,
        roleTarget: 'farmer'
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    return {
      nextStage: result.nextStage,
      message: `Token updated to ${friendlyStatus.title}`
    };
  };

  // Section 32: Direct Complete Procurement
  const completeTokenProcurement = (tokenId: string) => {
    const result = queueService.completeProcurement(
      tokenId,
      queueTokens,
      stations,
      queueHistory,
      simulatedTime
    );

    setQueueTokens(result.updatedTokens);
    setStations(result.updatedStations);
    setQueueHistory(result.updatedHistory);
    setCompletedTodayCount((prev) => prev + 1);

    const token = queueTokens.find((t) => t.id === tokenId);
    const addedWeight = token?.quantityKg || 450;
    setStorageUsedKg((prev) => Math.min(storageCapacityKg, prev + addedWeight));

    setCentres((prevCentres) =>
      prevCentres.map((c) => {
        if (c.id === selectedCentre.id) {
          const nextProcessed = c.currentProcessed + 1;
          const nextQueue = Math.max(0, c.currentQueue - 1);
          return {
            ...c,
            currentProcessed: nextProcessed,
            currentQueue: nextQueue,
            farmersWaitingCount: nextQueue,
            storageUsed: c.storageUsed + 45
          };
        }
        return c;
      })
    );

    if (token) {
      addOperationalEvent({
        timestamp: simulatedTime,
        type: 'PROCUREMENT_COMPLETED',
        title: `Intake Finished: Token ${token.tokenCode}`,
        description: `${token.farmerName} finished weighment (${addedWeight} kg ${token.produceType}). Digital weighment slip generated.`,
        tokenCode: token.tokenCode,
        badgeVariant: 'success'
      });
    }

    if (token && token.tokenCode === activeBooking?.tokenNumber) {
      const notif: Notification = {
        id: `NOTIF-${Date.now()}`,
        title: '✓ Procurement Completed',
        message: `Procurement finished for ${token.produceType} (${token.quantityKg} kg) at ${selectedCentre.name}. Weighment slip generated.`,
        timeAgo: 'Just now',
        type: 'success',
        isRead: false,
        roleTarget: 'farmer'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Section 16 & 17: Farmer Check-in
  const checkInToken = (tokenCode: string) => {
    const result = queueService.checkInFarmer(tokenCode, queueTokens, simulatedTime);
    if (result.error) {
      return { success: false, message: result.error };
    }

    setQueueTokens(result.updatedTokens);

    addOperationalEvent({
      timestamp: simulatedTime,
      type: 'FARMER_ARRIVED',
      title: `Arrival Check-In: Token ${tokenCode}`,
      description: result.statusNote,
      tokenCode,
      badgeVariant: 'info'
    });

    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: `Token ${tokenCode} Checked In`,
      message: result.statusNote,
      timeAgo: 'Just now',
      type: result.isLate ? 'warning' : 'info',
      isRead: false,
      roleTarget: 'all'
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: result.statusNote,
      isEarly: result.isEarly,
      isLate: result.isLate
    };
  };

  // Section 31: Mark No Show
  const markTokenNoShow = (tokenId: string) => {
    const result = queueService.markNoShow(tokenId, queueTokens, stations);
    setQueueTokens(result.updatedTokens);
    setStations(result.updatedStations);

    const token = queueTokens.find((t) => t.id === tokenId);
    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: `No-Show Recorded: ${token?.tokenCode || tokenId}`,
      message: 'Farmer did not report when called. Moved to no-show holding queue.',
      timeAgo: 'Just now',
      type: 'warning',
      isRead: false,
      roleTarget: 'operator'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Section 14: Open Additional Station
  const openAdditionalStation = () => {
    const result = queueService.openStation(stations);
    setStations(result.updatedStations);

    // Update centre active stations
    setCentres((prev) =>
      prev.map((c) =>
        c.id === selectedCentre.id
          ? { ...c, activeStations: result.updatedStations.filter((s) => s.status === 'active').length }
          : c
      )
    );

    addOperationalEvent({
      timestamp: simulatedTime,
      type: 'STATION_OPENED',
      title: 'Station Activated',
      description: result.message,
      badgeVariant: 'success'
    });

    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Station Opened',
      message: result.message,
      timeAgo: 'Just now',
      type: 'success',
      isRead: false,
      roleTarget: 'operator'
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true, message: result.message };
  };

  // Section 15: Close Station Safely with in-process checks
  const checkStationCanClose = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId);
    if (!station) return { canClose: false };
    if (station.currentTokenId) {
      return {
        canClose: false,
        currentTokenCode: station.currentTokenCode,
        farmerName: station.currentFarmerName,
        stationNumber: station.number
      };
    }
    return { canClose: true, stationNumber: station.number };
  };

  const closeStationById = (stationId: string) => {
    const result = queueService.closeStation(stationId, stations);
    if (!result.success) {
      return { success: false, message: result.message };
    }

    setStations(result.updatedStations);
    setCentres((prev) =>
      prev.map((c) =>
        c.id === selectedCentre.id
          ? { ...c, activeStations: result.updatedStations.filter((s) => s.status === 'active').length }
          : c
      )
    );

    addOperationalEvent({
      timestamp: simulatedTime,
      type: 'STATION_CLOSED',
      title: 'Station Closed',
      description: result.message,
      badgeVariant: 'warning'
    });

    return { success: true, message: result.message };
  };

  // Part 5: Operational Actions
  const pauseProcurement = () => {
    setIsProcurementPaused(true);
    addOperationalEvent({
      timestamp: simulatedTime,
      type: 'CENTRE_PAUSED',
      title: 'Procurement Paused by Operator',
      description: 'Inbound gate admissions temporarily held. In-progress weighments continue.',
      badgeVariant: 'warning'
    });
    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: '⏸ Centre Operations Paused',
      message: 'New admissions to Poonamallee Procurement Centre are temporarily paused.',
      timeAgo: 'Just now',
      type: 'warning',
      isRead: false,
      roleTarget: 'all'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const resumeProcurement = () => {
    setIsProcurementPaused(false);
    addOperationalEvent({
      timestamp: simulatedTime,
      type: 'CENTRE_RESUMED',
      title: 'Procurement Resumed',
      description: 'Normal inbound intake and queue calls restored.',
      badgeVariant: 'success'
    });
    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: '▶ Centre Operations Resumed',
      message: 'Inbound admissions and weighbridge intake have resumed.',
      timeAgo: 'Just now',
      type: 'success',
      isRead: false,
      roleTarget: 'all'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const broadcastAnnouncement = (title: string, message: string, category: string = 'General Announcement') => {
    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: `📢 ${title}`,
      message,
      timeAgo: 'Just now',
      type: 'info',
      isRead: false,
      roleTarget: 'all'
    };
    setNotifications((prev) => [notif, ...prev]);
    addOperationalEvent({
      timestamp: simulatedTime,
      type: 'CENTRE_RESUMED',
      title: `Broadcast: ${title}`,
      description: message,
      badgeVariant: 'info'
    });
  };

  const requestTransportFleet = (count: number = 2) => {
    const newTrucks: LoadingBayVehicle[] = [
      {
        id: `VEH-${Date.now()}-1`,
        plateNumber: `TN-22-EX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: '12-Tonne Multi-Axle Carrier',
        status: 'Waiting',
        capacityKg: 12000,
        currentLoadKg: 0,
        destination: 'FCI Central Silo, Avadi',
        driverName: 'K. Vetrivel',
        bayNumber: 2
      },
      {
        id: `VEH-${Date.now()}-2`,
        plateNumber: `TN-43-PZ-${Math.floor(1000 + Math.random() * 9000)}`,
        type: '10-Tonne Tipper Truck',
        status: 'Available',
        capacityKg: 10000,
        currentLoadKg: 0,
        destination: 'TNCSC Rice Mill, Kanchipuram',
        driverName: 'R. Ilango',
        bayNumber: 3
      }
    ];

    setLoadingVehicles((prev) => [...newTrucks.slice(0, count), ...prev.slice(0, 4 - count)]);

    addOperationalEvent({
      timestamp: simulatedTime,
      type: 'VEHICLE_ARRIVED',
      title: `+${count} Evacuation Trucks Requested`,
      description: 'Dispatched transport vehicles to accelerate warehouse godown clearance.',
      badgeVariant: 'success'
    });

    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: '🚚 Transport Fleet Dispatched',
      message: `${count} additional transport trucks allocated to Poonamallee Loading Bay.`,
      timeAgo: 'Just now',
      type: 'info',
      isRead: false,
      roleTarget: 'operator'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const resetDigitalTwinDemo = () => {
    setQueueTokens(INITIAL_QUEUE_TOKENS);
    setStations(INITIAL_STATIONS);
    setQueueHistory(INITIAL_COMPLETED_HISTORY);
    setCompletedTodayCount(42);
    setStorageUsedKg(6800);
    setStorageCapacityKg(10000);
    setIsProcurementPaused(false);
    setLoadingVehicles(INITIAL_LOADING_VEHICLES);
    setOperationalEvents(INITIAL_OPERATIONAL_EVENTS);
    setSimulatedMinutes(615); // 10:15 AM
  };

  const applyWhatIfScenarioAction = (stationToActivate: number = 4) => {
    openAdditionalStation();
    addOperationalEvent({
      timestamp: simulatedTime,
      type: 'SIMULATION_TRIGGERED',
      title: 'What-If Recommendation Applied',
      description: `Station ${stationToActivate} activated. Estimated waiting time reduced.`,
      badgeVariant: 'success'
    });
  };

  const addOperationalEvent = (event: Omit<OperationalEvent, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const newEvt: OperationalEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: event.timestamp || simulatedTime,
      ...event
    };
    setOperationalEvents((prev) => [newEvt, ...prev]);
  };

  // Section 24: Simulate +1 Farmer
  const addOneDemoFarmer = (customName?: string): QueueToken => {
    const result = queueService.addDemoFarmer(
      queueTokens,
      selectedCentre.id,
      selectedCentre.name,
      customName
    );

    setQueueTokens(result.updatedTokens);

    // Update centre metrics
    setCentres((prevCentres) =>
      prevCentres.map((c) => {
        if (c.id === selectedCentre.id) {
          const nextQueue = c.currentQueue + 1;
          return {
            ...c,
            currentQueue: nextQueue,
            farmersWaitingCount: nextQueue,
            humanizedLoadText: `${nextQueue} farmers currently waiting.`
          };
        }
        return c;
      })
    );

    return result.newToken;
  };

  // Section 23: Simulate +5 Farmers
  const addFiveDemoFarmers = () => {
    let current = queueTokens;
    for (let i = 0; i < 5; i++) {
      const res = queueService.addDemoFarmer(current, selectedCentre.id, selectedCentre.name);
      current = res.updatedTokens;
    }
    setQueueTokens(current);

    setCentres((prevCentres) =>
      prevCentres.map((c) => {
        if (c.id === selectedCentre.id) {
          const nextQueue = c.currentQueue + 5;
          return {
            ...c,
            currentQueue: nextQueue,
            farmersWaitingCount: nextQueue,
            humanizedLoadText: `${nextQueue} farmers currently waiting.`
          };
        }
        return c;
      })
    );

    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: '+5 Farmers Checked In',
      message: `5 new demo farmers have joined the queue at ${selectedCentre.name}.`,
      timeAgo: 'Just now',
      type: 'info',
      isRead: false,
      roleTarget: 'operator'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Section 25: Process Next Active Farmer
  const processNextActiveFarmer = () => {
    // 1. Find active processing station
    const occupiedStation = stations.find((s) => s.status === 'active' && s.currentTokenId);
    if (occupiedStation && occupiedStation.currentTokenId) {
      completeTokenProcurement(occupiedStation.currentTokenId);
    }
    // 2. Automatically call next waiting farmer
    setTimeout(() => {
      callNextFarmer();
    }, 100);
  };

  // Section 26: Advance Demo Time
  const advanceSimulatedClock = (minutes: number = 5) => {
    setSimulatedMinutes((prev) => {
      const nextMins = prev + minutes;
      return nextMins > 1080 ? 540 : nextMins;
    });

    // Check if farmer is near turn and trigger alerts (Section 29)
    if (currentToken && currentToken.status === 'WAITING') {
      const ahead = currentToken.farmersAhead;
      if (ahead === 5) {
        const notif: Notification = {
          id: `NOTIF-${Date.now()}`,
          title: 'Turn Getting Closer',
          message: 'There are only 5 farmers ahead of you. Please stay near the vehicle bay.',
          timeAgo: 'Just now',
          type: 'info',
          isRead: false,
          roleTarget: 'farmer'
        };
        setNotifications((prev) => [notif, ...prev]);
      } else if (ahead === 2) {
        const notif: Notification = {
          id: `NOTIF-${Date.now()}`,
          title: 'Please Be Ready',
          message: 'Only 2 farmers ahead. Position your vehicle near Weighbridge Gate 1.',
          timeAgo: 'Just now',
          type: 'warning',
          isRead: false,
          roleTarget: 'farmer'
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }
  };

  const simulateFiveMinutes = () => {
    advanceSimulatedClock(5);
  };

  const simulateNextFarmer = () => {
    processNextActiveFarmer();
  };

  const simulateCongestion = (centreId: string) => {
    setCentres((prev) =>
      prev.map((c) => {
        if (c.id === centreId) {
          const isCongested = c.loadLabel === 'High';
          const nextLoad = isCongested ? 'Moderate' : 'High';
          const nextWait = isCongested ? 18 : 38;
          const nextQueue = isCongested ? 17 : 32;

          if (!isCongested) {
            const notif: Notification = {
              id: `NOTIF-${Date.now()}`,
              title: '⚠ Centre Activity Has Increased',
              message: `${c.name} is experiencing heavy gate arrivals. Consider arriving slightly later or choosing Avadi Procurement Centre.`,
              timeAgo: 'Just now',
              type: 'warning',
              isRead: false,
              roleTarget: 'farmer'
            };
            setNotifications((prevNotif) => [notif, ...prevNotif]);
          }

          return {
            ...c,
            loadLabel: nextLoad,
            currentWaitMinutes: nextWait,
            status: isCongested ? 'optimal' : 'congested',
            farmersWaitingCount: nextQueue,
            currentQueue: nextQueue,
            humanizedLoadText: isCongested
              ? '17 farmers are currently waiting.'
              : 'High queue latency at inbound gate.'
          };
        }
        return c;
      })
    );
  };

  const clearActiveBooking = () => {
    setActiveBooking(null);
  };

  const restoreActiveBooking = () => {
    setActiveBooking(MOCK_ACTIVE_BOOKING);
    setIsMissedSlotActive(false);
  };

  const addProduce = (newCrop: RegisteredProduce) => {
    setFarmer((prev) => ({
      ...prev,
      registeredProduce: [newCrop, ...prev.registeredProduce]
    }));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getCentreQueueState = (centreId: string = 'PC-TN-04'): CentreQueueState => {
    return queueService.getCentreQueueState(
      centreId,
      queueTokens,
      stations,
      completedTodayCount,
      simulatedTime
    );
  };

  const updateTokenPriorityReason = (tokenId: string, reason: string) => {
    setQueueTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, priorityReason: reason } : t))
    );
  };

  return (
    <KisanSetuContext.Provider
      value={{
        farmer,
        centres,
        selectedCentre,
        bookings,
        activeBooking,
        currentToken,
        vehicles,
        notifications,
        payments,
        ecosystemStats,
        language,
        easyMode,
        isMissedSlotActive,
        simulatedTime,
        slotBookingsMap,
        queueTokens,
        stations,
        queueHistory,
        completedTodayCount,
        storageUsedKg,
        storageCapacityKg,
        isProcurementPaused,
        loadingVehicles,
        operationalEvents,
        setLanguage,
        toggleEasyMode,
        confirmBooking,
        rescheduleBooking,
        takeNextAvailableSlot,
        toggleMissedSlotDemo,
        simulateNextFarmer,
        simulateFiveMinutes,
        advanceSimulatedClock,
        simulateCongestion,
        clearActiveBooking,
        restoreActiveBooking,
        addProduce,
        markAllNotificationsRead,
        isSlotFull,
        callNextFarmer,
        advanceTokenStage,
        completeTokenProcurement,
        checkInToken,
        markTokenNoShow,
        openAdditionalStation,
        closeStationById,
        checkStationCanClose,
        addOneDemoFarmer,
        addFiveDemoFarmers,
        processNextActiveFarmer,
        getCentreQueueState,
        updateTokenPriorityReason,
        pauseProcurement,
        resumeProcurement,
        broadcastAnnouncement,
        requestTransportFleet,
        resetDigitalTwinDemo,
        applyWhatIfScenarioAction,
        addOperationalEvent
      }}
    >
      {children}
    </KisanSetuContext.Provider>
  );
};

export function useKisanSetu() {
  const context = useContext(KisanSetuContext);
  if (!context) {
    throw new Error('useKisanSetu must be used within a KisanSetuProvider');
  }
  return context;
}
