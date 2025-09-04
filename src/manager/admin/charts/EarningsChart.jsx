import { currency } from '@/manager/utils/mock'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

export default function EarningsChart({ data }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="fw-semibold mb-3">Earnings Overview</div>

        {/* Quan trọng: container phải có chiều cao cụ thể */}
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [currency(v), 'Earnings']} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0d6efd"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
