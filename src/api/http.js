// src/api/http.js
import axios from 'axios'

export const API_BASE =
  import.meta?.env?.VITE_API_BASE ?? 'http://localhost:8080'

const instance = axios.create({
  baseURL: API_BASE,
  // ❌ đừng set Content-Type mặc định ở đây; để interceptor xử lý theo từng request
  withCredentials: false, // nếu dùng cookie-session thì bật true; dùng Bearer token thì false là đủ
})

// --- helpers ---
const readToken = () => {
  try { return localStorage.getItem('token') } catch { return null }
}

/** Lưu/xoá token + cập nhật axios defaults để các request sau tự có Authorization */
export const setToken = (t) => {
  try {
    if (t) localStorage.setItem('token', t)
    else localStorage.removeItem('token')
  } catch {}
  if (t) instance.defaults.headers.common['Authorization'] = `Bearer ${t}`
  else delete instance.defaults.headers.common['Authorization']
}

/** Khởi tạo từ localStorage khi tải app (reload) */
setToken(readToken())

// --- interceptors ---
instance.interceptors.request.use((config) => {
  config.headers = config.headers || {}

  // Gắn token nếu caller chưa set
  if (!config.headers['Authorization']) {
    const token = readToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`
  }

  // Tự chọn Content-Type theo dữ liệu:
  const isForm =
    typeof FormData !== 'undefined' &&
    config.data instanceof FormData

  if (isForm) {
    // ĐỂ TRỐNG Content-Type để axios tự set multipart boundary
    delete config.headers['Content-Type']
  } else {
    // JSON mặc định cho POST/PUT/PATCH nếu caller chưa tự set
    const method = (config.method || '').toLowerCase()
    if ((method === 'post' || method === 'put' || method === 'patch') &&
        !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
  }

  return config
})

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response) {
      error.message = error.message || 'Không thể kết nối máy chủ.'
      return Promise.reject(error)
    }

    const status = error.response.status
    const apiMsg =
      error.response.data?.message ||
      error.response.data?.error

    const fallback =
      status === 400 ? 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.' :
      status === 401 ? 'Bạn cần đăng nhập để tiếp tục.' :
      status === 403 ? 'Bạn không có quyền thực hiện thao tác này.' :
      status === 404 ? 'Không tìm thấy tài nguyên.' :
      status === 409 ? 'Xung đột dữ liệu.' :
      status === 422 ? 'Dữ liệu không hợp lệ. Vui lòng sửa và thử lại.' :
      status === 429 ? 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.' :
      status >= 500 ? 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.' :
      'Đã xảy ra lỗi. Vui lòng thử lại.'

    error.message = apiMsg || fallback
    return Promise.reject(error)
  }
)

// --- wrapper ngắn gọn ---
const http = {
  // JSON helpers
  get: (url, params, config) => instance.get(url, { params, ...(config || {}) }),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, data, config) => instance.delete(url, { data, ...(config || {}) }),

  // FormData helpers (upload)
  postForm: (url, formData, config) =>
    instance.post(url, formData, { ...(config || {}), headers: { ...(config?.headers || {}), /* Content-Type auto */ } }),
  putForm: (url, formData, config) =>
    instance.put(url, formData, { ...(config || {}), headers: { ...(config?.headers || {}), /* Content-Type auto */ } }),
  patchForm: (url, formData, config) =>
    instance.patch(url, formData, { ...(config || {}), headers: { ...(config?.headers || {}), /* Content-Type auto */ } }),

  // Alias DELETE với params (khỏi truyền body)
  del: (url, config) => instance.delete(url, config),
}

export default http
