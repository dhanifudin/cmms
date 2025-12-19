<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle>Change User Role</DialogTitle>
      <DialogDescription>
        Modify {{ user.name }}'s role and permissions. Role changes require approval and will be logged in the audit trail.
      </DialogDescription>
    </DialogHeader>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Current Role Display -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <Label class="text-gray-600">Current Role</Label>
            <div class="flex items-center space-x-2 mt-1">
              <Badge :variant="getRoleBadgeVariant(user.role)">
                {{ user.role }}
              </Badge>
              <span class="text-sm text-gray-600">
                since {{ formatDate(user.updatedAt || user.createdAt) }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <Label class="text-gray-600">Current Assignment</Label>
            <p class="font-medium">{{ getCurrentAssignment(user) }}</p>
            <p class="text-sm text-gray-600">{{ user.department || 'No department assigned' }}</p>
          </div>
        </div>
      </div>

      <!-- New Role Selection -->
      <div class="space-y-4">
        <div>
          <Label for="newRole">New Role *</Label>
          <Select v-model="form.role" required>
            <SelectTrigger :class="{ 'border-red-500': errors.role }">
              <SelectValue placeholder="Select new role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="role in availableRoles" 
                :key="role.value" 
                :value="role.value"
                :disabled="role.value === user.role"
              >
                <div class="flex items-center space-x-2">
                  <Badge :variant="getRoleBadgeVariant(role.value)" class="text-xs">
                    {{ role.value }}
                  </Badge>
                  <div class="text-left">
                    <p class="font-medium">{{ role.title }}</p>
                    <p class="text-xs text-gray-600">{{ role.description }}</p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.role" class="text-sm text-red-600 mt-1">{{ errors.role }}</p>
        </div>

        <!-- Role Change Impact -->
        <div v-if="form.role && roleChangeImpact" class="p-4 rounded-lg border border-blue-200 bg-blue-50">
          <div class="flex items-start space-x-2">
            <Info class="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 class="font-medium text-blue-800">Role Change Impact</h4>
              <p class="text-sm text-blue-700 mt-1">{{ roleChangeImpact }}</p>
            </div>
          </div>
        </div>

        <!-- SSO Provider Change Warning -->
        <div v-if="ssoProviderWillChange" class="p-4 rounded-lg border border-amber-200 bg-amber-50">
          <div class="flex items-start space-x-2">
            <AlertTriangle class="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 class="font-medium text-amber-800">Authentication Provider Change Required</h4>
              <p class="text-sm text-amber-700 mt-1">
                This role change will require switching from {{ user.ssoProvider === 'talenta' ? 'Talenta HRIS' : 'Idaman SSO' }} 
                to {{ getRequiredSSO(form.role) }}. The user will need to set up authentication with the new provider.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignment Update -->
      <div v-if="form.role" class="space-y-4">
        <h4 class="font-medium text-gray-900">Assignment Update</h4>
        
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

      <!-- Promotion Requirements -->
      <div v-if="isPromotion" class="space-y-4">
        <h4 class="font-medium text-gray-900">Promotion Requirements</h4>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label for="trainingCompleted">Required Training Completed</Label>
            <Checkbox 
              id="trainingCompleted" 
              v-model:checked="form.trainingCompleted"
              :class="{ 'border-red-500': errors.trainingCompleted }"
            />
          </div>
          
          <div>
            <Label for="performanceScore">Performance Score (1-10)</Label>
            <Input
              id="performanceScore"
              v-model.number="form.performanceScore"
              type="number"
              min="1"
              max="10"
              step="0.1"
              placeholder="Enter performance score"
              :class="{ 'border-red-500': errors.performanceScore }"
            />
            <p v-if="errors.performanceScore" class="text-sm text-red-600 mt-1">{{ errors.performanceScore }}</p>
            <p class="text-sm text-gray-600 mt-1">Minimum score of {{ minimumPromotionScore }} required for promotion</p>
          </div>
        </div>
      </div>

      <!-- Justification -->
      <div>
        <Label for="reason">Justification for Role Change *</Label>
        <Textarea
          id="reason"
          v-model="form.reason"
          placeholder="Please provide detailed justification for this role change, including qualifications, performance history, and business need"
          rows="4"
          :class="{ 'border-red-500': errors.reason }"
          required
        />
        <p v-if="errors.reason" class="text-sm text-red-600 mt-1">{{ errors.reason }}</p>
        <p class="text-sm text-gray-600 mt-1">
          This justification will be reviewed by administrators and recorded in the audit trail
        </p>
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
          If not specified, the change will be effective immediately upon approval
        </p>
      </div>

      <!-- Additional Options -->
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900">Additional Options</h4>
        
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="requirePasswordReset" 
              v-model:checked="form.requirePasswordReset" 
            />
            <Label for="requirePasswordReset" class="text-sm">
              Require password reset on next login
            </Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="notifyUser" 
              v-model:checked="form.notifyUser" 
            />
            <Label for="notifyUser" class="text-sm">
              Send notification to user about role change
            </Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="requireApproval" 
              v-model:checked="form.requireApproval" 
            />
            <Label for="requireApproval" class="text-sm">
              Require additional approval from senior administrator
            </Label>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="isSubmitting || !isFormValid"
        >
          <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          {{ isSubmitting ? 'Processing...' : (isPromotion ? 'Submit for Promotion' : 'Change Role') }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { User, UserRole } from '@/types';

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
import { Loader2, AlertTriangle, Info } from 'lucide-vue-next';

// Props and Emits
interface Props {
  user: User;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [data: { 
    role: UserRole; 
    reason: string;
    trainingCompleted: boolean;
    performanceScore?: number;
    effectiveDate?: string;
    terminalId?: string;
    regionId?: string;
    requirePasswordReset?: boolean;
    notifyUser?: boolean;
    requireApproval?: boolean;
  }];
  cancel: [];
}>();

// Form State
const form = ref({
  role: '' as UserRole,
  reason: '',
  trainingCompleted: false,
  performanceScore: undefined as number | undefined,
  effectiveDate: '',
  terminalId: props.user.terminalId || '',
  regionId: props.user.regionId || '',
  requirePasswordReset: false,
  notifyUser: true,
  requireApproval: false
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// Role hierarchy for promotion detection
const roleHierarchy: Record<UserRole, number> = {
  'worker': 1,
  'leader': 2,
  'supervisor': 3,
  'admin': 4
};

// Available roles with descriptions
const availableRoles = [
  { 
    value: 'worker' as UserRole, 
    title: 'Worker',
    description: 'Execute work orders and submit documentation' 
  },
  { 
    value: 'leader' as UserRole, 
    title: 'Leader',
    description: 'Lead teams and oversee operations (permissions TBD)' 
  },
  { 
    value: 'supervisor' as UserRole, 
    title: 'Supervisor',
    description: 'Approve work orders and manage workers' 
  },
  { 
    value: 'admin' as UserRole, 
    title: 'Admin',
    description: 'Full system administration and configuration' 
  }
];

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

const isPromotion = computed(() => {
  if (!form.value.role) return false;
  return roleHierarchy[form.value.role] > roleHierarchy[props.user.role];
});

const minimumPromotionScore = computed(() => {
  switch (form.value.role) {
    case 'leader': return 6.0;
    case 'supervisor': return 7.0;
    case 'admin': return 8.0;
    default: return 5.0;
  }
});

const ssoProviderWillChange = computed(() => {
  if (!form.value.role) return false;
  
  const currentSSO = props.user.ssoProvider || 'talenta';
  const newSSO = getRequiredSSO(form.value.role);
  
  return currentSSO !== newSSO;
});

const roleChangeImpact = computed(() => {
  if (!form.value.role) return '';
  
  const currentRole = props.user.role;
  const newRole = form.value.role;
  
  if (roleHierarchy[newRole] > roleHierarchy[currentRole]) {
    return `This is a promotion from ${currentRole} to ${newRole}. User will gain additional permissions and responsibilities.`;
  } else if (roleHierarchy[newRole] < roleHierarchy[currentRole]) {
    return `This is a demotion from ${currentRole} to ${newRole}. User will lose some permissions and may need reassignment of current responsibilities.`;
  } else {
    return `This is a lateral role change. Permissions and responsibilities will be adjusted according to the new role.`;
  }
});

const isFormValid = computed(() => {
  const basicValidation = form.value.role && 
                         form.value.role !== props.user.role &&
                         form.value.reason.trim() !== '' &&
                         Object.keys(errors.value).length === 0;
  
  const promotionValidation = !isPromotion.value || 
                             (form.value.trainingCompleted && 
                              form.value.performanceScore !== undefined && 
                              form.value.performanceScore >= minimumPromotionScore.value);
  
  return basicValidation && promotionValidation;
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

const getCurrentAssignment = (user: User): string => {
  if (user.terminalId) {
    const terminal = terminals.value.find(t => t.id === user.terminalId);
    return terminal ? `${terminal.name} (${terminal.code})` : user.terminalId;
  }
  if (user.regionId) {
    const region = regions.value.find(r => r.id === user.regionId);
    return region ? `${region.name} (${region.code})` : user.regionId;
  }
  return 'No assignment';
};

const getRequiredSSO = (role: UserRole): string => {
  return (role === 'admin' || role === 'worker') ? 'Talenta HRIS' : 'Idaman SSO';
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

  if (!form.value.role) {
    newErrors.role = 'Please select a new role';
  } else if (form.value.role === props.user.role) {
    newErrors.role = 'Please select a different role';
  }

  if (!form.value.reason.trim()) {
    newErrors.reason = 'Justification is required for role changes';
  } else if (form.value.reason.trim().length < 20) {
    newErrors.reason = 'Please provide a more detailed justification (minimum 20 characters)';
  }

  // Terminal validation for admin/worker roles
  if ((form.value.role === 'admin' || form.value.role === 'worker') && !form.value.terminalId) {
    newErrors.terminalId = 'Terminal assignment is required for this role';
  }

  // Region validation for supervisor/leader roles
  if ((form.value.role === 'supervisor' || form.value.role === 'leader') && !form.value.regionId) {
    newErrors.regionId = 'Region assignment is required for this role';
  }

  // Promotion-specific validations
  if (isPromotion.value) {
    if (!form.value.trainingCompleted) {
      newErrors.trainingCompleted = 'Required training must be completed for promotion';
    }
    
    if (form.value.performanceScore === undefined) {
      newErrors.performanceScore = 'Performance score is required for promotion';
    } else if (form.value.performanceScore < minimumPromotionScore.value) {
      newErrors.performanceScore = `Minimum score of ${minimumPromotionScore.value} required for this promotion`;
    } else if (form.value.performanceScore < 1 || form.value.performanceScore > 10) {
      newErrors.performanceScore = 'Performance score must be between 1 and 10';
    }
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
      role: form.value.role,
      reason: form.value.reason.trim(),
      trainingCompleted: form.value.trainingCompleted,
      ...(form.value.performanceScore !== undefined && { performanceScore: form.value.performanceScore }),
      ...(form.value.effectiveDate && { effectiveDate: form.value.effectiveDate }),
      ...(form.value.terminalId && { terminalId: form.value.terminalId }),
      ...(form.value.regionId && { regionId: form.value.regionId }),
      requirePasswordReset: form.value.requirePasswordReset,
      notifyUser: form.value.notifyUser,
      requireApproval: form.value.requireApproval
    };
    
    emit('submit', submitData);
  } catch (error) {
    console.error('Error changing user role:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Watch role changes to clear/set appropriate location fields
watch(() => form.value.role, (newRole: UserRole) => {
  // Clear validation errors when role changes
  if (errors.value.role) delete errors.value.role;
  if (errors.value.terminalId) delete errors.value.terminalId;
  if (errors.value.regionId) delete errors.value.regionId;
  
  // Set appropriate assignment fields
  if (newRole === 'admin' || newRole === 'worker') {
    form.value.regionId = '';
    if (!form.value.terminalId) {
      form.value.terminalId = props.user.terminalId || '';
    }
  } else if (newRole === 'supervisor' || newRole === 'leader') {
    form.value.terminalId = '';
    if (!form.value.regionId) {
      form.value.regionId = props.user.regionId || '';
    }
  }
});
</script>