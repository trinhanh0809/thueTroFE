import { useEffect, useState } from 'react'
import '@/pages/components/Search/Search.css'
import apiList from '@/api'
import PriceDropdown from '@/pages/components/PriceDropdown/PriceDropdown'
import Button from '@/components/ui/Button'

export default function SearchBar({
  variant = 'hero',
  initial = { q: '', roomTypeId: '', price: '', area: '' },
  onSubmit,
  className = '',
}) {
  const [form, setForm] = useState(() => ({
    q: initial.q || '',
    roomTypeId: initial.roomTypeId || '',
    price: initial.price || '',
    area: initial.area || '',
  }))
  const [types, setTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        setLoadingTypes(true)
        const res = await apiList.getRoomType?.()
        setTypes(res?.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingTypes(false)
      }
    })()
  }, [])

  const wrapCls =
    variant === 'hero' ? 'searchbar hero ' : 'searchbar inline px-2 py-2'

  const selectCls = 'form-select form-select-lg border-0'
  const btnCls = 'btn btn-lg btn-warning px-4 fw-semibold'

  const handleChange = (k) => (e) =>
    setForm((s) => ({ ...s, [k]: e.target.value }))
  const submit = (e) => {
    e?.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form className={`${wrapCls} ${className}`} onSubmit={submit}>
      <div className="row g-2 g-md-3   container_search">
        <div className="col-12 col-lg-4">
          <div className="position-relative">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 opacity-50" />
            <input
              className={`form-control form-control-lg border-0 ps-5`}
              placeholder="Bạn muốn tìm trọ ở đâu?"
              value={form.q}
              onChange={handleChange('q')}
            />
          </div>
        </div>
        <div className="col-6 col-lg-2">
          <div className="position-relative">
            <i className="bi bi-house position-absolute top-50 start-0 translate-middle-y ms-3 opacity-50" />
            <select
              className={`form-select form-select-lg border-0 ps-5`}
              value={form.roomTypeId}
              onChange={handleChange('roomTypeId')}
              disabled={loadingTypes}
            >
              <option value="">Tất cả</option>
              {types.map((t) => (
                <option
                  key={t.id ?? t.roomTypeId}
                  value={String(t.id ?? t.roomTypeId)}
                >
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mức giá (triệu) */}
        <div className="col-6 col-lg-2 ">
          <div className="position-relative">
            <PriceDropdown
              value={form.price} // '', 'a-b', 'a+'
              onChange={(v) => setForm((s) => ({ ...s, price: v }))}
              min={0}
              max={120}
              step={0.5}
            />
          </div>
        </div>

        {/* Diện tích */}
        <div className="col-9 col-lg-2">
          <div className="position-relative">
            <span className=" position-absolute top-50 start-0 translate-middle-y ms-3 opacity-50">
              m²
            </span>
            <select
              className={`${selectCls} ps-5`}
              value={form.area}
              onChange={handleChange('area')}
            >
              <option value="">Diện tích</option>
              <option value="0-20">Dưới 20m²</option>
              <option value="20-40">20–40m²</option>
              <option value="40-60">40–60m²</option>
              <option value="60+">Trên 60m²</option>
            </select>
          </div>
        </div>

        <div className="col-9 col-lg-2">
          <Button type="submit" className={btnCls}>
            Tìm kiếm
          </Button>
        </div>
      </div>
    </form>
  )
}
