import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import apiList from '@/api'

const fmtVND = (n) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(n)
    : n === 0
      ? '0'
      : '—'

const addr = (w, d, p) => [w, d, p].filter(Boolean).join(', ') || '—'

function EmptyRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-5 text-center text-muted">
        <i className="bi bi-buildings display-6 d-block mb-2" />
        Chưa có phòng nào
      </td>
    </tr>
  )
}

export default function RoomManger() {
  const nav = useNavigate()
  const location = useLocation()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  // paging
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const canPrev = page > 0
  const canNext = page + 1 < totalPages

  // filters (by ID, khớp BE search)
  const [roomTypes, setRoomTypes] = useState([])
  const [roomTypeId, setRoomTypeId] = useState('')

  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  const [provinceId, setProvinceId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [wardId, setWardId] = useState('')

  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [areaMin, setAreaMin] = useState('')
  const [areaMax, setAreaMax] = useState('')

  const [loadingProv, setLoadingProv] = useState(false)
  const [loadingDist, setLoadingDist] = useState(false)
  const [loadingWard, setLoadingWard] = useState(false)

  // read query on mount
  useEffect(() => {
    const sp = new URLSearchParams(location.search)
    const qp = sp.get('page')
    const qs = sp.get('size')
    qp && setPage(Math.max(0, parseInt(qp, 10) || 0))
    qs && setSize(Math.max(1, parseInt(qs, 10) || 10))

    setRoomTypeId(sp.get('roomTypeId') || '')
    setProvinceId(sp.get('provinceId') || '')
    setDistrictId(sp.get('districtId') || '')
    setWardId(sp.get('wardId') || '')
    setPriceMin(sp.get('priceMin') || '')
    setPriceMax(sp.get('priceMax') || '')
    setAreaMin(sp.get('areaMin') || '')
    setAreaMax(sp.get('areaMax') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncUrl = () => {
    const sp = new URLSearchParams()
    sp.set('page', String(page))
    sp.set('size', String(size))
    if (roomTypeId) sp.set('roomTypeId', roomTypeId)
    else sp.delete('roomTypeId')
    if (provinceId) sp.set('provinceId', provinceId)
    else sp.delete('provinceId')
    if (districtId) sp.set('districtId', districtId)
    else sp.delete('districtId')
    if (wardId) sp.set('wardId', wardId)
    else sp.delete('wardId')
    if (priceMin) sp.set('priceMin', priceMin)
    else sp.delete('priceMin')
    if (priceMax) sp.set('priceMax', priceMax)
    else sp.delete('priceMax')
    if (areaMin) sp.set('areaMin', areaMin)
    else sp.delete('areaMin')
    if (areaMax) sp.set('areaMax', areaMax)
    else sp.delete('areaMax')
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${sp.toString()}`
    )
  }

  const buildParams = () => {
    const p = { page, size }
    if (provinceId) p.provinceId = Number(provinceId)
    if (districtId) p.districtId = Number(districtId)
    if (wardId) p.wardId = Number(wardId)
    if (roomTypeId) p.roomTypeId = Number(roomTypeId)
    if (priceMin !== '') p.priceMin = Number(priceMin)
    if (priceMax !== '') p.priceMax = Number(priceMax)
    if (areaMin !== '') p.areaMin = Number(areaMin)
    if (areaMax !== '') p.areaMax = Number(areaMax)
    return p
  }

  const fetchList = async () => {
    setLoading(true)
    try {
      syncUrl()
      // BE: public search (APPROVED)
      // TODO: map đúng API tìm kiếm
      const { status, data } = await apiList.getRoomMe(buildParams())
      if (status === 200) {
        setRows(Array.isArray(data?.content) ? data.content : [])
        setTotalPages(data?.totalPages ?? 0)
        setTotalElements(data?.totalElements ?? 0)
      } else {
        toast.error('Không thể tải danh sách phòng')
      }
    } catch (e) {
      console.error(e)
      toast.error('Tải danh sách thất bại')
    } finally {
      setLoading(false)
    }
  }

  // options
  const loadRoomTypes = async () => {
    const { status, data } = await apiList.getRoomType()
    if (status === 200 && Array.isArray(data)) setRoomTypes(data)
  }
  const loadProvinces = async () => {
    setLoadingProv(true)
    try {
      const { status, data } = await apiList.getProvinces()
      if (status === 200 && Array.isArray(data)) setProvinces(data)
    } finally {
      setLoadingProv(false)
    }
  }
  const loadDistricts = async (pid) => {
    if (!pid) {
      setDistricts([])
      return
    }
    setLoadingDist(true)
    try {
      const { status, data } = await apiList.getDistricts(pid)
      if (status === 200 && Array.isArray(data)) setDistricts(data)
    } finally {
      setLoadingDist(false)
    }
  }
  const loadWards = async (did) => {
    if (!did) {
      setWards([])
      return
    }
    setLoadingWard(true)
    try {
      const { status, data } = await apiList.getWards(did)
      if (status === 200 && Array.isArray(data)) setWards(data)
    } finally {
      setLoadingWard(false)
    }
  }

  useEffect(() => {
    loadRoomTypes()
    loadProvinces()
  }, [])
  useEffect(() => {
    fetchList() /* eslint-disable-next-line */
  }, [
    page,
    size,
    roomTypeId,
    provinceId,
    districtId,
    wardId,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
  ])

  useEffect(() => {
    if (!provinceId) {
      setDistrictId('')
      setWardId('')
      setDistricts([])
      setWards([])
      return
    }
    loadDistricts(Number(provinceId))
    setDistrictId('')
    setWardId('')
  }, [provinceId])

  useEffect(() => {
    if (!districtId) {
      setWardId('')
      setWards([])
      return
    }
    loadWards(Number(districtId))
    setWardId('')
  }, [districtId])

  const resetFilters = () => {
    setRoomTypeId('')
    setProvinceId('')
    setDistrictId('')
    setWardId('')
    setPriceMin('')
    setPriceMax('')
    setAreaMin('')
    setAreaMax('')
    setPage(0)
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Quản lý phòng</h4>
        <button
          className="btn btn-primary"
          onClick={() => nav('/host/danh-sach-phong-tro/tao-moi')}
        >
          <i className="bi bi-plus-lg me-2" /> Thêm phòng
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body d-flex flex-wrap gap-3 align-items-end">
          <div>
            <label className="form-label small mb-1">Loại phòng</label>
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 160 }}
              value={roomTypeId}
              onChange={(e) => {
                setRoomTypeId(e.target.value)
                setPage(0)
              }}
            >
              <option value="">— Tất cả —</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label small mb-1">Tỉnh/TP</label>
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 180 }}
              value={provinceId}
              onChange={(e) => {
                setProvinceId(e.target.value)
                setPage(0)
              }}
              disabled={loadingProv}
            >
              <option value="">— Tất cả —</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label small mb-1">Quận/Huyện</label>
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 180 }}
              value={districtId}
              onChange={(e) => {
                setDistrictId(e.target.value)
                setPage(0)
              }}
              disabled={!provinceId || loadingDist}
            >
              <option value="">— Tất cả —</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label small mb-1">Phường/Xã</label>
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 180 }}
              value={wardId}
              onChange={(e) => {
                setWardId(e.target.value)
                setPage(0)
              }}
              disabled={!districtId || loadingWard}
            >
              <option value="">— Tất cả —</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label small mb-1">Giá tối thiểu (VND)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={priceMin}
              onChange={(e) => {
                setPriceMin(e.target.value)
                setPage(0)
              }}
              style={{ width: 160 }}
            />
          </div>
          <div>
            <label className="form-label small mb-1">Giá tối đa (VND)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={priceMax}
              onChange={(e) => {
                setPriceMax(e.target.value)
                setPage(0)
              }}
              style={{ width: 160 }}
            />
          </div>
          <div>
            <label className="form-label small mb-1">Diện tích từ (m²)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={areaMin}
              onChange={(e) => {
                setAreaMin(e.target.value)
                setPage(0)
              }}
              style={{ width: 140 }}
            />
          </div>
          <div>
            <label className="form-label small mb-1">đến (m²)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={areaMax}
              onChange={(e) => {
                setAreaMax(e.target.value)
                setPage(0)
              }}
              style={{ width: 140 }}
            />
          </div>

          <div className="ms-auto">
            <button className="btn btn-light btn-sm" onClick={resetFilters}>
              <i className="bi bi-arrow-counterclockwise me-1" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 56 }} className="text-center">
                  STT
                </th>
                <th>Tiêu đề</th>
                <th>Địa chỉ</th>
                <th style={{ width: 110 }} className="text-end">
                  Diện tích
                </th>
                <th style={{ width: 150 }} className="text-end">
                  Giá / tháng
                </th>
                <th style={{ width: 170 }} className="text-end">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                rows.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="text-center">{page * size + idx + 1}</td>
                    <td>
                      <button
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => nav(`/host/danh-sach-phong-tro/${r.id}`)}
                      >
                        {r.title || '—'}
                      </button>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 360 }}>
                      {addr(r.wardName, r.districtName, r.provinceName)}
                    </td>
                    <td className="text-end">
                      {typeof r.areaSqm === 'number' ? `${r.areaSqm} m²` : '—'}
                    </td>
                    <td className="text-end fw-semibold">
                      {fmtVND(r.priceMonth)}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() =>
                            nav(`/host/danh-sach-phong-tro/${r.id}/sua`)
                          }
                          title="Sửa"
                        >
                          <i className="bi bi-pencil-square" />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={async () => {
                            if (!window.confirm('Xoá phòng này?')) return
                            try {
                              // BE: chỉ chủ phòng xoá được
                              await toast.promise(apiList.rooms.delete(r.id), {
                                pending: 'Đang xoá...',
                                success: 'Đã xoá',
                                error: 'Xoá thất bại',
                              })
                              fetchList()
                            } catch (e) {
                              console.error(e)
                            }
                          }}
                          title="Xoá"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && <EmptyRow colSpan={7} />}
            </tbody>
          </table>
        </div>

        {/* Pager */}
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
              disabled={!canPrev || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <i className="bi bi-chevron-left me-1" /> Trước
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={!canNext || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau <i className="bi bi-chevron-right ms-1" />
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={1800} theme="colored" />
    </div>
  )
}
