import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatPrice } from '@/lib/utils';

interface SalesChartProps {
  data: { date: string; orders: number; revenue?: number }[];
  showRevenue?: boolean;
}

function shortDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function SalesChart({ data, showRevenue }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} stroke="#6E6D69" fontSize={11} tickLine={false} />
        <YAxis stroke="#6E6D69" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#1F1F22', border: '1px solid #2A2A2E', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#B0AFAC' }}
          labelFormatter={shortDate}
          formatter={(value: number, name: string) =>
            name === 'revenue' ? [formatPrice(value), 'Revenue'] : [value, 'Orders']
          }
        />
        <Line type="monotone" dataKey="orders" stroke="#E4A93A" strokeWidth={2} dot={false} />
        {showRevenue && <Line type="monotone" dataKey="revenue" stroke="#6C3ABF" strokeWidth={2} dot={false} />}
      </LineChart>
    </ResponsiveContainer>
  );
}
