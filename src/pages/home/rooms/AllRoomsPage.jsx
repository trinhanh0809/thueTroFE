import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiList from '@/api'
import RoomCard from '@/pages/components/RoomCard/RoomCard'
import LoadingOverlay from '@/pages/components/Loading/LoadingOverlay'

export default function AllRoomsPreview({ title = 'Tất cả phòng' }) {
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiList.getRoom({ page: 0, size: 20 })
        const item = res?.data.content
        setItems(item)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const goToFull = () => {
    const sp = new URLSearchParams({
      page: 0,
      size: 20,
    })
    nav({ pathname: '/rooms', search: sp.toString() })
  }

  return (
    <div className="container my-4">
      <h3 className="fw-bold text-primary mb-3">{title}</h3>

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
                  Chưa có bài phù hợp.
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
