import { useEffect, useState } from 'react'
import { analyticsService } from '../services/analytics.service'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

function AdminDashboard() {
  const [revenue, setRevenue] = useState(null)
  const [subscriptions, setSubscriptions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const [revenueResponse, subsResponse] = await Promise.all([
        analyticsService.getRevenueAnalytics('30'),
        analyticsService.getSubscriptionAnalytics(),
      ])

      setRevenue(revenueResponse.data)
      setSubscriptions(subsResponse.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${revenue?.totalRevenue?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue Today</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${revenue?.revenueToday?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Subscriptions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {subscriptions?.activeSubscriptions || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Churn Rate</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {subscriptions?.churnRate?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">📈</span> Revenue Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue?.revenueByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              <Line name="Revenue ($)" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🚀</span> Subscription Growth
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={subscriptions?.subscriptionGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              <Line name="New Subs" type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">📊</span> Subscriptions by Plan (Active)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subscriptions?.subscriptionsByPlan || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="planName" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              <Bar name="Subscribers" dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {revenue?.totalTransactions || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Growth Rate</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {subscriptions?.growthRate?.toFixed(2) || '0.00'}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trialing</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {subscriptions?.trialingSubscriptions || 0}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
