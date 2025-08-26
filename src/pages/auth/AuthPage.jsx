import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginAsync, fetchMe } from '@/redux/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import AuthApi from '@/api'
import '@/pages/auth/Auth.css'
import FormInput from '@/components/ui/FormInput.jsx'

export default function AuthPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading } = useSelector((s) => s.auth)
  const [mode, setMode] = useState('signup')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })

  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    applyHost: false,
    agree: false,
  })

  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const disableSubmit = loading

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const regErrors = useMemo(() => {
    const e = {}
    if (!regForm.fullName.trim()) e.fullName = 'Nhập họ tên'
    if (regForm.fullName && regForm.fullName.length < 3)
      e.fullName = 'Nhập họ tên phải trên 3 kí tự'
    if (!regForm.email.trim()) e.email = 'Nhập email'
    if (!regForm.username.trim()) e.username = 'Nhập username'
    if (!regForm.password) e.password = 'Nhập mật khẩu'
    if (regForm.password && regForm.password.length < 6)
      e.password = 'Tối thiểu 6 ký tự'
    return e
  }, [regForm])

  // ====== submit handlers ======
  const submitLogin = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    const action = await dispatch(loginAsync(loginForm))
    if (loginAsync.fulfilled.match(action)) {
      await dispatch(fetchMe())
      navigate('/profile')
    } else {
      setError(action.payload || 'Đăng nhập thất bại')
    }
  }

  const submitRegister = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      const payload = {
        username: regForm.username,
        password: regForm.password,
        email: regForm.email,
        firstName: regForm.fullName,
        applyHost: !!regForm.applyHost,
      }
      const { data } = await AuthApi.register(payload)
      setMsg(
        typeof data === 'string'
          ? data
          : 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.'
      )
      setMode('signin')
      dispatch(logout && logout()) // nếu có action
      localStorage.removeItem('token')
      if (AuthApi?.defaults?.headers)
        delete AuthApi.defaults.headers.Authorization
      setLoginForm({ username: regForm.username, password: '' })
    } catch (err) {
      setError('Đăng ký thất bại')
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-hero">
        <div className="overlay" />
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
            <p className="muted">
              {mode === 'signup'
                ? 'Tạo tài khoản để đăng tin & đặt trọ nhanh chóng.'
                : 'Chào mừng bạn quay lại.'}
            </p>
          </div>

          {msg && <div className="alert success">{msg}</div>}
          {error && <div className="alert danger">{error}</div>}

          {/* ====== Đăng kí ====== */}
          {mode === 'signup' && (
            <form className="form" onSubmit={submitRegister}>
              <FormInput
                label="Họ và tên"
                name="fullName"
                value={regForm.fullName}
                onChange={(e) =>
                  setRegForm((s) => ({ ...s, fullName: e.target.value }))
                }
                placeholder="Name..."
                error={regErrors.fullName}
                errorOnBlur
                required
              />
              <FormInput
                label="Email"
                // name="email"
                value={regForm.email}
                onChange={(e) =>
                  setRegForm((s) => ({ ...s, email: e.target.value }))
                }
                placeholder="Email address..."
                error={regErrors.email}
                errorOnBlur
                required
              />
              <FormInput
                label="Tên đăng nhập"
                // name="username"
                value={regForm.username}
                onChange={(e) =>
                  setRegForm((s) => ({ ...s, username: e.target.value }))
                }
                placeholder="Username..."
                error={regErrors.username}
                errorOnBlur
                required
              />
              <FormInput
                label="Mật khẩu"
                type="password"
                passwordToggle
                name="password"
                value={regForm.password}
                onChange={(e) =>
                  setRegForm((s) => ({ ...s, password: e.target.value }))
                }
                placeholder="Nhập mật khẩu"
                error={regErrors.password}
                errorOnBlur
                required
              />

              <div className="row between">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={regForm.applyHost}
                    onChange={(e) =>
                      setRegForm((s) => ({ ...s, applyHost: e.target.checked }))
                    }
                  />
                  <span>Đăng ký làm Chủ trọ</span>
                </label>
              </div>

              <div className="row between">
                <button
                  className="primary"
                  type="submit"
                  disabled={disableSubmit}
                >
                  {disableSubmit ? 'Processing…' : 'Đăng kí'}
                </button>

                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setMode('signin')
                    setMsg('')
                    setError('')
                  }}
                >
                  Đăng nhập →
                </button>
              </div>
            </form>
          )}

          {/* ====== Đăng nhập ====== */}
          {mode === 'signin' && (
            <form className="form" onSubmit={submitLogin}>
              <FormInput
                label="Tên đăng nhập"
                name="username"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm((s) => ({ ...s, username: e.target.value }))
                }
                placeholder="Tên đăng nhập."
                required
                left="👤"
              />
              <FormInput
                label="Mật khẩu"
                type="password"
                passwordToggle
                name="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((s) => ({ ...s, password: e.target.value }))
                }
                placeholder="Nhập mật khẩu"
                required
                left="🔒"
              />

              <div className="row between">
                <button
                  className="primary"
                  type="submit"
                  disabled={disableSubmit}
                >
                  {disableSubmit ? 'Signing in…' : 'Sign In'}
                </button>
                <div className="links">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setMode('signup')
                      setMsg('')
                      setError('')
                    }}
                  >
                    Tạo tài khoản
                  </button>
                  <Link to="/forgot-password" className="link-btn">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
