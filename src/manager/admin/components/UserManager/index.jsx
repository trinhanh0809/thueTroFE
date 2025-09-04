import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AccountFormModal from './form'
import apiList from '@/api'

function EmptyStateRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-5">
        <div className="d-flex flex-column align-items-center text-muted">
          <i className="bi bi-people display-5 mb-2"></i>
          <div className="fw-semibold">Chưa có tài khoản nào</div>
          <div className="small">Nhấn “Thêm tài khoản” để tạo mới.</div>
        </div>
      </td>
    </tr>
  )
}

export default function UserManager() {
  const [data, setData] = useState([])
  const [loadingList, setLoadingList] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create') // 'create' | 'edit' | 'detail'
  const [editing, setEditing] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetRow, setTargetRow] = useState(null)

  const [busy, setBusy] = useState(false)

  const getApi = async () => {
    setLoadingList(true)
    try {
      const { status, data } = await apiList.getAll()
      if (status === 200) setData(Array.isArray(data) ? data : [])
      else toast.error('Không thể tải danh sách')
    } catch (err) {
      console.error(err)
      toast.error('Tải danh sách thất bại')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    getApi()
  }, [])

  const handleEdit = (row) => {
    setEditing(row)
    setFormMode('edit')
    setFormOpen(true)
  }

  const handleView = (row) => {
    setEditing(row) // truyền đúng 1 user
    setFormMode('detail') // xem
    setFormOpen(true)
  }

  const openConfirmToggle = (row) => {
    setTargetRow(row)
    setConfirmOpen(true)
  }

  // Submit form (create/update) — KHÔNG gọi getApi ở đây nữa, form sẽ gọi
  const onSubmitForm = async (values) => {
    setBusy(true)
    try {
      await toast.promise(apiList.adminUpdateUser(editing.id, values), {
        pending: 'Đang cập nhật...',
        success: 'Đã cập nhật tài khoản',
        error: 'Cập nhật thất bại',
      })

      // getApi sẽ được gọi từ form sau khi submit thành công
    } finally {
      setBusy(false)
    }
  }

  const onConfirmToggle = async () => {
    if (!targetRow) return
    setBusy(true)
    try {
      const action = targetRow.enabled ? 'vô hiệu hoá' : 'mở khoá'
      await toast.promise(apiList.toggleEnabled(targetRow.id), {
        pending: `Đang ${action} ${targetRow.username}...`,
        success: `Đã ${action} tài khoản`,
        error: 'Thao tác thất bại',
      })
      await getApi()
      setConfirmOpen(false)
      setTargetRow(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Quản lý tài khoản</h4>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 56 }} className="text-center">
                  STT
                </th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th style={{ width: 140 }}>Vai trò</th>
                <th style={{ width: 140 }}>Trạng thái</th>
                <th style={{ width: 220 }} className="text-end">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingList && (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center">
                      <div className="spinner-border mb-2" role="status"></div>
                      <div className="small text-muted">Đang tải...</div>
                    </div>
                  </td>
                </tr>
              )}

              {!loadingList &&
                data.map((row, idx) => (
                  <tr key={row.id ?? idx}>
                    <td className="text-center">{idx + 1}</td>
                    <td className="text-truncate" style={{ maxWidth: 240 }}>
                      {row.username}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 320 }}>
                      {row.email}
                    </td>
                    <td>
                      <span className="badge text-bg-secondary">
                        {row.roles}
                      </span>
                    </td>
                    <td>
                      {row.enabled ? (
                        <span className="badge text-bg-success">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="badge text-bg-warning">
                          Đã vô hiệu hoá
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(row)}
                          title="Sửa"
                          disabled={busy}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleView(row)}
                          title="Xem chi tiết"
                          disabled={busy}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className={
                            row.enabled
                              ? 'btn btn-outline-warning'
                              : 'btn btn-outline-success'
                          }
                          onClick={() => openConfirmToggle(row)}
                          title={row.enabled ? 'Vô hiệu hoá' : 'Mở khoá'}
                          disabled={busy}
                        >
                          <i
                            className={
                              row.enabled ? 'bi bi-lock' : 'bi bi-unlock'
                            }
                          ></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loadingList && data.length === 0 && (
                <EmptyStateRow colSpan={6} />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {formOpen && (
        <AccountFormModal
          key={editing?.id || formMode} // ép remount khi đổi user/mode
          mode={formMode}
          title={
            formMode === 'create'
              ? 'Thêm tài khoản'
              : formMode === 'edit'
                ? 'Sửa tài khoản'
                : 'Xem chi tiết'
          }
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSubmit={formMode === 'detail' ? undefined : onSubmitForm}
          getApi={getApi} // truyền xuống form theo yêu cầu
          data={
            formMode === 'create'
              ? { username: '', email: '', role: 'USER', enabled: true }
              : editing
          }
        />
      )}

      {/* Modal xác nhận Toggle */}
      {confirmOpen && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.35)' }}
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                  Xác nhận
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmOpen(false)}
                />
              </div>
              <div className="modal-body">
                {targetRow && (
                  <p className="mb-0">
                    Bạn có chắc muốn{' '}
                    {targetRow.enabled ? 'vô hiệu hoá' : 'mở khoá'} tài khoản{' '}
                    <strong>{targetRow.username}</strong> không?
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-light"
                  onClick={() => setConfirmOpen(false)}
                >
                  Huỷ
                </button>
                <button className="btn btn-danger" onClick={onConfirmToggle}>
                  <i className="bi bi-check2 me-2"></i>Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={1800} theme="colored" />
    </div>
  )
}
