import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export interface SeriesPoint {
  date: string;
  value: number;
}

export interface Forecast {
  history: SeriesPoint[];
  prediction: SeriesPoint[];
  trend: 'up' | 'down' | 'flat';
  changePct: number;
  confidence: number;
  dataPoints: number;
  sufficient: boolean;
  predictedTotal: number;
}

export interface OwnerAnalytics {
  rangeDays: number;
  forecast: Forecast;
  salesByCategory: { category: string; units: number; revenue: number }[];
  customerAcquisition: { week: string; verified: number; unverified: number }[];
  heatmap: { day: number; hour: number; count: number }[];
  funnel: { stage: string; value: number }[];
}

export async function getOwnerAnalytics(days = 90): Promise<OwnerAnalytics> {
  const { data } = await api.get<ApiSuccess<OwnerAnalytics>>('/owner/analytics', { params: { days } });
  return data.data;
}
