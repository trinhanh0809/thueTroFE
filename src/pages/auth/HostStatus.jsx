import { useEffect, useState } from 'react'
import AuthApi from '@/api'

export default function HostStatus() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    AuthApi.myHostStatus()
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!data) return <div>Loading...</div>

  return (
    <div>
      <h2>Trạng thái Chủ trọ</h2>
      <div>isHost: {String(data.isHost)}</div>
      <div>latestRequestStatus: {data.latestRequestStatus}</div>
    </div>
  )
}
