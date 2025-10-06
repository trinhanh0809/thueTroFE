import { useEffect, useMemo, useState } from 'react'

function Modal({ open, title, width = 720, children, footer, onClose }) {
  if (!open) return null
  return (
    <div className="bm-modal-backdrop" onClick={onClose}>
      <div
        className="bm-modal-card"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bm-modal-head">
          <div className="bm-modal-title">{title}</div>
          <button className="btn btn-icon" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="bm-modal-body">{children}</div>
        <div className="bm-modal-foot">{footer}</div>
      </div>
      <style>{`
        .bm-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50;}
        .bm-modal-card{width:100%;background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 18px 40px rgba(17,24,39,.12),0 2px 8px rgba(17,24,39,.08);}
        .bm-modal-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #e5e7eb;}
        .bm-modal-title{font-weight:700;}
        .bm-modal-body{padding:14px;}
        .bm-modal-foot{padding:12px 14px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:10px;}
        .btn{height:32px;border-radius:8px;padding:0 12px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;}
        .btn-primary{background:#175fe4;border-color:#175fe4;color:#fff;}
      `}</style>
    </div>
  )
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'

const EMPTY_BLOCK = {
  name: '',
  address: '',
  count_room: 0,
  coverImageUrl: '',
  enable: true,
}

export default function BlockFormModal({
  open,
  mode = 'create',
  initial,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_BLOCK)
  const [preview, setPreview] = useState(FALLBACK_IMG)
  const readOnly = mode === 'view'

  useEffect(() => {
    const merged = { ...EMPTY_BLOCK, ...(initial || {}) }
    setForm(merged)
    setPreview(merged.coverImageUrl || FALLBACK_IMG)
  }, [initial, open])

  const title = useMemo(() => {
    if (mode === 'edit') return 'Sửa dãy trọ'
    if (mode === 'view') return `Chi tiết dãy trọ ${initial?.name || ''}`
    return 'Thêm dãy trọ'
  }, [mode, initial])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleFile = (file) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)

    // Giả sử có API upload ảnh chung:
    const fd = new FormData()
    fd.append('file', file)
    fetch('/api/uploads/blocks', { method: 'POST', body: fd })
      .then((r) => r.json())
      .then((res) => {
        // BE trả về {url: "..."}
        set('coverImageUrl', res.url)
      })
  }

  const submit = (e) => {
    e.preventDefault()
    if (readOnly) return
    onSubmit?.({
      ...(initial?.id ? { id: initial.id } : {}),
      name: form.name,
      address: form.address,
      count_room: Number(form.count_room) || 0,
      coverImageUrl: form.coverImageUrl,
      enable: !!form.enable,
    })
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        mode === 'view' ? (
          <button className="btn" onClick={onClose}>
            Đóng
          </button>
        ) : (
          <>
            <button className="btn" onClick={onClose}>
              Hủy
            </button>
            <button className="btn btn-primary" onClick={submit}>
              Lưu
            </button>
          </>
        )
      }
    >
      <form className="form-grid" onSubmit={submit}>
        <div className="form-item col-span-2">
          <label>Tên dãy *</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="form-item col-span-2">
          <label>Địa chỉ *</label>
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="form-item">
          <label>Tổng số phòng</label>
          <input
            type="number"
            min={0}
            value={form.count_room}
            onChange={(e) => set('count_room', e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="form-item">
          <label>Trạng thái</label>
          <input
            type="checkbox"
            checked={!!form.enable}
            onChange={(e) => set('enable', e.target.checked)}
            disabled={readOnly}
          />
          {form.enable ? 'Enable' : 'Disable'}
        </div>

        <div className="form-item col-span-2">
          <label>Ảnh đại diện</label>
          {!readOnly && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          )}
          <div className="img-preview">
            <img src={preview} alt="preview" />
          </div>
        </div>
      </form>

      <style>{`
       /* Modal backdrop */
.bm-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}

/* Modal card */
.bm-modal-card {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12),
              0 6px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: fadeInScale 0.25s ease-out;
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* Header */
.bm-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.bm-modal-title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}

/* Footer */
.bm-modal-foot {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fafafa;
}

/* Buttons */
.btn {
  height: 36px;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:hover { background: #f3f4f6; }
.btn-primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
.btn-primary:hover { background: #1d4ed8; }
.btn-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  text-align: center;
  font-size: 20px;
  line-height: 1;
}

/* Form grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.col-span-2 { grid-column: span 2 / span 2; }

/* Form item */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-item label {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}
.form-item input[type="text"],
.form-item input[type="number"],
.form-item input[type="file"] {
  height: 38px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 14px;
  background: #fff;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}
.form-item input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
  outline: none;
}

/* Image preview */
.img-preview {
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  padding: 10px;
  display: inline-block;
  background: #f9fafb;
  margin-top: 6px;
}
.img-preview img {
  width: 280px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

/* Toggle */
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  padding: 4px 10px;
  background: #fff;
  user-select: none;
  width: max-content;
}
.toggle.on {
  background: #e0f2fe;
  border-color: #38bdf8;
  color: #0369a1;
}
.toggle input {
  accent-color: #2563eb;
  width: 16px;
  height: 16px;
}
.toggle .label {
  font-weight: 600;
  font-size: 12px;
}

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .col-span-2 { grid-column: auto; }
}

      `}</style>
    </Modal>
  )
}
