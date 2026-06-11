import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';
import type { OrderStatus, PaymentMethod } from '@/types/order.types';

export interface DashboardData {
  isOwner: boolean;
  metrics: {
    ordersToday: number;
    revenueToday: number | null;
    pendingOrders: number;
    lowStockCount: number;
  };
  salesSeries: { date: string; orders: number; revenue?: number }[];
  categoryBreakdown: { name: string; value: number }[];
  topProducts: { id: string; name: string; image: string | null; unitsSold: number; revenue: number | null }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    paymentMethod: PaymentMethod | null;
  }[];
  pendingDeletions: number;
}

export async function getAdminDashboard(days: 7 | 30 = 7): Promise<DashboardData> {
  const { data } = await api.get<ApiSuccess<DashboardData>>('/admin/dashboard', { params: { days } });
  return data.data;
}
