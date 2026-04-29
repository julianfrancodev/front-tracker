import api from './api';
import type { TrackingData } from '../types/tracking.types';

export const trackingService = {
  getTracking: async (routeId: string | number): Promise<TrackingData> => {
    // Tipamos la respuesta como unknown para normalizarla de forma segura
    const response = await api.get<unknown>(`/routes/${routeId}/tracking`);
    const body = response.data;
    
    console.log('Tracking API Response:', body);
    
    // Normalización: Si el backend devuelve { success, data: { ... } }
    if (body && typeof body === 'object' && 'data' in body) {
      return (body as { data: TrackingData }).data;
    }
    
    // Si devuelve el objeto plano { routeId, ... }
    return body as TrackingData;
  }
};
