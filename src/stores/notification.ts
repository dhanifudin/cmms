import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Notification, Priority, NotificationCategory, NotificationSettings, NotificationAction } from '@/types';
import { useAuthStore } from './auth';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const settings = ref<NotificationSettings | null>(null);
  const isLoading = ref(false);
  const escalationTimers = ref<Map<string, number>>(new Map());

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
    category?: NotificationCategory;
    priority?: Priority;
    actionUrl?: string;
    actionButtons?: NotificationAction[];
    relatedEntity?: {
      type: 'work_order' | 'inventory' | 'user' | 'invoice';
      id: string;
    };
    metadata?: Record<string, any>;
    expiresAt?: string;
  }) => {
    // Check if notifications are allowed for this user
    if (!shouldDeliverNotification(notificationData.category, notificationData.priority)) {
      return null;
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      category: notificationData.category || inferCategory(notificationData.relatedEntity?.type),
      priority: notificationData.priority || 'normal',
      userId: authStore.currentUser?.id || '',
      read: false,
      actionUrl: notificationData.actionUrl,
      actionButtons: notificationData.actionButtons,
      relatedEntity: notificationData.relatedEntity,
      metadata: notificationData.metadata,
      escalationLevel: 0,
      expiresAt: notificationData.expiresAt,
      createdAt: new Date().toISOString()
    };

    notifications.value.unshift(notification);
    
    // Setup escalation if enabled
    setupEscalation(notification);
    
    // Auto-remove after expiration for certain types
    if (notification.expiresAt) {
      const expireTime = new Date(notification.expiresAt).getTime() - Date.now();
      if (expireTime > 0) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, expireTime);
      }
    } else if (notificationData.type === 'info' && !notificationData.actionUrl) {
      // Auto-remove info notifications without actions after 5 seconds
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }

    return notification;
  };

  // Helper functions
  const shouldDeliverNotification = (category?: NotificationCategory, priority?: Priority): boolean => {
    if (!settings.value || !authStore.currentUser) return true;

    // Check if notifications are enabled for this category
    if (category && !settings.value.categories[category]) {
      return false;
    }

    // Check if notifications are enabled for this priority
    if (priority && !settings.value.priorities[priority]) {
      return false;
    }

    // Check quiet hours
    if (settings.value.quietHours?.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const { startTime, endTime } = settings.value.quietHours;
      
      if (startTime <= endTime) {
        // Same day quiet hours
        if (currentTime >= startTime && currentTime <= endTime) {
          // Only allow urgent/emergency notifications during quiet hours
          return priority === 'urgent' || category === 'emergency';
        }
      } else {
        // Overnight quiet hours
        if (currentTime >= startTime || currentTime <= endTime) {
          return priority === 'urgent' || category === 'emergency';
        }
      }
    }

    return true;
  };

  const inferCategory = (entityType?: string): NotificationCategory => {
    switch (entityType) {
      case 'work_order': return 'work_order';
      case 'inventory': return 'inventory';
      case 'invoice': return 'invoice';
      case 'user': return 'communication';
      default: return 'system';
    }
  };

  const setupEscalation = (notification: Notification) => {
    if (!settings.value?.escalationSettings.enabled || notification.priority === 'low') {
      return;
    }

    const delayMs = settings.value.escalationSettings.delayMinutes * 60 * 1000;
    const timer = setTimeout(() => {
      escalateNotification(notification.id);
    }, delayMs);

    escalationTimers.value.set(notification.id, timer);
  };

  const escalateNotification = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (!notification || notification.read || !settings.value) {
      return;
    }

    const maxLevel = settings.value.escalationSettings.maxLevel;
    if ((notification.escalationLevel || 0) < maxLevel) {
      notification.escalationLevel = (notification.escalationLevel || 0) + 1;
      notification.escalatedAt = new Date().toISOString();
      
      // Make notification more prominent
      if (notification.priority !== 'urgent') {
        notification.priority = notification.escalationLevel >= 2 ? 'urgent' : 'high';
      }

      // Setup next escalation if not at max level
      if (notification.escalationLevel < maxLevel) {
        setupEscalation(notification);
      }
    }
  };

  const markAsRead = (notificationIds: string[]) => {
    const readAt = new Date().toISOString();
    notificationIds.forEach(id => {
      const notification = notifications.value.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        notification.readAt = readAt;
        
        // Clear escalation timer
        const timer = escalationTimers.value.get(id);
        if (timer) {
          clearTimeout(timer);
          escalationTimers.value.delete(id);
        }
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

  const loadSettings = async () => {
    if (!authStore.currentUser) return;

    // Initialize default settings for user
    const defaultSettings: NotificationSettings = {
      userId: authStore.currentUser.id,
      categories: {
        work_order: true,
        inventory: authStore.isAdmin,
        invoice: authStore.hasPermission('view_invoices'),
        communication: true,
        system: true,
        emergency: true
      },
      priorities: {
        low: true,
        normal: true,
        high: true,
        urgent: true
      },
      deliveryChannels: {
        inApp: true,
        inbox: true,
        push: false,
        email: false
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '07:00',
        timezone: 'Asia/Jakarta'
      },
      escalationSettings: {
        enabled: true,
        delayMinutes: 30, // Escalate after 30 minutes
        maxLevel: 2
      },
      sounds: {
        enabled: true,
        highPriorityOnly: true
      },
      updatedAt: new Date().toISOString()
    };

    settings.value = defaultSettings;
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!settings.value) return;

    settings.value = {
      ...settings.value,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };

    // Simulate API call to save settings
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const executeNotificationAction = async (notificationId: string, actionId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (!notification?.actionButtons) return;

    const action = notification.actionButtons.find(a => a.id === actionId);
    if (!action) return;

    try {
      if (action.requireConfirmation) {
        const confirmed = confirm(action.confirmationMessage || 'Are you sure you want to perform this action?');
        if (!confirmed) return;
      }

      // Mark notification as read when action is taken
      markAsRead([notificationId]);

      // Handle different action types
      switch (action.actionType) {
        case 'route':
          if (action.target) {
            // Navigate to route (would use router in component)
            window.location.href = action.target;
          }
          break;
        case 'api':
          if (action.target) {
            // Make API call
            await fetch(action.target, { method: 'POST' });
          }
          break;
        case 'modal':
          // Open modal (would emit event or use modal store)
          console.log('Open modal:', action.target);
          break;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to execute notification action:', error);
      return { success: false, error };
    }
  };

  const initializeNotifications = async () => {
    if (!authStore.currentUser) return;

    // Load user settings first
    await loadSettings();

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
        category: 'system',
        priority: 'normal',
        userId,
        read: false,
        escalationLevel: 0,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif2',
        title: 'System Maintenance Scheduled',
        message: 'Maintenance window scheduled for tomorrow 2:00 AM - 2:30 AM.',
        type: 'info',
        category: 'system',
        priority: 'normal',
        userId,
        read: false,
        escalationLevel: 0,
        actionButtons: [
          {
            id: 'acknowledge',
            label: 'Acknowledge',
            type: 'secondary',
            actionType: 'api',
            target: '/api/notifications/acknowledge'
          }
        ],
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      }
    );

    // Role-specific notifications
    if (authStore.isWorker) {
      mockNotifications.push(
        {
          id: 'notif3',
          title: 'New Work Order Assigned',
          message: 'WO-001: Generator Maintenance has been assigned to you. Please start the work before the due date.',
          type: 'info',
          category: 'work_order',
          priority: 'high',
          userId,
          read: false,
          escalationLevel: 0,
          actionUrl: '/work-orders/wo1',
          actionButtons: [
            {
              id: 'view_work_order',
              label: 'View Details',
              type: 'primary',
              actionType: 'route',
              target: '/work-orders/wo1'
            },
            {
              id: 'start_work',
              label: 'Start Work',
              type: 'secondary',
              actionType: 'api',
              target: '/api/work-orders/wo1/start',
              requireConfirmation: true,
              confirmationMessage: 'Are you ready to start this work order?'
            }
          ],
          relatedEntity: { type: 'work_order', id: 'wo1' },
          metadata: {
            workOrderTitle: 'Generator Maintenance',
            terminalId: 'terminal1',
            priority: 'high'
          },
          createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 'notif4',
          title: 'Work Order Due Soon',
          message: 'WO-002: Pump Inspection is due in 2 hours. Please complete as soon as possible.',
          type: 'warning',
          category: 'work_order',
          priority: 'urgent',
          userId,
          read: false,
          escalationLevel: 1,
          escalatedAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
          actionUrl: '/work-orders/wo2',
          actionButtons: [
            {
              id: 'view_urgent',
              label: 'View Urgent Task',
              type: 'danger',
              actionType: 'route',
              target: '/work-orders/wo2'
            }
          ],
          relatedEntity: { type: 'work_order', id: 'wo2' },
          metadata: {
            workOrderTitle: 'Pump Inspection',
            dueDate: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            overdueSoon: true
          },
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
          category: 'work_order',
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
          category: 'inventory',
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
          category: 'invoice',
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
        message: `${workOrderTitle} has been assigned to you. Please review the details and start when ready.`,
        type: 'info',
        category: 'work_order',
        priority: 'high',
        actionUrl: `/work-orders/${workOrderId}`,
        actionButtons: [
          {
            id: 'view_assignment',
            label: 'View Assignment',
            type: 'primary',
            actionType: 'route',
            target: `/work-orders/${workOrderId}`
          },
          {
            id: 'start_work',
            label: 'Start Work',
            type: 'secondary',
            actionType: 'api',
            target: `/api/work-orders/${workOrderId}/start`,
            requireConfirmation: true,
            confirmationMessage: 'Are you ready to start this work order?'
          }
        ],
        relatedEntity: { type: 'work_order', id: workOrderId },
        metadata: {
          workOrderTitle,
          assignedBy: 'supervisor'
        }
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
    settings,
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
    loadSettings,
    updateSettings,
    executeNotificationAction,
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