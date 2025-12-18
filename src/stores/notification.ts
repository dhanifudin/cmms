import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Notification, Priority } from '@/types';
import { useAuthStore } from './auth';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const isLoading = ref(false);

  const authStore = useAuthStore();

  // Computed properties
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  );

  const unreadCount = computed(() => unreadNotifications.value.length);

  const recentNotifications = computed(() => 
    notifications.value
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  );

  const priorityNotifications = computed(() => 
    notifications.value.filter(n => n.priority === 'high' || n.priority === 'urgent')
  );

  // Actions
  const addNotification = (notificationData: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    priority?: Priority;
    actionUrl?: string;
    relatedEntity?: {
      type: 'work_order' | 'inventory' | 'user' | 'invoice';
      id: string;
    };
  }) => {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      priority: notificationData.priority || 'normal',
      userId: authStore.currentUser?.id || '',
      read: false,
      actionUrl: notificationData.actionUrl,
      relatedEntity: notificationData.relatedEntity,
      createdAt: new Date().toISOString()
    };

    notifications.value.unshift(notification);
    
    // Auto-remove after 5 seconds for info notifications
    if (notificationData.type === 'info' && !notificationData.actionUrl) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }

    return notification;
  };

  const markAsRead = (notificationIds: string[]) => {
    notificationIds.forEach(id => {
      const notification = notifications.value.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    });
  };

  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true;
    });
  };

  const removeNotification = (notificationId: string) => {
    const index = notifications.value.findIndex(n => n.id === notificationId);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAll = () => {
    notifications.value = [];
  };

  const clearRead = () => {
    notifications.value = notifications.value.filter(n => !n.read);
  };

  const initializeNotifications = () => {
    if (!authStore.currentUser) return;

    // Generate some mock notifications based on user role
    const mockNotifications: Notification[] = [];
    const userId = authStore.currentUser.id;
    const now = new Date();

    // Common notifications for all users
    mockNotifications.push(
      {
        id: 'notif1',
        title: 'Welcome to CMMS',
        message: 'Your account is now active. Explore the system features.',
        type: 'success',
        priority: 'normal',
        userId,
        read: false,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif2',
        title: 'System Maintenance Scheduled',
        message: 'Maintenance window scheduled for tomorrow 2:00 AM - 2:30 AM.',
        type: 'info',
        priority: 'normal',
        userId,
        read: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      }
    );

    // Role-specific notifications
    if (authStore.isWorker) {
      mockNotifications.push(
        {
          id: 'notif3',
          title: 'New Work Order Assigned',
          message: 'WO-001: Generator Maintenance has been assigned to you.',
          type: 'info',
          priority: 'high',
          userId,
          read: false,
          actionUrl: '/work-orders/wo1',
          relatedEntity: { type: 'work_order', id: 'wo1' },
          createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 'notif4',
          title: 'Work Order Due Soon',
          message: 'WO-002: Pump Inspection is due in 2 hours.',
          type: 'warning',
          priority: 'high',
          userId,
          read: false,
          actionUrl: '/work-orders/wo2',
          relatedEntity: { type: 'work_order', id: 'wo2' },
          createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
        }
      );
    }

    if (authStore.isSupervisor || authStore.isAdmin) {
      mockNotifications.push(
        {
          id: 'notif5',
          title: 'Work Order Submitted for Review',
          message: 'WO-003: Safety Check has been completed and needs approval.',
          type: 'info',
          priority: 'normal',
          userId,
          read: false,
          actionUrl: '/work-orders/wo3',
          relatedEntity: { type: 'work_order', id: 'wo3' },
          createdAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString()
        }
      );
    }

    if (authStore.isAdmin) {
      mockNotifications.push(
        {
          id: 'notif6',
          title: 'Low Inventory Alert',
          message: 'Oil Filter (OF-001) stock is below minimum threshold.',
          type: 'warning',
          priority: 'high',
          userId,
          read: false,
          actionUrl: '/inventory/inv1',
          relatedEntity: { type: 'inventory', id: 'inv1' },
          createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
        },
        {
          id: 'notif7',
          title: 'Invoice Generated',
          message: 'Invoice #INV-001 has been generated for Terminal 1.',
          type: 'success',
          priority: 'normal',
          userId,
          read: true,
          actionUrl: '/invoices/inv1',
          relatedEntity: { type: 'invoice', id: 'inv1' },
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        }
      );
    }

    notifications.value = mockNotifications;
  };

  // Notification helpers for common scenarios
  const notifyWorkOrderAssigned = (workOrderId: string, workOrderTitle: string, workerId: string) => {
    if (authStore.currentUser?.id === workerId) {
      addNotification({
        title: 'New Work Order Assigned',
        message: `${workOrderTitle} has been assigned to you.`,
        type: 'info',
        priority: 'high',
        actionUrl: `/work-orders/${workOrderId}`,
        relatedEntity: { type: 'work_order', id: workOrderId }
      });
    }
  };

  const notifyWorkOrderCompleted = (workOrderId: string, workOrderTitle: string) => {
    if (authStore.isSupervisor || authStore.isAdmin) {
      addNotification({
        title: 'Work Order Submitted for Review',
        message: `${workOrderTitle} has been completed and needs approval.`,
        type: 'info',
        priority: 'normal',
        actionUrl: `/work-orders/${workOrderId}`,
        relatedEntity: { type: 'work_order', id: workOrderId }
      });
    }
  };

  const notifyWorkOrderOverdue = (workOrderId: string, workOrderTitle: string) => {
    addNotification({
      title: 'Work Order Overdue',
      message: `${workOrderTitle} is now overdue. Please complete as soon as possible.`,
      type: 'error',
      priority: 'urgent',
      actionUrl: `/work-orders/${workOrderId}`,
      relatedEntity: { type: 'work_order', id: workOrderId }
    });
  };

  const notifyLowInventory = (itemName: string, itemId: string, currentStock: number, minThreshold: number) => {
    if (authStore.isAdmin) {
      addNotification({
        title: 'Low Inventory Alert',
        message: `${itemName} stock is low (${currentStock}/${minThreshold}). Consider restocking.`,
        type: 'warning',
        priority: 'high',
        actionUrl: `/inventory/${itemId}`,
        relatedEntity: { type: 'inventory', id: itemId }
      });
    }
  };

  const notifyInvoiceGenerated = (invoiceId: string, invoiceNumber: string) => {
    if (authStore.hasPermission('view_invoices')) {
      addNotification({
        title: 'Invoice Generated',
        message: `Invoice ${invoiceNumber} has been successfully generated.`,
        type: 'success',
        priority: 'normal',
        actionUrl: `/invoices/${invoiceId}`,
        relatedEntity: { type: 'invoice', id: invoiceId }
      });
    }
  };

  const showSuccess = (message: string) => {
    addNotification({
      title: 'Success',
      message,
      type: 'success'
    });
  };

  const showError = (message: string) => {
    addNotification({
      title: 'Error',
      message,
      type: 'error'
    });
  };

  const showWarning = (message: string) => {
    addNotification({
      title: 'Warning',
      message,
      type: 'warning'
    });
  };

  const showInfo = (message: string) => {
    addNotification({
      title: 'Info',
      message,
      type: 'info'
    });
  };

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    recentNotifications,
    priorityNotifications,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    initializeNotifications,
    notifyWorkOrderAssigned,
    notifyWorkOrderCompleted,
    notifyWorkOrderOverdue,
    notifyLowInventory,
    notifyInvoiceGenerated,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
});