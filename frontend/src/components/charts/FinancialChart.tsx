import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { formatPrice } from '@/lib/utils';

interface FinancialChartProps {
  data: { date: string; gross: number; refunds: number; net: number }[];
}

function shortDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const LABELS: Record<string, string> = { gross: 'Gross Revenue', refunds: 'Refunds', net: 'Net Revenue' };

export function FinancialChart({ data }: FinancialChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} stroke="#6E6D69" fontSize={11} tickLine={false} />
        <YAxis stroke="#6E6D69" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
        <Tooltip
          contentStyle={{ background: '#1F1F22', border: '1px solid #2A2A2E', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#B0AFAC' }}
          labelFormatter={shortDate}
          formatter={(value: number, name: string) => [formatPrice(value), LABELS[name] ?? name]}
        />
        <Legend iconType="circle" formatter={(value) => <span style={{ color: '#B0AFAC', fontSize: 12 }}>{LABELS[value] ?? value}</span>} />
        <Line type="monotone" dataKey="gross" stroke="#E4A93A" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="net" stroke="#2ECC71" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="refunds" stroke="#E74C3C" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
