// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom'
import routeConfig from './routeConfig'

// nếu muốn TỰ ĐỘNG bọc DefaultLayout cho route không khai báo layout,
// set DEFAULT_LAYOUT = DefaultLayout; (hiện để null = không tự bọc)
const DEFAULT_LAYOUT = null;

const withLayout = (Layout, el) => {
  if (Layout === null) return el;                     // ép không layout
  const L = Layout ?? DEFAULT_LAYOUT;                 // fallback nếu muốn
  return L ? <L>{el}</L> : el;
};

export default function AppRoutes() {
  return (
    <Routes>
      {routeConfig.map(({ path, element, layout }, i) => (
        <Route key={path || i} path={path} element={withLayout(layout, element)} />
      ))}
    </Routes>
  );
}
