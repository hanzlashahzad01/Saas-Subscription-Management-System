import { useEffect, useState } from 'react'
import { couponService } from '../services/coupon.service'
import { Card, CardBody } from '../components/Card'
import { Button } from '../components/Button'
import toast from 'react-hot-toast'

function CouponManagement() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        discountType: 'percentage',
        discountValue: 0,
        minAmount: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 0,
        isActive: true
    })

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = async () => {
        setLoading(true)
        try {
            const response = await couponService.getCoupons()
            setCoupons(response.data)
        } catch (error) {
            toast.error('Failed to load coupons')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingCoupon) {
                await couponService.updateCoupon(editingCoupon._id, formData)
                toast.success('Coupon updated successfully')
            } else {
                await couponService.createCoupon(formData)
                toast.success('Coupon created successfully')
            }
            setIsModalOpen(false)
            setEditingCoupon(null)
            loadCoupons()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save coupon')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return
        try {
            await couponService.deleteCoupon(id)
            toast.success('Coupon deleted successfully')
            loadCoupons()
        } catch (error) {
            toast.error('Failed to delete coupon')
        }
    }

    const openCreateModal = () => {
        setEditingCoupon(null)
        setFormData({
            code: '',
            name: '',
            discountType: 'percentage',
            discountValue: 0,
            minAmount: 0,
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            usageLimit: 0,
            isActive: true
        })
        setIsModalOpen(true)
    }

    const openEditModal = (coupon) => {
        setEditingCoupon(coupon)
        setFormData({
            code: coupon.code,
            name: coupon.name,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minAmount: coupon.minAmount,
            validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
            validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit || 0,
            isActive: coupon.isActive
        })
        setIsModalOpen(true)
    }

    const createDemoCoupon = async () => {
        const demoData = {
            code: 'SAAS50',
            name: 'Special Lunch Discount',
            discountType: 'percentage',
            discountValue: 50,
            minAmount: 0,
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            usageLimit: 1000,
            isActive: true
        }
        try {
            await couponService.createCoupon(demoData)
            toast.success('Demo Coupon SAAS50 Created!')
            loadCoupons()
        } catch (error) {
            toast.error('Demo coupon already exists or failed to create')
        }
    }

    if (loading && coupons.length === 0) {
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coupon Management</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Create and manage discount codes</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={createDemoCoupon} variant="outline" className="border-green-500 text-green-500 hover:bg-green-50">
                        ⚡ Quick Demo Coupon
                    </Button>
                    <Button onClick={openCreateModal}>
                        + Add New Coupon
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <Card key={coupon._id} className={`${!coupon.isActive ? 'opacity-60' : ''} border-t-4 ${coupon.isActive ? 'border-t-primary-500' : 'border-t-gray-500'}`}>
                        <CardBody>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded text-lg font-mono font-bold">
                                        {coupon.code}
                                    </span>
                                    <h3 className="text-lg font-bold mt-2 text-gray-900 dark:text-white">{coupon.name}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary-600">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                    </div>
                                    <div className="text-xs text-gray-500">discount</div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between">
                                    <span>Min. Purchase:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-200">${coupon.minAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className={`font-semibold ${coupon.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Used:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-200">{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Expires:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-200">{new Date(coupon.validUntil).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-2">
                                <Button onClick={() => openEditModal(coupon)} variant="outline" className="flex-1 py-1 text-xs">Edit</Button>
                                <Button onClick={() => handleDelete(coupon._id)} variant="outline" className="flex-1 py-1 text-xs border-red-500 text-red-500 hover:bg-red-50">Delete</Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {coupons.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500">No coupons found. Click "Add New Coupon" to create one.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SUMMER50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Coupon Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Display Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min. Amount ($)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600"
                                        value={formData.minAmount}
                                        onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        placeholder="0 for unlimited"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Valid From</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Valid Until</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-primary-600 rounded"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Coupon is Active</label>
                            </div>

                            <div className="flex space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Button type="submit" className="flex-1">
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CouponManagement
