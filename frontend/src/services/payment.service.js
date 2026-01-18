import api from './api'

export const paymentService = {
  createCheckoutSession: async (planId, billingCycle, couponCode) => {
    const response = await api.post('/payments/create-checkout', {
      planId,
      billingCycle,
      couponCode
    })
    return response.data
  },

  getPayments: async () => {
    const response = await api.get('/payments')
    return response.data
  },

  getPayment: async (id) => {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },
}
