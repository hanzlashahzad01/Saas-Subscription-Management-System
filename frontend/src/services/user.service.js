import api from './api'

export const userService = {
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData)
    return response.data
  },

  updatePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData)
    return response.data
  },

  uploadAvatar: async (avatar) => {
    const response = await api.post('/users/avatar', { avatar })
    return response.data
  },

  // Admin methods
  getUsers: async () => {
    const response = await api.get('/users')
    return response.data
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}
