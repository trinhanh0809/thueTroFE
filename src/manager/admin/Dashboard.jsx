import { useState } from 'react'
import { currency, genMock } from '../utils/mock'
import StatCard from './components/StatCard'
import Progress from './components/Progress'
import RevenueSourcesPie from './charts/RevenueSourcesPie'
import EarningsChart from './charts/EarningsChart'

export default function Dashboard() {
  const [data, setData] = useState(genMock())
  const { cards, charts } = data

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="fw-semibold">Dashboard</h1>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setData(genMock())}
          >
            Regenerate Data
          </button>
          <button className="btn btn-outline-secondary">Generate Report</button>
        </div>
      </div>

      {/* Cards */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Earnings (Monthly)"
            value={currency(cards.monthlyEarnings)}
            icon={<span>📅</span>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Earnings (Annual)"
            value={currency(cards.annualEarnings)}
            icon={<span>💲</span>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Tasks"
            value={`${cards.tasks}%`}
            icon={<span>🗒️</span>}
          >
            <Progress value={cards.tasks} />
          </StatCard>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Pending Requests"
            value={cards.pendingRequests}
            icon={<span>💬</span>}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <EarningsChart data={charts.earnings} />
        </div>
        <div className="col-12 col-lg-4">
          <RevenueSourcesPie data={charts.revenueSources} />
        </div>
      </div>

      <div className="small text-muted mt-3">
        * Dữ liệu đang mock. Khi dùng thật, thay `genMock()` bằng gọi API của
        bạn.
      </div>
    </div>
  )
}
