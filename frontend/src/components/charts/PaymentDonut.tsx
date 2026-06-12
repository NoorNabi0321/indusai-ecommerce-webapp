import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatPrice } from '@/lib/utils';

const METHOD_COLORS: Record<string, string> = {
  COD: '#E4A93A',
  STRIPE: '#6C3ABF',
  JAZZCASH: '#E74C3C',
  EASYPAISA: '#2ECC71',
};
const METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  STRIPE: 'Card (Stripe)',
  JAZZCASH: 'JazzCash',
  EASYPAISA: 'Easypaisa',
};

interface PaymentDonutProps {
  data: { method: string; amount: number; count: number }[];
}

export function PaymentDonut({ data }: PaymentDonutProps) {
  if (data.length === 0) {
    return <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">No payments yet.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="method" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
          {data.map((d) => (
            <Cell key={d.method} fill={METHOD_COLORS[d.method] ?? '#3498DB'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1F1F22', border: '1px solid #2A2A2E', borderRadius: 10, fontSize: 12 }}
          formatter={(value: number, name: string) => [formatPrice(value), METHOD_LABELS[name] ?? name]}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value) => <span style={{ color: '#B0AFAC', fontSize: 12 }}>{METHOD_LABELS[value] ?? value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
