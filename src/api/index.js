
import http from './http'

const apiList = {
  // User
  getAll: () => http.get('/user/all'),
  getUser: (data) => http.get('/user/search',data),
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
  adminUpdateUser: (id,data) => http.patch(`/user/${id}`,data),

  // RoomType
  getRoomType: () => http.get('/room-types'),
  postRoomType: (data) => http.post('/room-types',data),
  putRoomType: (id,data) => http.put(`/room-types/${id}`,data),
  deleteRoomType: (id) => http.delete(`/room-types/${id}`),

  // AdminHostRequest
  getHostRequest: (data) => http.get('/admin/host-requests/list',data),
  approveHostRequest: (id,data) => http.put(`/admin/host-requests/${id}/approve`,data),
  rejectHostRequest: (id,data) => http.put(`/admin/host-requests/${id}/reject`,data),

  // Room
  getRoom: (data) => http.get('/rooms/search', data),
  getRoomMe: (data) => http.get('/rooms/me', data),
  getRoomId: (id,data) => http.get(`/rooms/${id}`, data),
  createRoom: (data) => http.post(`/rooms`, data),
  deleteRoom: (id) => http.delete(`/rooms/${id}`),
  updateRoom: (id, data) => http.put(`/rooms/${id}`, data),
  // location
  getProvinces: () => http.get('/areas/provinces'),
  getDistricts: (id) => http.get(`/areas/districts?provinceId=${id}`),
  getWards: (id) => http.get(`/areas/wards?districtId=${id}`),

  //Host

  // Amenity
  getAmenity: () => http.get('/amenity'),
  postAmenity: (data) => http.post('/amenity',data),
  deleteAmenity: (id) => http.delete(`/amenity/${id}`),
  putAmenity: (id, data) => http.put(`/amenity/${id}`,data),

  // Image
uploadImage : (file, name) => {
  const fd = new FormData()
  fd.append('file', file) // trùng với @RequestPart("file")
  const q = name ? `?name=${encodeURIComponent(name)}` : ''
  return http.postForm(`/files/images${q}`, fd)
}
  



  

}

export default apiList
