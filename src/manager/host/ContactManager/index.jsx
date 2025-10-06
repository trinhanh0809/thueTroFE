import { useMemo, useState } from 'react'
import ContractFormModal, {
  EMPTY_CONTRACT,
  computeStatus,
} from '@/manager/host/ContactManager/form'

/** ===== Demo data & helpers ===== */
const uid = () => Math.random().toString(36).slice(2, 9)
const fmtDate = (s) =>
  s
    ? new Date(s).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : '—'

const DEMO_HOUSES = [
  { id: 'house-1', name: 'trọ mới' },
  { id: 'house-2', name: 'trọ A' },
]

const DEMO_CONTRACTS = [
  {
    id: 'c001',
    houseId: 'house-1',
    code: 'HD-0001',
    roomName: 'Phòng 101',
    representative: 'Nguyễn Văn A',
    phone: '0901234567',
    people: 2,
    createdDate: '2025-09-01',
    moveInDate: '2025-09-02',
    dueDate: '2025-10-01',
    endDate: '',
    notes: '',
  },
  {
    id: 'c002',
    houseId: 'house-1',
    code: 'HD-0002',
    roomName: 'Phòng 102',
    representative: 'Trần Thị B',
    phone: '0912345678',
    people: 1,
    createdDate: '2025-08-01',
    moveInDate: '2025-08-05',
    dueDate: '2025-08-30',
    endDate: '',
    notes: 'Trễ hạn 5 ngày',
  },
]

/** Trạng thái hiển thị */
const STATUS_META = {
  active: { label: 'Đang hiệu lực', color: '#1a7f37', bg: '#e8f5ee' },
  soon: { label: 'Sắp đến hạn', color: '#a15c00', bg: '#fff3e0' },
  overdue: { label: 'Đã quá hạn', color: '#b91c1c', bg: '#fee2e2' },
  ended: { label: 'Đã kết thúc', color: '#475569', bg: '#f1f5f9' },
}

function StatusBadge({ status }) {
  const m = STATUS_META[status]
  if (!m) return null
  return (
    <span
      className="status-badge"
      style={{ color: m.color, background: m.bg, borderColor: m.bg }}
    >
      {m.label}
    </span>
  )
}

export default function ContractManagement({
  initialHouses = DEMO_HOUSES,
  initialContracts = DEMO_CONTRACTS,
}) {
  const [houses] = useState(initialHouses)
  const [contracts, setContracts] = useState(initialContracts)
  const [houseId, setHouseId] = useState(initialHouses[0]?.id || '')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    active: true,
    soon: true,
    overdue: true,
    ended: true,
  })

  // modal state
  const [modal, setModal] = useState({
    open: false,
    mode: 'create', // view | edit | create
    initial: null,
  })

  const visibleContracts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const enabled = Object.entries(filters)
      .filter(([, v]) => v)
      .map(([k]) => k)
    return contracts
      .filter((c) => c.houseId === houseId)
      .map((c) => ({ ...c, _status: computeStatus(c) }))
      .filter((c) => {
        const matchQ =
          !q ||
          c.code.toLowerCase().includes(q) ||
          c.roomName.toLowerCase().includes(q) ||
          c.representative.toLowerCase().includes(q)
        return enabled.includes(c._status) && matchQ
      })
  }, [contracts, houseId, filters, query])

  const openCreate = () =>
    setModal({ open: true, mode: 'create', initial: { ...EMPTY_CONTRACT } })
  const openView = (c) => setModal({ open: true, mode: 'view', initial: c })
  const openEdit = (c) => setModal({ open: true, mode: 'edit', initial: c })

  const upsertContract = (values, id) => {
    if (!id) {
      const newC = { id: uid(), houseId, ...values }
      setContracts((arr) => [newC, ...arr])
    } else {
      setContracts((arr) =>
        arr.map((c) => (c.id === id ? { ...c, ...values } : c))
      )
    }
  }

  return (
    <div className="cm-wrap">
      {/* Topbar */}
      <div className="topbar">
        <div className="select-wrap">
          <select value={houseId} onChange={(e) => setHouseId(e.target.value)}>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <span className="select-caret">▾</span>
        </div>

        <div className="spacer" />

        <button className="btn btn-ghost">
          <span className="icon">⛃</span> Bộ lọc
        </button>

        <div className="search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm"
          />
          <span className="search-icon">🔍</span>
        </div>

        <button className="btn btn-primary" onClick={openCreate}>
          + Lập hợp đồng
        </button>
      </div>

      {/* Title */}
      <h2 className="page-title">QUẢN LÝ HỢP ĐỒNG</h2>

      {/* Filter chips */}
      <div className="card filter-card">
        <div className="filter-title">Trạng thái</div>
        <div className="filter-chips">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <label key={key} className="chip">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, [key]: e.target.checked }))
                }
              />
              <span
                className="chip-label"
                style={{ color: meta.color, background: meta.bg }}
              >
                {meta.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Mã hợp đồng</th>
              <th>Tên phòng</th>
              <th>Người đại diện</th>
              <th>Số lượng người ở</th>
              <th>Ngày lập</th>
              <th>Ngày vào ở</th>
              <th>Ngày đến hạn</th>
              <th>Ngày kết thúc</th>
              <th>Tình trạng</th>
              <th style={{ width: 140 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visibleContracts.length ? (
              visibleContracts.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.roomName}</td>
                  <td>
                    {c.representative}
                    {c.phone ? (
                      <div className="muted small">{c.phone}</div>
                    ) : null}
                  </td>
                  <td>{c.people}</td>
                  <td>{fmtDate(c.createdDate)}</td>
                  <td>{fmtDate(c.moveInDate)}</td>
                  <td>{fmtDate(c.dueDate)}</td>
                  <td>{fmtDate(c.endDate)}</td>
                  <td>
                    <StatusBadge status={c._status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={() => openView(c)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => openEdit(c)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-icon"
                        title="Xoá"
                        onClick={() =>
                          setContracts((arr) =>
                            arr.filter((x) => x.id !== c.id)
                          )
                        }
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="empty">
                  Không có bản ghi nào!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <ContractFormModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.initial}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onRequestEdit={() => setModal((m) => ({ ...m, mode: 'edit' }))}
        onSubmit={(values) => {
          if (modal.mode === 'edit' && modal.initial?.id) {
            upsertContract(values, modal.initial.id)
          } else {
            upsertContract(values, null)
          }
          setModal((m) => ({ ...m, open: false }))
        }}
      />

      {/* Styles */}
      <style>{`
        :root{
          --card:#fff; --muted:#6b7280; --line:#e5e7eb; --bg:#f7f7fb;
          --primary:#175fe4; --radius-xl:14px; --shadow:0 8px 24px rgba(17,24,39,.08),0 2px 8px rgba(17,24,39,.06);
        }
        .cm-wrap{padding:16px;background:var(--bg);min-height:100%;}
        .page-title{font-size:20px;margin:10px 0 14px;font-weight:700;}

        .topbar{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius-xl);padding:10px 12px;box-shadow:var(--shadow);}
        .select-wrap{position:relative;}
        .select-wrap select{appearance:none;border:1px solid var(--line);background:#fff;height:36px;padding:0 32px 0 12px;border-radius:8px;}
        .select-caret{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#6b7280;pointer-events:none;}
        .search{position:relative;}
        .search input{height:36px;padding:0 36px 0 12px;border:1px solid var(--line);border-radius:8px;background:#fff;min-width:220px;}
        .search-icon{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#9ca3af;}
        .spacer{flex:1;}

        .btn{height:32px;border-radius:8px;padding:0 12px;border:1px solid var(--line);background:#fff;cursor:pointer;}
        .btn:hover{background:#f8fafc;}
        .btn-primary{background:var(--primary);border-color:var(--primary);color:#fff;}
        .btn-primary:hover{opacity:.92;}
        .btn-ghost{background:#fff;border:1px solid var(--line);color:#111827;}
        .btn-icon{width:34px;padding:0;text-align:center;}

        .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-xl);}
        .filter-card{padding:12px;margin:12px 0;}
        .filter-title{font-weight:600;margin-bottom:8px;}
        .filter-chips{display:flex;gap:14px;flex-wrap:wrap;}
        .chip{display:flex;align-items:center;gap:8px;user-select:none;}
        .chip input{accent-color:var(--primary);}
        .chip-label{display:inline-block;padding:4px 10px;border-radius:999px;font-size:13px;border:1px solid transparent;}

        .table-card{padding:0;overflow:auto;}
        .table{width:100%;border-collapse:separate;border-spacing:0;}
        .table thead th{font-weight:600;text-align:left;font-size:14px;padding:12px;border-bottom:1px solid var(--line);background:#fafafa;}
        .table tbody td{padding:12px;border-bottom:1px solid var(--line);vertical-align:top;}
        .row-actions{display:flex;gap:6px;align-items:center;}
        .status-badge{font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;border:1px solid transparent;display:inline-block;}
        .empty{text-align:center;color:var(--muted);padding:18px;}
        .muted.small{color:var(--muted);font-size:12px;}
        @media (max-width: 768px){ .table thead {display:none;} .table tbody td{display:block;padding:8px 12px;border-bottom:1px dashed var(--line);} .table tbody tr{border-bottom:1px solid var(--line);} }
      `}</style>
    </div>
  )
}
