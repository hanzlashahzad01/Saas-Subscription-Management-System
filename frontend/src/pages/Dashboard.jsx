import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscriptionService } from '../services/subscription.service'
import { planService } from '../services/plan.service'
import toast from 'react-hot-toast'

function Dashboard() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [subsResponse, plansResponse] = await Promise.all([
        subscriptionService.getSubscriptions(),
        planService.getPlans(),
      ])

      const activeSubscription = subsResponse.data.find(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      )
      setSubscription(activeSubscription)
    } catch (error) {
      toast.error('Failed to load subscription data')
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to your subscription dashboard</p>
      </div>

      {subscription ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{subscription.plan?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Billing Cycle</p>
              <p className="text-lg font-medium capitalize text-gray-900 dark:text-white">{subscription.billingCycle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : subscription.status === 'trialing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {subscription.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {subscription.nextBillingDate
                  ? new Date(subscription.nextBillingDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <Link
              to="/subscriptions"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-all shadow-md hover:shadow-lg"
            >
              Manage Subscription
            </Link>
            <Link
              to="/billing"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              View Billing History
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 text-center animate-fade-in">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Active Subscription</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Subscribe to a plan to get started</p>
          <Link
            to="/pricing"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-all shadow-md hover:shadow-lg"
          >
            View Plans
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/pricing"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-all animate-fade-in"
        >
          <div className="text-3xl mb-2">💳</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Browse Plans</h3>
          <p className="text-gray-600 dark:text-gray-400">Choose the perfect plan for your needs</p>
        </Link>

        <Link
          to="/subscriptions"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-all animate-fade-in"
        >
          <div className="text-3xl mb-2">📦</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">My Subscriptions</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage your active subscriptions</p>
        </Link>

        <Link
          to="/billing"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-all animate-fade-in"
        >
          <div className="text-3xl mb-2">💵</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Billing History</h3>
          <p className="text-gray-600 dark:text-gray-400">View your payment history</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
