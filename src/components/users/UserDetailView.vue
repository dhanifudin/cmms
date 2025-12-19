<template>
  <div class="space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between border-b pb-4">
      <div class="flex items-center space-x-4">
        <div class="relative">
          <Avatar class="h-16 w-16">
            <AvatarImage :src="user.avatar || ''" :alt="user.name" />
            <AvatarFallback>{{ initials }}</AvatarFallback>
          </Avatar>
          <div 
            class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
            :class="statusIndicatorClass"
          ></div>
        </div>
        
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ user.name }}</h2>
          <p class="text-gray-600">{{ user.email }}</p>
          <div class="flex items-center space-x-2 mt-1">
            <Badge :variant="getRoleBadgeVariant(user.role)">
              {{ user.role }}
            </Badge>
            <Badge :variant="getStatusBadgeVariant(user.status)">
              {{ user.status }}
            </Badge>
            <Badge v-if="user.mfaEnabled" variant="secondary">
              <Shield class="h-3 w-3 mr-1" />
              MFA
            </Badge>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="$emit('edit', user)">
          <Edit class="h-4 w-4 mr-2" />
          Edit
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="$emit('change-status', user)">
              <UserCog class="h-4 w-4 mr-2" />
              Change Status
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('promote', user)">
              <UserPlus class="h-4 w-4 mr-2" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="resetPassword" class="text-orange-600">
              <Key class="h-4 w-4 mr-2" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem @click="resetMFA" class="text-orange-600">
              <Shield class="h-4 w-4 mr-2" />
              Reset MFA
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="$emit('delete', user)" class="text-red-600">
              <Trash2 class="h-4 w-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" @click="$emit('close')">
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- User Information Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Information -->
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <Label class="text-gray-600">Full Name</Label>
            <p class="font-medium">{{ user.name }}</p>
          </div>
          
          <div>
            <Label class="text-gray-600">Email Address</Label>
            <p class="font-medium">{{ user.email }}</p>
          </div>
          
          <div v-if="user.employeeId">
            <Label class="text-gray-600">Employee ID</Label>
            <p class="font-medium">{{ user.employeeId }}</p>
          </div>
          
          <div v-if="user.phoneNumber">
            <Label class="text-gray-600">Phone Number</Label>
            <p class="font-medium">{{ user.phoneNumber }}</p>
          </div>
          
          <div v-if="user.department">
            <Label class="text-gray-600">Department</Label>
            <p class="font-medium">{{ user.department }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Role & Assignment -->
      <Card>
        <CardHeader>
          <CardTitle>Role & Assignment</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <Label class="text-gray-600">Role</Label>
            <div class="flex items-center space-x-2">
              <Badge :variant="getRoleBadgeVariant(user.role)">
                {{ user.role }}
              </Badge>
            </div>
          </div>
          
          <div v-if="user.terminalId">
            <Label class="text-gray-600">Terminal</Label>
            <p class="font-medium">{{ getTerminalName(user.terminalId) }}</p>
          </div>
          
          <div v-if="user.regionId">
            <Label class="text-gray-600">Region</Label>
            <p class="font-medium">{{ getRegionName(user.regionId) }}</p>
          </div>
          
          <div v-if="user.ssoProvider">
            <Label class="text-gray-600">SSO Provider</Label>
            <div class="flex items-center space-x-2">
              <Badge variant="outline">
                {{ user.ssoProvider === 'talenta' ? 'Talenta HRIS' : 'Idaman SSO' }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Account Status -->
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <Label class="text-gray-600">Status</Label>
            <div class="flex items-center space-x-2">
              <Badge :variant="getStatusBadgeVariant(user.status)">
                {{ user.status }}
              </Badge>
            </div>
          </div>
          
          <div>
            <Label class="text-gray-600">Multi-Factor Authentication</Label>
            <div class="flex items-center space-x-2">
              <Badge :variant="user.mfaEnabled ? 'default' : 'secondary'">
                <Shield class="h-3 w-3 mr-1" />
                {{ user.mfaEnabled ? 'Enabled' : 'Disabled' }}
              </Badge>
            </div>
          </div>
          
          <div>
            <Label class="text-gray-600">Last Login</Label>
            <p class="font-medium text-sm">
              {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
            </p>
          </div>
          
          <div>
            <Label class="text-gray-600">Account Created</Label>
            <p class="font-medium text-sm">
              {{ formatDate(user.createdAt) }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Activity Summary -->
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-gray-600">Work Orders Assigned</Label>
              <p class="text-2xl font-bold text-blue-600">{{ activityStats.workOrdersAssigned }}</p>
            </div>
            
            <div>
              <Label class="text-gray-600">Work Orders Completed</Label>
              <p class="text-2xl font-bold text-green-600">{{ activityStats.workOrdersCompleted }}</p>
            </div>
            
            <div>
              <Label class="text-gray-600">Completion Rate</Label>
              <p class="text-2xl font-bold text-purple-600">{{ activityStats.completionRate }}%</p>
            </div>
            
            <div>
              <Label class="text-gray-600">Average Rating</Label>
              <div class="flex items-center space-x-1">
                <p class="text-2xl font-bold text-yellow-600">{{ activityStats.averageRating }}</p>
                <div class="flex">
                  <Star 
                    v-for="i in 5" 
                    :key="i"
                    class="h-4 w-4"
                    :class="i <= Math.round(activityStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Notes Section -->
    <Card v-if="user.notes">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-gray-700 whitespace-pre-line">{{ user.notes }}</p>
      </CardContent>
    </Card>

    <!-- Status History -->
    <Card v-if="statusHistory.length > 0">
      <CardHeader>
        <CardTitle>Status History</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div 
            v-for="entry in statusHistory" 
            :key="entry.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <Badge :variant="getStatusBadgeVariant(entry.status)">
                {{ entry.status }}
              </Badge>
              <div>
                <p class="text-sm font-medium">{{ entry.reason }}</p>
                <p class="text-xs text-gray-600">
                  by {{ entry.changedBy }} • {{ formatDate(entry.changedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Role History -->
    <Card v-if="roleHistory.length > 0">
      <CardHeader>
        <CardTitle>Role History</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div 
            v-for="entry in roleHistory" 
            :key="entry.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2">
                <Badge :variant="getRoleBadgeVariant(entry.fromRole)" class="text-xs">
                  {{ entry.fromRole }}
                </Badge>
                <ArrowRight class="h-3 w-3 text-gray-400" />
                <Badge :variant="getRoleBadgeVariant(entry.toRole)" class="text-xs">
                  {{ entry.toRole }}
                </Badge>
              </div>
              <div>
                <p class="text-sm font-medium">{{ entry.reason }}</p>
                <p class="text-xs text-gray-600">
                  by {{ entry.changedBy }} • {{ formatDate(entry.changedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import { 
  Edit, X, MoreVertical, UserCog, UserPlus, Key, Shield, Trash2, 
  Star, ArrowRight 
} from 'lucide-vue-next';

// Props and Emits
interface Props {
  user: User;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [user: User];
  delete: [user: User];
  'change-status': [user: User];
  promote: [user: User];
  close: [];
}>();

// Computed Properties
const initials = computed(() => {
  return props.user.name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const statusIndicatorClass = computed(() => {
  switch (props.user.status) {
    case 'active': return 'bg-green-500';
    case 'inactive': return 'bg-gray-400';
    case 'suspended': return 'bg-red-500';
    case 'terminated': return 'bg-red-700';
    default: return 'bg-gray-400';
  }
});

// Mock data for display
const activityStats = {
  workOrdersAssigned: 47,
  workOrdersCompleted: 43,
  completionRate: 91,
  averageRating: 4.2
};

const statusHistory = [
  {
    id: '1',
    status: 'active' as const,
    reason: 'Account reactivated after training completion',
    changedBy: 'Ahmad Sutrisno',
    changedAt: '2024-01-15T08:30:00Z'
  },
  {
    id: '2',
    status: 'suspended' as const,
    reason: 'Temporary suspension for additional training',
    changedBy: 'Budi Santoso',
    changedAt: '2024-01-10T14:20:00Z'
  }
];

const roleHistory = [
  {
    id: '1',
    fromRole: 'worker' as const,
    toRole: 'supervisor' as const,
    reason: 'Promotion based on performance and completed leadership training',
    changedBy: 'Ahmad Sutrisno',
    changedAt: '2023-12-01T09:00:00Z'
  }
];

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

const getTerminalName = (terminalId: string): string => {
  const terminals: Record<string, string> = {
    'terminal1': 'Jakarta Terminal (JKT01)',
    'terminal2': 'Surabaya Terminal (SBY01)',
    'terminal3': 'Medan Terminal (MDN01)',
    'terminal4': 'Balikpapan Terminal (BPN01)',
    'terminal5': 'Palembang Terminal (PLB01)'
  };
  return terminals[terminalId] || terminalId;
};

const getRegionName = (regionId: string): string => {
  const regions: Record<string, string> = {
    'region1': 'Jakarta & West Java (REG01)',
    'region2': 'Central & East Java (REG02)',
    'region3': 'Sumatra (REG03)',
    'region4': 'Kalimantan & Eastern Indonesia (REG04)'
  };
  return regions[regionId] || regionId;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const resetPassword = () => {
  // Implement password reset logic
  console.log('Reset password for user:', props.user.id);
};

const resetMFA = () => {
  // Implement MFA reset logic
  console.log('Reset MFA for user:', props.user.id);
};
</script>