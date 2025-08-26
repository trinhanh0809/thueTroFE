import http from './http'

const apiList = {
  // User
  register: (data) => http.post('/user/register', data),
  activate: (query) => http.get('/user/activate', query), // { email, code }
  login: (data) => http.post('/user/authenticate', data),
  me: () => http.get('/user/me'),
  changePassword: (data) => http.put('/user/change-password', data),
  forgotPassword: (data) => http.put('/user/forgot-password', data),
  changeAvatar: (data) => http.put('/user/change-avatar', data), // { url }
  updateProfile: (data) => http.put('/user/update-profile', data),
  myHostStatus: () => http.get('/user/me/host-status'),

  // RoomType
getRoomType: () => http.get('/room-types'),
}

export default apiList
