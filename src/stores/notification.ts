import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  category: 'work-order' | 'inventory' | 'system' | 'user' | 'invoice'
  priority: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  data?: any
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const { success, error, warning, info } = useToast()

  // Computed getters
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
  const unreadNotifications = computed(() => notifications.value.filter(n => !n.read))
  const recentNotifications = computed(() => 
    notifications.value
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
  )

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    notifications.value.unshift(newNotification)

    // Show toast notification based on type and priority
    const shouldShowToast = notification.priority === 'high' || notification.priority === 'critical'
    
    if (shouldShowToast) {
      const toastOptions = {
        description: notification.message,
        duration: notification.priority === 'critical' ? 8000 : 4000,
        action: notification.actionUrl ? {
          label: notification.actionLabel || 'View',
          onClick: () => {
            // This would be handled by the router in the actual implementation
            console.log('Navigate to:', notification.actionUrl)
          }
        } : undefined
      }

      switch (notification.type) {
        case 'success':
          success(notification.title, toastOptions)
          break
        case 'error':
          error(notification.title, toastOptions)
          break
        case 'warning':
          warning(notification.title, toastOptions)
          break
        default:
          info(notification.title, toastOptions)
      }
    }

    return newNotification.id
  }

  // Mark as read
  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  // Mark all as read
  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  // Remove notification
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Clear all notifications
  const clearAll = () => {
    notifications.value = []
  }

  // Predefined notification creators for common CMMS events
  const workOrderCreated = (workOrderId: string, title: string, assignee?: string) => {
    addNotification({
      type: 'info',
      category: 'work-order',
      priority: 'medium',
      title: 'New Work Order Created',
      message: `Work Order "${title}" has been created${assignee ? ` and assigned to ${assignee}` : ''}`,
      actionUrl: `/work-orders/${workOrderId}`,
      actionLabel: 'View Details'
    })
  }

  const workOrderCompleted = (workOrderId: string, title: string) => {
    addNotification({
      type: 'success',
      category: 'work-order',
      priority: 'medium',
      title: 'Work Order Completed',
      message: `Work Order "${title}" has been completed successfully`,
      actionUrl: `/work-orders/${workOrderId}`,
      actionLabel: 'Review'
    })
  }

  const workOrderOverdue = (workOrderId: string, title: string, daysPastDue: number) => {
    addNotification({
      type: 'warning',
      category: 'work-order',
      priority: daysPastDue > 3 ? 'high' : 'medium',
      title: 'Work Order Overdue',
      message: `Work Order "${title}" is ${daysPastDue} day${daysPastDue > 1 ? 's' : ''} past due`,
      actionUrl: `/work-orders/${workOrderId}`,
      actionLabel: 'Take Action'
    })
  }

  const inventoryLowStock = (itemName: string, currentStock: number, threshold: number) => {
    addNotification({
      type: 'warning',
      category: 'inventory',
      priority: currentStock === 0 ? 'critical' : 'high',
      title: currentStock === 0 ? 'Item Out of Stock' : 'Low Stock Alert',
      message: `${itemName}: ${currentStock} units remaining (threshold: ${threshold})`,
      actionUrl: '/inventory',
      actionLabel: 'Manage Inventory'
    })
  }

  const invoiceGenerated = (invoiceId: string, amount: number, recipient: string) => {
    addNotification({
      type: 'info',
      category: 'invoice',
      priority: 'medium',
      title: 'Invoice Generated',
      message: `Invoice for $${amount.toLocaleString()} has been sent to ${recipient}`,
      actionUrl: `/invoices/${invoiceId}`,
      actionLabel: 'View Invoice'
    })
  }

  const systemMaintenance = (startTime: Date, duration: number) => {
    addNotification({
      type: 'warning',
      category: 'system',
      priority: 'high',
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${startTime.toLocaleString()} (${duration} hours)`,
    })
  }

  // Initialize with some demo notifications
  const initializeDemoNotifications = () => {
    // Only add demo notifications if the store is empty
    if (notifications.value.length === 0) {
      setTimeout(() => {
        workOrderCreated('wo-001', 'Gas Pipeline Inspection', 'Ahmad Sutrisno')
        inventoryLowStock('Oil Filter', 2, 5)
        workOrderOverdue('wo-002', 'Compressor Maintenance', 2)
        invoiceGenerated('inv-001', 15750, 'Terminal Jakarta')
      }, 1000)
    }
  }

  return {
    notifications,
    unreadCount,
    unreadNotifications,
    recentNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    workOrderCreated,
    workOrderCompleted,
    workOrderOverdue,
    inventoryLowStock,
    invoiceGenerated,
    systemMaintenance,
    initializeDemoNotifications
  }
})