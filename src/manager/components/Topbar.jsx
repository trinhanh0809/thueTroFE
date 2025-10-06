import React from 'react'
import { Link, useLocation } from 'react-router-dom'

/** Topbar: breadcrumb + search + actions (notify, theme, user) */
export default function Topbar({
  user = { name: 'Admin', email: 'admin@example.com' },
  onLogout,
}) {
  const [q, setQ] = React.useState('')

  return (
    <nav
      className="navbar bg-white border-bottom sticky-top  z-3"
      style={{ height: 56 }}
    >
      <div className="container-fluid">
        {/* Left: brand + breadcrumbs */}
        {/* <div className="d-flex align-items-center gap-3">
          <nav aria-label="breadcrumb">
          
          </nav>
        </div> */}

        {/* Right: search + actions */}
        <div className="d-flex align-items-center gap-2">
          <form className="d-none d-md-flex">
            <input
              className="form-control"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 280 }}
            />
          </form>

          {/* User menu (pure React) */}
          {/* <div className="position-relative">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((s) => !s)
              }}
            >
              <div
                className="rounded-circle bg-secondary"
                style={{ width: 28, height: 28 }}
              />
              <span className="d-none d-sm-inline">{user?.name || 'User'}</span>
              <i className="bi bi-caret-down-fill small"></i>
            </button>
            {menuOpen && (
              <div
                className="dropdown-menu dropdown-menu-end show mt-2"
                style={{
                  position: 'absolute',
                  inset: 'auto 0 0 auto',
                  transform: 'translateY(40px)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="dropdown-header">
                  <div className="fw-semibold">{user?.name}</div>
                  <div className="small text-muted">{user?.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <Link className="dropdown-item" to="/profile">
                  Hồ sơ
                </Link>
                <button className="dropdown-item" onClick={onLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </nav>
  )
}
