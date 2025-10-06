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
      {/* Sidebar cố định bên trái */}
      <div
        style={{
          width,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto', // nếu menu dài thì sidebar tự cuộn riêng
        }}
      >
        <Sidebar items={items} width={width} />
      </div>

      {/* Nội dung chính */}
      <div className="flex-grow-1 d-flex flex-column  ">
        <Topbar />
        <main
          className="p-3"
          style={{ flexGrow: 1, overflowY: 'auto' }} // chỉ phần này cuộn
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
