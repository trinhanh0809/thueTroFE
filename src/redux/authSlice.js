// redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import apiList from '@/api/index.js'
import { setToken as persistToken } from '@/api/http'

const initialToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
const parseUser = (t) => {
  if (!t) return null
  try {
    const p = jwtDecode(t)
    return { username: p?.sub || p?.username || null, roles: p?.roles || [] }
  } catch {
    return null
  }
}

// LẤY HỒ SƠ /user/me
export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiList.me()
    console.log("data", data)
    // data = { id, username, email, firstName, lastName, phoneNumber, avatar, enabled, isHost, roles }
    return data
  } catch (e) {
    return rejectWithValue(e.message || 'Fetch profile failed')
  }
})

// ĐĂNG NHẬP
// redux/authSlice.js
export const loginAsync = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiList.login(payload);
    const d = res?.data;

    // 👉 thêm d?.jwtToken vào danh sách fallback
    const token =
      d?.token ??
      d?.jwt ??
      d?.jwtToken ??
      d?.access_token ??
      d?.accessToken ??
      (typeof d === 'string' ? d : null);

    if (!token) {
      console.error('Login response không có token. data =', d);
      throw new Error('Server không trả token hợp lệ');
    }
    return token;
  } catch (e) {
    return rejectWithValue(e.message || 'Login failed');
  }
});


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    user: parseUser(initialToken), // thông tin từ JWT (username + roles)
    profile: null,                 // hồ sơ đầy đủ từ /user/me (avatar, first/lastName…)
    loading: false,
    error: null,
  },
  reducers: {
 setToken(state, action) {
  state.token = action.payload
  state.user = parseUser(action.payload)
  persistToken(action.payload) // chính là setToken ở http.js -> cập nhật defaults
},
    logout(state) {
      state.token = null
      state.user = null
      state.profile = null
      persistToken(null)
    },
  },
  extraReducers: (b) => {
    b
      // login
      .addCase(loginAsync.pending, (s) => { s.loading = true; s.error = null })
     .addCase(loginAsync.fulfilled, (s, a) => {
  s.loading = false
  // NÊN có log tạm:
  console.log('token from login:', a.payload)
  authSlice.caseReducers.setToken(s, { type: 'auth/setToken', payload: a.payload })
})

      .addCase(loginAsync.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'Login failed' })

      // fetchMe
      .addCase(fetchMe.pending, (s) => { /* có thể set cờ riêng nếu muốn */ })
      .addCase(fetchMe.fulfilled, (s, a) => { s.profile = a.payload })
      .addCase(fetchMe.rejected, (s, a) => { s.error = a.payload || 'Fetch profile failed' })
  },
})

export const { setToken, logout } = authSlice.actions
export default authSlice.reducer

// selector tiện dụng
export const selectAuthView = (state) => {
  const { user, profile } = state.auth
  const displayName =
    (profile?.firstName || profile?.lastName) ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
    : (profile?.username || user?.username || '')
  const avatar = profile?.avatar || ''
  const roles = profile?.roles || user?.roles || []
  return { displayName, avatar, roles, user, profile }
}
