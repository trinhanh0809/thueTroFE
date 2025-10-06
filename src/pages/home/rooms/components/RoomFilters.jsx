// src/pages/rooms/components/RoomFilters.jsx
import { useEffect, useMemo, useState } from 'react'

/**
 * Sidebar filter (có thu gọn từng nhóm bằng mũi tên):
 *  - area: 'lt20' | '20-40' | '40-60' | '60-80' | 'gt80'
 *  - amenities: string[]  (e.g. ['gac_lung','wifi',...])
 *  - nearby: string[]     (e.g. ['cho','sieu_thi',...])
 */
export default function RoomFilters({ initial, onApply }) {
  const init = useMemo(
    () => ({
      area: initial?.area || '',
      amenities: Array.isArray(initial?.amenities)
        ? initial.amenities
        : typeof initial?.amenities === 'string'
          ? initial.amenities.split(',').filter(Boolean)
          : [],
      nearby: Array.isArray(initial?.nearby)
        ? initial.nearby
        : typeof initial?.nearby === 'string'
          ? initial.nearby.split(',').filter(Boolean)
          : [],
    }),
    [initial]
  )

  const [area, setArea] = useState(init.area)
  const [amenities, setAmenities] = useState(init.amenities)
  const [nearby, setNearby] = useState(init.nearby)

  // trạng thái mở/thu các nhóm
  const [openArea, setOpenArea] = useState(true)
  const [openAmen, setOpenAmen] = useState(true)
  const [openNearby, setOpenNearby] = useState(true)

  useEffect(() => {
    setArea(init.area)
    setAmenities(init.amenities)
    setNearby(init.nearby)
  }, [init])

  const toggle = (arr, setter, v) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  }

  const AREA_OPTIONS = [
    { value: 'lt20', label: 'Dưới 20 m²' },
    { value: '20-40', label: '20–40 m²' },
    { value: '40-60', label: '40–60 m²' },
    { value: '60-80', label: '60–80 m²' },
    { value: 'gt80', label: 'Trên 80 m²' },
  ]

  const AMENITY_OPTIONS = [
    { value: 'gac_lung', label: 'Gác lửng' },
    { value: 'wifi', label: 'Wifi' },
    { value: 've_sinh_trong', label: 'Vệ sinh trong' },
    { value: 'phong_tam', label: 'Phòng tắm' },
    { value: 'binh_nong_lanh', label: 'Bình nóng lạnh' },
    { value: 'ke_bep', label: 'Kệ bếp' },
  ]

  const NEARBY_OPTIONS = [
    { value: 'cho', label: 'Chợ' },
    { value: 'sieu_thi', label: 'Siêu thị' },
    { value: 'benh_vien', label: 'Bệnh viện' },
    { value: 'truong_hoc', label: 'Trường học' },
    { value: 'cong_vien', label: 'Công viên' },
    { value: 'ben_xe_bus', label: 'Bến xe bus' },
    { value: 'the_thao', label: 'Trung tâm thể dục thể thao' },
  ]

  const handleApply = () => onApply?.({ area, amenities, nearby })
  const handleClear = () => {
    setArea('')
    setAmenities([])
    setNearby([])
    onApply?.({ area: '', amenities: [], nearby: [] })
  }

  const Chevron = ({ open }) => (
    <i
      className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`}
      aria-hidden="true"
    />
  )

  return (
    <div className="card p-3">
      <h5 className="mb-3">
        <i className="bi bi-funnel me-2" />
        Lọc tìm kiếm
      </h5>

      {/* Diện tích */}
      <div className="mb-3">
        <div className="fw-semibold d-flex align-items-center justify-content-between">
          <span>Diện tích</span>
          <button
            type="button"
            className="btn btn-link btn-sm p-0"
            onClick={() => setOpenArea((o) => !o)}
            aria-expanded={openArea}
            aria-controls="filter-area"
            title={openArea ? 'Thu gọn' : 'Mở rộng'}
          >
            <Chevron open={openArea} />
          </button>
        </div>
        <div id="filter-area" className={openArea ? '' : 'd-none'}>
          {AREA_OPTIONS.map((op) => (
            <div key={op.value} className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                id={`area-${op.value}`}
                name="area"
                checked={area === op.value}
                onChange={() => setArea(op.value)}
              />
              <label className="form-check-label" htmlFor={`area-${op.value}`}>
                {op.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tiện nghi */}
      <div className="mb-3">
        <div className="fw-semibold d-flex align-items-center justify-content-between">
          <span>Tiện nghi</span>
          <button
            type="button"
            className="btn btn-link btn-sm p-0"
            onClick={() => setOpenAmen((o) => !o)}
            aria-expanded={openAmen}
            aria-controls="filter-amen"
            title={openAmen ? 'Thu gọn' : 'Mở rộng'}
          >
            <Chevron open={openAmen} />
          </button>
        </div>
        <div id="filter-amen" className={openAmen ? '' : 'd-none'}>
          {AMENITY_OPTIONS.map((op) => (
            <div key={op.value} className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id={`am-${op.value}`}
                checked={amenities.includes(op.value)}
                onChange={() => toggle(amenities, setAmenities, op.value)}
              />
              <label className="form-check-label" htmlFor={`am-${op.value}`}>
                {op.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Môi trường xung quanh */}
      <div className="mb-3">
        <div className="fw-semibold d-flex align-items-center justify-content-between">
          <span>Môi trường xung quanh</span>
          <button
            type="button"
            className="btn btn-link btn-sm p-0"
            onClick={() => setOpenNearby((o) => !o)}
            aria-expanded={openNearby}
            aria-controls="filter-nearby"
            title={openNearby ? 'Thu gọn' : 'Mở rộng'}
          >
            <Chevron open={openNearby} />
          </button>
        </div>
        <div id="filter-nearby" className={openNearby ? '' : 'd-none'}>
          {NEARBY_OPTIONS.map((op) => (
            <div key={op.value} className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id={`nb-${op.value}`}
                checked={nearby.includes(op.value)}
                onChange={() => toggle(nearby, setNearby, op.value)}
              />
              <label className="form-check-label" htmlFor={`nb-${op.value}`}>
                {op.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="d-grid gap-2">
        <button className="btn btn-primary" onClick={handleApply}>
          Áp dụng
        </button>
        <button className="btn btn-outline-secondary" onClick={handleClear}>
          Xoá lọc
        </button>
      </div>
    </div>
  )
}
