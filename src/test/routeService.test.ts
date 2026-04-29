import { describe, it, expect, vi, Mocked } from 'vitest';
import { routeService } from '../services/routeService';
import api from '../services/api';
import type { Route } from '../types/route.types';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = api as Mocked<typeof api>;

describe('routeService', () => {
  it('should fetch routes with correct params', async () => {
    const mockData = { data: [], total: 0, page: 1, totalPages: 1 };
    mockedApi.get.mockResolvedValue({ data: mockData });

    const result = await routeService.getRoutes(1, 20, 'Bogotá');

    expect(api.get).toHaveBeenCalledWith('/routes', expect.objectContaining({
      params: expect.objectContaining({
        page: 1,
        limit: 20,
        origin_city: 'Bogotá'
      })
    }));
    expect(result).toEqual(mockData);
  });

  it('should create a route', async () => {
    const newRoute = { origin_city: 'A', destination_city: 'B', carrier: 'C' } as Omit<Route, 'id'>;
    mockedApi.post.mockResolvedValue({ data: { id: 1, ...newRoute } });

    const result = await routeService.createRoute(newRoute);

    expect(api.post).toHaveBeenCalledWith('/routes', newRoute);
    expect(result.id).toBe(1);
  });
});
