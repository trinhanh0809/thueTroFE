export default function BlockCard({ block, onToggle, onEdit }) {
  return (
    <div className="block-card">
      <div className="thumb">
        <img
          src={block.thumbnail || FALLBACK}
          alt={block.name}
          onError={(e) => (e.currentTarget.src = FALLBACK)}
        />
        {block.typeLabel && <span className="ribbon">{block.typeLabel}</span>}
      </div>

      <div className="content">
        <div className="title-row">
          <h4 className="name mb-0">{block.name}</h4>
          <div className="spacer" />
          <ActiveToggle value={block.active} onChange={onToggle} />
        </div>

        <div className="muted small mb-1">
          <i className="bi bi-broadcast me-1" />
          Quảng cáo:{' '}
          <a
            href="#"
            className="link-orange"
            onClick={(e) => e.preventDefault()}
          >
            {block.adLabel || '—'}
          </a>
        </div>
        <div className="muted small mb-1">
          <i className="bi bi-geo-alt me-1" />
          {block.address || '—'}
        </div>
        <div className="muted small mb-2">
          <i className="bi bi-calendar3 me-1" />
          Ngày tạo: {fmtDate(block.createdAt)}
        </div>

        <div className="meta-row">
          <span className="pill">
            Tổng số phòng: <b>{block.totalRooms ?? 0}</b>
          </span>
        </div>

        <div className="actions">
          <button className="btn btn-ghost" onClick={onEdit}>
            <i className="bi bi-pencil-square me-1" />
            Sửa
          </button>
        </div>
      </div>

      <style>{`
        .block-card{
          display:flex; gap:16px; background:#fff; border:1px solid #e5e7eb;
          border-radius:16px; padding:14px; align-items:flex-start;
        }
        .thumb{ position:relative; width:220px; height:160px; border-radius:12px; overflow:hidden; flex:0 0 auto; }
        .thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
        .ribbon{
          position:absolute; left:10px; top:10px; background:#eaf0ff; color:#1d4ed8;
          font-weight:700; font-size:12px; padding:4px 10px; border-radius:999px;
          border:1px solid #cfe0ff;
        }
        .content{ flex:1; min-width:0; }
        .title-row{ display:flex; align-items:center; gap:10px; margin-bottom:6px; }
        .name{ font-size:18px; font-weight:700; }
        .spacer{ flex:1; }
        .muted{ color:#6b7280; }
        .small{ font-size:13px; }
        .link-orange{ color:#ff6a00; text-decoration:none; }
        .link-orange:hover{ text-decoration:underline; }
        .meta-row{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
        .pill{ background:#fff; border:1px solid #e5e7eb; border-radius:999px; padding:4px 10px; font-size:12px; }
        .actions{ display:flex; gap:8px; }
        .btn-ghost{ background:#fff; border:1px solid #e5e7eb; }
      `}</style>
    </div>
  )
}
