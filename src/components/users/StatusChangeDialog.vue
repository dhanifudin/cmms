<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle>Change User Status</DialogTitle>
      <DialogDescription>
        Update {{ user.name }}'s account status. This action will be logged in the audit trail.
      </DialogDescription>
    </DialogHeader>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Current Status -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <Label class="text-gray-600">Current Status</Label>
            <div class="flex items-center space-x-2 mt-1">
              <Badge :variant="getStatusBadgeVariant(user.status)">
                {{ user.status }}
              </Badge>
              <span class="text-sm text-gray-600">
                since {{ formatDate(user.updatedAt || user.createdAt) }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <Label class="text-gray-600">User</Label>
            <p class="font-medium">{{ user.name }}</p>
            <p class="text-sm text-gray-600">{{ user.email }}</p>
          </div>
        </div>
      </div>

      <!-- New Status Selection -->
      <div class="space-y-4">
        <div>
          <Label for="newStatus">New Status *</Label>
          <Select v-model="form.status" required>
            <SelectTrigger :class="{ 'border-red-500': errors.status }">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="status in availableStatuses" 
                :key="status.value" 
                :value="status.value"
                :disabled="status.value === user.status"
              >
                <div class="flex items-center space-x-2">
                  <Badge :variant="getStatusBadgeVariant(status.value)" class="text-xs">
                    {{ status.value }}
                  </Badge>
                  <span>{{ status.description }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.status" class="text-sm text-red-600 mt-1">{{ errors.status }}</p>
        </div>

        <!-- Status Change Impact Warning -->
        <div v-if="form.status && statusChangeImpact" class="p-4 rounded-lg border border-amber-200 bg-amber-50">
          <div class="flex items-start space-x-2">
            <AlertTriangle class="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 class="font-medium text-amber-800">Impact of Status Change</h4>
              <p class="text-sm text-amber-700 mt-1">{{ statusChangeImpact }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reason for Change -->
      <div>
        <Label for="reason">Reason for Status Change *</Label>
        <Textarea
          id="reason"
          v-model="form.reason"
          placeholder="Please provide a detailed reason for this status change"
          rows="4"
          :class="{ 'border-red-500': errors.reason }"
          required
        />
        <p v-if="errors.reason" class="text-sm text-red-600 mt-1">{{ errors.reason }}</p>
        <p class="text-sm text-gray-600 mt-1">
          This information will be recorded in the audit trail and visible to other administrators
        </p>
      </div>

      <!-- Additional Options for specific status changes -->
      <div v-if="showAdditionalOptions" class="space-y-4">
        <h4 class="font-medium text-gray-900">Additional Options</h4>
        
        <!-- Suspension Duration (for suspended status) -->
        <div v-if="form.status === 'suspended'" class="space-y-3">
          <div>
            <Label for="suspensionDuration">Suspension Duration</Label>
            <Select v-model="form.suspensionDuration">
              <SelectTrigger>
                <SelectValue placeholder="Select duration (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="suspendAccess" 
              v-model:checked="form.suspendAccess" 
            />
            <Label for="suspendAccess" class="text-sm">
              Immediately revoke all system access
            </Label>
          </div>
        </div>

        <!-- Reactivation Requirements (for reactivating suspended users) -->
        <div v-if="user.status === 'suspended' && form.status === 'active'" class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="requireTraining" 
              v-model:checked="form.requireTraining" 
            />
            <Label for="requireTraining" class="text-sm">
              Require additional training before access restoration
            </Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="requirePasswordReset" 
              v-model:checked="form.requirePasswordReset" 
            />
            <Label for="requirePasswordReset" class="text-sm">
              Force password reset on next login
            </Label>
          </div>
        </div>

        <!-- Notification Options -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="notifyUser" 
              v-model:checked="form.notifyUser" 
            />
            <Label for="notifyUser" class="text-sm">
              Send notification to user about status change
            </Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="notifySupervisor" 
              v-model:checked="form.notifySupervisor" 
            />
            <Label for="notifySupervisor" class="text-sm">
              Notify user's supervisor or manager
            </Label>
          </div>
        </div>
      </div>

      <!-- Effective Date -->
      <div>
        <Label for="effectiveDate">Effective Date</Label>
        <Input
          id="effectiveDate"
          v-model="form.effectiveDate"
          type="datetime-local"
          :min="new Date().toISOString().slice(0, 16)"
        />
        <p class="text-sm text-gray-600 mt-1">
          If not specified, the change will be effective immediately
        </p>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="isSubmitting || !isFormValid"
          :variant="form.status === 'suspended' || form.status === 'terminated' ? 'destructive' : 'default'"
        >
          <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          {{ isSubmitting ? 'Processing...' : submitButtonText }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { User, UserStatus } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import { Loader2, AlertTriangle } from 'lucide-vue-next';

// Props and Emits
interface Props {
  user: User;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [data: { 
    status: UserStatus; 
    reason: string;
    effectiveDate?: string;
    suspensionDuration?: string;
    suspendAccess?: boolean;
    requireTraining?: boolean;
    requirePasswordReset?: boolean;
    notifyUser?: boolean;
    notifySupervisor?: boolean;
  }];
  cancel: [];
}>();

// Form State
const form = ref({
  status: '' as UserStatus,
  reason: '',
  effectiveDate: '',
  suspensionDuration: '',
  suspendAccess: true,
  requireTraining: false,
  requirePasswordReset: false,
  notifyUser: true,
  notifySupervisor: false
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// Available status options
const availableStatuses = [
  { 
    value: 'active' as UserStatus, 
    description: 'User has full access to the system' 
  },
  { 
    value: 'inactive' as UserStatus, 
    description: 'User account is disabled but not permanently removed' 
  },
  { 
    value: 'suspended' as UserStatus, 
    description: 'Temporary restriction due to policy violation or investigation' 
  },
  { 
    value: 'terminated' as UserStatus, 
    description: 'Permanent deactivation - user is no longer with the organization' 
  }
];

// Computed properties
const showAdditionalOptions = computed(() => {
  return form.value.status && form.value.status !== props.user.status;
});

const statusChangeImpact = computed(() => {
  if (!form.value.status) return '';
  
  switch (form.value.status) {
    case 'active':
      return props.user.status === 'suspended' 
        ? 'User will regain full system access. Any pending work orders will become available again.'
        : 'User will have full system access and can be assigned new work orders.';
    
    case 'inactive':
      return 'User will lose system access but account data will be preserved. They cannot be assigned new work orders.';
    
    case 'suspended':
      return 'User will immediately lose system access. All pending work orders may need to be reassigned. This is typically used for temporary restrictions.';
    
    case 'terminated':
      return 'User will permanently lose system access. All active work orders will need to be reassigned. This action should be used only for employees leaving the organization.';
    
    default:
      return '';
  }
});

const submitButtonText = computed(() => {
  if (!form.value.status) return 'Change Status';
  
  switch (form.value.status) {
    case 'active': return 'Activate User';
    case 'inactive': return 'Deactivate User';
    case 'suspended': return 'Suspend User';
    case 'terminated': return 'Terminate User';
    default: return 'Change Status';
  }
});

const isFormValid = computed(() => {
  return form.value.status && 
         form.value.status !== props.user.status &&
         form.value.reason.trim() !== '' &&
         Object.keys(errors.value).length === 0;
});

// Methods
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    case 'suspended': return 'destructive';
    case 'terminated': return 'outline';
    default: return 'outline';
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!form.value.status) {
    newErrors.status = 'Please select a new status';
  } else if (form.value.status === props.user.status) {
    newErrors.status = 'Please select a different status';
  }

  if (!form.value.reason.trim()) {
    newErrors.reason = 'Reason is required for status changes';
  } else if (form.value.reason.trim().length < 10) {
    newErrors.reason = 'Please provide a more detailed reason (minimum 10 characters)';
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const submitData = {
      status: form.value.status,
      reason: form.value.reason.trim(),
      ...(form.value.effectiveDate && { effectiveDate: form.value.effectiveDate }),
      ...(form.value.suspensionDuration && { suspensionDuration: form.value.suspensionDuration }),
      ...(form.value.status === 'suspended' && { suspendAccess: form.value.suspendAccess }),
      ...(props.user.status === 'suspended' && form.value.status === 'active' && { 
        requireTraining: form.value.requireTraining,
        requirePasswordReset: form.value.requirePasswordReset 
      }),
      notifyUser: form.value.notifyUser,
      notifySupervisor: form.value.notifySupervisor
    };
    
    emit('submit', submitData);
  } catch (error) {
    console.error('Error changing user status:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>