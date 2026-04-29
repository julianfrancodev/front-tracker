import { describe, it, expect, vi, Mocked } from 'vitest';
import { trackingService } from '../services/trackingService';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApi = api as Mocked<typeof api>;

describe('trackingService', () => {
  it('should fetch tracking data', async () => {
    const mockTracking = { 
      routeId: '1', 
      lastLocation: 'Cali', 
      progressPercent: 50,
      etaMinutes: 10,
      timestamp: '2026-04-29T00:00:00Z'
    };
    mockedApi.get.mockResolvedValue({ data: mockTracking });

    const result = await trackingService.getTracking('1');

    expect(api.get).toHaveBeenCalledWith('/routes/1/tracking');
    expect(result).toEqual(mockTracking);
  });
});
