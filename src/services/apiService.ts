import {
  Farmer,
  ProcurementCentre,
  Booking,
  QueueToken,
  Vehicle,
  Notification,
  EcosystemStats
} from '../types';
import {
  MOCK_FARMER,
  MOCK_ACTIVE_BOOKING,
  MOCK_BOOKINGS,
  MOCK_CENTRES,
  MOCK_QUEUE_TOKEN,
  MOCK_VEHICLES,
  MOCK_NOTIFICATIONS,
  MOCK_ECOSYSTEM_STATS
} from '../data/mockData';

/**
 * Service abstraction for KisanSetu.
 * In Part 1, this returns strongly-typed mock data asynchronously.
 * Future modules can seamlessly connect to REST/RPC or real database backends
 * without changing the caller interface.
 */
class KisanSetuService {
  async getFarmerProfile(): Promise<Farmer> {
    return Promise.resolve({ ...MOCK_FARMER });
  }

  async getActiveBooking(): Promise<Booking | null> {
    return Promise.resolve({ ...MOCK_ACTIVE_BOOKING });
  }

  async getBookings(): Promise<Booking[]> {
    return Promise.resolve([...MOCK_BOOKINGS]);
  }

  async getProcurementCentres(): Promise<ProcurementCentre[]> {
    return Promise.resolve([...MOCK_CENTRES]);
  }

  async getCentreById(id: string): Promise<ProcurementCentre | undefined> {
    const centre = MOCK_CENTRES.find(c => c.id === id);
    return Promise.resolve(centre ? { ...centre } : undefined);
  }

  async getQueueTokens(): Promise<QueueToken[]> {
    return Promise.resolve([{ ...MOCK_QUEUE_TOKEN }]);
  }

  async getActiveQueueToken(): Promise<QueueToken> {
    return Promise.resolve({ ...MOCK_QUEUE_TOKEN });
  }

  async getVehicles(): Promise<Vehicle[]> {
    return Promise.resolve([...MOCK_VEHICLES]);
  }

  async getNotifications(role?: string): Promise<Notification[]> {
    const list = role
      ? MOCK_NOTIFICATIONS.filter(n => n.roleTarget === role || n.roleTarget === 'all')
      : MOCK_NOTIFICATIONS;
    return Promise.resolve([...list]);
  }

  async getEcosystemStats(): Promise<EcosystemStats> {
    return Promise.resolve({ ...MOCK_ECOSYSTEM_STATS });
  }
}

export const apiService = new KisanSetuService();
