import { useEffect, useState } from 'react'
import AuthApi from '@/api'
import Container from '@/components/layout/Container'

export default function ProfilePage() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')

  // Sidebar active tab
  const [activeMenu, setActiveMenu] = useState('profile') // 'profile' | 'account' | 'stay' | 'review' | 'favorite' | 'notify'

  // ====== form profile ======
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState('Nam')
  const [birthDate, setBirthDate] = useState('')
  const [citizenId, setCitizenId] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await AuthApi.me()
        setMe(data)
        setFullName(data.fullName || data.username || '')
        setGender(data.gender || 'Nam')
        setBirthDate(data.birthDate || '')
        setCitizenId(data.citizenId || '')
        setAddress(data.address || '')
      } catch (e) {
        setError(e?.message || 'Không tải được dữ liệu.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setOkMsg('')
    setError('')
    try {
      await AuthApi.updateProfile({
        fullName,
        gender,
        birthDate,
        citizenId,
        address,
      })
      setOkMsg('Cập nhật thành công!')
    } catch (e) {
      setError(e?.message || 'Cập nhật thất bại')
    }
  }

  const onLogout = async () => {
    try {
      // Nếu có API logout thì gọi, nếu không thì xóa token localStorage/cookie
      if (AuthApi.logout) await AuthApi.logout()
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    } catch {
      window.location.href = '/login'
    }
  }

  if (loading)
    return <div className="alert alert-secondary m-3">Đang tải...</div>

  return (
    <Container>
      <div className="py-3">
        {/* align-items-stretch để các cột cao bằng nhau */}
        <div className="row g-3 align-items-stretch">
          {/* SIDEBAR */}
          <div className="col-12 col-lg-3 d-flex">
            <div className="card shadow-sm flex-fill h-100">
              <div className="card-body d-flex align-items-center gap-2">
                <img
                  src={
                    me?.avatar ||
                    'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg'
                  }
                  alt="avatar"
                  width={36}
                  height={36}
                  className="rounded-circle"
                />
                <div>
                  <div className="fw-semibold">{me?.username}</div>
                  <div className="text-muted small">ID: #{me?.id || '—'}</div>
                </div>
              </div>

              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                    activeMenu === 'profile' ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => setActiveMenu('profile')}
                >
                  <span className="bi bi-person-badge" /> Thông tin cá nhân
                </button>

                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                    activeMenu === 'account' ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => setActiveMenu('account')}
                >
                  <span className="bi bi-person" /> Thông tin tài khoản
                </button>

                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                    activeMenu === 'stay' ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => setActiveMenu('stay')}
                >
                  <span className="bi bi-house" /> Thông tin lưu trú
                </button>

                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                    activeMenu === 'review' ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => setActiveMenu('review')}
                >
                  <span className="bi bi-star" /> Quản lý đánh giá
                </button>

                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                    activeMenu === 'favorite' ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => setActiveMenu('favorite')}
                >
                  <span className="bi bi-heart" /> Lưu trữ
                </button>

                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                    activeMenu === 'notify' ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => setActiveMenu('notify')}
                >
                  <span className="bi bi-bell" /> Thông báo
                </button>

                <button
                  className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                  type="button"
                  onClick={onLogout}
                >
                  <span className="bi bi-box-arrow-right" /> Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="col-12 col-lg-8 d-flex">
            <div className="card shadow-sm flex-fill h-100">
              <div className="card-body">
                {/* Thông báo chung */}
                {error && <div className="alert alert-danger">{error}</div>}
                {okMsg && <div className="alert alert-success">{okMsg}</div>}

                {/* Tab: Thông tin cá nhân */}
                {activeMenu === 'profile' && (
                  <>
                    <h5 className="card-title mb-1">THÔNG TIN CÁ NHÂN</h5>
                    <p className="text-muted">
                      Cập nhật thông tin của bạn và tìm hiểu các thông tin này
                      được sử dụng ra sao.
                    </p>

                    <form className="mt-3" onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Họ tên</label>
                        <input
                          className="form-control"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Name"
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Giới tính</label>
                          <select
                            className="form-select"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                          >
                            <option>Nam</option>
                            <option>Nữ</option>
                            <option>Khác</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Ngày sinh</label>
                          <input
                            type="date"
                            className="form-control"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            placeholder="Vui lòng chọn"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Số Căn cước công dân
                        </label>
                        <input
                          className="form-control"
                          value={citizenId}
                          onChange={(e) => setCitizenId(e.target.value)}
                          placeholder="Vui lòng nhập"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Địa chỉ</label>
                        <input
                          className="form-control"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Vui lòng nhập"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary px-4">
                        Cập nhật
                      </button>
                    </form>
                  </>
                )}

                {/* Tab: Thông tin tài khoản */}
                {activeMenu === 'account' && (
                  <>
                    <h5 className="card-title mb-1">THÔNG TIN TÀI KHOẢN</h5>
                    <p className="text-muted">
                      Quản lý email, số điện thoại, mật khẩu…
                    </p>
                    {/* TODO: Form tài khoản */}
                    <div className="alert alert-info">
                      Chức năng đang phát triển.
                    </div>
                  </>
                )}

                {/* Tab: Thông tin lưu trú */}
                {activeMenu === 'stay' && (
                  <>
                    <h5 className="card-title mb-1">THÔNG TIN LƯU TRÚ</h5>
                    <div className="alert alert-info">
                      Chức năng đang phát triển.
                    </div>
                  </>
                )}

                {/* Tab: Quản lý đánh giá */}
                {activeMenu === 'review' && (
                  <>
                    <h5 className="card-title mb-1">QUẢN LÝ ĐÁNH GIÁ</h5>
                    <div className="alert alert-info">
                      Chức năng đang phát triển.
                    </div>
                  </>
                )}

                {/* Tab: Lưu trữ */}
                {activeMenu === 'favorite' && (
                  <>
                    <h5 className="card-title mb-1">LƯU TRỮ</h5>
                    <div className="alert alert-info">
                      Chức năng đang phát triển.
                    </div>
                  </>
                )}

                {/* Tab: Thông báo */}
                {activeMenu === 'notify' && (
                  <>
                    <h5 className="card-title mb-1">THÔNG BÁO</h5>
                    <div className="alert alert-info">
                      Chức năng đang phát triển.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
