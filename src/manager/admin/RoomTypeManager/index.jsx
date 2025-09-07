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
          <div className="fw-semibold">Chưa có loại phòng nào</div>
          <div className="small">Nhấn “Thêm loại phòng” để tạo mới.</div>
        </div>
      </td>
    </tr>
  )
}

export default function RoomTypeManager() {
  const [data, setData] = useState([])
  const [loadingList, setLoadingList] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [editing, setEditing] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetRow, setTargetRow] = useState(null)

  const [busy, setBusy] = useState(false)

  const getApi = async () => {
    setLoadingList(true)
    try {
      const { status, data } = await apiList.getRoomType()
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

  // Submit form (create/update) — KHÔNG gọi getApi ở đây nữa, form sẽ gọi
  const onSubmitForm = async (values) => {
    setBusy(true)
    try {
      await toast.promise(apiList.postRoomType(editing.id, values), {
        pending: 'Đang cập nhật...',
        success: 'Đã cập nhật tài khoản',
        error: 'Cập nhật thất bại',
      })

      // getApi sẽ được gọi từ form sau khi submit thành công
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (row) => {
    if (!row?.id) return

    // setBusy(true)
    try {
      await toast.promise(apiList.deleteRoomType(row.id), {
        success: 'Đã xoá loại phòng thành công!',
        error: 'Xoá loại phòng thất bại',
      })

      await getApi()
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(
          err.response.data?.message ||
            'Không thể xóa: loại phòng đang được sử dụng.'
        )
      } else {
        toast.error('Xóa thất bại')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Quản lý loại phòng</h4>

        <button
          className="btn btn-primary"
          onClick={() => {
            setFormMode('create')
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <i className="bi bi-plus-lg me-2"></i> Thêm loại phòng
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 56 }} className="text-center">
                  STT
                </th>
                <th style={{ width: 140 }}>Tên loại phòng</th>
                <th style={{ width: 140 }} className="text-end">
                  Mã loại phòng
                </th>
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
                      {row.name}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 240 }}>
                      {row.code}
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
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(row)}
                          title="Xoá"
                          disabled={busy}
                        >
                          <i className="bi bi-trash"></i>
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
