// components/layout/Navbar.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, selectAuthView } from '@/redux/authSlice'
import '@/components/layout/navbar/Navbar.css'
import apiList from '@/api'
import Search from '@/components/ui/Search'
import Button from '@/components/ui/Button'
import Container from '../Container'

export default function Navbar() {
  const { user } = useSelector((s) => s.auth)
  const { displayName, avatar, roles } = useSelector(selectAuthView)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [openMenu, setOpenMenu] = useState(false)
  const [roomType, setRoomType] = useState()

  useEffect(() => {
    ;(async () => {
      try {
        const { status, data } = await apiList.getRoomType()
        if (status === 200) setRoomType(data)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  const initials = useMemo(() => {
    const n = (displayName || user?.username || 'U').trim()
    return n.slice(0, 1).toUpperCase()
  }, [displayName, user])

  // Phân quyền
  const isAdmin = roles?.includes('ADMIN')
  const isHost = roles?.includes('HOST') // admin có thể đồng thời là host, nhưng ưu tiên điều hướng admin

  // Điều hướng nút chính (đăng tin / admin / host-status)
  const handlePrimaryClick = () => {
    if (isAdmin) {
      navigate('/admin') // ADMIN → trang quản trị
    } else if (isHost) {
      navigate('/host/new') // HOST → đăng tin
    } else {
      navigate('/host-status') // user thường → trang đăng ký/chờ duyệt làm chủ trọ
    }
  }

  const primaryLabel = isAdmin
    ? 'Trang quản trị'
    : isHost
      ? 'Đăng tin'
      : 'Chưa đăng kí'

  return (
    <header className="tm-header">
      <Container>
        <div className="tm-container">
          {/* Left */}
          <div className="left">
            <Link to="/" className="brand">
              <img src="https://tromoi.com/logo.png" alt="logo" />
            </Link>

            <nav className="nav">
              <Link to="phong-tro">Phòng trọ xịn</Link>
              <Link to="chinh-sach">Chính sách thuê trọ</Link>

              <div className="dropdown">
                <button
                  className="btn dropdown-toggle bottom_btn"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Loại phòng
                </button>
                <ul className="dropdown-menu">
                  {(roomType ?? []).map((p) => (
                    <li key={p.id}>
                      <a className="dropdown-item" href={p.href ?? '#'}>
                        {p.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Ô tìm kiếm */}
            <Search placeholder="Tìm theo khu vực..." />
          </div>

          {/* Right */}
          <div className="right">
            {!user ? (
              <>
                <Link to="/login" className="link">
                  <Button iconRight="arrow">Đăng kí, Đăng nhập</Button>
                </Link>
              </>
            ) : (
              <>
                <Button className="post-btn" onClick={handlePrimaryClick}>
                  {primaryLabel}
                </Button>

                <div className="user-wrap">
                  <button
                    className="avatar"
                    onClick={() => setOpenMenu((s) => !s)}
                    title={displayName}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="avatar"
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      initials
                    )}
                  </button>

                  {openMenu && (
                    <div
                      className="menu"
                      onMouseLeave={() => setOpenMenu(false)}
                    >
                      <div className="menu-item" style={{ fontWeight: 600 }}>
                        {displayName}
                      </div>

                      {/* Admin ưu tiên hiện trang quản trị */}
                      {isAdmin ? (
                        <>
                          <Link
                            to="/admin"
                            className="menu-item"
                            onClick={() => setOpenMenu(false)}
                          >
                            Trang quản trị
                          </Link>
                          <Link
                            to="/profile"
                            className="menu-item"
                            onClick={() => setOpenMenu(false)}
                          >
                            Hồ sơ
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/profile"
                            className="menu-item"
                            onClick={() => setOpenMenu(false)}
                          >
                            Hồ sơ
                          </Link>
                          <Link
                            to="/profile"
                            className="menu-item"
                            onClick={() => setOpenMenu(false)}
                          >
                            Trạng thái Chủ trọ
                          </Link>
                        </>
                      )}

                      <button
                        className="menu-item danger"
                        onClick={() => {
                          dispatch(logout())
                          setOpenMenu(false)
                          navigate('/')
                        }}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
