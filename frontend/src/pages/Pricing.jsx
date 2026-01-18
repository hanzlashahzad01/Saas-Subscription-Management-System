import { useEffect, useState } from 'react'
import { planService } from '../services/plan.service'
import { paymentService } from '../services/payment.service'
import { couponService } from '../services/coupon.service'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Card, CardBody } from '../components/Card'
import api from '../services/api'
import toast from 'react-hot-toast'

function Pricing() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [selectedPlanForManual, setSelectedPlanForManual] = useState(null)
  const [manualPaymentData, setManualPaymentData] = useState({
    method: 'jazzcash',
    transactionId: ''
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedPlanForCard, setSelectedPlanForCard] = useState(null)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  })
  const [isVerifyingCard, setIsVerifyingCard] = useState(false)

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    setValidatingCoupon(true)
    try {
      // Find the currently selected plan price to validate against minAmount
      const firstPlan = plans[0]
      const amount = firstPlan ? (billingCycle === 'monthly' ? firstPlan.price.monthly : firstPlan.price.yearly) : 0

      const response = await couponService.validateCoupon(couponCode, null, amount)
      if (response.success) {
        toast.success(`Coupon "${response.data.coupon.code}" applied!`)
        setAppliedCoupon(response.data.coupon)
      } else {
        toast.error(response.message || 'Invalid coupon code')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleSubscribe = async (planId, method = 'stripe') => {
    if (!user) {
      toast.error('Please login to subscribe')
      return
    }

    const plan = plans.find(p => p._id === planId)
    if (method === 'manual') {
      setSelectedPlanForManual(plan)
      return
    }

    if (method === 'stripe') {
      setSelectedPlanForCard(plan)
      return
    }
  }

  const handleCardVerification = async (e) => {
    e.preventDefault()
    setIsVerifyingCard(true)
    try {
      // Step 1: Verify Card (Mock API call)
      const verifyRes = await api.post('/payments/verify-card', cardData)

      if (verifyRes.data.success) {
        toast.success('Card verified! Processing subscription...')

        // Step 2: Proceed to Checkout
        const response = await paymentService.createCheckoutSession(
          selectedPlanForCard._id,
          billingCycle,
          appliedCoupon?.code,
          { manualMethod: 'card', cardDetails: cardData } // Passing hints for simulation
        )

        if (response.success) {
          if (response.data?.url) {
            window.location.href = response.data.url
          } else {
            toast.success(response.data.message || 'Subscription activated!')
            setSelectedPlanForCard(null)
            setTimeout(() => { window.location.href = '/subscriptions' }, 1500)
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Card verification failed')
    } finally {
      setIsVerifyingCard(false)
    }
  }

  const confirmManualPayment = async () => {
    if (!selectedPlanForManual) return

    // Validations
    if (!manualPaymentData.transactionId || manualPaymentData.transactionId.length < 6) {
      toast.error('Please enter a valid Transaction ID (at least 6 characters)')
      return
    }

    setIsVerifying(true)
    try {
      const response = await api.post('/payments/create-checkout', {
        planId: selectedPlanForManual._id,
        billingCycle,
        manualMethod: manualPaymentData.method,
        transactionId: manualPaymentData.transactionId,
        couponCode: appliedCoupon?.code
      })

      if (response.data.success) {
        toast.success('🎉 Payment submitted! Admin will verify it shortly.', { duration: 5000 })
        setSelectedPlanForManual(null)
        setManualPaymentData({ method: 'jazzcash', transactionId: '' })
        setTimeout(() => {
          window.location.href = '/subscriptions'
        }, 2000)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit payment')
    } finally {
      setIsVerifying(false)
    }
  }

  const calculateFinalPrice = (price) => {
    if (!appliedCoupon) return price
    let discount = 0
    if (appliedCoupon.discountType === 'percentage') {
      discount = (price * appliedCoupon.discountValue) / 100
      if (appliedCoupon.maxDiscount) discount = Math.min(discount, appliedCoupon.maxDiscount)
    } else {
      discount = appliedCoupon.discountValue
    }
    return Math.max(0, price - discount)
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading premium plans...</p>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-primary-600 font-bold tracking-wide uppercase text-sm mb-2">Pricing Plans</h2>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
          Ready to supercharge your business?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Choose a plan that works best for you and your team. High-performance features at an affordable price.
        </p>

        {/* Billing Switch */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-lg transition-colors ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => {
              setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')
              setAppliedCoupon(null)
            }}
            className="flex w-14 h-7 bg-primary-600 rounded-full p-1 transition-all duration-300 ease-in-out hover:bg-primary-700 shadow-inner"
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className={`text-lg transition-colors ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400'}`}>
            Yearly <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Save 20%</span>
          </span>
        </div>

        {/* Coupon Input */}
        <div className="max-w-md mx-auto relative group">
          <div className="flex space-x-2 p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all group-focus-within:border-primary-400 group-focus-within:ring-4 group-focus-within:ring-primary-400/10">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Have a discount code?"
              className="flex-1 px-4 py-2 bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 text-sm font-medium"
            />
            <Button
              onClick={handleApplyCoupon}
              className="px-6 rounded-lg text-sm"
              disabled={validatingCoupon || !couponCode.trim()}
              loading={validatingCoupon}
            >
              Apply
            </Button>
          </div>
          {appliedCoupon && (
            <div className="absolute -bottom-10 left-0 right-0 animate-fade-in-up">
              <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center shadow-md">
                <span className="mr-2">✨</span> {appliedCoupon.name} Applied! Savings: {appliedCoupon.discountValue}{appliedCoupon.discountType === 'percentage' ? '%' : '$'}
                <button onClick={() => { setAppliedCoupon(null); setCouponCode('') }} className="ml-3 hover:text-red-100 underline">
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly
          const finalPrice = calculateFinalPrice(price)
          const isPopular = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('business')

          return (
            <Card
              key={plan._id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isPopular ? 'border-2 border-primary-500 ring-4 ring-primary-500/10' : 'border border-gray-200 dark:border-gray-700'
                }`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] uppercase font-black px-4 py-1 rounded-bl-xl rotate-0 shadow-lg z-10">
                  Most Popular
                </div>
              )}

              {plan.trialDays > 0 && (
                <div className="absolute top-8 -left-12 bg-green-500 text-white text-[10px] font-bold px-12 py-1 -rotate-45 shadow flex items-center justify-center">
                  {plan.trialDays} Day Free Trial
                </div>
              )}

              <CardBody className="p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm h-10 overflow-hidden">{plan.description}</p>
                </div>

                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-black text-gray-900 dark:text-white transition-all">
                    ${finalPrice.toFixed(0)}
                  </span>
                  {finalPrice < price && (
                    <span className="ml-2 text-lg text-gray-400 line-through">
                      ${price}
                    </span>
                  )}
                  <span className="ml-1 text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>

                <ul className="mb-10 space-y-4 min-h-[200px]">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex-shrink-0 w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    onClick={() => handleSubscribe(plan._id, 'stripe')}
                    className={`w-full py-4 text-base font-bold shadow-lg shadow-primary-500/20 ${isPopular ? '' : 'bg-gray-900 hover:bg-black dark:bg-primary-600 dark:hover:bg-primary-700'}`}
                  >
                    Get Started with Card
                  </Button>
                  <Button
                    onClick={() => handleSubscribe(plan._id, 'manual')}
                    variant="secondary"
                    className="w-full py-4 text-base font-bold dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    JazzCash / Bank Transfer
                  </Button>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Trust Badges / Footer */}
      <div className="max-w-4xl mx-auto text-center border-t border-gray-200 dark:border-gray-700 pt-16">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-8">Trusted by 1000+ businesses across Pakistan</h3>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center font-black text-2xl text-gray-500 dark:text-gray-300">JazzCash</div>
          <div className="flex items-center font-black text-2xl text-gray-500 dark:text-gray-300">EasyPaisa</div>
          <div className="flex items-center font-black text-2xl text-gray-500 dark:text-gray-300">Visa</div>
          <div className="flex items-center font-black text-2xl text-gray-500 dark:text-gray-300">MasterCard</div>
        </div>
      </div>

      {/* Manual Payment Modal */}
      {selectedPlanForManual && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-0 shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white relative">
              <h2 className="text-3xl font-black mb-1">Manual Payment</h2>
              <p className="opacity-90 font-medium">Verify your payment to activate plan</p>
              <div className="absolute top-8 right-8 text-5xl opacity-20">💰</div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-8 border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Selected Plan</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{selectedPlanForManual.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Total to Pay</p>
                  <p className="text-2xl font-black text-primary-600">
                    ${calculateFinalPrice(billingCycle === 'monthly' ? selectedPlanForManual.price.monthly : selectedPlanForManual.price.yearly).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-tighter">
                    1. Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['jazzcash', 'easypaisa', 'bank_transfer'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setManualPaymentData({ ...manualPaymentData, method: m })}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${manualPaymentData.method === m
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md ring-2 ring-primary-500/20'
                          : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-xl mb-1">{m === 'jazzcash' ? '📱' : m === 'easypaisa' ? '💸' : '🏦'}</div>
                        {m.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                  <p className="text-xs font-black text-primary-800 dark:text-primary-400 mb-2 uppercase">Account Details</p>
                  {manualPaymentData.method === 'jazzcash' && (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">JazzCash Account: <span className="text-primary-600">0300-1234567</span></p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Account Title: SAAS SOLUTIONS ADMIN</p>
                    </div>
                  )}
                  {manualPaymentData.method === 'easypaisa' && (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">EasyPaisa Account: <span className="text-primary-600">0300-1234567</span></p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Account Title: SAAS SOLUTIONS ADMIN</p>
                    </div>
                  )}
                  {manualPaymentData.method === 'bank_transfer' && (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Bank: <span className="text-primary-600">Meezan Bank</span></p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">IBAN: <span className="text-primary-600 font-mono tracking-tighter">PK00MEZN00123456789</span></p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-tighter">
                    2. Enter Transaction ID / Reference
                  </label>
                  <input
                    type="text"
                    placeholder="Enter valid 8-12 digit ID"
                    value={manualPaymentData.transactionId}
                    onChange={(e) => setManualPaymentData({ ...manualPaymentData, transactionId: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-mono font-bold"
                  />
                  <p className="mt-2 text-[10px] text-gray-500 font-bold italic">* Please ensure the ID is correct for fast approval.</p>
                </div>
              </div>

              <div className="flex space-x-4 mt-10">
                <Button
                  onClick={confirmManualPayment}
                  className="flex-1 py-4 rounded-2xl text-lg font-black shadow-xl shadow-primary-500/30"
                  loading={isVerifying}
                  disabled={isVerifying || !manualPaymentData.transactionId}
                >
                  {isVerifying ? 'Verifying...' : 'Submit Payment Request'}
                </Button>
                <Button
                  onClick={() => setSelectedPlanForManual(null)}
                  variant="secondary"
                  className="px-6 rounded-2xl dark:bg-gray-700"
                  disabled={isVerifying}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Payment Modal */}
      {selectedPlanForCard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-0 shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 text-white relative">
              <h2 className="text-3xl font-black mb-1">Secure Checkout</h2>
              <p className="opacity-80 text-sm font-medium">Pay safely with your Credit/Debit Card</p>
              <div className="absolute top-8 right-8 text-4xl opacity-20">💳</div>
            </div>

            <form onSubmit={handleCardVerification} className="p-8 space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-2 border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selected Plan</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{selectedPlanForCard.name} ({billingCycle})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total to Pay</span>
                  <p className="text-2xl font-black text-primary-600">
                    ${calculateFinalPrice(billingCycle === 'monthly' ? selectedPlanForCard.price.monthly : selectedPlanForCard.price.yearly).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-tighter">1. Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold uppercase tracking-tight"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-tighter">2. Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-mono font-bold text-xl"
                  value={cardData.cardNumber}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
                    val = val.match(/.{1,4}/g)?.join(' ') || val;
                    setCardData({ ...cardData, cardNumber: val });
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-tighter">3. Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                    value={cardData.expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                      if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                      setCardData({ ...cardData, expiry: val });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-tighter">4. CVV Code</label>
                  <input
                    type="password"
                    required
                    placeholder="***"
                    maxLength="3"
                    className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                    value={cardData.cvc}
                    onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl text-lg font-black shadow-xl shadow-primary-500/30"
                  loading={isVerifyingCard}
                  disabled={isVerifyingCard}
                >
                  {isVerifyingCard ? 'Verifying Card...' : 'Confirm & Pay Now'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setSelectedPlanForCard(null)}
                  variant="secondary"
                  className="px-6 rounded-2xl dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isVerifyingCard}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest pt-2">
                🔒 Secured by Industry Standard 256-bit Encryption
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pricing
