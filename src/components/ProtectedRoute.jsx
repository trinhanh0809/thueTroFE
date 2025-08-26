import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * ProtectedRoute
 * - Chặn truy cập khi chưa đăng nhập → redirect /login (kèm state.from)
 * - Nếu là đường dẫn /admin/** thì bắt buộc có role ADMIN
 * - Nếu truyền props roles, sẽ yêu cầu người dùng có ít nhất 1 role trong danh sách
 * - Khi không đủ quyền → redirect về "/" (có thể thay bằng trang 403 riêng)
 */
export default function ProtectedRoute({
  children,
  roles, // string | string[] | undefined
  redirectIfDenied = '/forbidden403', // nơi chuyển hướng khi thiếu quyền
}) {
  const { user, loading } = useSelector((s) => s.auth)
  const location = useLocation()

  // Có thể hiển thị skeleton khi đang kiểm tra phiên đăng nhập
  if (loading) {
    return <div className="container py-4">Đang kiểm tra phiên đăng nhập…</div>
  }

  // Chưa đăng nhập → về /login và giữ lại trang muốn vào
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const userRoles = user?.roles ?? []

  // 1) Tự động bắt buộc ADMIN nếu path là /admin/**
  const isAdminPath =
    location.pathname === '/admin' || location.pathname.startsWith('/admin/')
  if (isAdminPath && !userRoles.includes('ADMIN')) {
    return (
      <Navigate
        to={redirectIfDenied}
        replace
        state={{ from: location, reason: 'forbidden_admin' }}
      />
    )
  }

  // 2) Nếu có truyền roles thủ công, cũng kiểm tra
  if (roles) {
    const required = Array.isArray(roles) ? roles : [roles]
    const ok = required.some((r) => userRoles.includes(r))
    if (!ok) {
      return (
        <Navigate
          to={redirectIfDenied}
          replace
          state={{ from: location, reason: 'forbidden_role' }}
        />
      )
    }
  }

  return children
}
