import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiList from '@/api'
import RoomList from './rooms/RoomList'
import RoomTypeRoom from './rooms/RoomTypeRoom'

const FALLBACK =
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80'

const fmtPrice = (v) => {
  if (v == null) return 'Liên hệ'
  const m = Number(v) / 1_000_000
  const s = Number.isInteger(m) ? String(m) : m.toFixed(3).replace(/\.?0+$/, '')
  return `${s} triệu/tháng`
}

const fmtDate = (d) => {
  if (!d) return null
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return null
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

const addrStr = (r) =>
  [r?.addressLine, r?.wardName, r?.districtName, r?.provinceName]
    .filter(Boolean)
    .join(', ')

export default function RoomDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  // Lightbox state
  const [lbOpen, setLbOpen] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)
  const touchStartX = useRef(null)
  const touchDeltaX = useRef(0)

  // fetch detail
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await apiList.getRoomId(id)
        const body = res?.data ?? res
        if (!alive) return
        setItem(body?.data || body)
      } catch (e) {
        console.error(e)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [id])

  // images list (đảm bảo đủ 3 ảnh cho gallery)
  const images = useMemo(() => {
    const arr = item?.imageUrls || []
    if (arr.length >= 3) return arr
    return [...arr, ...Array(Math.max(0, 3 - arr.length)).fill(FALLBACK)]
  }, [item])

  // fullList dùng cho lightbox (nếu không có ảnh thì dùng FALLBACK)
  const fullList = useMemo(() => {
    const arr =
      item?.imageUrls && item.imageUrls.length ? item.imageUrls : [FALLBACK]
    return arr
  }, [item])

  const openLightbox = useCallback((index) => {
    setLbIndex(index)
    setLbOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLbOpen(false)
  }, [])

  const prevImage = useCallback(() => {
    setLbIndex((i) => (i - 1 + fullList.length) % fullList.length)
  }, [fullList.length])

  const nextImage = useCallback(() => {
    setLbIndex((i) => (i + 1) % fullList.length)
  }, [fullList.length])

  // khóa scroll body khi mở lightbox + lắng nghe ESC / mũi tên
  useEffect(() => {
    if (lbOpen) {
      const onKey = (e) => {
        if (e.key === 'Escape') closeLightbox()
        if (e.key === 'ArrowLeft') prevImage()
        if (e.key === 'ArrowRight') nextImage()
      }
      document.addEventListener('keydown', onKey)
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', onKey)
        document.body.style.overflow = prevOverflow
      }
    }
  }, [lbOpen, closeLightbox, prevImage, nextImage])

  // Vuốt trên mobile
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }
  const onTouchMove = (e) => {
    if (touchStartX.current != null) {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current
    }
  }
  const onTouchEnd = () => {
    const THRESHOLD = 60
    if (touchDeltaX.current > THRESHOLD) prevImage()
    else if (touchDeltaX.current < -THRESHOLD) nextImage()
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">Đang tải…</div>
      </div>
    )
  }

  const address = addrStr(item)
  const contactName = item?.contact?.name || item?.contact
  const contactPhone = item?.contact?.phone || item?.phone
  const zaloUrl = item?.zaloUrl || item?.zalo || item?.contact?.zaloUrl
  const postedDate = fmtDate(
    item?.postedAt || item?.createdAt || item?.created_date || item?.created_at
  )

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav className="mb-3 small" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/rooms">
              {item?.roomTypeName || item?.roomType?.name}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {item?.title}
          </li>
        </ol>
      </nav>

      {/* Header + gallery trong hộp shadow */}
      <div className="detail-wrap rounded-4 p-3 p-md-4 mb-4">
        <h4 className="fw-bold mb-1">{item?.title}</h4>
        <div className="text-muted mb-3">
          <i className="bi bi-geo-alt me-1" />
          {address}
        </div>

        {/* Gallery */}
        <div className="gallery mb-3">
          {/* ảnh lớn bên trái */}
          <div className="g-main">
            <img
              src={images[0] || FALLBACK}
              alt=""
              onError={(e) => (e.currentTarget.src = FALLBACK)}
              onClick={() => openLightbox(0)}
              style={{ cursor: 'zoom-in' }}
            />
          </div>

          {/* 4 ảnh nhỏ bên phải */}
          <div className="g-side">
            <img
              src={images[1] || FALLBACK}
              alt=""
              onError={(e) => (e.currentTarget.src = FALLBACK)}
              onClick={() => openLightbox(Math.min(1, fullList.length - 1))}
              style={{ cursor: 'zoom-in' }}
            />
          </div>
          <div className="g-side">
            <img
              src={images[2] || FALLBACK}
              alt=""
              onError={(e) => (e.currentTarget.src = FALLBACK)}
              onClick={() => openLightbox(Math.min(2, fullList.length - 1))}
              style={{ cursor: 'zoom-in' }}
            />
          </div>
          <div className="g-side">
            <img
              src={images[1] || FALLBACK}
              alt=""
              onError={(e) => (e.currentTarget.src = FALLBACK)}
              onClick={() => openLightbox(Math.min(1, fullList.length - 1))}
              style={{ cursor: 'zoom-in' }}
            />
          </div>
          <div className="g-side">
            <img
              src={images[2] || FALLBACK}
              alt=""
              onError={(e) => (e.currentTarget.src = FALLBACK)}
              onClick={() => openLightbox(Math.min(2, fullList.length - 1))}
              style={{ cursor: 'zoom-in' }}
            />
            {item?.imageUrls?.length > 3 && (
              <span className="more-overlay">+{item.imageUrls.length - 3}</span>
            )}
          </div>
        </div>

        {/* ===== Thanh thông tin dưới ảnh ===== */}
        <div className="info-strip rounded-3 mb-3">
          <div className="d-flex flex-wrap align-items-center gap-4">
            {(item?.roomTypeName || item?.roomType?.name) && (
              <span className="d-inline-flex align-items-center">
                <i className="bi bi-house-door me-2" />
                {item?.roomTypeName || item?.roomType?.name}
              </span>
            )}

            <span className="d-inline-flex align-items-center">
              <i className="bi bi-cash-coin me-2" />
              Giá từ <b className="ms-1">{fmtPrice(item?.priceMonth)}</b>
            </span>

            {contactName && (
              <span className="d-inline-flex align-items-center">
                <i className="bi bi-person me-2" />
                Chủ trọ: <b className="ms-1">{contactName}</b>
              </span>
            )}

            {contactPhone && (
              <span className="d-inline-flex align-items-center">
                <i className="bi bi-telephone me-2" />
                <a
                  href={`tel:${contactPhone}`}
                  className="text-decoration-none"
                >
                  {contactPhone}
                </a>
              </span>
            )}

            {postedDate && (
              <span className="d-inline-flex align-items-center">
                <i className="bi bi-clock me-2" />
                Ngày đăng: <b className="ms-1">{postedDate}</b>
              </span>
            )}
          </div>

          <div className="ms-auto d-flex align-items-center gap-2">
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="btn btn-orange btn-sm">
                <i className="bi bi-telephone me-1" />
                Liên hệ chủ trọ
              </a>
            )}
            {zaloUrl && (
              <a
                href={zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-light btn-sm"
                title="Zalo"
              >
                Zalo
              </a>
            )}
          </div>
        </div>
        {/* ===== /info-strip ===== */}

        {/* price + meta hàng dưới ảnh */}
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="fs-5">
            <span className="text-muted">Giá chỉ từ</span>{' '}
            <b className="text-orange">{fmtPrice(item?.priceMonth)}</b>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {item?.roomType?.name && (
              <span className="badge text-bg-light border">
                {item.roomType.name}
              </span>
            )}
            {typeof item?.areaSqm === 'number' && (
              <span className="badge text-bg-light border">
                {item.areaSqm} m²
              </span>
            )}
            {item?.maxOccupancy && (
              <span className="badge text-bg-light border">
                Tối đa {item.maxOccupancy} người
              </span>
            )}
            {item?.deposit != null && (
              <span className="badge text-bg-light border">
                Cọc {item.deposit} triệu
              </span>
            )}
          </div>

          <div className="ms-auto d-none d-md-flex align-items-center gap-2">
            <button className="btn btn-light btn-sm">
              <i className="bi bi-share me-1" />
              Chia sẻ
            </button>
            <button className="btn btn-light btn-sm">
              <i className="bi bi-heart me-1" />
              Lưu
            </button>
            <button className="btn btn-light btn-sm">
              <i className="bi bi-flag me-1" />
              Báo xấu
            </button>
          </div>
        </div>
      </div>

      {/* Giới thiệu */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Giới thiệu</h5>
          <div className="text-body">
            {item?.description?.trim() ? (
              item.description.split('\n').map((p, i) => (
                <p key={i} className="mb-2">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-muted mb-0">Chưa có mô tả.</p>
            )}
          </div>

          <hr className="my-4" />

          <div className="row g-3">
            <div className="col-md-6">
              <div>
                <b>Yêu cầu:</b>{' '}
                {item?.maxOccupancy ? `tối đa ${item.maxOccupancy} người` : '—'}
              </div>
              <div>
                <b>Giá thuê:</b> {fmtPrice(item?.priceMonth)}
              </div>
              <div>
                <b>Địa chỉ:</b> {address || '—'}
              </div>
              {(contactName || contactPhone) && (
                <div>
                  <b>Liên hệ:</b>{' '}
                  {[contactName, contactPhone].filter(Boolean).join(' • ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách loại phòng */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Danh sách loại phòng</h5>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 120 }}>Ảnh</th>
                  <th>Thông tin</th>
                  <th>Tiện nghi</th>
                  <th style={{ width: 170 }} className="text-end">
                    Giá thuê phòng
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <img
                      src={images[0] || FALLBACK}
                      alt="thumb"
                      className="rounded"
                      style={{
                        width: 100,
                        height: 75,
                        objectFit: 'cover',
                        cursor: 'zoom-in',
                      }}
                      onError={(e) => (e.currentTarget.src = FALLBACK)}
                      onClick={() => openLightbox(0)}
                    />
                  </td>
                  <td className="small">
                    {item?.title || 'Phòng'} <br />
                    {item?.areaSqm ? `${item.areaSqm} m²` : '— m²'} •{' '}
                    {item?.roomType?.name || '—'}
                  </td>
                  <td className="small">
                    {(item?.amenityNames || []).slice(0, 6).map((a) => (
                      <span
                        key={a}
                        className="badge text-bg-light border me-1 mb-1"
                      >
                        {a}
                      </span>
                    ))}
                    {item?.amenityNames?.length > 6 && (
                      <span className="badge text-bg-light border">
                        +{item.amenityNames.length - 6}
                      </span>
                    )}
                  </td>
                  <td className="text-end fw-semibold">
                    {fmtPrice(item?.priceMonth)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tiện nghi / Đối tượng / Môi trường xung quanh */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-4">
              <h6 className="mb-3">Đối tượng</h6>
              <ul className="list-unstyled small mb-0">
                <li>
                  <i className="bi bi-mortarboard me-2" />
                  Đi học
                </li>
                <li>
                  <i className="bi bi-briefcase me-2" />
                  Đi làm
                </li>
                <li>
                  <i className="bi bi-people me-2" />
                  Gia đình
                </li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="mb-3">Tiện nghi</h6>
              <div className="d-flex flex-wrap gap-2">
                {(item?.amenityNames || []).length ? (
                  item.amenityNames.map((a) => (
                    <span key={a} className="badge text-bg-light border">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-muted small">—</span>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <h6 className="mb-3">Môi trường xung quanh</h6>
              <ul className="list-unstyled small mb-0">
                <li>
                  <i className="bi bi-bag me-2" />
                  Chợ
                </li>
                <li>
                  <i className="bi bi-building me-2" />
                  Trường học
                </li>
                <li>
                  <i className="bi bi-cart3 me-2" />
                  Siêu thị
                </li>
                <li>
                  <i className="bi bi-bus-front me-2" />
                  Bến xe Bus
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Đường đi</h5>
          <div className="ratio ratio-16x9">
            <iframe
              title="map"
              src={
                item?.lat && item?.lng
                  ? `https://www.google.com/maps?q=${item.lat},${item.lng}&z=16&output=embed`
                  : `https://www.google.com/maps?q=${encodeURIComponent(address || '')}&z=15&output=embed`
              }
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <RoomTypeRoom />
      </div>

      {/* Lightbox Overlay */}
      {lbOpen && (
        <div
          className="lb-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh lớn"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="lb-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lb-close"
              aria-label="Đóng"
              onClick={closeLightbox}
            >
              <i className="bi bi-x-lg" />
            </button>

            <button
              className="lb-nav lb-prev"
              aria-label="Ảnh trước"
              onClick={prevImage}
            >
              <i className="bi bi-chevron-left" />
            </button>

            <img
              src={fullList[lbIndex] || FALLBACK}
              alt={`Ảnh ${lbIndex + 1}`}
              onError={(e) => (e.currentTarget.src = FALLBACK)}
              className="lb-img"
            />

            <button
              className="lb-nav lb-next"
              aria-label="Ảnh sau"
              onClick={nextImage}
            >
              <i className="bi bi-chevron-right" />
            </button>

            <div className="lb-counter">
              {lbIndex + 1} / {fullList.length}
            </div>
          </div>
        </div>
      )}

      {/* page styles */}
      <style>{`
        .detail-wrap{
          background:#fff;
          border:1px solid rgba(2,6,23,.06);
          box-shadow: 0 20px 45px rgba(17,24,39,.08), 0 4px 12px rgba(17,24,39,.06);
        }
        .text-orange{ color:#ff6a00 !important; }

        /* info strip dưới ảnh */
        .info-strip{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:12px 14px;
          border-top:1px solid rgba(2,6,23,.06);
          border-bottom:1px solid rgba(2,6,23,.06);
          background:#fff;
        }
        .btn-orange{
          background:#ff6a00;
          border-color:#ff6a00;
          color:#fff;
        }
        .btn-orange:hover{ opacity:.9; color:#fff; }

        /* gallery */
        .gallery{
          display:grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: 220px 220px; /* chỉnh cao ảnh tại đây */
          gap:12px;
        }
        .gallery .g-main{ grid-row:1 / span 2; grid-column:1; overflow:hidden; border-radius:12px; }
        .gallery .g-side{ overflow:hidden; border-radius:12px; position:relative; }
        .gallery img{ width:100%; height:100%; object-fit:cover; display:block; }
        .gallery img{ transition: transform .25s ease; }
        .gallery img:hover{ transform: scale(1.02); }
        .more-overlay{
          position:absolute; inset:auto 12px 12px auto;
          background:rgba(0,0,0,.55); color:#fff; padding:6px 10px; border-radius:999px; font-weight:700;
        }
        @media (max-width: 768px){
          .gallery{ grid-template-columns: 1fr; grid-template-rows: auto; }
          .gallery .g-main{ grid-row:auto; }
          .info-strip{ flex-direction:column; align-items:flex-start; }
        }

        /* Lightbox */
        .lb-backdrop{
          position:fixed; inset:0; background:rgba(0,0,0,.9);
          display:flex; align-items:center; justify-content:center;
          z-index: 1050; /* cao hơn bootstrap modal */
          animation: lb-fade .12s ease;
        }
        @keyframes lb-fade { from{opacity:0} to{opacity:1} }
        .lb-content{
          position:relative; width:100%; height:100%;
          display:flex; align-items:center; justify-content:center;
          padding: 24px;
        }
        .lb-img{
          max-width: 92vw; max-height: 82vh; object-fit: contain; box-shadow: 0 10px 30px rgba(0,0,0,.4);
          border-radius: 10px;
        }
        .lb-close{
          position:absolute; top:18px; right:18px; border:0; background:rgba(255,255,255,.14);
          color:#fff; width:42px; height:42px; border-radius:999px;
          display:flex; align-items:center; justify-content:center;
          backdrop-filter: blur(4px);
        }
        .lb-close:hover{ background:rgba(255,255,255,.22); }
        .lb-nav{
          position:absolute; top:50%; transform: translateY(-50%);
          border:0; background:rgba(255,255,255,.14); color:#fff;
          width:48px; height:72px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          backdrop-filter: blur(4px);
        }
        .lb-prev{ left:18px; }
        .lb-next{ right:18px; }
        .lb-nav:hover{ background:rgba(255,255,255,.22); }
        .lb-counter{
          position:absolute; bottom:18px; left:50%; transform: translateX(-50%);
          color:#eee; font-size:14px; background:rgba(0,0,0,.35); padding:6px 10px; border-radius:999px;
        }
        @media (max-width: 576px){
          .lb-nav{ width:42px; height:60px; }
          .lb-close{ width:40px; height:40px; }
          .lb-img{ max-width: 96vw; max-height: 76vh; }
        }
      `}</style>
    </div>
  )
}
