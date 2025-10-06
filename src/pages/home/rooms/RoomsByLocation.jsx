// src/pages/rooms/components/FeaturedProvinces.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiList from '@/api'
import LoadingOverlay from '@/pages/components/Loading/LoadingOverlay'

const normalize = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// map ảnh demo theo tên tỉnh (đổi sang ảnh thật nếu bạn có URL trong API)
const IMG_BY_PROV_KEY = {
  'ha-noi':
    'https://cdn-media.sforum.vn/storage/app/media/anh-ho-hoan-kiem-16.jpg',
  'tp-ho-chi-minh':
    'https://upload.wikimedia.org/wikipedia/commons/0/02/Landmark_81_Saigon.jpg',
  'da-nang':
    'https://upload.wikimedia.org/wikipedia/commons/f/fd/Da_Nang_Dragon_Bridge.jpg',
  'thuathien-hue':
    'https://upload.wikimedia.org/wikipedia/commons/2/2f/Hue_Citadel.jpg',
  'can-tho':
    'https://upload.wikimedia.org/wikipedia/commons/6/6b/Can_Tho_Bridge.jpg',
  'khanh-hoa':
    'https://upload.wikimedia.org/wikipedia/commons/1/1c/Nha_Trang_beach.jpg',
}

export default function FeaturedProvinces({
  // nếu không truyền, sẽ fetch tất cả tỉnh và pick theo featuredNames
  items,
  featuredNames = [
    'HCM',
    'Hà Nội',
    'Đà Nẵng',
    'Thừa Thiên Huế',
    'Cần Thơ',
    'Khánh Hòa',
  ],
  size = 6,
}) {
  const nav = useNavigate()
  const [provList, setProvList] = useState([])
  const [loading, setLoading] = useState(!items)
  const [clickingId, setClickingId] = useState(null)

  useEffect(() => {
    if (items) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiList.getProvinces({})
        setProvList(res?.data ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [items])

  const show = useMemo(() => {
    if (items?.length) return items.slice(0, size)
    const dict = new Map(provList.map((p) => [normalize(p.name), p]))
    const picked = []
    for (const name of featuredNames) {
      const key = normalize(name)
      const p =
        dict.get(key) || provList.find((x) => normalize(x.name).includes(key))
      if (p) picked.push({ id: p.id, name: p.name })
    }
    return picked.slice(0, size)
  }, [items, provList, featuredNames, size])

  const getImageFor = (name) => {
    const key = normalize(name)
    // nếu API có p.imageUrl thì dùng luôn: return p.imageUrl || ...
    // ở đây demo map theo key, fallback ảnh Hà Nội
    return (
      IMG_BY_PROV_KEY[key] ||
      'https://cdn-media.sforum.vn/storage/app/media/anh-ho-hoan-kiem-16.jpg'
    )
  }

  const goToProvince = async (prov) => {
    try {
      setClickingId(prov.id)
      // gọi thêm API getRoom với provinceId như bạn yêu cầu
      const res = await apiList.getRoom({
        provinceId: prov.id,
        page: 0,
        size: 12,
      })

      // điều hướng, kèm state để trang /rooms có thể dùng dữ liệu đã fetch
      const sp = new URLSearchParams({
        provinceId: String(prov.id),
        page: '0',
        size: '12',
      })
      nav(
        { pathname: '/rooms', search: sp.toString() },
        { state: { preloadedRooms: res?.data } }
      )
    } catch (e) {
      console.error(e)
      // vẫn điều hướng nếu muốn để trang đích tự fetch lại:
      const sp = new URLSearchParams({
        provinceId: String(prov.id),
        page: '0',
        size: '12',
      })
      nav({ pathname: '/rooms', search: sp.toString() })
    } finally {
      setClickingId(null)
    }
  }

  return (
    <section className="container my-5">
      <h3 className="text-center fw-bold text-primary mb-4">
        TỈNH, THÀNH PHỐ NỔI BẬT
      </h3>

      {loading ? (
        <LoadingOverlay show={loading} />
      ) : (
        <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-6">
          {show.map((p) => (
            <div key={p.id} className="col">
              <button
                className="w-100 fp-card text-start"
                onClick={() => goToProvince(p)}
                disabled={clickingId === p.id}
                aria-busy={clickingId === p.id}
              >
                <div className="fp-img">
                  <img src={getImageFor(p.name)} alt={p.name} />
                </div>
                <div className="fp-name">
                  {p.name}
                  {clickingId === p.id ? ' • Đang tải...' : ''}
                </div>
              </button>
            </div>
          ))}
          {!show.length && (
            <div className="col-12 text-center text-muted py-5">
              Chưa có tỉnh nào để hiển thị.
            </div>
          )}
        </div>
      )}

      <style>{`
        .fp-card{
          background:#fff;border:1px solid rgba(2,6,23,.06);
          border-radius:16px; overflow:hidden; padding:0;
          box-shadow:0 12px 30px rgba(17,24,39,.08),0 3px 10px rgba(17,24,39,.06);
          transition:transform .2s ease, box-shadow .2s ease, opacity .2s ease;
        }
        .fp-card[disabled]{ opacity:.7; cursor:not-allowed; }
        .fp-card:hover{ transform:translateY(-3px); box-shadow:0 16px 40px rgba(17,24,39,.12),0 6px 16px rgba(17,24,39,.08); }
        .fp-img{ width:100%; height:180px; overflow:hidden; }
        .fp-img img{ width:100%; height:100%; object-fit:cover; display:block; }
        .fp-name{ padding:12px 14px; font-weight:600; text-align:center; }
        @media (max-width: 576px){ .fp-img{ height:150px; } }
      `}</style>
    </section>
  )
}
