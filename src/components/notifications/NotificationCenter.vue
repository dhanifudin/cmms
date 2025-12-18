<template>
  <div class="relative">
    <!-- Notification Bell Button -->
    <button
      @click="toggleDropdown"
      class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full relative focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <BellIcon class="w-5 h-5" />
      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full"
      >
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Transition
      name="dropdown"
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
            <div class="flex items-center space-x-2">
              <button
                v-if="notificationStore.unreadCount > 0"
                @click="markAllAsRead"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
              <button
                @click="closeDropdown"
                class="text-gray-400 hover:text-gray-600"
              >
                <XIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <!-- Filter Tabs -->
          <div class="mt-3 flex space-x-1">
            <button
              v-for="tab in filterTabs"
              :key="tab.id"
              @click="activeFilter = tab.id"
              class="px-3 py-1 text-sm font-medium rounded-md transition-colors"
              :class="activeFilter === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            >
              {{ tab.label }}
              <span
                v-if="tab.count > 0"
                class="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none rounded-full"
                :class="activeFilter === tab.id
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-200 text-gray-600'"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="filteredNotifications.length === 0" class="p-6 text-center text-gray-500">
            <BellIcon class="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications found</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              :class="{ 'bg-blue-50': !notification.read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <component
                    :is="getIcon(notification.type)"
                    class="h-5 w-5"
                    :class="getIconColor(notification.type)"
                  />
                </div>
                
                <div class="ml-3 flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <h4
                      class="text-sm font-medium text-gray-900 truncate"
                      :class="{ 'font-semibold': !notification.read }"
                    >
                      {{ notification.title }}
                    </h4>
                    <div class="flex items-center space-x-2 ml-2">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="getPriorityColor(notification.priority)"
                      >
                        {{ notification.priority }}
                      </span>
                      <div
                        v-if="!notification.read"
                        class="h-2 w-2 rounded-full bg-blue-600"
                      ></div>
                    </div>
                  </div>
                  
                  <p class="text-sm text-gray-600 mt-1">
                    {{ notification.message }}
                  </p>
                  
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">
                      {{ formatTime(notification.createdAt) }}
                    </span>
                    
                    <div class="flex items-center space-x-1">
                      <button
                        v-if="notification.actionUrl"
                        @click.stop="navigateToAction(notification)"
                        class="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                      
                      <button
                        @click.stop="dismissNotification(notification.id)"
                        class="text-xs text-gray-400 hover:text-gray-600"
                      >
                        <XIcon class="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div class="flex items-center justify-between">
            <button
              @click="clearAllRead"
              class="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear read notifications
            </button>
            
            <router-link
              to="/inbox"
              @click="closeDropdown"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all in Inbox →
            </router-link>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import type { Notification } from '@/types';
import {
  Bell as BellIcon,
  X as XIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  AlertTriangle as WarningIcon,
  XCircle as ErrorIcon
} from 'lucide-vue-next';

const router = useRouter();
const notificationStore = useNotificationStore();

const isOpen = ref(false);
const activeFilter = ref<string>('all');

const filterTabs = computed(() => [
  {
    id: 'all',
    label: 'All',
    count: notificationStore.notifications.length
  },
  {
    id: 'unread',
    label: 'Unread',
    count: notificationStore.unreadCount
  },
  {
    id: 'priority',
    label: 'Priority',
    count: notificationStore.priorityNotifications.length
  }
]);

const filteredNotifications = computed(() => {
  const notifications = notificationStore.recentNotifications;
  
  switch (activeFilter.value) {
    case 'unread':
      return notifications.filter(n => !n.read);
    case 'priority':
      return notifications.filter(n => n.priority === 'high' || n.priority === 'urgent');
    default:
      return notifications;
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown();
  }
};

const handleNotificationClick = (notification: Notification) => {
  if (!notification.read) {
    notificationStore.markAsRead([notification.id]);
  }
  
  if (notification.actionUrl) {
    navigateToAction(notification);
  }
};

const navigateToAction = (notification: Notification) => {
  if (notification.actionUrl) {
    router.push(notification.actionUrl);
    closeDropdown();
  }
};

const dismissNotification = (notificationId: string) => {
  notificationStore.removeNotification(notificationId);
};

const markAllAsRead = () => {
  const unreadIds = notificationStore.unreadNotifications.map(n => n.id);
  notificationStore.markAsRead(unreadIds);
};

const clearAllRead = () => {
  notificationStore.clearRead();
};

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

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600'
  };
  return colors[priority as keyof typeof colors] || colors.normal;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
  
  if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>