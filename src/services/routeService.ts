import api from './api';
import type { PaginatedResponse, Route } from '../types/route.types';

export const routeService = {
  getRoutes: async (page: number, limit: number = 20, origin_city?: string, status?: string): Promise<PaginatedResponse> => {
    const params: Record<string, string | number | undefined> = { page, limit };
    
    if (origin_city) params.origin_city = origin_city;
    if (status) params.status = status;

    console.log('API Request Params:', params);

    const response = await api.get<PaginatedResponse>('/routes', { params });
    return response.data;
  },

  createRoute: async (route: Omit<Route, 'id'>): Promise<Route> => {
    const response = await api.post<Route>('/routes', route);
    return response.data;
  },

  updateRoute: async (id: number, route: Partial<Route>): Promise<Route> => {
    const response = await api.put<Route>(`/routes/${id}`, route);
    return response.data;
  },

  deleteRoute: async (id: number): Promise<void> => {
    await api.delete(`/routes/${id}`);
  }
};
