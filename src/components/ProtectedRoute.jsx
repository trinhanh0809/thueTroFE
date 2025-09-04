import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({
  children,
  roles,
  redirectIfDenied = '/forbidden403',
  redirectIfUnauthed = '/login',
  loadingFallback = null,
}) {
  const { user, loading } = useSelector((s) => s.auth || {})
  const location = useLocation()
  const have = Array.isArray(user?.roles) ? user.roles : []

  if (loading) return loadingFallback

  // Chưa đăng nhập
  if (!user)
    return (
      <Navigate to={redirectIfUnauthed} replace state={{ from: location }} />
    )

  // Ép quyền theo path
  const path = location.pathname
  const isAdminPath = path === '/admin' || path.startsWith('/admin/')
  const isHostPath = path === '/host' || path.startsWith('/host/')
  if (isAdminPath && !have.includes('ADMIN'))
    return <Navigate to={redirectIfDenied} replace />
  if (isHostPath && !have.some((r) => r === 'HOST' || r === 'ADMIN'))
    return <Navigate to={redirectIfDenied} replace />

  return children
}
