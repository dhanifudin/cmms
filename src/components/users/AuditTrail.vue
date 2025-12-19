<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">User Management Audit Trail</h2>
      <div class="flex items-center space-x-3">
        <Button variant="outline" @click="exportAuditLog">
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" @click="refreshAuditLog">
          <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label for="actionFilter">Action</Label>
            <Select v-model="filters.action">
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                <SelectItem value="user_created">User Created</SelectItem>
                <SelectItem value="user_updated">User Updated</SelectItem>
                <SelectItem value="user_deleted">User Deleted</SelectItem>
                <SelectItem value="status_changed">Status Changed</SelectItem>
                <SelectItem value="role_changed">Role Changed</SelectItem>
                <SelectItem value="password_reset">Password Reset</SelectItem>
                <SelectItem value="bulk_operation">Bulk Operation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="userFilter">User</Label>
            <Input
              id="userFilter"
              v-model="filters.userName"
              placeholder="Search by user name"
            />
          </div>

          <div>
            <Label for="adminFilter">Admin</Label>
            <Input
              id="adminFilter"
              v-model="filters.adminName"
              placeholder="Search by admin name"
            />
          </div>

          <div>
            <Label for="dateFilter">Date Range</Label>
            <Select v-model="filters.dateRange">
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="quarter">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="mt-4 flex items-center space-x-3">
          <Button @click="applyFilters">
            <Search class="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button variant="outline" @click="clearFilters">
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Audit Log Entries -->
    <div class="space-y-4">
      <div v-if="loading && auditLogs.length === 0" class="text-center py-12">
        <Loader2 class="h-8 w-8 animate-spin mx-auto mb-4" />
        <p class="text-gray-600">Loading audit trail...</p>
      </div>

      <div v-else-if="auditLogs.length === 0" class="text-center py-12">
        <FileSearch class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No audit entries found</h3>
        <p class="text-gray-600">Try adjusting your filters or check back later.</p>
      </div>

      <Card v-else>
        <CardContent class="p-0">
          <div class="divide-y">
            <div
              v-for="entry in auditLogs"
              :key="entry.id"
              class="p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start space-x-4">
                <!-- Action Icon -->
                <div class="flex-shrink-0 mt-1">
                  <div :class="getActionIconClass(entry.actionType)" class="p-2 rounded-full">
                    <component :is="getActionIcon(entry.actionType)" class="h-4 w-4" />
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ getActionTitle(entry.actionType) }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ entry.actionDescription }}</p>
                    </div>
                    <div class="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock class="h-3 w-3" />
                      <span>{{ formatDate(entry.timestamp) }}</span>
                    </div>
                  </div>

                  <!-- Details Grid -->
                  <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div v-if="entry.userId">
                      <Label class="text-gray-600">Target User ID</Label>
                      <p class="font-medium">{{ entry.userId }}</p>
                    </div>

                    <div v-if="entry.performedBy">
                      <Label class="text-gray-600">Performed By</Label>
                      <p class="font-medium">{{ entry.performedBy }}</p>
                    </div>

                    <div v-if="entry.newValues && Object.keys(entry.newValues).length > 0">
                      <Label class="text-gray-600">Changes</Label>
                      <div class="space-y-1">
                        <div v-for="(value, key) in entry.newValues" :key="key" class="flex justify-between">
                          <span class="text-gray-600 capitalize">{{ key.replace(/_/g, ' ') }}:</span>
                          <span class="font-medium">{{ formatMetadataValue(key, value) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- IP Address and Reason -->
                  <div v-if="entry.ipAddress || entry.reason" class="mt-3 flex items-center space-x-6 text-xs text-gray-500">
                    <div v-if="entry.ipAddress" class="flex items-center space-x-1">
                      <MapPin class="h-3 w-3" />
                      <span>{{ entry.ipAddress }}</span>
                    </div>
                    <div v-if="entry.reason" class="flex items-center space-x-1">
                      <span class="font-medium">Reason: {{ entry.reason }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Pagination -->
    <div v-if="totalEntries > pageSize" class="flex items-center justify-between">
      <p class="text-sm text-gray-600">
        Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalEntries) }} 
        of {{ totalEntries }} entries
      </p>
      
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="currentPage--"
          :disabled="currentPage <= 1"
        >
          <ChevronLeft class="h-4 w-4" />
          Previous
        </Button>
        
        <div class="flex items-center space-x-1">
          <Button
            v-for="page in getPageNumbers()"
            :key="page"
            :variant="page === currentPage ? 'default' : 'outline'"
            size="sm"
            @click="currentPage = page"
            class="w-8"
          >
            {{ page }}
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          @click="currentPage++"
          :disabled="currentPage >= Math.ceil(totalEntries / pageSize)"
        >
          Next
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import { useUserManagementStore } from '@/stores/userManagement';
import type { UserAuditLog, UserAuditAction } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Download, RefreshCw, Search, Clock, MapPin, FileSearch,
  Loader2, ChevronLeft, ChevronRight, UserPlus, UserMinus, Edit,
  Shield, Key, Users
} from 'lucide-vue-next';

// Store (commented out as not used)
// const userManagementStore = useUserManagementStore();

// State
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);

const filters = ref({
  action: '' as UserAuditAction | '',
  userName: '',
  adminName: '',
  dateRange: ''
});

// Mock audit data (in a real app, this would come from the store)
const auditLogs = ref<UserAuditLog[]>([
  {
    id: '1',
    actionType: 'user_created',
    actionDescription: 'New user account created',
    timestamp: '2024-01-20T10:30:00Z',
    performedBy: 'admin1',
    userId: 'user1',
    oldValues: {},
    newValues: {
      role: 'worker',
      terminal: 'Jakarta Terminal',
      department: 'Maintenance'
    },
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    actionType: 'user_updated',
    actionDescription: 'User status changed from active to suspended',
    timestamp: '2024-01-19T15:45:00Z',
    performedBy: 'supervisor1',
    userId: 'user2',
    oldValues: { status: 'active' },
    newValues: { status: 'suspended' },
    reason: 'Policy violation - requires additional training',
    ipAddress: '192.168.1.150'
  },
  {
    id: '3',
    actionType: 'user_updated',
    actionDescription: 'User role promoted from worker to supervisor',
    timestamp: '2024-01-18T09:15:00Z',
    performedBy: 'admin1',
    userId: 'user3',
    oldValues: { role: 'worker' },
    newValues: { 
      role: 'supervisor',
      performance_score: '8.5',
      training_completed: 'true'
    },
    ipAddress: '192.168.1.200'
  }
]);

const totalEntries = ref(50);

// Computed (commented out as not used)
// const filteredAuditLogs = computed(() => {
//   // In a real implementation, filtering would be done server-side
//   return auditLogs.value;
// });

// Methods
const getActionIcon = (action: UserAuditAction) => {
  switch (action) {
    case 'user_created': return UserPlus;
    case 'user_updated': return Edit;
    case 'user_deleted': return UserMinus;
    case 'status_changed': return Shield;
    case 'role_changed': return UserPlus;
    case 'password_reset': return Key;
    case 'bulk_operation': return Users;
    default: return Edit;
  }
};

const getActionIconClass = (action: UserAuditAction) => {
  switch (action) {
    case 'user_created': return 'bg-green-100 text-green-600';
    case 'user_updated': return 'bg-blue-100 text-blue-600';
    case 'user_deleted': return 'bg-red-100 text-red-600';
    case 'status_changed': return 'bg-amber-100 text-amber-600';
    case 'role_changed': return 'bg-purple-100 text-purple-600';
    case 'password_reset': return 'bg-orange-100 text-orange-600';
    case 'bulk_operation': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getActionTitle = (action: UserAuditAction) => {
  switch (action) {
    case 'user_created': return 'User Created';
    case 'user_updated': return 'User Updated';
    case 'user_deleted': return 'User Deleted';
    case 'status_changed': return 'Status Changed';
    case 'role_changed': return 'Role Changed';
    case 'password_reset': return 'Password Reset';
    case 'bulk_operation': return 'Bulk Operation';
    default: return 'Unknown Action';
  }
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

const formatMetadataValue = (key: string, value: any): string => {
  if (key === 'training_completed') {
    return value === 'true' ? 'Yes' : 'No';
  }
  if (key === 'performance_score') {
    return `${value}/10`;
  }
  return String(value);
};

// Commented out as not used
// const getBrowserInfo = (userAgent: string): string => {
//   if (userAgent.includes('Chrome')) return 'Chrome';
//   if (userAgent.includes('Firefox')) return 'Firefox';
//   if (userAgent.includes('Safari')) return 'Safari';
//   if (userAgent.includes('Edge')) return 'Edge';
//   return 'Unknown Browser';
// };

const getPageNumbers = (): number[] => {
  const totalPages = Math.ceil(totalEntries.value / pageSize.value);
  const pages: number[] = [];
  
  // Show max 5 page numbers
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages, start + 4);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
};

const applyFilters = async () => {
  loading.value = true;
  currentPage.value = 1;
  
  try {
    // In a real implementation, this would call the store method
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error applying filters:', error);
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    action: '',
    userName: '',
    adminName: '',
    dateRange: ''
  };
  applyFilters();
};

const refreshAuditLog = async () => {
  loading.value = true;
  
  try {
    // In a real implementation, this would call the store method
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error refreshing audit log:', error);
  } finally {
    loading.value = false;
  }
};

const exportAuditLog = async () => {
  try {
    // In a real implementation, this would generate a CSV/Excel file
    const csvContent = [
      'Date,Action,Description,User,Admin,IP Address',
      ...auditLogs.value.map(entry => [
        formatDate(entry.timestamp),
        getActionTitle(entry.actionType),
        entry.actionDescription,
        '', // User name would need to be looked up from user ID
        '', // Performed by name would need to be looked up from user ID
        entry.ipAddress || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting audit log:', error);
  }
};

// Initialize
onMounted(() => {
  applyFilters();
});
</script>