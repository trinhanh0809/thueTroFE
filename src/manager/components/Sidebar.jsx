import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export default function Sidebar({ items = [], width = 240 }) {
  const location = useLocation()
  return (
    <aside
      className="text-light min-vh-100 position-sticky top-0 border-end"
      style={{
        width,
        borderColor: 'rgba(0,0,0,0.1)', // line dọc rất nhạt
      }}
    >
      <div
        className="px-3 py-3 border-bottom"
        style={{ borderColor: 'rgba(0,0,0,0.1)' }}
      >
        <NavLink to="/" className="text-decoration-none fw-bold">
          {location.pathname.startsWith('/admin')
            ? 'Quản trị hệ thống'
            : location.pathname.startsWith('/host')
              ? 'Quản lý trọ'
              : 'Trang chủ'}
        </NavLink>
      </div>

      <nav className="px-2 py-2 d-grid gap-1">
        {items.map((it) => (
          <React.Fragment key={it.key}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                'nav-link px-3 py-2 rounded ' +
                (isActive ? 'bg-secondary text-white' : 'text-secondary')
              }
            >
              {it.label}
            </NavLink>
          </React.Fragment>
        ))}
      </nav>
    </aside>
  )
}
