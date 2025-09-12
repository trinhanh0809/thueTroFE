import apiList from '@/api'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function AccountFormModal({
  mode = 'create', // 'create' | 'edit' | 'detail'
  title,
  onClose,
  getApi, // refresh list sau khi lưu
  data, // roomType từ BE khi edit/detail: { id?, name, code }
}) {
  const isView = mode === 'detail'

  // ---- INIT: chỉ còn name, code ----
  const init = (d) => ({
    name: d?.name ?? '',
    code: d?.code ?? '',
  })

  const [values, setValues] = useState(init(data))

  useEffect(() => {
    setValues(mode === 'create' ? init(null) : init(data))
  }, [mode, data])

  const setValue = (name) => (e) => {
    const v = e?.target ? e.target.value : e
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  // ---- Build đúng payload cho RoomType ----
  const buildPayload = () => {
    const payload = {}
    const putStr = (key) => {
      const raw = values[key]
      if (typeof raw === 'string') {
        const t = raw.trim()
        if (t !== '') payload[key] = t
      }
    }
    putStr('name')
    putStr('code')
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isView) return

    const payload = buildPayload()

    if (!payload.name || !payload.code) {
      toast.error('Vui lòng nhập đủ Name và Code')
      return
    }

    try {
      if (mode === 'create') {
        // API thêm mới
        await toast.promise(apiList.postAmenity(payload), {
          pending: 'Đang thêm loại phòng...',
          success: 'Đã thêm loại phòng thành công!',
          error: 'Thêm loại phòng thất bại',
        })
      } else if (mode === 'edit' && data?.id) {
        // API sửa
        await toast.promise(apiList.putAmenity(data.id, payload), {
          pending: 'Đang cập nhật loại phòng...',
          success: 'Đã cập nhật loại phòng thành công!',
          error: 'Cập nhật loại phòng thất bại',
        })
      }

      await getApi?.()
      onClose?.()
    } catch (err) {
      console.error('API error:', err.response?.data || err.message)
    }
  }

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', background: 'rgba(0,0,0,0.35)' }}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog">
        <div className="modal-content border-0 rounded-4">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Tên loại phòng (name)</label>
                <input
                  name="name"
                  className="form-control"
                  value={values.name}
                  onChange={isView ? undefined : setValue('name')}
                  disabled={isView}
                  placeholder="Nhập tên loại phòng"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Mã loại phòng (code)</label>
                <input
                  name="code"
                  className="form-control"
                  value={values.code}
                  onChange={isView ? undefined : setValue('code')}
                  disabled={isView}
                  placeholder="Nhập mã loại phòng (ví dụ: STD, DLX)"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-light" type="button" onClick={onClose}>
                Đóng
              </button>
              {!isView && (
                <button className="btn btn-primary" type="submit">
                  Lưu
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
