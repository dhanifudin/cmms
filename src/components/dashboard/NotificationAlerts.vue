<template>
  <div v-if="priorityAlerts.length > 0" class="space-y-3">
    <div class="flex items-center">
      <AlertTriangleIcon class="h-4 w-4 mr-2 text-orange-500" />
      <h3 class="text-sm font-medium">Priority Alerts</h3>
      <Badge variant="destructive" class="ml-2">
        {{ priorityAlerts.length }}
      </Badge>
    </div>

    <div class="space-y-2">
      <Alert
        v-for="alert in priorityAlerts.slice(0, 3)"
        :key="alert.id"
        :variant="alert.priority === 'urgent' ? 'destructive' : 'default'"
        class="cursor-pointer transition-colors hover:bg-accent"
        @click="handleAlertClick(alert)"
      >
        <component :is="getAlertIcon(alert.type)" class="h-4 w-4" />
        <AlertTitle class="flex items-center">
          {{ alert.title }}
          <Badge
            v-if="alert.escalationLevel && alert.escalationLevel > 0"
            variant="outline"
            class="ml-2"
            :title="`Escalated ${alert.escalationLevel} times`"
          >
            ⚡{{ alert.escalationLevel }}
          </Badge>
        </AlertTitle>
        <AlertDescription class="space-y-2">
          <p class="line-clamp-2">{{ alert.message }}</p>
          <div class="flex items-center justify-between text-xs">
            <span class="text-muted-foreground">{{ formatTime(alert.createdAt) }}</span>
            <Badge variant="secondary">{{ formatCategory(alert.category) }}</Badge>
          </div>

          <!-- Quick Actions -->
          <div v-if="alert.actionButtons && alert.actionButtons.length > 0" class="flex gap-2 pt-2">
            <Button
              v-for="action in alert.actionButtons.slice(0, 2)"
              :key="action.id"
              size="sm"
              :variant="action.type === 'primary' ? 'default' : action.type === 'danger' ? 'destructive' : 'secondary'"
              @click.stop="handleActionClick(alert.id, action.id)"
            >
              {{ action.label }}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      
      <!-- Show more alerts indicator -->
      <div v-if="priorityAlerts.length > 3" class="text-center">
        <Button variant="link" as-child size="sm">
          <router-link to="/inbox">
            {{ priorityAlerts.length - 3 }} more priority alert{{ priorityAlerts.length - 3 !== 1 ? 's' : '' }}
          </router-link>
        </Button>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div v-else-if="recentNotifications.length > 0" class="space-y-3">
    <div class="flex items-center">
      <ClockIcon class="h-4 w-4 mr-2 text-blue-500" />
      <h3 class="text-sm font-medium">Recent Activity</h3>
    </div>

    <div class="space-y-2">
      <Card
        v-for="notification in recentNotifications.slice(0, 3)"
        :key="notification.id"
        class="cursor-pointer transition-colors hover:bg-accent"
        @click="handleAlertClick(notification)"
      >
        <CardContent class="p-3">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium truncate">{{ notification.title }}</h4>
              <p class="text-xs text-muted-foreground mt-1 truncate">{{ notification.message }}</p>
              <span class="text-xs text-muted-foreground">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <component
              :is="getAlertIcon(notification.type)"
              class="h-4 w-4 ml-3 flex-shrink-0"
              :class="getIconColor(notification.type)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- No notifications -->
  <Alert v-else>
    <CheckCircleIcon class="h-4 w-4" />
    <AlertTitle>All caught up!</AlertTitle>
    <AlertDescription>No pending notifications</AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import type { Notification } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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