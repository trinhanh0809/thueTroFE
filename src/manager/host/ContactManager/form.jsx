import { useEffect, useMemo, useState } from 'react'

/** Modal dùng chung (inline để file tự chạy, có thể tách ra ui/Modal.jsx nếu muốn) */
function Modal({ open, title, children, footer, onClose, width = 680 }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="contract-modal-backdrop" onClick={onClose}>
      <div
        className="contract-modal-card"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="contract-modal-head">
          <div className="contract-modal-title">{title}</div>
          <button className="btn btn-icon" onClick={onClose} aria-label="close">
            ×
          </button>
        </div>
        <div className="contract-modal-body">{children}</div>
        <div className="contract-modal-foot">{footer}</div>

        <style>{`
          .contract-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50;}
          .contract-modal-card{width:100%;background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 18px 40px rgba(17,24,39,.12),0 2px 8px rgba(17,24,39,.08);overflow:hidden;}
          .contract-modal-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #e5e7eb;}
          .contract-modal-title{font-weight:700;}
          .contract-modal-body{padding:14px;}
          .contract-modal-foot{padding:12px 14px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:10px;}
          .btn{height:32px;border-radius:8px;padding:0 12px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;}
          .btn:hover{background:#f8fafc;}
          .btn-primary{background:#175fe4;border-color:#175fe4;color:#fff;}
          .btn-primary:hover{opacity:.92;}
          .btn-icon{width:34px;padding:0;text-align:center;}
        `}</style>
      </div>
    </div>
  )
}

/** ===== Helpers ===== */
export const EMPTY_CONTRACT = {
  code: '',
  roomName: '',
  representative: '',
  phone: '',
  people: 1,
  createdDate: '', // Ngày lập
  moveInDate: '',
  dueDate: '', // Ngày đến hạn
  endDate: '', // Ngày kết thúc (optional)
  notes: '',
}

/** Trạng thái: active / soon / overdue / ended */
export const computeStatus = (c, today = new Date()) => {
  const d = (s) => (s ? new Date(s) : null)
  const due = d(c.dueDate)
  const end = d(c.endDate)
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate())

  const t = startOfDay(today)

  if (end && end <= t) return 'ended'
  if (due) {
    const diff = (startOfDay(due) - t) / (1000 * 60 * 60 * 24)
    if (diff < 0) return 'overdue'
    if (diff <= 7) return 'soon' // trong 7 ngày tới
  }
  return 'active'
}

const STATUS_META = {
  active: { label: 'Đang hiệu lực', color: '#1a7f37', bg: '#e8f5ee' },
  soon: { label: 'Sắp đến hạn', color: '#a15c00', bg: '#fff3e0' },
  overdue: { label: 'Đã quá hạn', color: '#b91c1c', bg: '#fee2e2' },
  ended: { label: 'Đã kết thúc', color: '#475569', bg: '#f1f5f9' },
}

const fmtDate = (s) =>
  s
    ? new Date(s).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : '—'

export default function ContractFormModal({
  open,
  initial,
  mode = 'create', // 'view' | 'edit' | 'create'
  onClose,
  onSubmit, // values => void
  onRequestEdit, // () => void (view -> edit)
}) {
  const [form, setForm] = useState(initial || EMPTY_CONTRACT)
  const [errors, setErrors] = useState({})
  const readOnly = mode === 'view'

  useEffect(() => {
    setForm(initial || EMPTY_CONTRACT)
    setErrors({})
  }, [initial, open])

  const title = useMemo(() => {
    if (mode === 'view') return `Chi tiết hợp đồng ${initial?.code || ''}`
    if (mode === 'edit') return `Chỉnh sửa hợp đồng ${initial?.code || ''}`
    return 'Lập hợp đồng'
  }, [mode, initial])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.code.trim()) e.code = 'Mã hợp đồng bắt buộc'
    if (!form.roomName.trim()) e.roomName = 'Tên phòng bắt buộc'
    if (!form.representative.trim())
      e.representative = 'Người đại diện bắt buộc'
    if (form.people <= 0) e.people = 'Số người > 0'
    if (!form.createdDate) e.createdDate = 'Chọn ngày lập'
    if (!form.moveInDate) e.moveInDate = 'Chọn ngày vào ở'
    if (!form.dueDate) e.dueDate = 'Chọn ngày đến hạn'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e) => {
    e?.preventDefault?.()
    if (readOnly) return
    if (!validate()) return
    onSubmit?.(form)
  }

  const status = computeStatus(form)
  const statusMeta = STATUS_META[status]

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        mode === 'view' ? (
          <>
            <button className="btn" onClick={onClose}>
              Đóng
            </button>
            <button className="btn btn-primary" onClick={onRequestEdit}>
              Chỉnh sửa
            </button>
          </>
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
        <div className="form-item">
          <label>Mã hợp đồng *</label>
          <input
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            readOnly={readOnly}
          />
          {errors.code && <div className="err">{errors.code}</div>}
        </div>
        <div className="form-item">
          <label>Tên phòng *</label>
          <input
            value={form.roomName}
            onChange={(e) => set('roomName', e.target.value)}
            readOnly={readOnly}
          />
          {errors.roomName && <div className="err">{errors.roomName}</div>}
        </div>
        <div className="form-item">
          <label>Người đại diện *</label>
          <input
            value={form.representative}
            onChange={(e) => set('representative', e.target.value)}
            readOnly={readOnly}
          />
          {errors.representative && (
            <div className="err">{errors.representative}</div>
          )}
        </div>
        <div className="form-item">
          <label>Số điện thoại</label>
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            readOnly={readOnly}
          />
        </div>
        <div className="form-item">
          <label>Số lượng người ở *</label>
          <input
            type="number"
            min={1}
            value={form.people}
            onChange={(e) => set('people', Number(e.target.value))}
            readOnly={readOnly}
          />
          {errors.people && <div className="err">{errors.people}</div>}
        </div>
        <div className="form-item">
          <label>Ngày lập *</label>
          <input
            type="date"
            value={form.createdDate}
            onChange={(e) => set('createdDate', e.target.value)}
            readOnly={readOnly}
          />
          {errors.createdDate && (
            <div className="err">{errors.createdDate}</div>
          )}
        </div>
        <div className="form-item">
          <label>Ngày vào ở *</label>
          <input
            type="date"
            value={form.moveInDate}
            onChange={(e) => set('moveInDate', e.target.value)}
            readOnly={readOnly}
          />
          {errors.moveInDate && <div className="err">{errors.moveInDate}</div>}
        </div>
        <div className="form-item">
          <label>Ngày đến hạn *</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
            readOnly={readOnly}
          />
          {errors.dueDate && <div className="err">{errors.dueDate}</div>}
        </div>
        <div className="form-item">
          <label>Ngày kết thúc</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => set('endDate', e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="form-item col-span-2">
          <label>Ghi chú</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="form-item col-span-2">
          <label>Tình trạng (tự động)</label>
          <div
            className="badge"
            style={{
              color: statusMeta.color,
              background: statusMeta.bg,
              display: 'inline-block',
            }}
          >
            {STATUS_META[status].label}
          </div>
          <div className="hint">
            Xác định dựa trên <b>Ngày đến hạn</b> và <b>Ngày kết thúc</b>.
          </div>
        </div>
      </form>

      <style>{`
        .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
        .col-span-2{grid-column:span 2 / span 2;}
        .form-item{display:flex;flex-direction:column;gap:6px;}
        .form-item label{font-weight:600;font-size:13px;}
        .form-item input,.form-item select,.form-item textarea{height:36px;border:1px solid #e5e7eb;border-radius:8px;padding:0 10px;background:#fff;}
        .form-item textarea{height:auto;padding:8px 10px;resize:vertical;}
        .err{color:#b91c1c;font-size:12px;}
        .hint{color:#6b7280;font-size:12px;margin-top:6px;}
        .badge{padding:4px 10px;border-radius:999px;font-weight:600;}
        @media(max-width:640px){.form-grid{grid-template-columns:1fr;}.col-span-2{grid-column:auto;}}
      `}</style>
    </Modal>
  )
}
