<template>
  <div v-if="priorityMessages.length > 0" class="space-y-3">
    <div class="flex items-center">
      <AlertTriangleIcon class="h-4 w-4 mr-2 text-orange-500" />
      <h3 class="text-sm font-medium">Priority Messages</h3>
      <Badge variant="destructive" class="ml-2">
        {{ priorityMessages.length }}
      </Badge>
    </div>

    <div class="space-y-2">
      <Alert
        v-for="message in priorityMessages.slice(0, 3)"
        :key="message.id"
        :variant="message.priority === 'urgent' ? 'destructive' : 'default'"
        class="cursor-pointer transition-colors hover:bg-accent"
        @click="handleMessageClick(message)"
      >
        <component :is="getMessageIcon(message)" class="h-4 w-4" />
        <AlertTitle class="flex items-center">
          {{ message.subject }}
          <Badge
            v-if="message.category"
            variant="outline"
            class="ml-2"
            :title="`Category: ${formatCategory(message.category)}`"
          >
            {{ formatCategory(message.category) }}
          </Badge>
        </AlertTitle>
        <AlertDescription class="space-y-2">
          <p class="line-clamp-2">{{ message.content }}</p>
          <div class="flex items-center justify-between text-xs">
            <span class="text-muted-foreground">{{ formatTime(message.createdAt) }}</span>
            <Badge variant="secondary">{{ formatPriority(message.priority) }}</Badge>
          </div>

          <!-- Quick Actions -->
          <div v-if="message.actionButtons && message.actionButtons.length > 0" class="flex gap-2 pt-2">
            <Button
              v-for="action in message.actionButtons.slice(0, 2)"
              :key="action.id"
              size="sm"
              :variant="action.type === 'primary' ? 'default' : action.type === 'danger' ? 'destructive' : 'secondary'"
              @click.stop="handleActionClick(message.id, action.id)"
            >
              {{ action.label }}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      
      <!-- Show more messages indicator -->
      <div v-if="priorityMessages.length > 3" class="text-center">
        <Button variant="link" as-child size="sm">
          <router-link to="/inbox">
            {{ priorityMessages.length - 3 }} more priority message{{ priorityMessages.length - 3 !== 1 ? 's' : '' }}
          </router-link>
        </Button>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div v-else-if="recentMessages.length > 0" class="space-y-3">
    <div class="flex items-center">
      <ClockIcon class="h-4 w-4 mr-2 text-blue-500" />
      <h3 class="text-sm font-medium">Recent Messages</h3>
    </div>

    <div class="space-y-2">
      <Card
        v-for="message in recentMessages.slice(0, 3)"
        :key="message.id"
        class="cursor-pointer transition-colors hover:bg-accent"
        @click="handleMessageClick(message)"
      >
        <CardContent class="p-3">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium truncate">{{ message.subject }}</h4>
              <p class="text-xs text-muted-foreground mt-1 truncate">{{ message.content }}</p>
              <span class="text-xs text-muted-foreground">{{ formatTime(message.createdAt) }}</span>
            </div>
            <component
              :is="getMessageIcon(message)"
              class="h-4 w-4 ml-3 flex-shrink-0"
              :class="getIconColor(message.category)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- No messages -->
  <Alert v-else>
    <CheckCircleIcon class="h-4 w-4" />
    <AlertTitle>All caught up!</AlertTitle>
    <AlertDescription>No pending messages</AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useMessageStore } from '@/stores/message';
import type { Message } from '@/types';
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
  ClipboardList as WorkOrderIcon,
  Package as InventoryIcon,
  FileText as InvoiceIcon,
  User as UserIcon,
  Settings as SystemIcon
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const messageStore = useMessageStore();

const unreadMessages = computed(() => 
  messageStore.inboxMessages.filter(message => 
    !message.readBy.some(read => read.userId === authStore.currentUser?.id)
  )
);

const priorityMessages = computed(() => 
  unreadMessages.value.filter(message => 
    message.priority === 'high' || message.priority === 'urgent'
  ).slice(0, 5)
);

const recentMessages = computed(() => 
  unreadMessages.value.filter(message =>
    message.type === 'system_notification'
  ).slice(0, 5)
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

const formatPriority = (priority: string) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const getMessageIcon = (message: Message) => {
  // Icon based on category first, then priority/type
  if (message.category) {
    const icons = {
      work_order: WorkOrderIcon,
      inventory: InventoryIcon,
      invoice: InvoiceIcon,
      user: UserIcon,
      system: SystemIcon,
      emergency: AlertTriangleIcon
    };
    return icons[message.category as keyof typeof icons] || SystemIcon;
  }
  
  // Fallback to priority-based icons
  if (message.priority === 'urgent') return AlertTriangleIcon;
  if (message.priority === 'high') return WarningIcon;
  return InfoIcon;
};

const getIconColor = (category?: string) => {
  if (!category) return 'text-blue-500';
  
  const colors = {
    work_order: 'text-blue-500',
    inventory: 'text-green-500',
    invoice: 'text-purple-500',
    user: 'text-gray-500',
    system: 'text-gray-500',
    emergency: 'text-red-500'
  };
  return colors[category as keyof typeof colors] || 'text-blue-500';
};

const handleMessageClick = (message: Message) => {
  // Mark as read
  messageStore.markAsRead([message.id]);
  
  // Navigate to related page if available
  if (message.relatedEntity) {
    const { type, id } = message.relatedEntity;
    const routes = {
      work_order: `/work-orders/${id}`,
      inventory: `/inventory/${id}`,
      invoice: `/invoices/${id}`,
      user: `/inbox`
    };
    const route = routes[type as keyof typeof routes];
    if (route) {
      router.push(route);
      return;
    }
  }
  
  // Default to inbox
  router.push('/inbox');
};

const handleActionClick = async (messageId: string, actionId: string) => {
  try {
    const result = await messageStore.executeMessageAction(messageId, actionId);
    if (result.success && messageStore.messages.find(m => m.id === messageId)?.actionButtons?.find(a => a.id === actionId)?.actionType === 'route') {
      const action = messageStore.messages.find(m => m.id === messageId)?.actionButtons?.find(a => a.id === actionId);
      if (action?.target) {
        router.push(action.target);
      }
    }
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