import { useEffect, useState } from 'react'
import { subscriptionService } from '../services/subscription.service'
import { planService } from '../services/plan.service'
import toast from 'react-hot-toast'

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionService.getSubscriptions()
      setSubscriptions(response.data)
    } catch (error) {
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return
    }

    try {
      const response = await subscriptionService.cancelSubscription(id)
      if (response.success) {
        toast.success('Subscription will be cancelled at the end of the billing period')
        loadSubscriptions()
      } else {
        toast.error(response.message || 'Failed to cancel subscription')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription')
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any subscriptions yet.</p>
          <a
            href="/pricing"
            className="inline-block px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            Browse Plans
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <div key={subscription._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-transparent dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {subscription.plan?.name || 'N/A'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">{subscription.billingCycle} billing</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : subscription.status === 'trialing'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : subscription.status === 'canceled'
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                >
                  {subscription.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {subscription.nextBillingDate
                      ? new Date(subscription.nextBillingDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    $
                    {subscription.billingCycle === 'monthly'
                      ? subscription.plan?.price.monthly
                      : subscription.plan?.price.yearly}
                    /{subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 dark:text-yellow-400">
                    This subscription will be cancelled at the end of the billing period.
                  </p>
                </div>
              )}

              {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <button
                  onClick={() => handleCancel(subscription._id)}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Subscriptions
