// src/App.jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProtectedRoute from '@/components/ProtectedRoute';
import routeConfig from '@/routes/routeConfig.jsx';
import { fetchMe } from '@/redux/authSlice';
import Navbar from './components/layout/navbar/Navbar';

function renderRoute(r, authedUser) {
  // chặn trang chỉ dành cho khách khi đã đăng nhập
  if (r.guestOnly && authedUser) {
    return <Route key={r.path} path={r.path} element={<Navigate to="/profile" replace />} />;
  }

  // route cần bảo vệ
  if (r.protected) {
    return (
      <Route
        key={r.path}
        path={r.path}
        element={<ProtectedRoute roles={r.roles}>{r.element}</ProtectedRoute>}
      />
    );
  }

  // public
  return <Route key={r.path} path={r.path} element={r.element} />;
}

export default function App() {
  // 👇 lấy user từ Redux — nếu bỏ dòng này sẽ bị "user is not defined"
  const { user, token, profile } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  // khi có token mà chưa có profile → gọi /user/me để có avatar/tên
  useEffect(() => {
    if (token && !profile) dispatch(fetchMe());
  }, [token, profile, dispatch]);

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24 }}>
        <Routes>
          {routeConfig.map((r) => renderRoute(r, user))}
        </Routes>
      </div>
    </div>
  );
}
