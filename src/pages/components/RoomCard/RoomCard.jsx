import { Link } from 'react-router-dom'
import '@/pages/components/RoomCard/RoomCard.css'
const fmtPrice = (v) => {
  const m = Number(v) / 1_000_000
  const s = Number.isInteger(m) ? String(m) : m.toFixed(3).replace(/\.?0+$/, '')
  return `${s} triệu/tháng`
}

export default function RoomCard({ item }) {
  return (
    <div className="position-relative room">
      <div className="room-image">
        <img className="room-img" src={item.imageUrls?.[0]} alt={item.title} />
      </div>
      <div className="card-body ">
        <h6 className="room-title clamp-2 ">{item.title}</h6>

        <Link
          to={`/rooms/${item.id}`}
          className="stretched-link"
          aria-label={item.title}
        ></Link>
        <div className="room-price small text-muted">
          Từ <span className="text-orange">{fmtPrice(item.priceMonth)}</span>
        </div>
        <div className="room-tags">
          <span className="badge text-bg-primary-subtle text-primary fw-semibold text-bg-light border">
            {item.roomTypeName}
          </span>
          <span className="badge text-bg-secondary-subtle text-secondary fw-semibold text-bg-light border">
            {item.areaSqm}m²
          </span>
        </div>

        <div className="room-address small text-secondary clamp-1">
          <i class="bi bi-geo-alt"></i>
          {item.addressLine}
        </div>
      </div>
    </div>
  )
}
