import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AdminLayout({
  items = [],
  width = 240,
  brand = { name: 'Dashboard', to: '/' },
}) {
  return (
    <div
      className="d-flex"
      style={{ minHeight: '100vh', background: '#f8f9fa' }}
    >
      <Sidebar items={items} width={width} />
      <div className="flex-grow-1 d-flex flex-column">
        <Topbar
        // brand={brand}
        // user={user}
        // onLogout={onLogout}
        // onSearch={onSearch}
        />
        <main className="p-3">{<Outlet />}</main>
      </div>
    </div>
  )
}
