import { useState } from 'react'
import AuthApi from '@/api/AuthApi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      const { data } = await AuthApi.forgotPassword({ email })
      setMsg(data)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360 }}>
      <h2>Quên mật khẩu</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Gửi</button>
    </form>
  )
}
