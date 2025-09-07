import React, { useState } from 'react'
import apiList from '@/api'
import { toast } from 'react-toastify'

export default function AccountFormModal({
  mode = 'edit',
  title,
  onClose,
  getApi,
  data,
}) {
  const isView = mode === 'detail'
  const [values, setValues] = useState(data)
  const [submitting, setSubmitting] = useState(false)

  const setValueForm = (name) => (eOrVal) => {
    let v = eOrVal
    if (eOrVal && eOrVal.target) {
      const t = eOrVal.target
      v = t.value
    }
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  const buildPayload = () => {
    const payload = {}
    const keys = ['username', 'email', 'phoneNumber', 'roles', 'enabled']
    keys.forEach((k) => {
      const raw = values[k]
      const v = typeof raw === 'string' ? raw.trim() : raw
      if (v !== '' && v !== undefined && v !== null) payload[k] = v
    })
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = buildPayload()
    setSubmitting(true)
    try {
      await toast.promise(apiList.adminUpdateUser(data.id, payload), {
        success: 'Đã cập nhật tài khoản!',
        error: 'Cập nhật tài khoản thất bại',
      })
      await getApi()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Có lỗi xảy ra khi cập nhật')
    } finally {
      setSubmitting(false)
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
            <h5 className="modal-title">
              {title || (isView ? 'Xem chi tiết' : 'Cập nhật tài khoản')}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Username */}
              <div className="mb-3">
                <label className="form-label">Tên đăng nhập</label>
                <input
                  name="username"
                  className="form-control"
                  value={values.username}
                  onChange={isView ? undefined : setValueForm('username')}
                  disabled={isView || submitting}
                  placeholder="nhập username"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  className="form-control"
                  value={values.email}
                  onChange={isView ? undefined : setValueForm('email')}
                  disabled={isView || submitting}
                  placeholder="name@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                  name="phoneNumber"
                  className="form-control"
                  value={values.phoneNumber}
                  onChange={isView ? undefined : setValueForm('phoneNumber')}
                  disabled={isView || submitting}
                  placeholder="090..."
                />
              </div>

              {/* Roles */}
              <div className="mb-3">
                <label className="form-label">Vai trò</label>
                <select
                  name="roles"
                  className="form-select"
                  value={values.roles}
                  onChange={isView ? undefined : setValueForm('roles')}
                  disabled={isView || submitting}
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="HOST">HOST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-light"
                type="button"
                onClick={onClose}
                disabled={submitting}
              >
                Đóng
              </button>

              {!isView && (
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting || !data?.id}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
