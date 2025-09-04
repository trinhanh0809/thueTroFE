import http from './http'

const apiList = {
  // User
  getAll: () => http.get('/user/all'),
  register: (data) => http.post('/user/register', data),
  activate: (query) => http.get('/user/activate', query), // { email, code }
  login: (data) => http.post('/user/authenticate', data),
  me: () => http.get('/user/me'),
  changePassword: (data) => http.put('/user/change-password', data),
  forgotPassword: (data) => http.put('/user/forgot-password', data),
  changeAvatar: (data) => http.put('/user/change-avatar', data), // { url }
  updateProfile: (data) => http.put('/user/update-profile', data),
  myHostStatus: () => http.get('/user/me/host-status'),
  toggleEnabled: (id) => http.patch(`/user/${id}/toggle-enabled`),
  adminUpdateUser: (id) => http.patch(`/user/${id}`),

  // RoomType
  getRoomType: () => http.get('/admin/room-types'),
  postRoomType: () => http.post('/admin/room-types'),
  putRoomType: (id) => http.put(`/admin/room-types/${id}`),
  deleteRoomType: (id) => http.delete(`/admin/room-types/${id}`),
  

}

export default apiList
