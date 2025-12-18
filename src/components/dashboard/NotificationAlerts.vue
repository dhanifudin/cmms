<template>
  <div v-if="priorityAlerts.length > 0" class="space-y-3">
    <h3 class="text-sm font-medium text-gray-900 flex items-center">
      <AlertTriangleIcon class="h-4 w-4 mr-2 text-orange-500" />
      Priority Alerts
      <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        {{ priorityAlerts.length }}
      </span>
    </h3>
    
    <div class="space-y-2">
      <div
        v-for="alert in priorityAlerts.slice(0, 3)"
        :key="alert.id"
        class="p-3 rounded-lg border-l-4 cursor-pointer transition-colors"
        :class="{
          'border-l-orange-500 bg-orange-50 hover:bg-orange-100': alert.priority === 'high',
          'border-l-red-500 bg-red-50 hover:bg-red-100': alert.priority === 'urgent'
        }"
        @click="handleAlertClick(alert)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center">
              <h4 class="text-sm font-medium text-gray-900 truncate">
                {{ alert.title }}
              </h4>
              <span
                v-if="alert.escalationLevel && alert.escalationLevel > 0"
                class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                :title="`Escalated ${alert.escalationLevel} times`"
              >
                ⚡{{ alert.escalationLevel }}
              </span>
            </div>
            <p class="text-xs text-gray-600 mt-1 line-clamp-2">
              {{ alert.message }}
            </p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-500">
                {{ formatTime(alert.createdAt) }}
              </span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="getCategoryColor(alert.category)"
              >
                {{ formatCategory(alert.category) }}
              </span>
            </div>
          </div>
          
          <div class="ml-3 flex-shrink-0">
            <component
              :is="getAlertIcon(alert.type)"
              class="h-4 w-4"
              :class="getIconColor(alert.type)"
            />
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div v-if="alert.actionButtons && alert.actionButtons.length > 0" class="mt-3 flex space-x-2">
          <button
            v-for="action in alert.actionButtons.slice(0, 2)"
            :key="action.id"
            @click.stop="handleActionClick(alert.id, action.id)"
            class="text-xs px-2 py-1 rounded transition-colors"
            :class="{
              'bg-blue-600 text-white hover:bg-blue-700': action.type === 'primary',
              'bg-gray-100 text-gray-700 hover:bg-gray-200': action.type === 'secondary',
              'bg-red-100 text-red-700 hover:bg-red-200': action.type === 'danger'
            }"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- Show more alerts indicator -->
      <div v-if="priorityAlerts.length > 3" class="text-center">
        <router-link
          to="/inbox"
          class="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {{ priorityAlerts.length - 3 }} more priority alert{{ priorityAlerts.length - 3 !== 1 ? 's' : '' }}
        </router-link>
      </div>
    </div>
  </div>
  
  <!-- Recent Activity -->
  <div v-else-if="recentNotifications.length > 0" class="space-y-3">
    <h3 class="text-sm font-medium text-gray-900 flex items-center">
      <ClockIcon class="h-4 w-4 mr-2 text-blue-500" />
      Recent Activity
    </h3>
    
    <div class="space-y-2">
      <div
        v-for="notification in recentNotifications.slice(0, 3)"
        :key="notification.id"
        class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        @click="handleAlertClick(notification)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 truncate">
              {{ notification.title }}
            </h4>
            <p class="text-xs text-gray-600 mt-1 truncate">
              {{ notification.message }}
            </p>
            <span class="text-xs text-gray-500">
              {{ formatTime(notification.createdAt) }}
            </span>
          </div>
          <component
            :is="getAlertIcon(notification.type)"
            class="h-4 w-4 ml-3 flex-shrink-0"
            :class="getIconColor(notification.type)"
          />
        </div>
      </div>
    </div>
  </div>
  
  <!-- No notifications -->
  <div v-else class="text-center py-6">
    <CheckCircleIcon class="h-8 w-8 text-green-500 mx-auto mb-2" />
    <p class="text-sm text-gray-600">All caught up!</p>
    <p class="text-xs text-gray-500">No pending notifications</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import type { Notification } from '@/types';
import {
  AlertTriangle as AlertTriangleIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  AlertCircle as WarningIcon,
  XCircle as ErrorIcon,
  CheckCircle as SuccessIcon
} from 'lucide-vue-next';

const router = useRouter();
const notificationStore = useNotificationStore();

const priorityAlerts = computed(() => 
  notificationStore.notifications.filter(n => 
    !n.read && (n.priority === 'high' || n.priority === 'urgent')
  ).slice(0, 5)
);

const recentNotifications = computed(() => 
  notificationStore.notifications.filter(n => !n.read).slice(0, 5)
);

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const formatCategory = (category: string) => {
  return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getCategoryColor = (category: string) => {
  const colors = {
    work_order: 'bg-blue-100 text-blue-800',
    inventory: 'bg-green-100 text-green-800',
    invoice: 'bg-purple-100 text-purple-800',
    communication: 'bg-indigo-100 text-indigo-800',
    system: 'bg-gray-100 text-gray-800',
    emergency: 'bg-red-100 text-red-800'
  };
  return colors[category as keyof typeof colors] || colors.system;
};

const getAlertIcon = (type: string) => {
  const icons = {
    success: SuccessIcon,
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

const handleAlertClick = (notification: Notification) => {
  // Mark as read
  notificationStore.markAsRead([notification.id]);
  
  // Navigate to related page if available
  if (notification.actionUrl) {
    router.push(notification.actionUrl);
  }
};

const handleActionClick = async (notificationId: string, actionId: string) => {
  try {
    await notificationStore.executeNotificationAction(notificationId, actionId);
  } catch (error) {
    console.error('Failed to execute action:', error);
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>