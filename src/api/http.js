// src/api/http.js
import axios from 'axios'

export const API_BASE =
  import.meta?.env?.VITE_API_BASE ?? 'http://localhost:8080'

const instance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
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
  // Đảm bảo luôn có object headers
  config.headers = config.headers || {}
  // Nếu caller chưa set, gắn từ localStorage (phòng trường hợp defaults chưa có)
  if (!config.headers['Authorization']) {
    const token = readToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`
  }

  // DEBUG (bật tạm khi cần):
  // console.debug('[HTTP]', config.method?.toUpperCase(), config.url, config.headers?.Authorization)

  return config
})

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Request failed'
    return Promise.reject(new Error(msg))
  }
)

// --- wrapper ngắn gọn ---
const http = {
  get: (url, params, config) => instance.get(url, { params, ...(config || {}) }),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, data, config) => instance.delete(url, { data, ...(config || {}) }),
}

export default http
