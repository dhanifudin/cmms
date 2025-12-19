<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle>Bulk Operations</DialogTitle>
      <DialogDescription>
        Perform actions on {{ selectedUsers.length }} selected user{{ selectedUsers.length > 1 ? 's' : '' }}. All changes will be logged in the audit trail.
      </DialogDescription>
    </DialogHeader>

    <!-- Selected Users Preview -->
    <div class="border rounded-lg p-4 max-h-48 overflow-y-auto">
      <h4 class="font-medium mb-3">Selected Users ({{ selectedUsers.length }})</h4>
      <div class="space-y-2">
        <div 
          v-for="user in selectedUserData" 
          :key="user.id"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center space-x-3">
            <Avatar class="h-6 w-6">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="text-xs">{{ getInitials(user.name) }}</AvatarFallback>
            </Avatar>
            <span class="font-medium">{{ user.name }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <Badge :variant="getRoleBadgeVariant(user.role)" class="text-xs">
              {{ user.role }}
            </Badge>
            <Badge :variant="getStatusBadgeVariant(user.status)" class="text-xs">
              {{ user.status }}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Operation Type Selection -->
      <div>
        <Label for="operationType">Bulk Operation *</Label>
        <Select v-model="form.operationType" required>
          <SelectTrigger :class="{ 'border-red-500': errors.operationType }">
            <SelectValue placeholder="Select operation to perform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status_change">Change Status</SelectItem>
            <SelectItem value="role_change">Change Role</SelectItem>
            <SelectItem value="terminal_assignment">Update Terminal Assignment</SelectItem>
            <SelectItem value="region_assignment">Update Region Assignment</SelectItem>
            <SelectItem value="enable_mfa">Enable MFA</SelectItem>
            <SelectItem value="disable_mfa">Disable MFA</SelectItem>
            <SelectItem value="force_password_reset">Force Password Reset</SelectItem>
            <SelectItem value="send_notification">Send Notification</SelectItem>
            <SelectItem value="export_data">Export User Data</SelectItem>
            <SelectItem value="delete_users" class="text-red-600">Delete Users</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.operationType" class="text-sm text-red-600 mt-1">{{ errors.operationType }}</p>
      </div>

      <!-- Operation-specific Settings -->
      <div v-if="form.operationType" class="space-y-4">
        <!-- Status Change Settings -->
        <div v-if="form.operationType === 'status_change'" class="space-y-3">
          <div>
            <Label for="newStatus">New Status *</Label>
            <Select v-model="form.newStatus" required>
              <SelectTrigger :class="{ 'border-red-500': errors.newStatus }">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.newStatus" class="text-sm text-red-600 mt-1">{{ errors.newStatus }}</p>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox 
              id="notifyStatusChange" 
              v-model:checked="form.notifyUsers" 
            />
            <Label for="notifyStatusChange" class="text-sm">
              Send status change notification to affected users
            </Label>
          </div>
        </div>

        <!-- Role Change Settings -->
        <div v-if="form.operationType === 'role_change'" class="space-y-3">
          <div>
            <Label for="newRole">New Role *</Label>
            <Select v-model="form.newRole" required>
              <SelectTrigger :class="{ 'border-red-500': errors.newRole }">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="worker">Worker</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.newRole" class="text-sm text-red-600 mt-1">{{ errors.newRole }}</p>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox 
              id="requireApproval" 
              v-model:checked="form.requireApproval" 
            />
            <Label for="requireApproval" class="text-sm">
              Require additional approval for role changes
            </Label>
          </div>
        </div>

        <!-- Terminal Assignment Settings -->
        <div v-if="form.operationType === 'terminal_assignment'" class="space-y-3">
          <div>
            <Label for="terminalId">Terminal *</Label>
            <Select v-model="form.terminalId" required>
              <SelectTrigger :class="{ 'border-red-500': errors.terminalId }">
                <SelectValue placeholder="Select terminal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="terminal in terminals" 
                  :key="terminal.id" 
                  :value="terminal.id"
                >
                  {{ terminal.name }} ({{ terminal.code }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.terminalId" class="text-sm text-red-600 mt-1">{{ errors.terminalId }}</p>
          </div>

          <p class="text-sm text-amber-600">
            ⚠️ This will only affect users with admin or worker roles
          </p>
        </div>

        <!-- Region Assignment Settings -->
        <div v-if="form.operationType === 'region_assignment'" class="space-y-3">
          <div>
            <Label for="regionId">Region *</Label>
            <Select v-model="form.regionId" required>
              <SelectTrigger :class="{ 'border-red-500': errors.regionId }">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="region in regions" 
                  :key="region.id" 
                  :value="region.id"
                >
                  {{ region.name }} ({{ region.code }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.regionId" class="text-sm text-red-600 mt-1">{{ errors.regionId }}</p>
          </div>

          <p class="text-sm text-amber-600">
            ⚠️ This will only affect users with supervisor or leader roles
          </p>
        </div>

        <!-- Send Notification Settings -->
        <div v-if="form.operationType === 'send_notification'" class="space-y-3">
          <div>
            <Label for="notificationTitle">Notification Title *</Label>
            <Input
              id="notificationTitle"
              v-model="form.notificationTitle"
              placeholder="Enter notification title"
              :class="{ 'border-red-500': errors.notificationTitle }"
              required
            />
            <p v-if="errors.notificationTitle" class="text-sm text-red-600 mt-1">{{ errors.notificationTitle }}</p>
          </div>

          <div>
            <Label for="notificationMessage">Message *</Label>
            <Textarea
              id="notificationMessage"
              v-model="form.notificationMessage"
              placeholder="Enter notification message"
              rows="4"
              :class="{ 'border-red-500': errors.notificationMessage }"
              required
            />
            <p v-if="errors.notificationMessage" class="text-sm text-red-600 mt-1">{{ errors.notificationMessage }}</p>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox 
              id="highPriority" 
              v-model:checked="form.highPriority" 
            />
            <Label for="highPriority" class="text-sm">
              High priority notification
            </Label>
          </div>
        </div>

        <!-- Export Settings -->
        <div v-if="form.operationType === 'export_data'" class="space-y-3">
          <div>
            <Label for="exportFormat">Export Format</Label>
            <Select v-model="form.exportFormat">
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Fields to Include</Label>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="includeBasicInfo" v-model:checked="form.includeBasicInfo" />
                <Label for="includeBasicInfo" class="text-sm">Basic Information</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="includeRoleInfo" v-model:checked="form.includeRoleInfo" />
                <Label for="includeRoleInfo" class="text-sm">Role & Assignment</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="includeActivityStats" v-model:checked="form.includeActivityStats" />
                <Label for="includeActivityStats" class="text-sm">Activity Statistics</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="includeAuditTrail" v-model:checked="form.includeAuditTrail" />
                <Label for="includeAuditTrail" class="text-sm">Audit Trail</Label>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation -->
        <div v-if="form.operationType === 'delete_users'" class="p-4 rounded-lg border border-red-200 bg-red-50">
          <div class="flex items-start space-x-2">
            <AlertTriangle class="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 class="font-medium text-red-800">Confirm User Deletion</h4>
              <p class="text-sm text-red-700 mt-1">
                This action will permanently delete {{ selectedUsers.length }} user account{{ selectedUsers.length > 1 ? 's' : '' }} 
                and cannot be undone. All associated work orders will need to be reassigned.
              </p>
              <div class="mt-3 flex items-center space-x-2">
                <Checkbox 
                  id="confirmDelete" 
                  v-model:checked="form.confirmDelete"
                  :class="{ 'border-red-500': errors.confirmDelete }"
                />
                <Label for="confirmDelete" class="text-sm font-medium">
                  I understand that this action is permanent and irreversible
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Operation Reason -->
      <div>
        <Label for="reason">Reason for Bulk Operation *</Label>
        <Textarea
          id="reason"
          v-model="form.reason"
          placeholder="Please provide a detailed reason for this bulk operation"
          rows="3"
          :class="{ 'border-red-500': errors.reason }"
          required
        />
        <p v-if="errors.reason" class="text-sm text-red-600 mt-1">{{ errors.reason }}</p>
        <p class="text-sm text-gray-600 mt-1">
          This reason will be recorded in the audit trail for all affected users
        </p>
      </div>

      <!-- Progress Indicator -->
      <div v-if="isProcessing" class="p-4 rounded-lg border border-blue-200 bg-blue-50">
        <div class="flex items-center space-x-3">
          <Loader2 class="h-5 w-5 animate-spin text-blue-600" />
          <div class="flex-1">
            <h4 class="font-medium text-blue-800">Processing Bulk Operation</h4>
            <p class="text-sm text-blue-700">
              {{ processedCount }} of {{ selectedUsers.length }} users processed
            </p>
            <div class="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(processedCount / selectedUsers.length) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="isProcessing">
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="isSubmitting || !isFormValid"
          :variant="form.operationType === 'delete_users' ? 'destructive' : 'default'"
        >
          <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          {{ isSubmitting ? 'Processing...' : getSubmitButtonText() }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { BulkUserOperation } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  selectedUsers: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [operation: BulkUserOperation];
  cancel: [];
}>();

// Mock user data (in a real app, this would come from props or store)
// const allUsers: User[] = [
//   // This would be populated with actual user data
//   // For demo purposes, using a simplified mock
// ];

// Form State
const form = ref({
  operationType: '',
  newStatus: '',
  newRole: '',
  terminalId: '',
  regionId: '',
  notificationTitle: '',
  notificationMessage: '',
  exportFormat: 'csv',
  includeBasicInfo: true,
  includeRoleInfo: true,
  includeActivityStats: false,
  includeAuditTrail: false,
  highPriority: false,
  notifyUsers: true,
  requireApproval: false,
  confirmDelete: false,
  reason: ''
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const isProcessing = ref(false);
const processedCount = ref(0);

// Mock data for dropdowns
const terminals = ref([
  { id: 'terminal1', name: 'Jakarta Terminal', code: 'JKT01' },
  { id: 'terminal2', name: 'Surabaya Terminal', code: 'SBY01' },
  { id: 'terminal3', name: 'Medan Terminal', code: 'MDN01' },
  { id: 'terminal4', name: 'Balikpapan Terminal', code: 'BPN01' },
  { id: 'terminal5', name: 'Palembang Terminal', code: 'PLB01' }
]);

const regions = ref([
  { id: 'region1', name: 'Jakarta & West Java', code: 'REG01' },
  { id: 'region2', name: 'Central & East Java', code: 'REG02' },
  { id: 'region3', name: 'Sumatra', code: 'REG03' },
  { id: 'region4', name: 'Kalimantan & Eastern Indonesia', code: 'REG04' }
]);

// Computed properties
const selectedUserData = computed(() => {
  // In a real app, this would filter actual user data
  return props.selectedUsers.map(id => ({
    id,
    name: `User ${id}`,
    role: 'worker' as const,
    status: 'active' as const,
    avatar: `/avatars/user${id}.jpg`
  }));
});

const isFormValid = computed(() => {
  const hasOperation = form.value.operationType !== '';
  const hasReason = form.value.reason.trim() !== '';
  const noErrors = Object.keys(errors.value).length === 0;
  
  // Operation-specific validations
  let operationValid = true;
  switch (form.value.operationType) {
    case 'status_change':
      operationValid = form.value.newStatus !== '';
      break;
    case 'role_change':
      operationValid = form.value.newRole !== '';
      break;
    case 'terminal_assignment':
      operationValid = form.value.terminalId !== '';
      break;
    case 'region_assignment':
      operationValid = form.value.regionId !== '';
      break;
    case 'send_notification':
      operationValid = form.value.notificationTitle !== '' && form.value.notificationMessage !== '';
      break;
    case 'delete_users':
      operationValid = form.value.confirmDelete;
      break;
  }
  
  return hasOperation && hasReason && noErrors && operationValid;
});

// Methods
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive';
    case 'supervisor': return 'default';
    case 'leader': return 'secondary';
    case 'worker': return 'outline';
    default: return 'outline';
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    case 'suspended': return 'destructive';
    case 'terminated': return 'outline';
    default: return 'outline';
  }
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getSubmitButtonText = (): string => {
  switch (form.value.operationType) {
    case 'status_change': return `Change Status for ${props.selectedUsers.length} Users`;
    case 'role_change': return `Change Role for ${props.selectedUsers.length} Users`;
    case 'terminal_assignment': return `Update Terminal Assignment`;
    case 'region_assignment': return `Update Region Assignment`;
    case 'enable_mfa': return `Enable MFA for ${props.selectedUsers.length} Users`;
    case 'disable_mfa': return `Disable MFA for ${props.selectedUsers.length} Users`;
    case 'force_password_reset': return `Force Password Reset`;
    case 'send_notification': return `Send Notification`;
    case 'export_data': return `Export User Data`;
    case 'delete_users': return `Delete ${props.selectedUsers.length} Users`;
    default: return 'Execute Operation';
  }
};

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!form.value.operationType) {
    newErrors.operationType = 'Please select an operation';
  }

  if (!form.value.reason.trim()) {
    newErrors.reason = 'Reason is required for bulk operations';
  } else if (form.value.reason.trim().length < 10) {
    newErrors.reason = 'Please provide a more detailed reason (minimum 10 characters)';
  }

  // Operation-specific validations
  switch (form.value.operationType) {
    case 'status_change':
      if (!form.value.newStatus) {
        newErrors.newStatus = 'Please select a new status';
      }
      break;
    case 'role_change':
      if (!form.value.newRole) {
        newErrors.newRole = 'Please select a new role';
      }
      break;
    case 'terminal_assignment':
      if (!form.value.terminalId) {
        newErrors.terminalId = 'Please select a terminal';
      }
      break;
    case 'region_assignment':
      if (!form.value.regionId) {
        newErrors.regionId = 'Please select a region';
      }
      break;
    case 'send_notification':
      if (!form.value.notificationTitle.trim()) {
        newErrors.notificationTitle = 'Notification title is required';
      }
      if (!form.value.notificationMessage.trim()) {
        newErrors.notificationMessage = 'Notification message is required';
      }
      break;
    case 'delete_users':
      if (!form.value.confirmDelete) {
        newErrors.confirmDelete = 'Please confirm that you understand this action is permanent';
      }
      break;
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  isProcessing.value = true;
  processedCount.value = 0;
  
  try {
    // Simulate processing progress
    for (let i = 1; i <= props.selectedUsers.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      processedCount.value = i;
    }

    const operation: BulkUserOperation = {
      operation: form.value.operationType as any,
      userIds: props.selectedUsers,
      reason: form.value.reason.trim(),
      parameters: {
        ...(form.value.newStatus && { status: form.value.newStatus }),
        ...(form.value.newRole && { role: form.value.newRole }),
        ...(form.value.terminalId && { terminalId: form.value.terminalId }),
        ...(form.value.regionId && { regionId: form.value.regionId }),
        ...(form.value.notificationTitle && { 
          notification: {
            title: form.value.notificationTitle,
            message: form.value.notificationMessage,
            highPriority: form.value.highPriority
          }
        }),
        ...(form.value.operationType === 'export_data' && {
          export: {
            format: form.value.exportFormat,
            includeBasicInfo: form.value.includeBasicInfo,
            includeRoleInfo: form.value.includeRoleInfo,
            includeActivityStats: form.value.includeActivityStats,
            includeAuditTrail: form.value.includeAuditTrail
          }
        }),
        notifyUsers: form.value.notifyUsers,
        requireApproval: form.value.requireApproval
      }
    };

    emit('submit', operation);
  } catch (error) {
    console.error('Error processing bulk operation:', error);
  } finally {
    isSubmitting.value = false;
    isProcessing.value = false;
  }
};
</script>