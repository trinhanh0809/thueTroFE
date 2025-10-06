import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, selectAuthView } from '@/redux/authSlice'
import '@/components/layout/navbar/Navbar.css'
import apiList from '@/api'
import Button from '@/components/ui/Button'
import Container from '../Container'
import logo from '@/assets/image/logo.png'

export default function Navbar() {
  const { user } = useSelector((s) => s.auth)
  const { displayName, avatar, roles } = useSelector(selectAuthView)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [openMenu, setOpenMenu] = useState(false)
  const [roomTypes, setRoomTypes] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const { status, data } = await apiList.getRoomType()
        if (status === 200) setRoomTypes(data)
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
  const isHost = roles?.includes('HOST')

  const handlePrimaryClick = () => {
    if (isAdmin) {
      navigate('/admin')
    } else if (isHost) {
      navigate('/host/phong-tro')
    } else {
      navigate('/')
    }
  }

  const primaryLabel = isAdmin
    ? 'Trang quản trị'
    : isHost
      ? 'Đăng tin'
      : 'Chưa đăng kí'

  const goToRoomListPull = (rt) => {
    const sp = new URLSearchParams({
      roomTypeId: rt.id,
      page: '0',
      size: '20',
    })
    navigate({ pathname: '/rooms', search: sp.toString() })
  }

  const roomListPull = () => {
    const sp = new URLSearchParams({
      page: '0',
      size: '20',
    })
    navigate({ pathname: '/rooms', search: sp.toString() })
  }

  return (
    <header className="tm-header">
      <Container>
        <div className="tm-container">
          <div className="left">
            <Link to="/" className="brand">
              <img src={logo} alt="logo" width={174} height={73} />
            </Link>

            <nav className="nav">
              <button className="nav__button" onClick={roomListPull}>
                Phòng trọ xịn
              </button>
              <button className="nav__button" onClick={roomListPull}>
                Chính sách thuê trọ
              </button>

              <div className="dropdown ">
                <button
                  className="nav__button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Loại phòng
                </button>
                <ul className="dropdown-menu">
                  {roomTypes.map((rt) => (
                    <li key={rt.id}>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => goToRoomListPull(rt)}
                      >
                        {rt.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
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
