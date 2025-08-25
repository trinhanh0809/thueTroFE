export default function ProfilePage() {
  ;<div className="card shadow-sm">
    <div className="card-body text-center">
      <div className="mx-auto mb-2" style={{ width: 64, height: 64 }}>
        {avatar ? (
          <img src={avatar} alt="avatar" className="rounded-circle img-fluid" />
        ) : (
          <div
            className="rounded-circle bg-light d-flex align-items-center justify-content-center border"
            style={{ width: 64, height: 64 }}
          >
            <span className="text-muted fw-semibold">
              {(username || '?').slice(0, 2)}
            </span>
          </div>
        )}
      </div>
      <div className="fw-semibold">{username}</div>
      {userId && <div className="text-muted small">ID: {userId}</div>}
    </div>
    <div className="list-group list-group-flush">
      <button
        className="list-group-item list-group-item-action active"
        type="button"
      >
        Thông tin cá nhân
      </button>
      <button className="list-group-item list-group-item-action" type="button">
        Thông tin tài khoản
      </button>
      <button className="list-group-item list-group-item-action" type="button">
        Thông tin lưu trú
      </button>
      <button className="list-group-item list-group-item-action" type="button">
        Quản lý đánh giá
      </button>
      <button className="list-group-item list-group-item-action" type="button">
        Lưu trữ
      </button>
      <button className="list-group-item list-group-item-action" type="button">
        Thông báo
      </button>
      <button className="list-group-item list-group-item-action" type="button">
        Đăng xuất
      </button>
    </div>
  </div>

  {
    /* Content */
  }
  ;<div className="col-12 col-lg-9">
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-1">THÔNG TIN CÁ NHÂN</h5>
        <p className="text-muted">
          Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng
          ra sao.
        </p>

        {loading && (
          <div className="alert alert-secondary" role="alert">
            Đang tải...
          </div>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
              <label className="form-label">Họ tên</label>
              <input
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
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
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Số Căn cước công dân</label>
              <input
                className="form-control"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                placeholder="Nhập số CCCD"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Địa chỉ</label>
              <input
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={submitting}
            >
              {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </form>
        )}
      </div>
    </div>
  </div>
}
