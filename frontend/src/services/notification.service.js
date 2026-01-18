import api from './api'

export const notificationService = {
  getNotifications: async (isRead = null) => {
    const url = isRead !== null ? `/notifications?isRead=${isRead}` : '/notifications'
    const response = await api.get(url)
    return response.data
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all')
    return response.data
  },
}
