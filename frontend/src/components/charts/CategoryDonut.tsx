import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#E4A93A', '#6C3ABF', '#0F4F4F', '#3498DB', '#2ECC71', '#E74C3C'];

interface CategoryDonutProps {
  data: { name: string; value: number }[];
}

export function CategoryDonut({ data }: CategoryDonutProps) {
  if (data.length === 0) {
    return <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">No sales data yet.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1F1F22', border: '1px solid #2A2A2E', borderRadius: 10, fontSize: 12 }}
          formatter={(value: number, name: string) => [`${value} units`, name]}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value) => <span style={{ color: '#B0AFAC', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
