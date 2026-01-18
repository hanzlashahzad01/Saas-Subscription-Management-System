import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { planService } from '../services/plan.service'
import { Card, CardBody, CardFooter } from '../components/Card'
import { Button } from '../components/Button'
import toast from 'react-hot-toast'

const planSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters'),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0, 'Monthly price must be positive'),
  yearlyPrice: z.number().min(0, 'Yearly price must be positive'),
  stripePriceIdMonthly: z.string().optional(),
  stripePriceIdYearly: z.string().optional(),
  trialDays: z.number().min(0).max(30).default(0),
  features: z.string().optional()
})

function PlanManagement() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(planSchema)
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const response = await planService.getPlans()
      setPlans(response.data)
    } catch (error) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const planData = {
        name: data.name,
        description: data.description || '',
        price: {
          monthly: parseFloat(data.monthlyPrice),
          yearly: parseFloat(data.yearlyPrice)
        },
        stripePriceIdMonthly: data.stripePriceIdMonthly || '',
        stripePriceIdYearly: data.stripePriceIdYearly || '',
        features: data.features ? data.features.split('\n').filter(f => f.trim()) : [],
        trialDays: parseInt(data.trialDays) || 0
      }

      if (editingPlan) {
        await planService.updatePlan(editingPlan._id, planData)
        toast.success('Plan updated successfully')
      } else {
        await planService.createPlan(planData)
        toast.success('Plan created successfully')
      }

      reset()
      setEditingPlan(null)
      setIsFormOpen(false)
      loadPlans()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save plan')
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setValue('name', plan.name)
    setValue('description', plan.description || '')
    setValue('monthlyPrice', plan.price.monthly)
    setValue('yearlyPrice', plan.price.yearly)
    setValue('stripePriceIdMonthly', plan.stripePriceIdMonthly || '')
    setValue('stripePriceIdYearly', plan.stripePriceIdYearly || '')
    setValue('trialDays', plan.trialDays || 0)
    setValue('features', plan.features?.join('\n') || '')
    setIsFormOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return
    }

    try {
      await planService.deletePlan(id)
      toast.success('Plan deleted successfully')
      loadPlans()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete plan')
    }
  }

  const handleNew = () => {
    setEditingPlan(null)
    reset()
    setIsFormOpen(true)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plan Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create and manage subscription plans</p>
        </div>
        <Button onClick={handleNew}>+ Create New Plan</Button>
      </div>

      {isFormOpen && (
        <Card className="mb-8 border-primary-500 dark:border-primary-400">
          <CardBody>
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Name *
                </label>
                <input
                  {...registerField('name')}
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...registerField('description')}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Price ($) *
                  </label>
                  <input
                    {...registerField('monthlyPrice', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.monthlyPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                  />
                  {errors.monthlyPrice && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.monthlyPrice.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yearly Price ($) *
                  </label>
                  <input
                    {...registerField('yearlyPrice', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.yearlyPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                  />
                  {errors.yearlyPrice && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.yearlyPrice.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stripe Monthly Price ID
                  </label>
                  <input
                    {...registerField('stripePriceIdMonthly')}
                    type="text"
                    placeholder="price_..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stripe Yearly Price ID
                  </label>
                  <input
                    {...registerField('stripePriceIdYearly')}
                    type="text"
                    placeholder="price_..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trial Days (0-30)
                </label>
                <input
                  {...registerField('trialDays', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="30"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features (one per line)
                </label>
                <textarea
                  {...registerField('features')}
                  rows="5"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsFormOpen(false)
                    reset()
                    setEditingPlan(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id} className="hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${plan.isActive
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {plan.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{plan.description}</p>
              )}

              <div className="mb-4 space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${plan.price.monthly}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">/month</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    ${plan.price.yearly}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">/year</span>
                </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-sm text-gray-500 dark:text-gray-500 ml-5">
                      +{plan.features.length - 3} more features
                    </li>
                  )}
                </ul>
              )}

              {plan.trialDays > 0 && (
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-4">
                  {plan.trialDays} days free trial
                </p>
              )}
            </CardBody>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(plan)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(plan._id)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">No plans created yet.</p>
            <Button onClick={handleNew}>Create Your First Plan</Button>
          </CardBody>
        </Card>
      )}
    </div>
  )
}


export default PlanManagement
