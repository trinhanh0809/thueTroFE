import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiList from '@/api'
import SearchBar from '@/pages/components/Search/Search'
import RoomFilters from './components/RoomFilters'
import LoadingOverlay from '@/pages/components/Loading/LoadingOverlay'

const PRICE_UNIT = 1_000_000

// helper: chỉ nhận số > 0, còn lại undefined
const toPos = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}
const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v != null)
  )

// 'a-b' | 'a+' -> {priceMin, priceMax} (VND), chỉ > 0 mới set
function parsePriceStr(s) {
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
function priceToStr(minVnd, maxVnd) {
  const a = toPos(minVnd),
    b = toPos(maxVnd)
  if (!a && !b) return ''
  if (a && !b) return `${a / PRICE_UNIT}+`
  if (a && b) return `${a / PRICE_UNIT}-${b / PRICE_UNIT}`
  return `0-${b / PRICE_UNIT}`
}

// '0-20' | '20-40' | '40-60' | '60+' -> {areaMin, areaMax} (chỉ > 0)
function parseAreaCode(code) {
  if (!code) return {}
  if (code.endsWith('+')) {
    const a = toPos(code)
    return a ? { areaMin: a } : {}
  }
  const [a, b] = code.split('-')
  const min = toPos(a),
    max = toPos(b)
  return { ...(min ? { areaMin: min } : {}), ...(max ? { areaMax: max } : {}) }
}
function areaToCode(min, max) {
  const a = toPos(min),
    b = toPos(max)
  if (!a && !b) return ''
  const key = `${a ?? ''}-${b ?? ''}`
  switch (key) {
    case '0-20':
      return '0-20'
    case '20-40':
      return '20-40'
    case '40-60':
      return '40-60'
    case '60-':
      return '60+'
    default:
      return ''
  }
}

export default function RoomListPull() {
  const nav = useNavigate()
  const loc = useLocation()
  const qs = useMemo(() => new URLSearchParams(loc.search), [loc.search])

  // paging
  const pageFromUrl = Number(qs.get('page') ?? 0) || 0
  const sizeFromUrl = Number(qs.get('size') ?? 20) || 20
  const [page, setPage] = useState(pageFromUrl)
  const [size, setSize] = useState(sizeFromUrl)

  // đồng bộ page/size khi URL đổi
  useEffect(() => {
    if (page !== pageFromUrl) setPage(pageFromUrl)
    if (size !== sizeFromUrl) setSize(sizeFromUrl)
  }, [pageFromUrl, sizeFromUrl]) // eslint-disable-line

  // đọc tham số API từ URL – CHỈ >0 mới nhận
  const urlParams = useMemo(() => {
    const priceMin = toPos(qs.get('priceMin'))
    const priceMax = toPos(qs.get('priceMax'))
    const areaMin = toPos(qs.get('areaMin'))
    const areaMax = toPos(qs.get('areaMax'))
    return {
      q: (qs.get('q') || '').trim(),
      roomTypeId: toPos(qs.get('roomTypeId')),
      provinceId: toPos(qs.get('provinceId')),
      districtId: toPos(qs.get('districtId')),
      wardId: toPos(qs.get('wardId')),
      blockId: toPos(qs.get('blockId')),
      priceMin,
      priceMax,
      areaMin,
      areaMax,
    }
  }, [qs])

  // fetch list
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({
    number: 0,
    totalPages: 1,
    totalElements: 0,
    size,
  })

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      setLoading(true)
      try {
        const params = clean({ ...urlParams, page, size })
        const res = await apiList.getRoom(params, { signal: ctrl.signal })
        const b = res?.data
        const arr = Array.isArray(b?.content) ? b.content : []
        setItems(arr)
        setMeta({
          number: b?.number ?? page,
          totalPages: b?.totalPages ?? 1,
          totalElements: b?.totalElements ?? arr.length,
          size: b?.size ?? size,
        })
      } catch (e) {
        if (e?.name !== 'CanceledError') console.error(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [urlParams, page, size])

  // chỉ update URL nếu khác (tránh loop)
  useEffect(() => {
    const cur = new URLSearchParams(loc.search)
    if (cur.get('page') === String(page) && cur.get('size') === String(size))
      return
    cur.set('page', String(page))
    cur.set('size', String(size))
    nav({ pathname: loc.pathname, search: cur.toString() }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, loc.search])

  // submit từ SearchBar: xóa keys cũ, CHỈ set >0
  const handleSearchSubmit = (v) => {
    const sp = new URLSearchParams(loc.search)

    // XÓA sạch khóa search cũ (kể cả legacy)
    const KEYS = [
      'q',
      'roomTypeId',
      'provinceId',
      'districtId',
      'wardId',
      'blockId',
      'priceMin',
      'priceMax',
      'areaMin',
      'areaMax',
      'cat',
      'typeId',
      'price',
      'area',
    ]
    for (const k of KEYS) sp.delete(k)

    // q
    if (v.q?.trim()) sp.set('q', v.q.trim())

    // roomTypeId (>0 mới set)
    if (toPos(v.roomTypeId)) sp.set('roomTypeId', String(toPos(v.roomTypeId)))

    // price
    const p = parsePriceStr(v.price)
    if (p.priceMin) sp.set('priceMin', String(p.priceMin))
    if (p.priceMax) sp.set('priceMax', String(p.priceMax))

    // area
    const a = parseAreaCode(v.area)
    if (a.areaMin) sp.set('areaMin', String(a.areaMin))
    if (a.areaMax) sp.set('areaMax', String(a.areaMax))

    // reset trang
    sp.set('page', '0')
    sp.set('size', String(size))

    nav({ pathname: '/rooms', search: sp.toString() })
  }

  // initial cho SearchBar (URL -> UI)
  const searchInitial = useMemo(
    () => ({
      q: urlParams.q || '',
      roomTypeId: urlParams.roomTypeId ? String(urlParams.roomTypeId) : '',
      price: priceToStr(urlParams.priceMin, urlParams.priceMax),
      area: areaToCode(urlParams.areaMin, urlParams.areaMax),
    }),
    [urlParams]
  )

  const fmtPrice = (v) => {
    if (v == null) return '—'
    const m = Number(v) / PRICE_UNIT
    const s = Number.isInteger(m) ? String(m) : m.toFixed(1).replace(/\.0$/, '')
    return `${s} triệu/tháng`
  }

  return (
    <div className="container">
      <h2 className="fw-bold mb-3">Danh sách phòng</h2>

      <SearchBar
        variant="inline"
        initial={searchInitial}
        onSubmit={handleSearchSubmit}
      />

      <div className="row g-3 mt-2">
        <div className="col-lg-8">
          <div className="card p-3 mb-3">
            <div className="fw-semibold mb-3">
              Tổng {meta.totalElements.toLocaleString()} kết quả
            </div>

            {loading ? (
              <LoadingOverlay show={loading} />
            ) : items.length ? (
              <div className="vstack gap-3">
                {items.map((it) => (
                  <div key={it.id} className="card p-2">
                    <div className="row g-3 align-items-stretch">
                      <div className="col-md-4">
                        <div className="ratio ratio-4x3 bg-light rounded overflow-hidden">
                          {it.imageUrls?.[0] && (
                            <img
                              className="w-100 h-100 object-fit-cover"
                              src={it.imageUrls[0]}
                              alt={it.title}
                            />
                          )}
                        </div>
                      </div>
                      <div className="col-md-8 d-flex flex-column justify-content-between p-3">
                        <h5 className="mb-2 text-truncate" title={it.title}>
                          {it.title}
                        </h5>
                        <div className="small text-muted">
                          <i className="bi bi-geo-alt me-1" />
                          {it.addressLine || '—'}
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          {it.roomTypeName && (
                            <span className="badge text-bg-light border">
                              {it.roomTypeName}
                            </span>
                          )}
                          {it.areaSqm != null && (
                            <span className="badge text-bg-light border">
                              {it.areaSqm} m²
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <span className="text-orange fw-semibold">
                            {fmtPrice(it.priceMonth)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted py-5">
                Không có dữ liệu
              </div>
            )}

            {meta.totalPages > 1 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(0)}>
                      Đầu tiên
                    </button>
                  </li>
                  <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    >
                      ‹
                    </button>
                  </li>
                  {Array.from({ length: meta.totalPages }).map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${i === page ? 'active' : ''}`}
                    >
                      <button className="page-link" onClick={() => setPage(i)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${page === meta.totalPages - 1 ? 'disabled' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, meta.totalPages - 1))
                      }
                    >
                      ›
                    </button>
                  </li>
                  <li
                    className={`page-item ${page === meta.totalPages - 1 ? 'disabled' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(meta.totalPages - 1)}
                    >
                      Cuối cùng
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <RoomFilters
            initial={{
              q: urlParams.q || '',
              price: priceToStr(urlParams.priceMin, urlParams.priceMax),
              area: areaToCode(urlParams.areaMin, urlParams.areaMax),
              amenities: (qs.get('amenities') || '').split(',').filter(Boolean),
              nearby: (qs.get('nearby') || '').split(',').filter(Boolean),
            }}
            onApply={(v) => {
              const sp = new URLSearchParams(loc.search)
              const p = parsePriceStr(v.price)
              const a = parseAreaCode(v.area)
              v.q?.trim() ? sp.set('q', v.q.trim()) : sp.delete('q')
              p.priceMin
                ? sp.set('priceMin', String(p.priceMin))
                : sp.delete('priceMin')
              p.priceMax
                ? sp.set('priceMax', String(p.priceMax))
                : sp.delete('priceMax')
              a.areaMin
                ? sp.set('areaMin', String(a.areaMin))
                : sp.delete('areaMin')
              a.areaMax
                ? sp.set('areaMax', String(a.areaMax))
                : sp.delete('areaMax')
              sp.set('amenities', (v.amenities || []).join(','))
              sp.set('nearby', (v.nearby || []).join(','))
              sp.set('page', '0')
              sp.set('size', String(size))
              nav({ pathname: '/rooms', search: sp.toString() })
            }}
          />
        </div>
      </div>
    </div>
  )
}
