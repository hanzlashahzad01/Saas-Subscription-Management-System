import api from './api'

export const couponService = {
  getCoupons: async () => {
    const response = await api.get('/coupons')
    return response.data
  },

  validateCoupon: async (code, planId, amount) => {
    const params = new URLSearchParams()
    if (planId) params.append('planId', planId)
    if (amount) params.append('amount', amount)
    
    const response = await api.get(`/coupons/validate/${code}?${params.toString()}`)
    return response.data
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/coupons', couponData)
    return response.data
  },

  updateCoupon: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData)
    return response.data
  },

  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`)
    return response.data
  },

  applyCoupon: async (code) => {
    const response = await api.post(`/coupons/${code}/apply`)
    return response.data
  },
}
