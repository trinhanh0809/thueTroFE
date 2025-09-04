// src/routes/AppRoutes.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import routeConfig from './routeConfig'

// Tự bọc layout nếu có. Đặt DEFAULT_LAYOUT nếu muốn mặc định.
const DEFAULT_LAYOUT = null
const withLayout = (Layout, el) => {
  if (Layout === null) return el // ép không layout
  const L = Layout ?? DEFAULT_LAYOUT
  return L ? <L>{el}</L> : el
}

// Đệ quy build routes + hỗ trợ index
const renderRoutes = (routes, prefix = '') =>
  routes.map((r, i) => {
    const keyBase = r.path ?? `idx-${i}`
    const key = `${prefix}${keyBase}`

    if (r.index) {
      return (
        <Route
          key={`${key}-index`}
          index
          element={withLayout(r.layout, r.element)}
        />
      )
    }

    return (
      <Route key={key} path={r.path} element={withLayout(r.layout, r.element)}>
        {r.children ? renderRoutes(r.children, `${key}/`) : null}
      </Route>
    )
  })

export default function AppRoutes() {
  return <Routes>{renderRoutes(routeConfig)}</Routes>
}
