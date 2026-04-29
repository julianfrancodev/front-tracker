import { describe, it, expect, vi } from 'vitest';
import { trackingService } from '../services/trackingService';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('trackingService', () => {
  it('should fetch tracking data', async () => {
    const mockTracking = { 
      routeId: '1', 
      lastLocation: 'Cali', 
      progressPercent: 50,
      etaMinutes: 10,
      timestamp: '2026-04-29T00:00:00Z'
    };
    (api.get as any).mockResolvedValue({ data: mockTracking });

    const result = await trackingService.getTracking('1');

    expect(api.get).toHaveBeenCalledWith('/routes/1/tracking');
    expect(result).toEqual(mockTracking);
  });
});
