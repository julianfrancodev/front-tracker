import api from './api';
import type { TrackingData } from '../types/tracking.types';

export const trackingService = {
  getTracking: async (routeId: string | number): Promise<TrackingData> => {
    const response = await api.get<TrackingData>(`/routes/${routeId}/tracking`);
    return response.data;
  }
};
