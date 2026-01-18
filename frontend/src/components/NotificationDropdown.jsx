import { useState, useEffect, useRef } from 'react'
import { notificationService } from '../services/notification.service'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        loadNotifications()
        const interval = setInterval(loadNotifications, 60000) // Poll every minute
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const loadNotifications = async () => {
        try {
            const response = await notificationService.getNotifications()
            if (response.success) {
                setNotifications(response.data)
                setUnreadCount(response.data.filter(n => !n.isRead).length)
            }
        } catch (error) {
            console.error('Failed to load notifications:', error)
        }
    }

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id)
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            toast.error('Failed to mark notification as read')
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true)
            await notificationService.markAllAsRead()
            setNotifications(notifications.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
            toast.success('All notifications marked as read')
        } catch (error) {
            toast.error('Failed to mark all as read')
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'payment_success': return '✅'
            case 'payment_failed': return '❌'
            case 'subscription_cancelled': return '⚠️'
            default: return '🔔'
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <span className="text-xl mr-3">{getIcon(notification.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium text-gray-900 dark:text-white ${!notification.isRead ? 'font-bold' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="ml-2 w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"
                                                title="Mark as read"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 text-center">
                        <Link
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600"
                        >
                            Notification Settings
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationDropdown
