import React, { useEffect, useState } from 'react'

export default function AccountFormModal({
  mode = 'create', // 'create' | 'edit' | 'detail'
  title,
  onClose,
  onSubmit, // hàm gọi API (patch/put), nhận payload đã làm sạch
  getApi, // refresh list sau khi lưu
  data, // user object BE trả về (có thể roles là mảng)
}) {
  const isView = mode === 'detail'

  const init = (d) => {
    const roleStr = Array.isArray(d?.roles) ? d.roles[0] : d?.roles
    return {
      username: d?.username ?? '',
      email: d?.email ?? '',
      phoneNumber: d?.phoneNumber ?? '',
      roles: roleStr ?? 'CUSTOMER', // ADMIN | HOST | CUSTOMER
      enabled: d?.enabled ?? true,
    }
  }

  const [values, setValues] = useState(init(data))

  useEffect(() => {
    setValues(mode === 'create' ? init(null) : init(data))
  }, [mode, data])

  const setValue = (name) => (e) => {
    const v = e?.target ? e.target.value : e
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  const buildPayload = () => {
    const payload = {}

    const putStr = (key) => {
      const raw = values[key]
      if (typeof raw === 'string') {
        const t = raw.trim()
        if (t !== '') payload[key] = t
      } else if (raw != null) {
        payload[key] = raw
      }
    }

    putStr('username')
    putStr('email')
    putStr('phoneNumber')

    // roles: select đơn → string; BE chấp nhận string hoặc array
    if (values.roles) payload.roles = values.roles

    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isView) return
    const payload = buildPayload()
    await onSubmit?.(payload) // ví dụ: api.patch(`/user/${id}`, payload)
    await getApi?.()
    onClose?.()
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
                <label className="form-label">Tên đăng nhập</label>
                <input
                  name="username"
                  className="form-control"
                  value={values.username ?? ''}
                  onChange={isView ? undefined : setValue('username')}
                  disabled={isView}
                  placeholder="nhập username"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  className="form-control"
                  value={values.email ?? ''}
                  onChange={isView ? undefined : setValue('email')}
                  disabled={isView}
                  placeholder="name@example.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                  name="phoneNumber"
                  className="form-control"
                  value={values.phoneNumber ?? ''}
                  onChange={isView ? undefined : setValue('phoneNumber')}
                  disabled={isView}
                  placeholder="090..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Vai trò</label>
                <select
                  name="roles"
                  className="form-select"
                  value={values.roles ?? 'CUSTOMER'}
                  onChange={isView ? undefined : setValue('roles')}
                  disabled={isView}
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="HOST">HOST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
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
