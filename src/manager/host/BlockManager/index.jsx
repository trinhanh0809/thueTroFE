import { useEffect, useState } from 'react'
import BlockFormModal from '@/manager/host/BlockManager/form'
import apiList from '@/api'

const FALLBACK =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'
const fmtDate = (s) =>
  s
    ? new Date(s).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : '—'
const uid = () => Math.random().toString(36).slice(2, 9)

function ActiveToggle({ value, onChange }) {
  return (
    <button
      type="button"
      className={`toggle ${value ? 'on' : 'off'}`}
      onClick={() => onChange?.(!value)}
    >
      <span className="dot" />
      {value ? 'Hoạt động' : 'Tạm dừng'}
    </button>
  )
}

export default function BlocksManagement() {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({
    open: false,
    mode: 'create',
    initial: null,
  })

  const getApi = async () => {
    setLoading(true)
    try {
      const res = await apiList.getBlockMe()
      setBlocks(res.data.content)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    getApi()
  }, [])

  const openCreate = () =>
    setModal({ open: true, mode: 'create', initial: null })
  const openEdit = (b) => setModal({ open: true, mode: 'edit', initial: b })

  const upsertBlock = (values, id) => {
    setBlocks((arr) => arr.map((x) => (x.id === id ? { ...x, ...values } : x)))
  }

  return (
    <div className="bm-wrap">
      <div className="page-card">
        <div className="head">
          <h2 className="title">DÃY TRỌ/TÒA NHÀ</h2>
          <button className="btn btn-primary" onClick={openCreate}>
            + Thêm Trọ mới
          </button>
        </div>

        <div className="list">
          {blocks.map((b) => (
            <div className="row-item" key={b.id ?? uid()}>
              <div className="block-card">
                <div className="thumb">
                  <img src={b.coverImageUrl} alt={b.name} />
                </div>

                <div className="content">
                  <div className="title-row">
                    <h4 className="name mb-0">{b.name}</h4>
                    <div className="spacer" />
                    <ActiveToggle
                      value={!!b.active}
                      onChange={(v) =>
                        setBlocks((arr) =>
                          arr.map((x) =>
                            x.id === b.id ? { ...x, active: v } : x
                          )
                        )
                      }
                    />
                  </div>
                  <div className="muted small mb-1">
                    <i className="bi bi-geo-alt me-1" />
                    {b.address}
                  </div>
                  <div className="muted small mb-2">
                    <i className="bi bi-calendar3 me-1" />
                    Ngày tạo: {fmtDate(b.createdAt)}
                  </div>

                  <div className="meta-row">
                    <span className="pill">
                      Tổng số phòng: <b>{b.count_room ?? 0}</b>
                    </span>
                  </div>

                  <div className="actions">
                    <button
                      className="btn btn-ghost"
                      onClick={() => openEdit(b)}
                    >
                      <i className="bi bi-pencil-square me-1" />
                      Sửa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!Array.isArray(blocks) || blocks.length === 0 ? (
            <div className="muted small" style={{ padding: 12 }}>
              Không có dữ liệu
            </div>
          ) : null}
        </div>
      </div>

      <BlockFormModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.initial}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSubmit={(values) => {
          upsertBlock(values, modal.initial?.id)
          setModal({ open: false, mode: 'create', initial: null })
        }}
      />
      {/* styles */}
      <style>{`
        :root{ --bg:#f7f7fb; --card:#fff; --line:#e5e7eb; --radius:16px; --shadow:0 8px 24px rgba(17,24,39,.08),0 2px 8px rgba(17,24,39,.06); }
        .bm-wrap{ padding:16px;background:var(--bg);min-height:100%; }
        .page-card{ background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px;box-shadow:var(--shadow); }
        .head{ display:flex;align-items:center;justify-content: space-between;gap:12px;  }
        .title{ font-weight:800;font-size:20px;margin:0; }
        .list{ margin-top:12px; }
        .row-item{ background:#fff;border:1px solid #f1f5f9;border-radius:16px;padding:14px; }
        .row-item + .row-item{ margin-top:12px; }
        .btn{ height:32px;border-radius:8px;padding:0 12px;border:1px solid var(--line);background:#fff;cursor:pointer; }
        .btn-primary{ background:#175fe4;border-color:#175fe4;color:#fff; }
        .btn-primary:hover{ opacity:.92; }
        .btn-ghost{ background:#fff;border:1px solid #e5e7eb; }

        /* Card */
        .block-card{ display:flex; gap:16px; background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:14px; align-items:flex-start; }
        .thumb{ position:relative; width:220px; height:160px; border-radius:12px; overflow:hidden; flex:0 0 auto; }
        .thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
        .ribbon{ position:absolute; left:10px; top:10px; background:#eaf0ff; color:#1d4ed8; font-weight:700; font-size:12px; padding:4px 10px; border-radius:999px; border:1px solid #cfe0ff; }
        .content{ flex:1; min-width:0; }
        .title-row{ display:flex; align-items:center; gap:10px; margin-bottom:6px; }
        .name{ font-size:18px; font-weight:700; }
        .spacer{ flex:1; }
        .muted{ color:#6b7280; } .small{ font-size:13px; }
        .link-orange{ color:#ff6a00; text-decoration:none; } .link-orange:hover{ text-decoration:underline; }
        .meta-row{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
        .pill{ background:#fff; border:1px solid #e5e7eb; border-radius:999px; padding:4px 10px; font-size:12px; }
        .actions{ display:flex; gap:8px; }

        /* Toggle */
        .toggle{ display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:999px;border:1px solid #e5e7eb;background:#fff;font-weight:600;font-size:12px; }
        .toggle .dot{ width:14px;height:14px;border-radius:999px;display:inline-block;background:#9ca3af; }
        .toggle.on{ background:#e8f0ff; border-color:#cfe0ff; color:#175fe4; }
        .toggle.on .dot{ background:#175fe4; }

        .me-1{ margin-right:.25rem; } .mb-0{ margin-bottom:0; } .mb-1{ margin-bottom:.25rem; }
      `}</style>
    </div>
  )
}
