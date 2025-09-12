import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import apiList from '@/api'

function EmptyStateRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-5">
        <div className="d-flex flex-column align-items-center text-muted">
          <i className="bi bi-inboxes display-5 mb-2"></i>
          <div className="fw-semibold">Chưa có yêu cầu nào</div>
          <div className="small">
            Khi người dùng gửi yêu cầu làm chủ trọ, mục này sẽ hiển thị.
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function HostRequestManager() {
  const [data, setData] = useState([])
  const [loadingList, setLoadingList] = useState(false)

  // pager + search + filter
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [q, setQ] = useState('')
  const [qInput, setQInput] = useState('')
  const [isStatus, setIsStatus] = useState('')

  // reject modal
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectRow, setRejectRow] = useState(null)
  const [rejectNote, setRejectNote] = useState('')

  const canPrev = page > 0
  const canNext = page + 1 < totalPages

  // ---- đồng bộ URL mỗi khi filter/phân trang đổi ----
  const syncUrl = () => {
    const sp = new URLSearchParams()
    sp.set('page', String(page))
    sp.set('size', String(size))
    q ? sp.set('q', q) : sp.delete('q')
    isStatus ? sp.set('status', isStatus) : sp.delete('status')
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${sp.toString()}`
    )
  }

  const buildParams = () => {
    const p = { page, size }
    if (q) p.q = q
    if (isStatus) p.status = isStatus
    return p
  }

  const fetchList = async () => {
    setLoadingList(true)
    try {
      syncUrl()
      const { status, data: resp } = await apiList.getHostRequest(buildParams())
      if (status === 200) {
        setData(Array.isArray(resp?.content) ? resp.content : [])
        setTotalPages(resp?.totalPages ?? 0)
        setTotalElements(resp?.totalElements ?? 0)
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
  }, [page, size, q, isStatus])

  const onSearchSubmit = () => {
    setPage(0)
    setQ(qInput)
  }

  const handleStatusChange = (e) => {
    setIsStatus(e.target.value)
    setPage(0)
  }

  // ----- actions -----
  const approveRequest = async (row) => {
    if (!row?.id) return
    try {
      await toast.promise(apiList.approveHostRequest(row.id), {
        pending: `Đang duyệt yêu cầu của ${row?.user?.username || 'user'}...`,
        success: 'Đã duyệt yêu cầu!',
        error: 'Duyệt yêu cầu thất bại',
      })
      fetchList()
    } catch (e) {
      console.error(e)
    }
  }

  const openReject = (row) => {
    setRejectRow(row)
    setRejectNote('')
    setRejectOpen(true)
  }

  const submitReject = async () => {
    if (!rejectRow?.id) return
    try {
      await toast.promise(
        apiList.rejectHostRequest(rejectRow.id, { note: rejectNote }),
        {
          pending: 'Đang huỷ duyệt yêu cầu...',
          success: 'Đã huỷ duyệt yêu cầu!',
          error: 'Huỷ duyệt thất bại',
        }
      )
      setRejectOpen(false)
      setRejectRow(null)
      setRejectNote('')
      fetchList()
    } catch (e) {
      console.error(e)
    }
  }

  const renderStatus = (status) => {
    const s = (status || '').toUpperCase()
    if (s === 'APPROVED')
      return <span className="badge text-bg-success">ĐÃ DUYỆT</span>
    if (s === 'REJECTED')
      return <span className="badge text-bg-danger">HUỶ DUYỆT</span>
    return <span className="badge text-bg-warning">ĐANG CHỜ</span> // PENDING
  }

  const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : '')

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Yêu cầu làm chủ trọ</h4>
      </div>

      {/* toolbar */}
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-8">
              <div className="d-flex gap-3 align-items-stretch flex-nowrap">
                {/* search */}
                <div className="flex-fill min-w-0">
                  <div className="input-group input-group-sm">
                    <input
                      className="form-control"
                      placeholder="Tìm theo tên tài khoản"
                      value={qInput}
                      onChange={(e) => setQInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={onSearchSubmit}
                    >
                      <i className="bi bi-search" />
                    </button>
                  </div>
                </div>

                {/* status filter */}
                <div className="flex-fill">
                  <select
                    className="form-select form-select-sm w-100"
                    value={isStatus}
                    onChange={handleStatusChange}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Đang chờ</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Huỷ duyệt</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 64 }} className="text-center">
                  #
                </th>
                <th style={{ width: 220 }}>Tài khoản</th>
                <th style={{ width: 260 }}>Email</th>
                <th style={{ width: 200 }}>Ngày tạo</th>
                <th>Ghi chú</th>
                <th style={{ width: 140 }}>Trạng thái</th>
                <th style={{ width: 240 }} className="text-end">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {!loadingList &&
                data.map((row, idx) => {
                  const pending =
                    (row?.status || '').toUpperCase() === 'PENDING'
                  return (
                    <tr key={row?.id ?? `${page}-${idx}`}>
                      <td className="text-center">{page * size + idx + 1}</td>
                      <td className="text-truncate">{row?.user?.username}</td>
                      <td className="text-truncate">{row?.user?.email}</td>
                      <td>{formatDateTime(row?.createdAt)}</td>
                      <td className="text-truncate" style={{ maxWidth: 420 }}>
                        {row?.note}
                      </td>
                      <td>{renderStatus(row?.status)}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            disabled={!pending}
                            onClick={() => approveRequest(row)}
                            title="Duyệt yêu cầu"
                          >
                            <i className="bi bi-check2-circle me-1"></i> Duyệt
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            disabled={!pending}
                            onClick={() => openReject(row)}
                            title="Huỷ duyệt"
                          >
                            <i className="bi bi-x-circle me-1"></i> Huỷ duyệt
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

              {!loadingList && data.length === 0 && (
                <EmptyStateRow colSpan={7} />
              )}
            </tbody>
          </table>
        </div>

        {/* pager */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top bg-light-subtle">
          <div className="small text-muted">
            Tổng: <strong>{totalElements}</strong> • Trang{' '}
            {totalPages === 0 ? 0 : page + 1}/{totalPages}
          </div>

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

      {/* Reject modal */}
      {rejectOpen && (
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
                  <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                  Huỷ duyệt yêu cầu
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRejectOpen(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  Tài khoản: <strong>{rejectRow?.user?.username}</strong> (
                  {rejectRow?.user?.email})
                </div>
                <label className="form-label">Lý do huỷ duyệt (tuỳ chọn)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Nhập lý do huỷ duyệt..."
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-light"
                  onClick={() => setRejectOpen(false)}
                >
                  Đóng
                </button>
                <button className="btn btn-danger" onClick={submitReject}>
                  <i className="bi bi-x-circle me-2"></i>Xác nhận huỷ duyệt
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
