import React from 'react'
import '@/components/layout/footer/Footer.css'
import logo from '@/assets/image/logo.png'
export default function Footer() {
  return (
    <footer className="tm-footer">
      <div className="container">
        <div className="row gy-4">
          {/* Col 1: Logo + app + members */}
          <div className="col-12 col-lg-5">
            <img src={logo} alt="TRỌ MỚI" height="76" width={120} />
            <p className="mt-3 fw-semibold text-uppercase small text-primary m-0">
              Rất nhiều trọ mới và đẹp !!
            </p>
            {/* <div className="d-flex flex-wrap gap-3 mt-2 align-items-center">
              <img src="/partners/ohdidi.svg" alt="ohdidi" height="22" />
              <img src="/partners/ohbeauti.svg" alt="ohbeauti" height="22" />
              <img
                src="/partners/clinic.svg"
                alt="phòng khám tốt"
                height="22"
              />
              <img src="/partners/house.svg" alt="nhà đẹp rẻ tốt" height="22" />
              <img src="/partners/office.svg" alt="mặt bằng mới" height="22" />
            </div> */}
          </div>

          {/* Col 2: Links */}
          <div className="col-6 col-lg-3">
            <h6 className="tm-col-title">Hệ thống</h6>
            <ul className="tm-list">
              <li>
                <a href="#">Dành cho chủ trọ</a>
              </li>
              <li>
                <a href="#">Hướng dẫn</a>
              </li>
              <li>
                <a href="#">Liên hệ</a>
              </li>
            </ul>

            <h6 className="tm-col-title mt-3">Thông tin</h6>
            <ul className="tm-list">
              <li>
                <a href="#">Điều khoản &amp; Cam kết</a>
              </li>
              <li>
                <a href="#">Quy chế hoạt động</a>
              </li>
              <li>
                <a href="#">Giải quyết khiếu nại</a>
              </li>
              <li>
                <a href="#">Chính sách bảo mật</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="col-6 col-lg-3">
            <h6 className="tm-col-title">Kết nối với chúng tôi</h6>

            <ul className="tm-list">
              <li className="d-flex gap-2">
                <i className="bi bi-telephone text-primary"></i>
                <span>0334446046</span>
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-telephone text-primary"></i>
                <span>Zalo: 0334446046</span>
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-envelope text-primary"></i>
                <span>info@tromoi.com</span>
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-geo-alt text-primary"></i>
                <span>VP HN: 163 đông ngạc, quận bắc từ liêm, hà nội</span>
              </li>
            </ul>

            <div className="d-flex flex-wrap gap-2 mt-2">
              <a className="tm-social" href="#">
                <i className="bi bi-facebook" />
              </a>
              <a className="tm-social" href="#">
                <i className="bi bi-tiktok" />
              </a>
              <a className="tm-social" href="#">
                <i className="bi bi-instagram" />
              </a>
              <a className="tm-social" href="#">
                <i className="bi bi-youtube" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="tm-bottom">
        <div className="container text-center small">
          Copyright © 2015 - 2025 Co.,Ltd
        </div>
      </div>
    </footer>
  )
}
