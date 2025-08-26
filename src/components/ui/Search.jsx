import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/components/ui/Search.css'

export default function Search({ placeholder = 'Tìm theo khu vực...' }) {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (value.trim()) {
      navigate(`/search?location=${encodeURIComponent(value.trim())}`)
      setValue('')
    }
  }

  return (
    <form className="search-box" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">🔍</button>
    </form>
  )
}
