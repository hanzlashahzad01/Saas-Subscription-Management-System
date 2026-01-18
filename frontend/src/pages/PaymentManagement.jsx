import { useEffect, useState } from 'react'
import api from '../services/api'
import { Card, CardBody } from '../components/Card'
import { Button } from '../components/Button'
import toast from 'react-hot-toast'

function PaymentManagement() {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPayments()
    }, [])

    const loadPayments = async () => {
        setLoading(true)
        try {
            const response = await api.get('/payments')
            setPayments(response.data.data)
        } catch (error) {
            toast.error('Failed to load payments')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this payment?')) return
        try {
            const response = await api.post(`/payments/${id}/approve`)
            if (response.data.success) {
                toast.success('Payment approved!')
                loadPayments() // Refresh list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve payment')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'succeeded':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
            case 'failed':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
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
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">View and manage all transactions</p>
                </div>
                <Button onClick={loadPayments} variant="outline">
                    Refresh
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-transparent dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Method / Trans ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {payments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {payment.user?.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {payment.user?.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {payment.subscription?.plan?.name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {payment.subscription?.billingCycle}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                        ${payment.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="capitalize">{payment.paymentMethod} {payment.manualPaymentMethod !== 'none' && `(${payment.manualPaymentMethod})`}</div>
                                        {payment.transactionId && <div className="text-xs font-mono text-primary-600 dark:text-primary-400">{payment.transactionId}</div>}
                                        {payment.appliedCoupon && (
                                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                Code: {payment.appliedCoupon} (-${payment.discount})
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {payment.status === 'pending' && payment.paymentMethod === 'manual' && (
                                            <button
                                                onClick={() => handleApprove(payment._id)}
                                                className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-md transition-colors"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {payments.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">💸</div>
                        <p className="text-gray-600 dark:text-gray-400">No payments found yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PaymentManagement
