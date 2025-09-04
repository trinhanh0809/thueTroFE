export default function StatCard({ title, value, icon, children }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex">
        <div className="me-3 fs-4">{icon}</div>
        <div className="flex-grow-1">
          <div className="text-uppercase text-muted small">{title}</div>
          <div className="h4 mb-0">{value}</div>
          {children}
        </div>
      </div>
    </div>
  )
}
