import api from './api'

export const subscriptionService = {
  getSubscriptions: async () => {
    const response = await api.get('/subscriptions')
    return response.data
  },

  getSubscription: async (id) => {
    const response = await api.get(`/subscriptions/${id}`)
    return response.data
  },

  createSubscription: async (planId, billingCycle) => {
    const response = await api.post('/subscriptions', { planId, billingCycle })
    return response.data
  },

  cancelSubscription: async (id) => {
    const response = await api.post(`/subscriptions/${id}/cancel`)
    return response.data
  },

  upgradeSubscription: async (id, newPlanId) => {
    const response = await api.post(`/subscriptions/${id}/upgrade`, { newPlanId })
    return response.data
  },
}
