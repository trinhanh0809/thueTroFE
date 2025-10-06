// HomePage.jsx
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/Search/Search'
import RoomTypeRoom from './rooms/RoomTypeRoom'
import AllRoomsPage from './rooms/AllRoomsPage'
import FeaturedProvinces from './rooms/RoomsByLocation'

// ===== helpers để map UI -> API =====
const PRICE_UNIT = 1_000_000
const toPos = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}
const parsePriceStr = (s) => {
  if (!s) return {}
  if (s.endsWith('+')) {
    const a = toPos(s.slice(0, -1))
    return a ? { priceMin: a * PRICE_UNIT } : {}
  }
  const [a, b] = s.split('-')
  const min = toPos(a),
    max = toPos(b)
  return {
    ...(min ? { priceMin: min * PRICE_UNIT } : {}),
    ...(max ? { priceMax: max * PRICE_UNIT } : {}),
  }
}
const parseAreaCode = (code) => {
  if (!code) return {}
  if (code.endsWith('+')) {
    const a = toPos(code)
    return a ? { areaMin: a } : {}
  }
  const [a, b] = code.split('-')
  const min = toPos(a),
    max = toPos(b)
  return {
    ...(min ? { areaMin: min } : {}),
    ...(max ? { areaMax: max } : {}),
  }
}

export default function HomePage() {
  const nav = useNavigate()

  const go = (v) => {
    // v: { q, roomTypeId, price, area }
    const sp = new URLSearchParams()

    // q
    if (v.q?.trim()) sp.set('q', v.q.trim())

    // roomTypeId (>0 mới set)
    const rt = toPos(v.roomTypeId)
    if (rt) sp.set('roomTypeId', String(rt))

    // price (triệu -> VND)
    const p = parsePriceStr(v.price)
    if (p.priceMin) sp.set('priceMin', String(p.priceMin))
    if (p.priceMax) sp.set('priceMax', String(p.priceMax))

    // area (m²)
    const a = parseAreaCode(v.area)
    if (a.areaMin) sp.set('areaMin', String(a.areaMin))
    if (a.areaMax) sp.set('areaMax', String(a.areaMax))

    // paging mặc định
    sp.set('page', '0')
    sp.set('size', '20')

    // dọn các key legacy nếu có (đề phòng)
    sp.delete('cat')
    sp.delete('typeId')
    sp.delete('price')
    sp.delete('area')

    nav({ pathname: '/rooms', search: sp.toString() })
  }

  return (
    <div>
      {/* HERO */}
      <div className="hero">
        <img
          className="hero-img"
          src="https://vcdn1-vnexpress.vnecdn.net/2017/03/31/Hoguom1.jpg?w=680&h=0&q=100&dpr=2&fit=crop&s=dfTSxKIsVc8174AEdz3smg"
          alt="Hero"
        />
        <div className="hero-content container">
          <h1 className="hero-title">Tìm phòng phù hợp cho bạn</h1>
          <p className="hero-subtitle">Nhanh, dễ, chính xác theo nhu cầu</p>
          <div className="hero-search">
            {/* Có thể prefill nếu muốn: initial={{ q:'', roomTypeId:'', price:'', area:'' }} */}
            <SearchBar variant="hero" onSubmit={go} />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container">
        <div className="row g-3">
          <AllRoomsPage />
        </div>
        <div className="row g-3">
          <RoomTypeRoom />
        </div>
        <div className="row g-3">
          <FeaturedProvinces />
        </div>
      </div>

      <style>{`
        .hero{ position:relative; width:100%; height:474px; border-radius:10px; overflow:hidden; margin-bottom:24px; }
        .hero-img{ width:100%; height:100%; display:block; object-fit:cover; transform:scale(1.03); }
        .hero-content{ position:absolute; inset:0; display:flex; top: 500px; z-index:1; flex-direction:column; justify-content:center; align-items:flex-start; gap:12px; color:#fff; padding:24px; }
        .hero-title{ font-size:clamp(22px, 3.2vw, 38px); font-weight:800; line-height:1.15; margin:0; text-shadow:0 2px 8px rgba(0,0,0,.35); }
        .hero-subtitle{ font-size:clamp(14px, 1.6vw, 18px); margin:0 0 8px 0; opacity:.95; text-shadow:0 1px 6px rgba(0,0,0,.35); }
        @media (max-width: 576px){ .hero{ height:360px; border-radius:8px; } .hero-content{ padding:16px; } }
        .hero-search {     width: 100%;
        }
      `}</style>
    </div>
  )
}
