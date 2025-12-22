<template>
  <Card>
    <CardHeader class="pb-2 sm:pb-4">
      <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle class="text-base sm:text-lg">User Directory</CardTitle>
        <div class="flex items-center space-x-1 sm:space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            class="px-2 text-xs sm:px-3 sm:text-sm"
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            <X class="h-3 w-3" />
            <span class="hidden sm:inline ml-1">Clear</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            class="px-2 sm:px-3"
            @click="refreshUsers"
            :disabled="loading"
          >
            <RotateCcw class="h-3 w-3" :class="{ 'animate-spin': loading }" />
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent class="pt-0">
      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div class="sm:col-span-2">
          <Label class="text-xs sm:text-sm">Search Users</Label>
          <Input
            v-model="searchQuery"
            placeholder="Search name, email, ID..."
            class="mt-1 text-sm"
          >
            <template #prefix>
              <Search class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </template>
          </Input>
        </div>

        <div>
          <Label class="text-xs sm:text-sm">Role</Label>
          <Select v-model="roleFilter">
            <SelectTrigger class="mt-1 h-8 sm:h-9 text-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="leader">Leader</SelectItem>
              <SelectItem value="worker">Worker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label class="text-xs sm:text-sm">Status</Label>
          <Select v-model="statusFilter">
            <SelectTrigger class="mt-1 h-8 sm:h-9 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="hidden sm:block">
          <Label class="text-xs sm:text-sm">Terminal</Label>
          <Select v-model="terminalFilter">
            <SelectTrigger class="mt-1 h-8 sm:h-9 text-sm">
              <SelectValue placeholder="All Terminals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All Terminals</SelectItem>
              <SelectItem v-for="terminal in terminals" :key="terminal" :value="terminal">
                {{ terminal }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Mobile Additional Filters -->
      <div class="grid grid-cols-2 gap-2 mb-3 sm:hidden">
        <div>
          <Label class="text-xs">Terminal</Label>
          <Select v-model="terminalFilter">
            <SelectTrigger class="mt-1 h-8 text-sm">
              <SelectValue placeholder="All Terminals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All Terminals</SelectItem>
              <SelectItem v-for="terminal in terminals" :key="terminal" :value="terminal">
                {{ terminal }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="text-xs">SSO</Label>
          <Select v-model="ssoFilter">
            <SelectTrigger class="mt-1 h-8 text-sm">
              <SelectValue placeholder="All SSO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All SSO</SelectItem>
              <SelectItem value="talenta">Talenta</SelectItem>
              <SelectItem value="idaman">Idaman</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="flex items-center justify-between mb-3 sm:mb-4">
        <div class="text-xs sm:text-sm text-muted-foreground">
          {{ paginatedUsers.length }} of {{ paginationState.totalItems }} users
          <span v-if="hasActiveFilters" class="hidden sm:inline">(filtered from {{ totalUsers }})</span>
        </div>
      </div>

      <!-- User Table -->
      <div class="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-8 sm:w-12">
                <Checkbox
                  :checked="isAllSelected"
                  :indeterminate="isPartiallySelected"
                  @update:checked="toggleSelectAll"
                />
              </TableHead>
              <TableHead class="cursor-pointer hover:bg-muted/50" @click="toggleSort('name')">
                <div class="flex items-center space-x-1">
                  <span class="text-xs sm:text-sm">User</span>
                  <ArrowUpDown class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead class="cursor-pointer hover:bg-muted/50" @click="toggleSort('role')">
                <div class="flex items-center space-x-1">
                  <span class="text-xs sm:text-sm">Role</span>
                  <ArrowUpDown class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead class="cursor-pointer hover:bg-muted/50" @click="toggleSort('status')">
                <div class="flex items-center space-x-1">
                  <span class="text-xs sm:text-sm">Status</span>
                  <ArrowUpDown class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead class="hidden sm:table-cell cursor-pointer hover:bg-muted/50" @click="toggleSort('terminalId')">
                <div class="flex items-center space-x-1">
                  <span class="text-xs sm:text-sm">Terminal</span>
                  <ArrowUpDown class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead class="hidden lg:table-cell cursor-pointer hover:bg-muted/50" @click="toggleSort('lastLogin')">
                <div class="flex items-center space-x-1">
                  <span class="text-xs sm:text-sm">Last Login</span>
                  <ArrowUpDown class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead class="hidden lg:table-cell">
                <span class="text-xs sm:text-sm">MFA</span>
              </TableHead>
              <TableHead class="w-16 sm:w-24">
                <span class="text-xs sm:text-sm">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="user in paginatedUsers" 
              :key="user.id"
              class="hover:bg-muted/50"
            >
              <TableCell>
                <Checkbox
                  :checked="selectedUsers.includes(user.id)"
                  @update:checked="toggleUserSelection(user.id)"
                />
              </TableCell>
              
              <TableCell>
                <div class="flex items-center space-x-2 sm:space-x-3">
                  <Avatar class="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback class="text-xs">
                      {{ user.name.split(' ').map(n => n[0]).join('').toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="min-w-0 flex-1">
                    <div class="font-medium text-gray-900 text-sm sm:text-base truncate">{{ user.name }}</div>
                    <div class="text-xs sm:text-sm text-gray-500 truncate">{{ user.email }}</div>
                    <div v-if="user.employeeId" class="text-xs text-gray-400 sm:hidden">
                      ID: {{ user.employeeId }}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge :variant="getRoleBadgeVariant(user.role)" class="text-xs px-1.5 py-0.5">
                  {{ user.role }}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge :variant="getStatusBadgeVariant(user.status)" class="text-xs px-1.5 py-0.5">
                  {{ user.status }}
                </Badge>
              </TableCell>

              <TableCell class="hidden sm:table-cell">
                <span v-if="user.terminalId" class="text-xs sm:text-sm text-gray-600">
                  {{ user.terminalId }}
                </span>
                <span v-else class="text-xs sm:text-sm text-gray-400">—</span>
              </TableCell>

              <TableCell class="hidden lg:table-cell">
                <span v-if="user.lastLogin" class="text-xs sm:text-sm text-gray-600">
                  {{ formatLastLogin(user.lastLogin) }}
                </span>
                <span v-else class="text-xs sm:text-sm text-gray-400">Never</span>
              </TableCell>

              <TableCell class="hidden lg:table-cell">
                <Badge v-if="user.mfaEnabled" variant="outline" class="text-green-600 text-xs px-1.5 py-0.5">
                  <Shield class="h-3 w-3 mr-1" />
                  MFA
                </Badge>
                <span v-else class="text-xs text-gray-400">—</span>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" class="h-6 w-6 sm:h-8 sm:w-8 p-0">
                      <MoreHorizontal class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40">
                    <DropdownMenuItem @click="$emit('view-user', user)" class="text-sm">
                      <Eye class="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem @click="$emit('edit-user', user)" class="text-sm">
                      <Edit class="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem @click="$emit('change-status', user)" class="text-sm">
                      <UserCheck class="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Change Status
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      v-if="canPromoteUser(user)"
                      @click="$emit('promote-user', user)"
                      class="text-sm"
                    >
                      <Crown class="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Promote
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      @click="$emit('delete-user', user)"
                      :disabled="!canDeleteUser(user)"
                      class="text-destructive focus:text-destructive text-sm"
                    >
                      <Trash2 class="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <DataPagination
        :current-page="paginationState.currentPage"
        :page-size="paginationState.pageSize"
        :total-items="paginationState.totalItems"
        :total-pages="paginationState.totalPages"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        class="mt-3 sm:mt-4"
      />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUserManagementStore } from '@/stores/userManagement';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types';
import type { UserPaginationSizes } from '@/types/pagination';

// Pagination Components
import DataPagination from '@/components/ui/pagination/DataPagination.vue';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Search, X, RotateCcw, MoreHorizontal, Eye, Edit, UserCheck, Crown, Trash2,
  Shield, ArrowUpDown
} from 'lucide-vue-next';

// Props & Emits
interface Props {
  selectedUsers: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selected-users': [users: string[]];
  'edit-user': [user: User];
  'view-user': [user: User];
  'delete-user': [user: User];
  'change-status': [user: User];
  'promote-user': [user: User];
}>();

// Stores
const userManagementStore = useUserManagementStore();
const authStore = useAuthStore();

// Local state for filters
const searchQuery = ref('');
const roleFilter = ref('__ALL__');
const statusFilter = ref('__ALL__');
const terminalFilter = ref('__ALL__');
const ssoFilter = ref('__ALL__');

// Computed
const loading = computed(() => userManagementStore.loading);
const paginationState = computed(() => userManagementStore.paginationState);
const totalUsers = computed(() => userManagementStore.users.length);
const paginatedUsers = computed(() => userManagementStore.paginatedUsers);

const selectedUsers = computed({
  get: () => props.selectedUsers,
  set: (value) => emit('update:selected-users', value)
});

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' ||
    roleFilter.value !== '__ALL__' ||
    statusFilter.value !== '__ALL__' ||
    terminalFilter.value !== '__ALL__' ||
    ssoFilter.value !== '__ALL__';
});

const terminals = computed(() => {
  const terminalIds = userManagementStore.users
    .map(user => user.terminalId)
    .filter((id): id is string => Boolean(id));
  return [...new Set(terminalIds)].sort();
});

const isAllSelected = computed(() => {
  return paginatedUsers.value.length > 0 && 
    paginatedUsers.value.every(user => selectedUsers.value.includes(user.id));
});

const isPartiallySelected = computed(() => {
  const selectedCount = paginatedUsers.value.filter(user => 
    selectedUsers.value.includes(user.id)
  ).length;
  return selectedCount > 0 && selectedCount < paginatedUsers.value.length;
});


// Watch for filter changes
watch(searchQuery, (newValue) => {
  userManagementStore.setSearchQuery(newValue);
});

watch(roleFilter, (newValue) => {
  userManagementStore.setRoleFilter(newValue === '__ALL__' ? '' : newValue);
});

watch(statusFilter, (newValue) => {
  userManagementStore.setStatusFilter(newValue === '__ALL__' ? '' : newValue);
});

watch(terminalFilter, (newValue) => {
  userManagementStore.setTerminalFilter(newValue === '__ALL__' ? '' : newValue);
});

watch(ssoFilter, (newValue) => {
  userManagementStore.setSsoFilter(newValue === '__ALL__' ? '' : newValue);
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

const formatLastLogin = (lastLogin: string) => {
  const date = new Date(lastLogin);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
  return date.toLocaleDateString();
};

const canPromoteUser = (user: User) => {
  return authStore.hasPermission('promote_users') && 
    user.role === 'worker' && 
    user.status === 'active';
};

const canDeleteUser = (user: User) => {
  return authStore.hasPermission('manage_users') && 
    user.id !== authStore.currentUser?.id;
};

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    const newSelection = [
      ...selectedUsers.value,
      ...paginatedUsers.value
        .filter(user => !selectedUsers.value.includes(user.id))
        .map(user => user.id)
    ];
    selectedUsers.value = newSelection;
  } else {
    const pageUserIds = paginatedUsers.value.map(user => user.id);
    selectedUsers.value = selectedUsers.value.filter(id => !pageUserIds.includes(id));
  }
};

const toggleUserSelection = (userId: string) => {
  if (selectedUsers.value.includes(userId)) {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId);
  } else {
    selectedUsers.value = [...selectedUsers.value, userId];
  }
};

const handlePageChange = (page: number) => {
  userManagementStore.setPage(page);
};

const handlePageSizeChange = (pageSize: number) => {
  userManagementStore.setPageSize(pageSize as UserPaginationSizes);
};

const toggleSort = (field: string) => {
  userManagementStore.toggleSort(field);
};

const clearFilters = () => {
  searchQuery.value = '';
  roleFilter.value = '__ALL__';
  statusFilter.value = '__ALL__';
  terminalFilter.value = '__ALL__';
  ssoFilter.value = '__ALL__';
  userManagementStore.clearFilters();
};

const refreshUsers = () => {
  userManagementStore.fetchUsers();
};
</script>