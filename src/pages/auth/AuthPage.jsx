import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync, fetchMe } from '@/redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import AuthApi from '@/api/AuthApi';
import '@/pages/auth/Auth.css';
import FormInput from '@/pages/ui/FormInput.jsx'

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((s) => s.auth);

  // 'signin' | 'signup'
  const [mode, setMode] = useState('signup');

  // ====== form state ======
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    applyHost: false,
    agree: false,
  });

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const disableSubmit = loading;

  useEffect(() => {
    if (user) navigate('/profile');
  }, [user, navigate]);

  // ====== helpers ======
  const splitName = (full) => {
    const name = (full || '').trim().replace(/\s+/g, ' ');
    if (!name) return ['', ''];
    const parts = name.split(' ');
    if (parts.length === 1) return [parts[0], ''];
    const lastName = parts.pop();
    return [parts.join(' '), lastName];
  };

  const regErrors = useMemo(() => {
    const e = {};
    if (!regForm.fullName.trim()) e.fullName = 'Nhập họ tên';
    if (!regForm.email.trim()) e.email = 'Nhập email';
    if (!regForm.username.trim()) e.username = 'Nhập username';
    if (!regForm.password) e.password = 'Nhập mật khẩu';
    if (!regForm.confirmPassword) e.confirmPassword = 'Nhập lại mật khẩu';
    if (regForm.password && regForm.password.length < 6) e.password = 'Tối thiểu 6 ký tự';
    if (regForm.confirmPassword && regForm.password !== regForm.confirmPassword)
      e.confirmPassword = 'Mật khẩu không trùng khớp';
    if (!regForm.agree) e.agree = 'Bạn cần đồng ý điều khoản';
    return e;
  }, [regForm]);

  // ====== submit handlers ======
  const submitLogin = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!loginForm.username || !loginForm.password) {
      setError('Vui lòng nhập đủ thông tin');
      return;
    }
    const action = await dispatch(loginAsync(loginForm));
    if (loginAsync.fulfilled.match(action)) {
      await dispatch(fetchMe());
      navigate('/profile');
    } else {
      setError(action.payload || 'Đăng nhập thất bại');
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (Object.keys(regErrors).length) {
      setError(Object.values(regErrors)[0]);
      return;
    }
    const [firstName, lastName] = splitName(regForm.fullName);
    try {
      const payload = {
        username: regForm.username,
        password: regForm.password,
        email: regForm.email,
        firstName,
        lastName,
        phoneNumber: regForm.phoneNumber || '',
        applyHost: !!regForm.applyHost,
      };
      const { data } = await AuthApi.register(payload);
      setMsg(
        typeof data === 'string'
          ? data
          : 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.'
      );
      // chuyển về login luôn cho tiện
      setMode('signin');
      setLoginForm({ username: regForm.username, password: '' });
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="auth-split">
      {/* Left (hero) */}
      <div className="auth-hero">
        <div className="overlay" />
      </div>

      {/* Right (panel) */}
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{mode === 'signup' ? 'Sign Up' : 'Sign In'}</h2>
            <p className="muted">
              {mode === 'signup'
                ? 'Tạo tài khoản để đăng tin & đặt trọ nhanh chóng.'
                : 'Chào mừng bạn quay lại.'}
            </p>
          </div>

          {msg && <div className="alert success">{msg}</div>}
          {error && <div className="alert danger">{error}</div>}

          {/* ====== SIGN UP ====== */}
          {mode === 'signup' && (
            <form className="form" onSubmit={submitRegister}>
              <FormInput
                    label="Full Name"
                    name="fullName"
                    value={regForm.fullName}
                    onChange={(e) => setRegForm(s => ({ ...s, fullName: e.target.value }))}
                    placeholder="Name..."
                    error={regErrors.fullName}
                    required
                />
                <FormInput
                    label="Email"
                    name="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm(s => ({ ...s, email: e.target.value }))}
                    placeholder="Email address..."
                    error={regErrors.email}
                    required
                />
                <FormInput
                    label="Username"
                    name="username"
                    value={regForm.username}
                    onChange={(e) => setRegForm(s => ({ ...s, username: e.target.value }))}
                    placeholder="Username..."
                    error={regErrors.username}
                    required
                />
                <FormInput
                    label="Password"
                    type="password"
                    passwordToggle
                    name="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm(s => ({ ...s, password: e.target.value }))}
                    placeholder="Nhập mật khẩu"
                    error={regErrors.password}
                required
                />
                <FormInput
                    label="Repeat Password"
                    type="password"
                    passwordToggle
                    name="confirmPassword"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm(s => ({ ...s, confirmPassword: e.target.value }))}
                    placeholder="Nhập lại mật khẩu"
                    error={regErrors.confirmPassword}
                    required
                />                                                            

              <div className="row between">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={regForm.applyHost}
                    onChange={(e) => setRegForm((s) => ({ ...s, applyHost: e.target.checked }))}
                  />
                  <span>Đăng ký làm Chủ trọ</span>
                </label>
              </div>

              <div className="row between">
                <button className="primary" type="submit" disabled={disableSubmit}>
                  {disableSubmit ? 'Processing…' : 'Sign Up'}
                </button>

                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setMode('signin');
                    setMsg('');
                    setError('');
                  }}
                >
                  Đăng nhập →
                </button>
              </div>
            </form>
          )}

          {/* ====== SIGN IN ====== */}
          {mode === 'signin' && (
            <form className="form" onSubmit={submitLogin}>
               <FormInput
                    label="Username"
                    name="username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(s => ({ ...s, username: e.target.value }))}
                    placeholder="Tên đăng nhập."
                    required
                    left="👤"
                />
                <FormInput
                    label="Password"
                    type="password"
                    passwordToggle
                    name="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(s => ({ ...s, password: e.target.value }))}
                    placeholder="Nhập mật khẩu"
                    required
                    left="🔒"
                />

              <div className="row between">
                <button className="primary" type="submit" disabled={disableSubmit}>
                  {disableSubmit ? 'Signing in…' : 'Sign In'}
                </button>
                <div className="links">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setMode('signup');
                      setMsg('');
                      setError('');
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
  );
}
