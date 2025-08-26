import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AuthApi from '@/api'

export default function Activate() {
  const [params] = useSearchParams()
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const email = params.get('email')
    const code = params.get('code')
    if (email && code) {
      AuthApi.activate({ email, code })
        .then(({ data }) => setMsg(data))
        .catch((e) => setError(e.message))
    }
  }, [params])

  return (
    <div>
      <h2>Kích hoạt tài khoản</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!msg && !error && <p>Điền link từ email kích hoạt (có email & code)</p>}
    </div>
  )
}
