<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Basic Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Basic Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label for="name">Full Name *</Label>
          <Input
            id="name"
            v-model="form.name"
            placeholder="Enter full name"
            :class="{ 'border-red-500': errors.name }"
            required
          />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <Label for="email">Email Address *</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter email address"
            :class="{ 'border-red-500': errors.email }"
            required
          />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label for="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            v-model="form.employeeId"
            placeholder="Enter employee ID"
            :class="{ 'border-red-500': errors.employeeId }"
          />
          <p v-if="errors.employeeId" class="text-sm text-red-600 mt-1">{{ errors.employeeId }}</p>
        </div>

        <div>
          <Label for="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            v-model="form.phoneNumber"
            placeholder="Enter phone number"
            :class="{ 'border-red-500': errors.phoneNumber }"
          />
          <p v-if="errors.phoneNumber" class="text-sm text-red-600 mt-1">{{ errors.phoneNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Role and Assignment -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Role and Assignment</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label for="role">Role *</Label>
          <Select v-model="form.role" required>
            <SelectTrigger :class="{ 'border-red-500': errors.role }">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="leader">Leader</SelectItem>
              <SelectItem value="worker">Worker</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.role" class="text-sm text-red-600 mt-1">{{ errors.role }}</p>
          <p v-if="roleChanged" class="text-sm text-amber-600 mt-1 flex items-center">
            <AlertTriangle class="h-4 w-4 mr-1" />
            Changing role will require approval and may affect permissions
          </p>
        </div>

        <div>
          <Label for="department">Department</Label>
          <Select v-model="form.department">
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Safety">Safety</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="showTerminalSelect">
          <Label for="terminalId">Terminal *</Label>
          <Select v-model="form.terminalId" :required="form.role === 'admin' || form.role === 'worker'">
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

        <div v-if="showRegionSelect">
          <Label for="regionId">Region *</Label>
          <Select v-model="form.regionId" :required="form.role === 'supervisor' || form.role === 'leader'">
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
      </div>
    </div>

    <!-- Status and Security -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Status and Security</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label for="status">Status</Label>
          <Select v-model="form.status">
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="statusChanged" class="text-sm text-amber-600 mt-1 flex items-center">
            <AlertTriangle class="h-4 w-4 mr-1" />
            Status change will be logged in audit trail
          </p>
        </div>

        <div>
          <Label for="ssoProvider">SSO Provider *</Label>
          <Select v-model="form.ssoProvider" required>
            <SelectTrigger :class="{ 'border-red-500': errors.ssoProvider }">
              <SelectValue placeholder="Select SSO provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="provider in availableSSOProviders" 
                :key="provider.value" 
                :value="provider.value"
              >
                {{ provider.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.ssoProvider" class="text-sm text-red-600 mt-1">{{ errors.ssoProvider }}</p>
          <p class="text-sm text-gray-600 mt-1">
            {{ getSSOProviderDescription(form.ssoProvider || '') }}
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <Checkbox 
            id="mfaEnabled" 
            v-model:checked="form.mfaEnabled" 
          />
          <Label for="mfaEnabled" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Multi-Factor Authentication (MFA) Enabled
          </Label>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox 
            id="forcePasswordReset" 
            v-model:checked="form.forcePasswordReset" 
          />
          <Label for="forcePasswordReset" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Force password reset on next login
          </Label>
        </div>
      </div>
    </div>

    <!-- User Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Additional Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Last Login</Label>
          <p class="text-sm text-gray-600 mt-1">
            {{ user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never' }}
          </p>
        </div>

        <div>
          <Label>Account Created</Label>
          <p class="text-sm text-gray-600 mt-1">
            {{ new Date(user.createdAt).toLocaleDateString() }}
          </p>
        </div>
      </div>

      <div>
        <Label for="notes">Notes</Label>
        <Textarea
          id="notes"
          v-model="form.notes"
          placeholder="Add any additional notes about this user"
          rows="3"
        />
      </div>
    </div>

    <!-- Change Reason -->
    <div v-if="hasChanges" class="space-y-4">
      <h3 class="text-lg font-medium text-amber-600">Change Documentation</h3>
      
      <div>
        <Label for="changeReason">Reason for Changes *</Label>
        <Textarea
          id="changeReason"
          v-model="changeReason"
          placeholder="Please describe the reason for these changes"
          rows="3"
          :class="{ 'border-red-500': errors.changeReason }"
          required
        />
        <p v-if="errors.changeReason" class="text-sm text-red-600 mt-1">{{ errors.changeReason }}</p>
        <p class="text-sm text-gray-600 mt-1">
          This information will be recorded in the audit trail
        </p>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end space-x-3 pt-6 border-t">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        Cancel
      </Button>
      <Button type="submit" :disabled="isSubmitting || !isFormValid">
        <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { User, UpdateUserForm, UserRole } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  submit: [data: UpdateUserForm & { changeReason?: string }];
  cancel: [];
}>();

// Form State
const form = ref<UpdateUserForm>({
  name: props.user.name,
  email: props.user.email,
  role: props.user.role,
  status: props.user.status,
  employeeId: props.user.employeeId || '',
  phoneNumber: props.user.phoneNumber || '',
  department: props.user.department || '',
  terminalId: props.user.terminalId || '',
  regionId: props.user.regionId || '',
  ssoProvider: props.user.ssoProvider || 'talenta',
  mfaEnabled: props.user.mfaEnabled || false,
  forcePasswordReset: false,
  notes: props.user.notes || ''
});

const changeReason = ref('');
const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// Store original values for change detection
const originalValues = {
  name: props.user.name,
  email: props.user.email,
  role: props.user.role,
  status: props.user.status,
  employeeId: props.user.employeeId || '',
  phoneNumber: props.user.phoneNumber || '',
  department: props.user.department || '',
  terminalId: props.user.terminalId || '',
  regionId: props.user.regionId || '',
  ssoProvider: props.user.ssoProvider || 'talenta',
  mfaEnabled: props.user.mfaEnabled || false,
  notes: props.user.notes || ''
};

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
const showTerminalSelect = computed(() => 
  form.value.role === 'admin' || form.value.role === 'worker'
);

const showRegionSelect = computed(() => 
  form.value.role === 'supervisor' || form.value.role === 'leader'
);

const availableSSOProviders = computed(() => {
  const role = form.value.role;
  
  if (role === 'admin' || role === 'worker') {
    return [
      { value: 'talenta', label: 'Talenta HRIS' }
    ];
  } else if (role === 'supervisor' || role === 'leader') {
    return [
      { value: 'idaman', label: 'Idaman SSO' }
    ];
  }
  
  return [
    { value: 'talenta', label: 'Talenta HRIS' },
    { value: 'idaman', label: 'Idaman SSO' }
  ];
});

const roleChanged = computed(() => form.value.role !== originalValues.role);
const statusChanged = computed(() => form.value.status !== originalValues.status);

const hasChanges = computed(() => {
  return Object.keys(form.value).some(key => {
    const formKey = key as keyof UpdateUserForm;
    const formValue = form.value[formKey];
    const originalValue = (originalValues as any)[formKey];
    return formValue !== originalValue;
  }) || form.value.forcePasswordReset;
});

const isFormValid = computed(() => {
  const basicValidation = (form.value.name?.trim() || '') !== '' &&
                         (form.value.email?.trim() || '') !== '' &&
                         form.value.role &&
                         form.value.ssoProvider &&
                         Object.keys(errors.value).length === 0;
  
  const changeReasonValid = !hasChanges.value || changeReason.value.trim() !== '';
  
  return basicValidation && changeReasonValid;
});

// Methods
const getSSOProviderDescription = (provider: string): string => {
  switch (provider) {
    case 'talenta':
      return 'Used for Admin and Worker authentication';
    case 'idaman':
      return 'Used for Supervisor and Leader authentication';
    default:
      return '';
  }
};

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  // Name validation
  if (!form.value.name?.trim()) {
    newErrors.name = 'Name is required';
  }

  // Email validation
  if (!form.value.email?.trim()) {
    newErrors.email = 'Email is required';
  } else if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    newErrors.email = 'Invalid email format';
  }

  // Role validation
  if (!form.value.role) {
    newErrors.role = 'Role is required';
  }

  // Terminal validation for admin/worker
  if ((form.value.role === 'admin' || form.value.role === 'worker') && !form.value.terminalId) {
    newErrors.terminalId = 'Terminal is required for this role';
  }

  // Region validation for supervisor/leader
  if ((form.value.role === 'supervisor' || form.value.role === 'leader') && !form.value.regionId) {
    newErrors.regionId = 'Region is required for this role';
  }

  // SSO provider validation
  if (!form.value.ssoProvider) {
    newErrors.ssoProvider = 'SSO provider is required';
  }

  // Change reason validation
  if (hasChanges.value && !changeReason.value.trim()) {
    newErrors.changeReason = 'Change reason is required when making modifications';
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
    
    const submitData: UpdateUserForm & { changeReason?: string } = {
      ...form.value
    };
    
    if (hasChanges.value && changeReason.value.trim()) {
      submitData.changeReason = changeReason.value.trim();
    }
    
    emit('submit', submitData);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Watch role changes to auto-select appropriate SSO provider and clear location fields
watch(() => form.value.role, (newRole?: UserRole) => {
  if (!newRole) return;
  
  // Auto-select appropriate SSO provider
  if (newRole === 'admin' || newRole === 'worker') {
    form.value.ssoProvider = 'talenta';
    form.value.regionId = ''; // Clear region when switching to terminal-based roles
  } else if (newRole === 'supervisor' || newRole === 'leader') {
    form.value.ssoProvider = 'idaman';
    form.value.terminalId = ''; // Clear terminal when switching to region-based roles
  }
  
  // Clear validation errors when role changes
  errors.value = {};
});

// Watch form changes to clear specific validation errors
watch(() => form.value.name, () => {
  if (errors.value.name) delete errors.value.name;
});

watch(() => form.value.email, () => {
  if (errors.value.email) delete errors.value.email;
});

watch(() => form.value.terminalId, () => {
  if (errors.value.terminalId) delete errors.value.terminalId;
});

watch(() => form.value.regionId, () => {
  if (errors.value.regionId) delete errors.value.regionId;
});

watch(() => changeReason.value, () => {
  if (errors.value.changeReason) delete errors.value.changeReason;
});
</script>