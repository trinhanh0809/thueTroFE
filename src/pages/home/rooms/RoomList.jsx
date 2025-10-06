import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiList from '@/api'
import RoomCard from '@/pages/components/RoomCard/RoomCard'

const PAGE_SIZE = 12
const DEFAULT_TYPE_CODE = 'PhongTro'
const DEFAULT_PROV_CODE = ''

export default function RoomList() {
  const nav = useNavigate()
  const [types, setTypes] = useState([])
  const [provs, setProvs] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          apiList.getRoomType(),
          apiList.getProvinces(),
        ])
        if (!alive) return
        setTypes(Array.isArray(tRes?.data) ? tRes.data : [])
        setProvs(Array.isArray(pRes?.data) ? pRes.data : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const roomTypeId = useMemo(
    () => types.find((t) => t.code === DEFAULT_TYPE_CODE)?.id,
    [types]
  )
  const provinceId = useMemo(
    () =>
      DEFAULT_PROV_CODE
        ? provs.find((p) => p.code === DEFAULT_PROV_CODE)?.id
        : undefined,
    [provs]
  )

  useEffect(() => {
    if (!loaded) return
    if (DEFAULT_TYPE_CODE && !roomTypeId) {
      setLoading(false)
      return
    }

    const ctrl = new AbortController()
    ;(async () => {
      setLoading(true)
      try {
        const params = { page: 0, size: PAGE_SIZE }
        if (roomTypeId) params.roomTypeId = roomTypeId
        if (provinceId) params.provinceId = provinceId

        const res = await apiList.getRoom(params, { signal: ctrl.signal })
        const b = res?.data
        const raw =
          b?.data ?? b?.content ?? b?.items ?? (Array.isArray(b) ? b : [])
        setItems(Array.isArray(raw) ? raw : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [loaded, roomTypeId, provinceId])

  const goToFull = () => {
    const sp = new URLSearchParams({
      cat: DEFAULT_TYPE_CODE,
      ...(DEFAULT_PROV_CODE ? { prov: DEFAULT_PROV_CODE } : {}),
      page: '0',
      size: String(PAGE_SIZE),
    })
    nav({ pathname: '/rooms', search: sp.toString() })
  }

  const heading =
    types.find((t) => t.code === DEFAULT_TYPE_CODE)?.name || 'Danh sách phòng'

  return (
    <div className="container my-4">
      <h3 className="fw-bold text-primary mb-3">{heading}</h3>

      {loading ? (
        <div className="text-center py-5">Đang tải…</div>
      ) : (
        <>
          <div className="hot-wrap rounded-4 p-3 p-md-3">
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5">
              {items.map((it) => (
                <div key={it.id} className="col d-flex">
                  <RoomCard item={it} />
                </div>
              ))}
              {!items.length && (
                <div className="col-12 text-center text-muted py-5">
                  Chưa có bài phù hợp.
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <button className="btn btn-outline-primary" onClick={goToFull}>
              Xem thêm →
            </button>
          </div>
        </>
      )}

      <style>{`
        .hot-wrap{
          background:#fff;
          border:1px solid rgba(2,6,23,.06);
          box-shadow: 0 20px 45px rgba(17,24,39,.08), 0 4px 12px rgba(17,24,39,.06);
        }
      `}</style>
    </div>
  )
}
