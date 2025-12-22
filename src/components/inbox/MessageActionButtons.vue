<template>
  <div class="action-buttons mt-4 pt-4 border-t border-gray-200">
    <h4 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
    
    <div class="flex flex-wrap gap-2">
      <button
        v-for="action in actionButtons"
        :key="action.id"
        @click="handleActionClick(action)"
        class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:scale-105"
        :class="getActionButtonClass(action.type)"
      >
        <!-- Gaming-style icons -->
        <component
          v-if="getActionIcon(action)"
          :is="getActionIcon(action)"
          class="h-4 w-4 mr-2"
        />
        
        {{ action.label }}
        
        <!-- Gaming-style badge for primary actions -->
        <span
          v-if="action.type === 'primary'"
          class="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white bg-opacity-30"
        >
          ⚡
        </span>
      </button>
    </div>
    
    <!-- Gaming-style action description -->
    <div class="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
      <p class="text-sm text-blue-700">
        <span class="font-medium">Action Center:</span>
        Select an action to continue your administrative tasks. Primary actions will perform the main workflow.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { MessageAction } from '@/types';
import {
  Plus as PlusIcon,
  Eye as EyeIcon,
  Calendar as CalendarIcon,
  ExternalLink as ExternalLinkIcon,
  Zap as ZapIcon
} from 'lucide-vue-next';

interface Props {
  actionButtons: MessageAction[];
  messageId: string;
}

interface ActionResult {
  success: boolean;
  error?: any;
}

interface Emits {
  actionExecuted: [actionId: string, result: ActionResult];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();

// Action button styling based on type
const getActionButtonClass = (type: string) => {
  const baseClasses = 'border focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  switch (type) {
    case 'primary':
      return `${baseClasses} bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-md`;
    case 'secondary':
      return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500`;
    case 'danger':
      return `${baseClasses} bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500 shadow-md`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 focus:ring-gray-500`;
  }
};

// Gaming-style icons for different action types
const getActionIcon = (action: MessageAction) => {
  if (action.label.toLowerCase().includes('create')) {
    return PlusIcon;
  }
  if (action.label.toLowerCase().includes('view')) {
    return EyeIcon;
  }
  if (action.label.toLowerCase().includes('schedule')) {
    return CalendarIcon;
  }
  if (action.label.toLowerCase().includes('deploy')) {
    return ZapIcon;
  }
  return ExternalLinkIcon;
};

// Handle action button clicks
const handleActionClick = async (action: MessageAction) => {
  try {
    // Show confirmation if required
    if (action.requireConfirmation) {
      const confirmed = confirm(
        action.confirmationMessage || 'Are you sure you want to perform this action?'
      );
      if (!confirmed) {
        return;
      }
    }

    let result: ActionResult = { success: true };

    // Handle different action types
    switch (action.actionType) {
      case 'route':
        // Navigate to specified route
        await router.push(action.target);
        break;
        
      case 'api':
        // Make API call (simulated for now)
        console.log('API call to:', action.target);
        // In real implementation: await fetch(action.target, { method: 'POST' });
        break;
        
      case 'modal':
        // Open modal (emit event for parent to handle)
        console.log('Open modal:', action.target);
        // In real implementation: emit modal open event
        break;
        
      default:
        console.warn('Unknown action type:', action.actionType);
        result = { success: false, error: 'Unknown action type' };
    }

    // Emit action executed event
    emit('actionExecuted', action.id, result);
    
    // Gaming-style success feedback
    if (result.success) {
      console.log(`🎮 Action "${action.label}" completed successfully!`);
    }

  } catch (error) {
    console.error('Action execution failed:', error);
    emit('actionExecuted', action.id, { success: false, error });
  }
};
</script>

<style scoped>
/* Gaming-style button hover effects */
.action-buttons button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-buttons button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Gaming-style primary button glow effect */
.action-buttons button.bg-blue-600:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Responsive design */
@media (max-width: 640px) {
  .action-buttons .flex {
    flex-direction: column;
  }
  
  .action-buttons button {
    width: 100%;
    justify-content: center;
  }
}
</style>