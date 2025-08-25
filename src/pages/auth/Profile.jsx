import { useEffect, useState } from 'react'
import AuthApi from '@/api/AuthApi'

export default function Profile() {
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phoneNumber: '' })
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [avatarUrl, setAvatarUrl] = useState('')

  const loadMe = async () => {
    try {
      const { data } = await AuthApi.me()
      setMe(data)
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
      })
      setAvatarUrl(data.avatar || '')
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { loadMe() }, [])

  const updateProfile = async () => {
    setOkMsg('')
    try {
      const { data } = await AuthApi.updateProfile(profile)
      setOkMsg(data)
      loadMe()
    } catch (e) {
      setError(e.message)
    }
  }

  const changeAvatar = async () => {
    setOkMsg('')
    try {
      const { data } = await AuthApi.changeAvatar({ url: avatarUrl })
      setOkMsg('Đổi avatar OK')
      setMe((m) => (m ? { ...m, avatar: data.avatar } : m))
    } catch (e) {
      setError(e.message)
    }
  }

  const changePassword = async () => {
    setOkMsg('')
    try {
      const { data } = await AuthApi.changePassword(pwd)
      setOkMsg(data)
      setPwd({ currentPassword: '', newPassword: '' })
    } catch (e) {
      setError(e.message)
    }
  }

  if (!me) return <div>Loading...</div>

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Hồ sơ</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {okMsg && <p style={{ color: 'green' }}>{okMsg}</p>}

      <div>
        <img src={me.avatar || 'https://via.placeholder.com/96'} alt="avatar" width={96} height={96} />
        <div>
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="URL ảnh" />
          <button onClick={changeAvatar}>Đổi avatar</button>
        </div>
      </div>

      <div>
        <h3>Thông tin</h3>
        <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder="First name" />
        <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder="Last name" />
        <input value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} placeholder="Phone" />
        <button onClick={updateProfile}>Cập nhật hồ sơ</button>
      </div>

      <div>
        <h3>Đổi mật khẩu</h3>
        <input type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} placeholder="Mật khẩu hiện tại" />
        <input type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} placeholder="Mật khẩu mới (>=6)" />
        <button onClick={changePassword}>Đổi mật khẩu</button>
      </div>

      <div>
        <h3>Quyền & Trạng thái</h3>
        <div>Enabled: {String(me.enabled)}</div>
        <div>Username: {me.username}</div>
        <div>Roles: {me.roles?.join(', ')}</div>
      </div>
    </div>
  )
}
