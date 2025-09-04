import { currency } from '@/manager/utils/mock'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts'

const COLORS = ['#0d6efd', '#198754', '#20c997'] // bootstrap-ish

export default function RevenueSourcesPie({ data }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="fw-semibold mb-3">Revenue Sources</div>

        {/* Quan trọng: container phải có chiều cao cụ thể */}
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                label
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
              <Tooltip formatter={(v, n) => [currency(v), n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
