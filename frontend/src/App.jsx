import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './layouts/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Pricing from './pages/Pricing'
import Subscriptions from './pages/Subscriptions'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import SubscriptionSuccess from './pages/SubscriptionSuccess'
import PlanManagement from './pages/PlanManagement'
import PaymentManagement from './pages/PaymentManagement'
import CouponManagement from './pages/CouponManagement'
import UserManagement from './pages/UserManagement'


function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'company_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/plans"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'company_admin']}>
              <PlanManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/payments"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'company_admin']}>
              <PaymentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/coupons"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'company_admin']}>
              <CouponManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="pricing" element={<Pricing />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
        <Route path="subscription/success" element={<SubscriptionSuccess />} />
      </Route>
    </Routes>
  )
}

export default App
