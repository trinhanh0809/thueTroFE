import React, { useEffect, useMemo, useState } from 'react'
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
  const [formMode, setFormMode] = useState('create')
  const [editing, setEditing] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetRow, setTargetRow] = useState(null)

  // ---- server-side pagination + filters ----
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [q, setQ] = useState('')
  const [enabled, setEnabled] = useState('')
  const [isHost, setIsHost] = useState('')
  const [qInput, setQInput] = useState('')

  const canPrev = page > 0
  const canNext = page + 1 < totalPages
  // ---- đồng bộ URL mỗi khi filter/phân trang đổi ----
  const syncUrl = () => {
    const sp = new URLSearchParams()
    sp.set('page', page)
    sp.set('size', size)
    if (q) sp.set('q', q)
    else sp.delete('q')
    if (enabled) sp.set('enabled', enabled)
    else sp.delete('enabled')
    if (isHost) sp.set('isHost', isHost)
    else sp.delete('isHost')
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${sp.toString()}`
    )
  }

  const buildParams = () => {
    const p = { page, size }
    if (q) p.q = q
    if (enabled) p.enabled = enabled
    if (isHost) p.isHost = isHost
    return p
  }

  const fetchList = async () => {
    setLoadingList(true)
    try {
      syncUrl()
      const { status, data } = await apiList.getUser(buildParams())
      if (status === 200) {
        setData(Array.isArray(data?.content) ? data.content : [])
        setTotalPages(data?.totalPages ?? 0)
        setTotalElements(data?.totalElements ?? 0)
      } else {
        toast.error('Không thể tải danh sách')
      }
    } catch (err) {
      console.error(err)
      toast.error('Tải danh sách thất bại')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, q, enabled, isHost])

  const onSearchSubmit = () => {
    setPage(0)
    setQ(qInput)
  }

  const handleEnabledChange = (e) => {
    setEnabled(e.target.value)
    setPage(0)
  }
  const handleIsHostChange = (e) => {
    setIsHost(e.target.value)
    setPage(0)
  }

  const handleEdit = (row) => {
    setEditing(row)
    setFormMode('edit')
    setFormOpen(true)
  }
  const handleView = (row) => {
    setEditing(row)
    setFormMode('detail')
    setFormOpen(true)
  }
  const openConfirmToggle = (row) => {
    setTargetRow(row)
    setConfirmOpen(true)
  }

  const onConfirmToggle = async () => {
    if (!targetRow) return
    try {
      const action = targetRow.enabled ? 'vô hiệu hoá' : 'mở khoá'
      await toast.promise(apiList.toggleEnabled(targetRow.id), {
        pending: `Đang ${action} ${targetRow.username}...`,
        success: `Đã ${action} tài khoản`,
        error: 'Thao tác thất bại',
      })
      await fetchList()
      setConfirmOpen(false)
      setTargetRow(null)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Quản lý tài khoản</h4>
      </div>
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body flex-wrap gap-2 align-items-center">
          <div className="input-group mb-4" style={{ maxWidth: 360 }}>
            <input
              className="form-control"
              placeholder="Tìm theo tên tài khoản"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            />
            <button className="btn btn-primary" onClick={onSearchSubmit}>
              <i className="bi bi-search" />
            </button>
          </div>

          {/* Enabled select */}
          <div className="d-flex align-items-center  gap-4 ">
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                value={enabled}
                onChange={handleEnabledChange}
                style={{ width: 320 }}
              >
                <option value="" disabled hidden>
                  Trạng thái
                </option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Đã vô hiệu hoá</option>
              </select>
            </div>

            {/* Host select */}
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                value={isHost}
                onChange={handleIsHostChange}
                style={{ width: 320 }}
              >
                <option value="" disabled hidden>
                  Vai trò
                </option>
                <option value="true">Chủ trọ</option>
                <option value="false">Không phải chủ trọ</option>
              </select>
            </div>
          </div>
        </div>
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
                <th style={{ width: 160 }}>Vai trò</th>
                <th style={{ width: 140 }}>Trạng thái</th>
                <th style={{ width: 220 }} className="text-end">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {!loadingList &&
                data.map((row, idx) => (
                  <tr key={row.id ?? `${page}-${idx}`}>
                    <td className="text-center">{page * size + idx + 1}</td>

                    <td className="text-truncate" style={{ maxWidth: 240 }}>
                      {row.username}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 320 }}>
                      {row.email}
                    </td>
                    <td>
                      {Array.isArray(row.roles) ? (
                        row.roles.map((r, i) => (
                          <span
                            key={i}
                            className="badge text-bg-secondary me-1"
                          >
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="badge text-bg-secondary">
                          {row.roles}
                        </span>
                      )}
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
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleView(row)}
                          title="Xem chi tiết"
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

        {/* Pager */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top bg-light-subtle">
          <div className="small text-muted">
            Tổng: <strong>{totalElements}</strong> • Trang{' '}
            {totalPages === 0 ? 0 : page + 1}/{totalPages}
          </div>

          {/* Page size */}
          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="text-muted small">Mỗi trang</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 84 }}
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value))
                setPage(0)
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={!canPrev || loadingList}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <i className="bi bi-chevron-left me-1" /> Trước
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={!canNext || loadingList}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau <i className="bi bi-chevron-right ms-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {formOpen && (
        <AccountFormModal
          key={editing?.id || formMode}
          mode={formMode}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          getApi={fetchList}
          data={editing}
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
