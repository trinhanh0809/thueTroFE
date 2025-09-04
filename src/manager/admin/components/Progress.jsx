export default function Progress({ value }) {
  return (
    <div className="mt-2">
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div className="progress-bar" style={{ width: `${value}%` }} />
      </div>
      <div className="small text-muted mt-1">{value}%</div>
    </div>
  )
}
