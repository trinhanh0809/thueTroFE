import React from 'react'
import { Outlet } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/manager/components/AdminLayout'

export default function RoleGuard({ roles, items, brand }) {
  const rs = Array.isArray(roles) ? roles : [roles]
  return (
    <ProtectedRoute roles={rs}>
      <AdminLayout items={items} brand={brand}>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  )
}
