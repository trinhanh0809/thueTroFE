import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

const DEF_MIN = 0
const DEF_MAX = 120
const DEF_STEP = 0.5

function parseValue(v) {
  if (!v) return { min: '', max: '' }
  if (v.endsWith('+')) return { min: Number(v.slice(0, -1)) || '', max: '' }
  const [a, b] = v.split('-').map(Number)
  return { min: isNaN(a) ? '' : a, max: isNaN(b) ? '' : b }
}
function formatSummary(v) {
  if (!v) return 'Mức giá'
  if (v.endsWith('+')) return `Từ ${v.slice(0, -1)} triệu`
  const [a, b] = v.split('-')
  return `${a}  - ${b} triệu `
}

export default function PriceDropdown({
  value,
  onChange,
  selectCls = 'form-select form-select-lg border-0',
  min = DEF_MIN,
  max = DEF_MAX,
  step = DEF_STEP,
}) {
  const [open, setOpen] = useState(false)
  const { min: initMin, max: initMax } = useMemo(
    () => parseValue(value),
    [value]
  )
  const [minV, setMinV] = useState(initMin === '' ? min : initMin)
  const [maxV, setMaxV] = useState(initMax === '' ? max : initMax)
  const [preset, setPreset] = useState(!value ? 'all' : '')

  const wrapRef = useRef(null)
  const btnRef = useRef(null)
  const popRef = useRef(null)

  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    const onClickOut = (e) => {
      if (!open) return
      const t = e.target
      if (!wrapRef.current?.contains(t) && !popRef.current?.contains(t)) {
        setOpen(false)
      }
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClickOut)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOut)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const placePopup = () => {
    const btn = btnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const vw = window.innerWidth
    const margin = 8
    const desiredWidth = Math.min(340, Math.max(260, r.width))
    let left = r.left
    if (left + desiredWidth > vw - margin)
      left = Math.max(margin, vw - desiredWidth - margin)
    const top = r.bottom + 6
    setPos({ top, left, width: desiredWidth })
  }

  useLayoutEffect(() => {
    if (!open) return
    placePopup()
    const h = () => placePopup()
    window.addEventListener('resize', h)
    window.addEventListener('scroll', h, true)
    return () => {
      window.removeEventListener('resize', h)
      window.removeEventListener('scroll', h, true)
    }
  }, [open])

  const clampPair = (lo, hi) => {
    lo = Math.max(min, Math.min(lo, max))
    hi = Math.max(min, Math.min(hi, max))
    if (lo > hi) [lo, hi] = [hi, lo]
    return [lo, hi]
  }

  const apply = () => {
    if (preset === 'all' || (minV <= min && maxV >= max)) {
      onChange?.('')
      setOpen(false)
      return
    }
    if (maxV >= max && minV > min) onChange?.(`${minV}+`)
    else onChange?.(`${minV}-${maxV}`)
    setOpen(false)
  }
  const reset = () => {
    setMinV(min)
    setMaxV(max)
    setPreset('all')
    onChange?.('')
  }

  const setByPreset = (key) => {
    setPreset(key)
    switch (key) {
      case 'lt1':
        setMinV(min)
        setMaxV(1)
        break
      case '1-10':
        setMinV(1)
        setMaxV(10)
        break
      case '10-30':
        setMinV(10)
        setMaxV(30)
        break
      case '30-50':
        setMinV(30)
        setMaxV(50)
        break
      case 'gt50':
        setMinV(50)
        setMaxV(max)
        break
      case 'gt100':
        setMinV(100)
        setMaxV(max)
        break
      default:
        setMinV(min)
        setMaxV(max)
        break
    }
  }

  return (
    <>
      <div className="price-wrap" ref={wrapRef}>
        <div className="position-relative">
          <i className="bi bi-currency-dollar position-absolute top-50 start-0 translate-middle-y ms-3 opacity-50" />
          <button
            type="button"
            className={`price-trigger ${selectCls} ps-5`}
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            ref={btnRef}
          >
            {formatSummary(value)}
          </button>
        </div>
      </div>

      {open &&
        createPortal(
          <div
            ref={popRef}
            className="price-pop shadow-lg"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 2000,
            }}
          >
            <div className="price-head d-flex justify-content-between mb-2">
              <div className="fw-semibold">Giá thấp nhất</div>
              <div className="fw-semibold">Giá cao nhất</div>
            </div>

            {/* chỉ còn 2 ô nhập số */}
            <div className="d-flex gap-2 mb-3">
              <input
                type="number"
                min={min}
                max={maxV}
                step={step}
                className="form-control"
                value={minV}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  const [lo, hi] = clampPair(v, maxV)
                  setMinV(lo)
                  setMaxV(hi)
                  setPreset('')
                }}
              />
              <div className="px-1 d-flex align-items-center">→</div>
              <input
                type="number"
                min={minV}
                max={max}
                step={step}
                className="form-control"
                value={maxV}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  const [lo, hi] = clampPair(minV, v)
                  setMinV(lo)
                  setMaxV(hi)
                  setPreset('')
                }}
              />
            </div>

            {/* presets */}
            <ul className="list-unstyled price-presets">
              {[
                ['all', 'Tất cả mức giá'],
                ['lt1', 'Dưới 1 triệu'],
                ['1-10', '1 - 10 triệu'],
                ['10-30', '10 - 30 triệu'],
                ['30-50', '30 - 50 triệu'],
                ['gt50', 'Trên 50 triệu'],
                ['gt100', 'Trên 100 triệu'],
              ].map(([k, label]) => (
                <li key={k}>
                  <button
                    type="button"
                    className={`preset ${preset === k ? 'active' : ''}`}
                    onClick={() => setByPreset(k)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="d-flex justify-content-between mt-2">
              <button type="button" className="btn btn-light" onClick={reset}>
                <i className="bi bi-arrow-repeat me-1" /> Đặt lại
              </button>
              <button type="button" className="btn btn-primary" onClick={apply}>
                Tìm ngay
              </button>
            </div>
          </div>,
          document.body
        )}

      <style>{`
        .price-wrap{ position:relative; }
        .price-trigger{ cursor:pointer; }
        .price-pop{
          background:#fff; border:1px solid rgba(2,6,23,.08);
          border-radius:12px; padding:12px;
        }
        .price-presets{ margin:8px 0; display:grid; gap:4px; }
        .preset{ width:100%; text-align:left; background:transparent; border:0; padding:8px 6px; border-radius:8px; }
        .preset:hover{ background:#f6f7f9; }
        .preset.active{ background:#e7f1ff; color:#0d6efd; font-weight:600; }
      `}</style>
    </>
  )
}
