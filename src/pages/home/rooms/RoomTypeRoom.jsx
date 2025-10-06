import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiList from '@/api'
import RoomCard from '@/pages/components/RoomCard/RoomCard'
import LoadingOverlay from '@/pages/components/Loading/LoadingOverlay'

export default function RoomTypeRoom({ typeCode = 'PhongTro' }) {
  const nav = useNavigate()
  const [types, setTypes] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const tRes = await apiList.getRoomType?.()
        setTypes(tRes.data)
      } finally {
        console.error()
      }
    })()
  }, [])

  const roomType = useMemo(
    () => types.find((t) => t.code === typeCode),
    [types, typeCode]
  )

  const roomTypeId = roomType?.id
  useEffect(() => {
    if (!roomTypeId) {
      setLoading(false)
      setItems([])
      return
    }
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiList.getRoom({ roomTypeId, page: 0, size: 20 })
        setItems(res?.data.content)
      } finally {
        setLoading(false)
      }
    })()
  }, [roomTypeId])

  const goToFull = () => {
    const sp = new URLSearchParams({
      cat: typeCode,
      typeId: roomTypeId,
      page: 0,
      size: 20,
    })
    nav({ pathname: '/rooms', search: sp.toString() })
  }

  return (
    <div className="container my-4">
      <h3 className="fw-bold text-primary mb-3">{roomType?.name}</h3>
      {loading ? (
        <LoadingOverlay show={loading} />
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
                  Chưa có bài viết nào.
                </div>
              )}
            </div>

            <div className="mt-3">
              <button className="btn btn-outline-primary" onClick={goToFull}>
                Xem thêm →
              </button>
            </div>
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
