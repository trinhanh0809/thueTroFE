import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useSelector((s) => s.auth)
  if (!user) return <Navigate to="/login" replace />
  if (roles && roles.length > 0) {
    const ok = user.roles?.some((r) => roles.includes(r))
    if (!ok) return <div>Không có quyền truy cập</div>
  }
  return children
}
