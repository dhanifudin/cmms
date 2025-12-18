<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    <Transition
      v-for="notification in visibleNotifications"
      :key="notification.id"
      name="toast"
      appear
    >
      <div
        class="bg-white rounded-lg shadow-lg border-l-4 p-4 min-w-80"
        :class="getBorderColor(notification.type)"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component
              :is="getIcon(notification.type)"
              class="h-5 w-5"
              :class="getIconColor(notification.type)"
            />
          </div>
          
          <div class="ml-3 flex-1">
            <h4 class="text-sm font-medium text-gray-900">
              {{ notification.title }}
            </h4>
            <p class="text-sm text-gray-700 mt-1">
              {{ notification.message }}
            </p>
            
            <div v-if="notification.actionUrl" class="mt-2">
              <router-link
                :to="notification.actionUrl"
                @click="handleActionClick(notification)"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </router-link>
            </div>
          </div>
          
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="dismissNotification(notification.id)"
              class="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span class="sr-only">Close</span>
              <XIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <!-- Auto-dismiss progress bar -->
        <div
          v-if="getAutoDismissTime(notification) > 0"
          class="mt-2 w-full bg-gray-200 rounded-full h-1"
        >
          <div
            class="h-1 rounded-full transition-all duration-75 ease-linear"
            :class="getProgressBarColor(notification.type)"
            :style="`width: ${getProgress(notification.id)}%`"
          ></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import type { Notification } from '@/types';
import {
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  AlertTriangle as WarningIcon,
  XCircle as ErrorIcon,
  X as XIcon
} from 'lucide-vue-next';

const notificationStore = useNotificationStore();

const dismissTimers = ref<Map<string, number>>(new Map());
const progressTimers = ref<Map<string, number>>(new Map());
const progressValues = ref<Map<string, number>>(new Map());

const visibleNotifications = computed(() => 
  notificationStore.unreadNotifications.slice(0, 5) // Show max 5 notifications
);

onMounted(() => {
  // Setup auto-dismiss timers for visible notifications
  visibleNotifications.value.forEach(notification => {
    setupAutoDismiss(notification);
  });
});

onUnmounted(() => {
  // Clear all timers
  dismissTimers.value.forEach(timer => clearTimeout(timer));
  progressTimers.value.forEach(timer => clearInterval(timer));
});

const getIcon = (type: string) => {
  const icons = {
    success: CheckIcon,
    info: InfoIcon,
    warning: WarningIcon,
    error: ErrorIcon
  };
  return icons[type as keyof typeof icons] || InfoIcon;
};

const getIconColor = (type: string) => {
  const colors = {
    success: 'text-green-500',
    info: 'text-blue-500',
    warning: 'text-orange-500',
    error: 'text-red-500'
  };
  return colors[type as keyof typeof colors] || 'text-blue-500';
};

const getBorderColor = (type: string) => {
  const colors = {
    success: 'border-green-500',
    info: 'border-blue-500',
    warning: 'border-orange-500',
    error: 'border-red-500'
  };
  return colors[type as keyof typeof colors] || 'border-blue-500';
};

const getProgressBarColor = (type: string) => {
  const colors = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-orange-500',
    error: 'bg-red-500'
  };
  return colors[type as keyof typeof colors] || 'bg-blue-500';
};

const getAutoDismissTime = (notification: Notification) => {
  // Don't auto-dismiss if it has an action URL or is an error/warning
  if (notification.actionUrl || notification.type === 'error' || notification.type === 'warning') {
    return 0;
  }
  
  // Auto-dismiss info and success notifications
  return notification.type === 'success' ? 4000 : 6000;
};

const setupAutoDismiss = (notification: Notification) => {
  const autoDismissTime = getAutoDismissTime(notification);
  
  if (autoDismissTime > 0) {
    // Setup progress tracking
    progressValues.value.set(notification.id, 0);
    
    const progressInterval = setInterval(() => {
      const currentProgress = progressValues.value.get(notification.id) || 0;
      const newProgress = currentProgress + (100 / (autoDismissTime / 100));
      
      if (newProgress >= 100) {
        clearInterval(progressInterval);
        progressTimers.value.delete(notification.id);
        dismissNotification(notification.id);
      } else {
        progressValues.value.set(notification.id, newProgress);
      }
    }, 100);
    
    progressTimers.value.set(notification.id, progressInterval);
    
    // Setup auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      dismissNotification(notification.id);
    }, autoDismissTime);
    
    dismissTimers.value.set(notification.id, dismissTimer);
  }
};

const getProgress = (notificationId: string) => {
  return progressValues.value.get(notificationId) || 0;
};

const dismissNotification = (notificationId: string) => {
  // Clear timers
  const dismissTimer = dismissTimers.value.get(notificationId);
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimers.value.delete(notificationId);
  }
  
  const progressTimer = progressTimers.value.get(notificationId);
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimers.value.delete(notificationId);
  }
  
  progressValues.value.delete(notificationId);
  
  // Mark as read
  notificationStore.markAsRead([notificationId]);
};

const handleActionClick = (notification: Notification) => {
  dismissNotification(notification.id);
  // Router navigation is handled by the router-link
};

// Watch for new notifications and setup auto-dismiss
const setupNewNotifications = () => {
  visibleNotifications.value.forEach(notification => {
    if (!dismissTimers.value.has(notification.id) && !notification.read) {
      setupAutoDismiss(notification);
    }
  });
};

// Setup watcher for new notifications
let lastNotificationCount = visibleNotifications.value.length;
setInterval(() => {
  if (visibleNotifications.value.length > lastNotificationCount) {
    setupNewNotifications();
  }
  lastNotificationCount = visibleNotifications.value.length;
}, 1000);
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>