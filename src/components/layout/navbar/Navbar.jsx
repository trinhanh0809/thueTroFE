// components/layout/Navbar.jsx
import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, selectAuthView } from '@/redux/authSlice'
import '@/components/layout/navbar/Navbar.css'

export default function Navbar() {
  const { user } = useSelector((s) => s.auth) // còn dùng để ẩn/hiện menu
  const { displayName, avatar, roles } = useSelector(selectAuthView)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [openMobile, setOpenMobile] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)

  const initials = useMemo(() => {
    const n = (displayName || user?.username || 'U').trim()
    return n.slice(0, 1).toUpperCase()
  }, [displayName, user])

  const isHost = roles?.includes('HOST') || roles?.includes('ADMIN')



  return (
    <header className="tm-header">
      <div className="tm-container">
        {/* Left */}
        <div className="left">
          <button className="hamburger" aria-label="menu" onClick={() => setOpenMobile((s) => !s)}>
            <span /><span /><span />
          </button>

          <Link to="/" className="brand">
            <img src="https://tromoi.com/logo.png" alt="logo" />
          </Link>

          <nav className={`nav `}>
            <Link to="phong-tro">Phòng trọ</Link>
            <Link to="nha-nguyen-can" >Nhà nguyên căn</Link>
            <Link to="can-ho" >Căn hộ</Link> 
            <Link to="/videos" >Videp</Link> 
            <Link to="/blog" >Blog</Link>
          </nav>
        </div>

        {/* Right */}
        <div className="right">
          {!user ? (
            <>
              <Link to="/login" className="link" onClick={() => setOpenMobile(false)}>
                Đăng nhập tài khoản
              </Link>
              <Link to="/register" className="link" onClick={() => setOpenMobile(false)}>
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <button
                className="post-btn"
                onClick={() => navigate(isHost ? '/host/new' : '/host-status')}
              >
                {isHost ? 'Đăng tin' : 'Chưa đăng kí'}
              </button>

              <div className="user-wrap">
                <button className="avatar" onClick={() => setOpenMenu((s) => !s)} title={displayName}>
                  {avatar ? (
                    <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </button>
                {openMenu && (
                  <div className="menu" onMouseLeave={() => setOpenMenu(false)}>
                    <div className="menu-item" style={{ fontWeight: 600 }}>{displayName}</div>
                    <Link to="/profile" className="menu-item" onClick={() => setOpenMenu(false)}>Hồ sơ</Link>
                    <Link to="/host-status" className="menu-item" onClick={() => setOpenMenu(false)}>Trạng thái Chủ trọ</Link>
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
    </header>
  )
}
