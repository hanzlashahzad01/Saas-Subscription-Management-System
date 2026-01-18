import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function SubscriptionSuccess() {
  const [searchParams] = useSearchParams()
  const { loadUser } = useAuth()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // Subscription success - refresh user data to get active subscription
      loadUser().then(() => {
        setLoading(false)
        toast.success('Subscription activated successfully!')
      })
    } else {
      setLoading(false)
    }
  }, [sessionId, loadUser])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-12 border border-transparent dark:border-gray-700 animate-fade-in">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Subscription Activated!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Your subscription has been successfully activated. You now have full access to all
            features.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/dashboard"
              className="inline-block px-8 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/subscriptions"
              className="inline-block px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              View Subscriptions
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionSuccess
