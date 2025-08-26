// src/App.jsx
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import ProtectedRoute from '@/components/ProtectedRoute'
import { fetchMe } from '@/redux/authSlice'
import AppRoutes from '@/routes/renderRoute.jsx'

export default function App() {
  const dispatch = useDispatch()
  const { token, user } = useSelector((s) => s.auth)

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe())
    }
  }, [token, user, dispatch])

  return (
    <div>
      <AppRoutes />
    </div>
  )
}
