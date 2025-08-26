import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Container from '@/components/layout/Container'

export default function Forbidden403() {
  const navigate = useNavigate()
  const location = useLocation()
  const reason = location.state?.reason
  const attempted = location.state?.from?.pathname
  const { user } = useSelector((s) => s.auth)

  const reasonText =
    reason === 'forbidden_admin'
      ? 'Bạn cần quyền ADMIN để truy cập khu vực này.'
      : reason === 'forbidden_role'
      ? 'Tài khoản của bạn chưa có quyền phù hợp để truy cập trang này.'
      : 'Bạn không có quyền truy cập trang này.'

  return (
    <Container>
      <div
        className="py-5 d-flex align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <div className="w-100 text-center">
          <div className="display-1 fw-bold">403</div>
          <div className="mt-2 h4">
            <i className="bi bi-shield-lock me-2" />
            Không có quyền truy cập
          </div>

          <p className="text-muted mt-2">{reasonText}</p>
          {attempted && (
            <div className="text-muted small">
              Trang yêu cầu:&nbsp;<code>{attempted}</code>
            </div>
          )}
          {user && (
            <div className="text-muted small mt-1">
              Nếu bạn nghĩ đây là nhầm lẫn, hãy liên hệ quản trị viên hoặc thử
              đăng nhập bằng tài khoản khác.
            </div>
          )}

          <div className="d-flex gap-2 justify-content-center mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </button>
            <Link to="/" className="btn btn-primary">
              Về trang chủ
            </Link>
            {reason === 'forbidden_admin' && (
              <Link to="/host-status" className="btn btn-outline-primary">
                Trạng thái Chủ trọ
              </Link>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
