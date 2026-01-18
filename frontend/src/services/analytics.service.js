import api from './api'

export const analyticsService = {
  getRevenueAnalytics: async (period = '30') => {
    const response = await api.get(`/analytics/revenue?period=${period}`)
    return response.data
  },

  getSubscriptionAnalytics: async () => {
    const response = await api.get('/analytics/subscriptions')
    return response.data
  },
}
