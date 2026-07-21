import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { STATUS_LABELS } from '../../types/tracking'
import type { DashboardStats, ShipmentStatus } from '../../types/tracking'

const COLORS: Record<ShipmentStatus, string> = {
  pending: '#94a3b8',
  picked_up: '#3b82f6',
  in_transit: '#f59e0b',
  out_for_delivery: '#6366f1',
  delivered: '#10b981',
  exception: '#ef4444',
  returned: '#f97316',
}

type Props = {
  stats: DashboardStats
}

export default function StatusPieChart({ stats }: Props) {
  const data = [
    { name: STATUS_LABELS.pending, value: stats.pending, status: 'pending' as ShipmentStatus },
    { name: STATUS_LABELS.in_transit, value: stats.in_transit, status: 'in_transit' as ShipmentStatus },
    { name: STATUS_LABELS.delivered, value: stats.delivered, status: 'delivered' as ShipmentStatus },
    { name: STATUS_LABELS.exception, value: stats.exceptions, status: 'exception' as ShipmentStatus },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Nessun dato disponibile
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} spedizioni`, name]}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        <Legend
          formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
