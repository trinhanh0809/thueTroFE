import { useEffect, useMemo, useState } from 'react'

/** ========= Helpers ========= */
const fmtVND = (n) =>
  typeof n === 'number' && !Number.isNaN(n)
    ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫'
    : '—'
const plural = (n, s, p) => (n === 1 ? s : p || s + 's')
const uid = () => Math.random().toString(36).slice(2, 9)

/** ========= Demo data (có thể thay bằng API) ========= */
const DEMO_DATA = [
  {
    id: 'house-1',
    name: 'trọ mới',
    address: 'Hồng Hà, Đồng Xuân, Hoàn Kiếm, Hà Nội',
    groups: [
      {
        id: 'g01',
        index: 1,
        title: 'Phòng 101',
        rooms: [
          {
            id: 'r190',
            code: '190',
            status: 'available', // available | rented | deposit
            price: 12000000,
            deposit: 6000000,
            area: 12,
            max: 2,
            cycle: '1 tháng',
          },
          {
            id: 'r100',
            code: '100',
            status: 'available',
            price: 12000000,
            deposit: 6000000,
            area: 12,
            max: 2,
            cycle: '1 tháng',
          },
        ],
      },
      {
        id: 'g02',
        index: 2,
        title: 'Phòng 102',
        rooms: [],
      },
    ],
  },
]

/** ========= Status Config ========= */
const STATUS_META = {
  rented: { label: 'Đang thuê', color: '#1f6feb', bg: '#e7f0ff' },
  available: { label: 'Còn trống', color: '#1a7f37', bg: '#e8f5ee' },
  deposit: { label: 'Cọc phòng', color: '#a15c00', bg: '#fff3e0' },
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status]
  if (!meta) return null
  return (
    <span
      className="status-badge"
      style={{ color: meta.color, background: meta.bg, borderColor: meta.bg }}
    >
      {meta.label}
    </span>
  )
}

/** ========= Modal (thuần CSS, đóng khi click nền hoặc ESC) ========= */
function Modal({ open, title, children, footer, onClose, width = 560 }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="btn btn-icon" onClick={onClose} aria-label="close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{footer}</div>
      </div>
    </div>
  )
}

/** ========= Room card ========= */
function RoomCard({ room, onDetail, onEdit }) {
  return (
    <div className="room-card">
      <div className="room-top">
        <div className="room-code">{room.code}</div>
        <div className="room-status">
          <StatusBadge status={room.status} />
        </div>
      </div>

      <div className="room-meta">
        <div>
          <span className="meta-label">Giá thuê:</span>
          <span className="meta-value">{fmtVND(room.price)}</span>
        </div>
        <div>
          <span className="meta-label">Giá cọc:</span>
          <span className="meta-value">{fmtVND(room.deposit)}</span>
        </div>
        <div>
          <span className="meta-label">Diện tích:</span>
          <span className="meta-value">{room.area} m²</span>
        </div>
        <div>
          <span className="meta-label">Ở tối đa:</span>
          <span className="meta-value">{room.max} người</span>
        </div>
        <div>
          <span className="meta-label">Chu kỳ tiền:</span>
          <span className="meta-value">{room.cycle}</span>
        </div>
      </div>

      <div className="room-actions">
        <button className="btn btn-primary" onClick={onDetail}>
          Chi tiết
        </button>
        <button className="btn btn-ghost" onClick={onEdit}>
          Chỉnh sửa
        </button>
        <button className="btn btn-icon" title="Tuỳ chọn">
          ⋯
        </button>
      </div>
    </div>
  )
}

/** ========= Group box ========= */
function GroupBox({ group, onAddRoom, onEditGroup, onEditRoom }) {
  return (
    <div className="group-box">
      <div className="group-head">
        <div className="group-index">
          {String(group.index).padStart(2, '0')}
        </div>
        <div className="group-title">
          <div className="name">{group.title}</div>
          <div className="sub">
            {group.rooms.length} {plural(group.rooms.length, 'phòng')}
          </div>
        </div>
        <div className="spacer" />
        <div className="group-actions">
          <button className="btn btn-ghost" onClick={onAddRoom}>
            + Thêm phòng
          </button>
          <button className="btn btn-ghost" onClick={onEditGroup}>
            Sửa
          </button>
        </div>
      </div>

      <div className="group-body">
        {group.rooms.length ? (
          group.rooms.map((r) => (
            <RoomCard
              key={r.id}
              room={r}
              onDetail={() => console.log('detail', r.id)}
              onEdit={() => onEditRoom?.(r)}
            />
          ))
        ) : (
          <div className="empty">
            Chưa có phòng.{' '}
            <button className="btn btn-link" onClick={onAddRoom}>
              Thêm phòng
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** ========= Room Form Modal ========= */
const EMPTY_ROOM = {
  code: '',
  status: 'available',
  price: 0,
  deposit: 0,
  area: 10,
  max: 2,
  cycle: '1 tháng',
}

function RoomFormModal({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || EMPTY_ROOM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(initial || EMPTY_ROOM)
    setErrors({})
  }, [initial, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.code.trim()) e.code = 'Mã phòng là bắt buộc'
    if (!form.status) e.status = 'Chọn trạng thái'
    if (form.price < 0) e.price = 'Giá không hợp lệ'
    if (form.deposit < 0) e.deposit = 'Cọc không hợp lệ'
    if (form.area <= 0) e.area = 'Diện tích > 0'
    if (form.max <= 0) e.max = 'Số người > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit?.(form)
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Chỉnh sửa phòng' : 'Thêm phòng'}
      onClose={onClose}
      width={640}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={submit}>
            Lưu
          </button>
        </>
      }
    >
      <form className="form-grid" onSubmit={submit}>
        <div className="form-item">
          <label>Mã phòng *</label>
          <input
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            placeholder="VD: 101, A3-05…"
          />
          {errors.code && <div className="err">{errors.code}</div>}
        </div>

        <div className="form-item">
          <label>Trạng thái *</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          >
            <option value="available">Còn trống</option>
            <option value="rented">Đang thuê</option>
            <option value="deposit">Cọc phòng</option>
          </select>
          {errors.status && <div className="err">{errors.status}</div>}
        </div>

        <div className="form-item">
          <label>Giá thuê (₫)</label>
          <input
            type="number"
            inputMode="numeric"
            value={form.price}
            onChange={(e) => set('price', Number(e.target.value))}
            min={0}
          />
          {errors.price && <div className="err">{errors.price}</div>}
        </div>

        <div className="form-item">
          <label>Giá cọc (₫)</label>
          <input
            type="number"
            inputMode="numeric"
            value={form.deposit}
            onChange={(e) => set('deposit', Number(e.target.value))}
            min={0}
          />
          {errors.deposit && <div className="err">{errors.deposit}</div>}
        </div>

        <div className="form-item">
          <label>Diện tích (m²)</label>
          <input
            type="number"
            inputMode="numeric"
            value={form.area}
            onChange={(e) => set('area', Number(e.target.value))}
            min={1}
          />
          {errors.area && <div className="err">{errors.area}</div>}
        </div>

        <div className="form-item">
          <label>Ở tối đa (người)</label>
          <input
            type="number"
            inputMode="numeric"
            value={form.max}
            onChange={(e) => set('max', Number(e.target.value))}
            min={1}
          />
          {errors.max && <div className="err">{errors.max}</div>}
        </div>

        <div className="form-item">
          <label>Chu kỳ tiền</label>
          <select
            value={form.cycle}
            onChange={(e) => set('cycle', e.target.value)}
          >
            <option>1 tháng</option>
            <option>3 tháng</option>
            <option>6 tháng</option>
            <option>12 tháng</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}

/** ========= Group Form Modal ========= */
const EMPTY_GROUP = { title: '', index: 1 }

function GroupFormModal({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || EMPTY_GROUP)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(initial || EMPTY_GROUP)
    setErrors({})
  }, [initial, open])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Tên loại phòng là bắt buộc'
    if (form.index <= 0) e.index = 'Thứ tự > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit?.(form)
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng'}
      onClose={onClose}
      width={520}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={submit}>
            Lưu
          </button>
        </>
      }
    >
      <form className="form-grid" onSubmit={submit}>
        <div className="form-item">
          <label>Tên loại phòng *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="VD: Phòng 101"
          />
          {errors.title && <div className="err">{errors.title}</div>}
        </div>
        <div className="form-item">
          <label>Thứ tự *</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={form.index}
            onChange={(e) =>
              setForm((f) => ({ ...f, index: Number(e.target.value) }))
            }
          />
          {errors.index && <div className="err">{errors.index}</div>}
        </div>
      </form>
    </Modal>
  )
}

/** ========= Main ========= */
export default function RoomManagement({ initialData = DEMO_DATA }) {
  const [houses, setHouses] = useState(() => initialData)
  const [selectedHouseId, setSelectedHouseId] = useState(initialData[0]?.id)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    rented: true,
    available: true,
    deposit: true,
  })

  // Modal states
  const [roomModal, setRoomModal] = useState({
    open: false,
    houseId: null,
    groupId: null,
    initial: null,
  })
  const [groupModal, setGroupModal] = useState({
    open: false,
    houseId: null,
    initial: null,
  })

  const currentHouse = houses.find((h) => h.id === selectedHouseId)

  const filteredGroups = useMemo(() => {
    if (!currentHouse) return []
    const enabled = Object.entries(filters)
      .filter(([, v]) => v)
      .map(([k]) => k)
    const q = query.trim().toLowerCase()

    return currentHouse.groups.map((g) => ({
      ...g,
      rooms: g.rooms.filter((r) => {
        const statusOK = enabled.includes(r.status)
        const searchOK =
          !q ||
          r.code.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q)
        return statusOK && searchOK
      }),
    }))
  }, [currentHouse, filters, query])

  /** ---------- CRUD helpers (sửa trên state houses) ---------- */
  const upsertGroup = (houseId, patch, id) => {
    setHouses((hs) =>
      hs.map((h) => {
        if (h.id !== houseId) return h
        if (!id) {
          // add
          const newG = { id: uid(), rooms: [], ...patch }
          return {
            ...h,
            groups: [...h.groups, newG].sort((a, b) => a.index - b.index),
          }
        } else {
          // update
          return {
            ...h,
            groups: h.groups
              .map((g) => (g.id === id ? { ...g, ...patch } : g))
              .sort((a, b) => a.index - b.index),
          }
        }
      })
    )
  }

  const upsertRoom = (houseId, groupId, patch, id) => {
    setHouses((hs) =>
      hs.map((h) => {
        if (h.id !== houseId) return h
        return {
          ...h,
          groups: h.groups.map((g) => {
            if (g.id !== groupId) return g
            if (!id) {
              const newR = { id: uid(), ...patch }
              return { ...g, rooms: [...g.rooms, newR] }
            } else {
              return {
                ...g,
                rooms: g.rooms.map((r) =>
                  r.id === id ? { ...r, ...patch } : r
                ),
              }
            }
          }),
        }
      })
    )
  }

  /** ---------- Open modals ---------- */
  const openAddGroup = () =>
    setGroupModal({
      open: true,
      houseId: currentHouse.id,
      initial: { ...EMPTY_GROUP, index: currentHouse.groups.length + 1 },
    })

  const openEditGroup = (group) =>
    setGroupModal({ open: true, houseId: currentHouse.id, initial: group })

  const openAddRoom = (group) =>
    setRoomModal({
      open: true,
      houseId: currentHouse.id,
      groupId: group.id,
      initial: { ...EMPTY_ROOM },
    })

  const openEditRoom = (group, room) =>
    setRoomModal({
      open: true,
      houseId: currentHouse.id,
      groupId: group.id,
      initial: room,
    })

  return (
    <div className="rm-container">
      {/* Topbar */}
      <div className="topbar">
        <div className="select-wrap">
          <select
            value={selectedHouseId}
            onChange={(e) => setSelectedHouseId(e.target.value)}
          >
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <span className="select-caret">▾</span>
        </div>

        <div className="spacer" />

        <button className="btn btn-ghost" onClick={() => {}}>
          <span className="icon">⛃</span> Bộ lọc
        </button>

        <div className="search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm phòng"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="page-title">QUẢN LÝ PHÒNG</h2>

      {/* Filter bar */}
      <div className="card filter-card">
        <div className="filter-title">Trạng thái phòng</div>
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

      {/* House block */}
      {currentHouse && (
        <div className="house-block">
          <div className="house-head">
            <div className="house-name">{currentHouse.name}</div>
            <div className="house-sub">📍 {currentHouse.address}</div>
            <div className="spacer" />
            <button className="btn btn-ghost" onClick={openAddGroup}>
              + Thêm loại phòng
            </button>
          </div>

          {/* Groups */}
          {currentHouse.groups.map((g) => (
            <GroupBox
              key={g.id}
              group={g}
              onAddRoom={() => openAddRoom(g)}
              onEditGroup={() => openEditGroup(g)}
              onEditRoom={(room) => openEditRoom(g, room)}
            />
          ))}
        </div>
      )}

      {/* ===== Modals ===== */}
      <RoomFormModal
        open={roomModal.open}
        initial={roomModal.initial}
        onClose={() => setRoomModal((m) => ({ ...m, open: false }))}
        onSubmit={(values) => {
          if (roomModal.initial?.id) {
            upsertRoom(
              roomModal.houseId,
              roomModal.groupId,
              values,
              roomModal.initial.id
            )
          } else {
            upsertRoom(roomModal.houseId, roomModal.groupId, values)
          }
          setRoomModal((m) => ({ ...m, open: false }))
        }}
      />

      <GroupFormModal
        open={groupModal.open}
        initial={groupModal.initial}
        onClose={() => setGroupModal((m) => ({ ...m, open: false }))}
        onSubmit={(values) => {
          if (groupModal.initial?.id) {
            upsertGroup(groupModal.houseId, values, groupModal.initial.id)
          } else {
            upsertGroup(groupModal.houseId, values)
          }
          setGroupModal((m) => ({ ...m, open: false }))
        }}
      />

      {/* Styles */}
      <style>{`
        :root{
          --card: #ffffff;
          --muted: #6b7280;
          --line: #e5e7eb;
          --bg: #f7f7fb;
          --primary: #175fe4;
          --primary-contrast: #fff;
          --radius-xl: 14px;
          --radius-lg: 12px;
          --radius-md: 10px;
          --shadow: 0 8px 24px rgba(17,24,39,.08), 0 2px 8px rgba(17,24,39,.06);
        }
        .rm-container{
          padding: 16px;
          background: var(--bg);
          min-height: 100%;
        }
        .page-title{
          font-size: 20px;
          margin: 10px 0 14px;
          font-weight: 700;
        }

        /* Topbar */
        .topbar{
          display:flex; align-items:center; gap:12px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          padding: 10px 12px;
          box-shadow: var(--shadow);
        }
        .select-wrap{ position: relative; }
        .select-wrap select{
          appearance: none;
          border: 1px solid var(--line);
          background: #fff;
          height: 36px;
          padding: 0 32px 0 12px;
          border-radius: 8px;
        }
        .select-caret{
          position:absolute; right:10px; top:50%; transform:translateY(-50%);
          color:#6b7280; pointer-events:none;
        }
        .search{ position: relative; }
        .search input{
          height: 36px; padding: 0 36px 0 12px;
          border: 1px solid var(--line);
          border-radius: 8px; background: #fff;
          min-width: 220px;
        }
        .search-icon{
          position:absolute; right:10px; top:50%; transform:translateY(-50%);
          color:#9ca3af;
        }
        .spacer{ flex:1; }

        /* Buttons */
        .btn{
          height: 32px;
          border-radius: 8px;
          padding: 0 12px;
          border: 1px solid var(--line);
          background:#fff; cursor:pointer;
        }
        .btn:hover{ background:#f8fafc; }
        .btn-primary{
          background: var(--primary);
          border-color: var(--primary);
          color: var(--primary-contrast);
        }
        .btn-primary:hover{ opacity:.92; }
        .btn-ghost{ background:#fff; border:1px solid var(--line); color:#111827; }
        .btn-link{ border:0; background:transparent; color:var(--primary); padding:0; height:auto; }
        .btn-icon{ width:34px; padding:0; text-align:center; }

        /* Cards */
        .card{
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
        }
        .filter-card{ padding: 12px; margin: 12px 0; }
        .filter-title{ font-weight:600; margin-bottom:8px; }
        .filter-chips{ display:flex; gap:14px; flex-wrap:wrap; }
        .chip{ display:flex; align-items:center; gap:8px; user-select:none; }
        .chip input{ accent-color: var(--primary); }
        .chip-label{ display:inline-block; padding:4px 10px; border-radius:999px; font-size: 13px; border:1px solid transparent; }

        /* House */
        .house-block{
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          padding: 10px;
          box-shadow: var(--shadow);
        }
        .house-head{
          display:flex; align-items:center; gap:10px;
          padding: 10px 6px 12px;
          border-bottom:1px solid var(--line);
        }
        .house-name{ font-weight:700; }
        .house-sub{ color: var(--muted); font-size: 13px; }

        /* Group */
        .group-box{
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          background: #f7f9ff;
          padding: 10px;
          margin: 12px 0;
        }
        .group-head{ display:flex; align-items:center; gap:10px; padding: 6px; }
        .group-index{
          width:36px; height:36px; border-radius:999px;
          display:flex; align-items:center; justify-content:center;
          background:#eef2ff; color:#3443d3; font-weight:700;
        }
        .group-title .name{ font-weight:700; }
        .group-title .sub{ color: var(--muted); font-size: 13px; }
        .group-actions{ display:flex; gap:8px; }

        .group-body{
          padding: 10px 6px 4px;
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 10px;
        }
        .empty{ color: var(--muted); padding: 10px; }

        /* Room card */
        .room-card{
          background:#fff; border:1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 10px; position: relative;
        }
        .room-top{ display:flex; align-items:center; }
        .room-code{ font-weight:700; font-size: 16px; }
        .room-status{ margin-left:auto; }
        .status-badge{ font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; border:1px solid transparent; }
        .room-meta{ margin-top:8px; font-size: 13px; }
        .room-meta > div{ display:flex; justify-content:space-between; padding: 2px 0; }
        .meta-label{ color: var(--muted); }
        .meta-value{ font-weight: 600; }
        .room-actions{ display:flex; align-items:center; gap:8px; margin-top: 10px; }

        /* Modal */
        .modal-backdrop{
          position: fixed; inset: 0;
          background: rgba(0,0,0,.45);
          display:flex; align-items:center; justify-content:center;
          padding: 20px;
          z-index: 50;
        }
        .modal-card{
          width: 100%;
          background: #fff; border-radius: 16px; border: 1px solid var(--line);
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .modal-head{
          display:flex; align-items:center; gap:10px;
          padding: 12px 14px; border-bottom:1px solid var(--line);
        }
        .modal-title{ font-weight:700; }
        .modal-body{ padding: 14px; }
        .modal-foot{ padding: 12px 14px; border-top:1px solid var(--line); display:flex; justify-content:flex-end; gap:10px; }

        /* Form */
        .form-grid{
          display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;
        }
        .form-item{ display:flex; flex-direction:column; gap:6px; }
        .form-item label{ font-weight: 600; font-size: 13px; }
        .form-item input, .form-item select{
          height: 36px; border:1px solid var(--line); border-radius:8px; padding: 0 10px; background:#fff;
        }
        .err{ color:#b91c1c; font-size:12px; }

        @media (max-width: 640px){
          .group-body{ grid-template-columns: 1fr; }
          .form-grid{ grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
