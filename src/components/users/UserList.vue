<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>User Directory</CardTitle>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            <X class="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            @click="refreshUsers"
            :disabled="loading"
          >
            <RotateCcw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div class="md:col-span-2">
          <Label>Search Users</Label>
          <Input
            v-model="searchQuery"
            placeholder="Search by name, email, or employee ID..."
            class="mt-1"
          >
            <template #prefix>
              <Search class="h-4 w-4 text-muted-foreground" />
            </template>
          </Input>
        </div>

        <div>
          <Label>Role</Label>
          <Select v-model="roleFilter">
            <SelectTrigger class="mt-1">
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
          <Label>Status</Label>
          <Select v-model="statusFilter">
            <SelectTrigger class="mt-1">
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

        <div>
          <Label>Terminal</Label>
          <Select v-model="terminalFilter">
            <SelectTrigger class="mt-1">
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
          <Label>SSO Provider</Label>
          <Select v-model="ssoFilter">
            <SelectTrigger class="mt-1">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All Providers</SelectItem>
              <SelectItem value="talenta">Talenta</SelectItem>
              <SelectItem value="idaman">Idaman</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="flex items-center justify-between mb-4">
        <div class="text-sm text-muted-foreground">
          Showing {{ paginatedUsers.length }} of {{ filteredUsers.length }} users
          <span v-if="hasActiveFilters">(filtered from {{ totalUsers }})</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <Label class="text-sm">Rows per page:</Label>
          <Select v-model="pageSizeStr">
            <SelectTrigger class="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- User Table -->
      <div class="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">
                <Checkbox
                  :checked="isAllSelected"
                  :indeterminate="isPartiallySelected"
                  @update:checked="toggleSelectAll"
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terminal</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>MFA</TableHead>
              <TableHead class="w-32">Actions</TableHead>
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
                <div class="flex items-center space-x-3">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback>
                      {{ user.name.split(' ').map(n => n[0]).join('').toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div class="font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                    <div v-if="user.employeeId" class="text-xs text-gray-400">
                      ID: {{ user.employeeId }}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge :variant="getRoleBadgeVariant(user.role)">
                  {{ user.role }}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge :variant="getStatusBadgeVariant(user.status)">
                  {{ user.status }}
                </Badge>
              </TableCell>

              <TableCell>
                <span v-if="user.terminalId" class="text-sm text-gray-600">
                  {{ user.terminalId }}
                </span>
                <span v-else class="text-sm text-gray-400">—</span>
              </TableCell>

              <TableCell>
                <span v-if="user.lastLogin" class="text-sm text-gray-600">
                  {{ formatLastLogin(user.lastLogin) }}
                </span>
                <span v-else class="text-sm text-gray-400">Never</span>
              </TableCell>

              <TableCell>
                <Badge v-if="user.mfaEnabled" variant="outline" class="text-green-600">
                  <Shield class="h-3 w-3 mr-1" />
                  MFA
                </Badge>
                <span v-else class="text-sm text-gray-400">—</span>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="$emit('view-user', user)">
                      <Eye class="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem @click="$emit('edit-user', user)">
                      <Edit class="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem @click="$emit('change-status', user)">
                      <UserCheck class="h-4 w-4 mr-2" />
                      Change Status
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      v-if="canPromoteUser(user)"
                      @click="$emit('promote-user', user)"
                    >
                      <Crown class="h-4 w-4 mr-2" />
                      Promote
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      @click="$emit('delete-user', user)"
                      :disabled="!canDeleteUser(user)"
                      class="text-destructive focus:text-destructive"
                    >
                      <Trash2 class="h-4 w-4 mr-2" />
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
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <div class="text-sm text-muted-foreground">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            @click="setPage(1)"
            :disabled="currentPage === 1"
          >
            <ChevronsLeft class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="setPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          
          <div class="flex items-center space-x-1">
            <Button
              v-for="page in visiblePages"
              :key="page"
              :variant="page === currentPage ? 'default' : 'outline'"
              size="sm"
              class="w-8"
              @click="setPage(page)"
            >
              {{ page }}
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            @click="setPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="setPage(totalPages)"
            :disabled="currentPage === totalPages"
          >
            <ChevronsRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUserManagementStore } from '@/stores/userManagement';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types';

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
  Shield, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
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

// Local state
const searchQuery = ref('');
const roleFilter = ref('__ALL__');
const statusFilter = ref('__ALL__');
const terminalFilter = ref('__ALL__');
const ssoFilter = ref('__ALL__');
const pageSizeStr = ref('20');

// Computed
const loading = computed(() => userManagementStore.loading);
const currentPage = computed(() => userManagementStore.currentPage);
const totalPages = computed(() => userManagementStore.totalPages);
const totalUsers = computed(() => userManagementStore.users.length);
const filteredUsers = computed(() => userManagementStore.filteredUsers);
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

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages: number[] = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      pages.push(total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(current - 2, current - 1, current, current + 1, current + 2);
    }
  }
  
  return pages;
});

// Watch for filter changes
watch([searchQuery, roleFilter, statusFilter, terminalFilter, ssoFilter], () => {
  const filters = {
    search: searchQuery.value || undefined,
    role: roleFilter.value !== '__ALL__' ? roleFilter.value as any : undefined,
    status: statusFilter.value !== '__ALL__' ? statusFilter.value as any : undefined,
    terminalId: terminalFilter.value !== '__ALL__' ? terminalFilter.value : undefined,
    ssoProvider: ssoFilter.value !== '__ALL__' ? ssoFilter.value as any : undefined,
  };
  
  userManagementStore.fetchUsers(filters);
}, { deep: true });

watch(pageSizeStr, (newSize) => {
  userManagementStore.pageSize = parseInt(newSize);
  userManagementStore.setPage(1);
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

const setPage = (page: number) => {
  userManagementStore.setPage(page);
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