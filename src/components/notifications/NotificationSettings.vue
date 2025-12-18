<template>
  <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>
    
    <div v-if="!settings" class="text-center py-8">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading settings...
      </div>
    </div>

    <form v-else @submit.prevent="saveSettings" class="space-y-8">
      <!-- Notification Categories -->
      <div>
        <h3 class="text-base font-medium text-gray-900 mb-4">Notification Categories</h3>
        <p class="text-sm text-gray-600 mb-4">Choose which types of notifications you want to receive.</p>
        
        <div class="space-y-3">
          <div
            v-for="(_, category) in localSettings?.categories"
            :key="category"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="flex items-center">
                <component :is="getCategoryIcon(category)" class="h-4 w-4 mr-3 text-gray-500" />
                <span class="font-medium text-gray-900 capitalize">{{ formatCategoryName(category) }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ getCategoryDescription(category) }}</p>
            </div>
            
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="localSettings!.categories[category]"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Priority Levels -->
      <div>
        <h3 class="text-base font-medium text-gray-900 mb-4">Priority Levels</h3>
        <p class="text-sm text-gray-600 mb-4">Select which priority levels you want to receive notifications for.</p>
        
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="(_, priority) in localSettings?.priorities"
            :key="priority"
            class="flex items-center justify-between p-3 border rounded-lg"
            :class="{
              'border-gray-200 bg-gray-50': !localSettings?.priorities?.[priority],
              'border-blue-200 bg-blue-50': localSettings?.priorities?.[priority]
            }"
          >
            <div class="flex items-center">
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3"
                :class="getPriorityColor(priority)"
              >
                {{ priority.toUpperCase() }}
              </span>
            </div>
            
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="localSettings!.priorities[priority]"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Delivery Channels -->
      <div>
        <h3 class="text-base font-medium text-gray-900 mb-4">Delivery Channels</h3>
        <p class="text-sm text-gray-600 mb-4">Choose how you want to receive notifications.</p>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span class="font-medium text-gray-900">In-App Notifications</span>
              <p class="text-xs text-gray-500">Show notifications within the application</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="localSettings!.deliveryChannels.inApp"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span class="font-medium text-gray-900">Inbox Messages</span>
              <p class="text-xs text-gray-500">Send notifications to your inbox as messages</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="localSettings!.deliveryChannels.inbox"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Quiet Hours -->
      <div>
        <h3 class="text-base font-medium text-gray-900 mb-4">Quiet Hours</h3>
        <p class="text-sm text-gray-600 mb-4">Set times when you don't want to receive notifications (except urgent ones).</p>
        
        <div class="space-y-4">
          <label class="flex items-center">
            <input
              v-model="localSettings!.quietHours!.enabled"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm font-medium text-gray-900">Enable Quiet Hours</span>
          </label>
          
          <div v-if="localSettings?.quietHours?.enabled" class="grid grid-cols-2 gap-4 pl-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                v-model="localSettings!.quietHours!.startTime"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                v-model="localSettings!.quietHours!.endTime"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Escalation Settings -->
      <div>
        <h3 class="text-base font-medium text-gray-900 mb-4">Escalation Settings</h3>
        <p class="text-sm text-gray-600 mb-4">Automatically increase notification priority for unread important notifications.</p>
        
        <div class="space-y-4">
          <label class="flex items-center">
            <input
              v-model="localSettings!.escalationSettings.enabled"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm font-medium text-gray-900">Enable Automatic Escalation</span>
          </label>
          
          <div v-if="localSettings?.escalationSettings?.enabled" class="grid grid-cols-2 gap-4 pl-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Escalation Delay (minutes)</label>
              <input
                v-model.number="localSettings!.escalationSettings.delayMinutes"
                type="number"
                min="5"
                max="120"
                step="5"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Maximum Escalation Level</label>
              <select
                v-model.number="localSettings!.escalationSettings.maxLevel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option :value="1">Level 1</option>
                <option :value="2">Level 2</option>
                <option :value="3">Level 3</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Sound Settings -->
      <div>
        <h3 class="text-base font-medium text-gray-900 mb-4">Sound Notifications</h3>
        <p class="text-sm text-gray-600 mb-4">Configure audio alerts for notifications.</p>
        
        <div class="space-y-4">
          <label class="flex items-center">
            <input
              v-model="localSettings!.sounds.enabled"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm font-medium text-gray-900">Enable Sound Notifications</span>
          </label>
          
          <div v-if="localSettings?.sounds?.enabled" class="pl-6">
            <label class="flex items-center">
              <input
                v-model="localSettings!.sounds.highPriorityOnly"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span class="ml-2 text-sm text-gray-700">Only for high priority notifications</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="resetToDefaults"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset to Defaults
        </button>
        
        <div class="flex space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="isSaving">Saving...</span>
            <span v-else>Save Settings</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import type { NotificationSettings, NotificationCategory } from '@/types';
import {
  Briefcase as WorkIcon,
  Package as InventoryIcon,
  FileText as InvoiceIcon,
  MessageSquare as CommunicationIcon,
  Settings as SystemIcon,
  AlertTriangle as EmergencyIcon
} from 'lucide-vue-next';

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const notificationStore = useNotificationStore();
const isSaving = ref(false);

const settings = computed(() => notificationStore.settings);
const localSettings = ref<NotificationSettings | null>(null);

onMounted(async () => {
  if (settings.value) {
    localSettings.value = JSON.parse(JSON.stringify(settings.value));
  }
});

watch(settings, (newSettings) => {
  if (newSettings && !localSettings.value) {
    localSettings.value = JSON.parse(JSON.stringify(newSettings));
  }
}, { immediate: true });

const getCategoryIcon = (category: string) => {
  const icons = {
    work_order: WorkIcon,
    inventory: InventoryIcon,
    invoice: InvoiceIcon,
    communication: CommunicationIcon,
    system: SystemIcon,
    emergency: EmergencyIcon
  };
  return icons[category as keyof typeof icons] || SystemIcon;
};

const formatCategoryName = (category: string) => {
  return category.replace('_', ' ');
};

const getCategoryDescription = (category: NotificationCategory) => {
  const descriptions = {
    work_order: 'Assignments, completions, and status updates',
    inventory: 'Low stock alerts and inventory changes',
    invoice: 'Invoice generation and payment updates',
    communication: 'Messages and comments from other users',
    system: 'System maintenance and configuration changes',
    emergency: 'Critical alerts and emergency notifications'
  };
  return descriptions[category];
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

const resetToDefaults = () => {
  if (!settings.value) return;
  
  const confirmed = confirm('Are you sure you want to reset all notification settings to defaults? This cannot be undone.');
  if (confirmed && settings.value) {
    localSettings.value = JSON.parse(JSON.stringify(settings.value));
    
    // Reset to role-based defaults
    if (localSettings.value) {
      localSettings.value.categories = {
        work_order: true,
        inventory: true,
        invoice: true,
        communication: true,
        system: true,
        emergency: true
      };
      
      localSettings.value.priorities = {
        low: true,
        normal: true,
        high: true,
        urgent: true
      };
      
      localSettings.value.quietHours!.enabled = false;
      localSettings.value.escalationSettings.enabled = true;
      localSettings.value.sounds.enabled = true;
      localSettings.value.sounds.highPriorityOnly = true;
    }
  }
};

const saveSettings = async () => {
  if (!localSettings.value) return;
  
  isSaving.value = true;
  
  try {
    await notificationStore.updateSettings(localSettings.value);
    emit('saved');
    emit('close');
  } catch (error) {
    console.error('Failed to save notification settings:', error);
    alert('Failed to save settings. Please try again.');
  } finally {
    isSaving.value = false;
  }
};
</script>