import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export interface FinancialPoint {
  date: string;
  gross: number;
  refunds: number;
  net: number;
}

export interface PaymentSlice {
  method: string;
  amount: number;
  count: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string | null;
  actor: string;
  actorRole: string;
  ipAddress: string | null;
  createdAt: string;
}

export interface OwnerDashboard {
  rangeDays: number;
  metrics: {
    grossRevenue: number;
    netRevenue: number;
    refunds: number;
    totalOrders: number;
    paidOrders: number;
    avgOrderValue: number;
    newCustomers: number;
    shippingCollected: number;
  };
  financialSeries: FinancialPoint[];
  paymentBreakdown: PaymentSlice[];
  pendingActions: { pendingOrders: number; pendingDeletions: number; lowStock: number; pendingReturns: number };
  recentActivity: ActivityItem[];
}

export interface OwnerFinancials {
  range: { from: string; to: string };
  summary: {
    grossRevenue: number;
    refunds: number;
    netRevenue: number;
    paidOrders: number;
    avgOrderValue: number;
    shippingCollected: number;
    discountsGiven: number;
  };
  revenueSeries: FinancialPoint[];
  paymentMethods: { method: string; revenue: number; orders: number }[];
  productPerformance: { id: string; name: string; units: number; revenue: number }[];
}

export async function getOwnerDashboard(days = 30): Promise<OwnerDashboard> {
  const { data } = await api.get<ApiSuccess<OwnerDashboard>>('/owner/dashboard', { params: { days } });
  return data.data;
}

export async function getOwnerFinancials(params: { from?: string; to?: string } = {}): Promise<OwnerFinancials> {
  const { data } = await api.get<ApiSuccess<OwnerFinancials>>('/owner/financials', { params });
  return data.data;
}
