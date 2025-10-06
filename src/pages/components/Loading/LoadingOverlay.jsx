import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/pages/components/Loading/LoadingOverlay.css'

export default function LoadingOverlay({ show }) {
  if (!show) return null

  return (
    <div className="overlay">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}
