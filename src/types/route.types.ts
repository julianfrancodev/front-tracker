export interface Route {
  id: number;
  origin_city: string;
  destination_city: string;
  distance_km: number;
  estimated_time_hours: number;
  vehicle_type: string;
  carrier: string;
  cost_usd: number;
  status: string;
}

export interface PaginatedResponse {
  success: boolean;
  data: Route[];
  total: number;
  page: number;
  totalPages: number;
}
