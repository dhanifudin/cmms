<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
        <p class="mt-2 text-sm text-gray-600">
          Manage user accounts, roles, and permissions across all terminals
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <Button variant="outline" @click="exportUsers" :disabled="loading">
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" @click="showBulkOperations = true" :disabled="selectedUsers.length === 0">
          <Users class="h-4 w-4 mr-2" />
          Bulk Actions ({{ selectedUsers.length }})
        </Button>
        <Button @click="showCreateUser = true">
          <Plus class="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <Users class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.totalUsers }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100">
              <UserCheck class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.activeUsers }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100">
              <UserPlus class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">New This Month</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.newUsersThisMonth }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100">
              <Shield class="h-6 w-6 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">MFA Adoption</p>
              <p class="text-2xl font-bold text-gray-900">{{ Math.round(userStats.mfaAdoptionRate) }}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Role Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(count, role) in userStats.usersByRole" :key="role" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Badge :variant="getRoleBadgeVariant(role)" class="w-16 justify-center">
                  {{ role }}
                </Badge>
              </div>
              <span class="font-semibold text-gray-900">{{ count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(count, status) in userStats.usersByStatus" :key="status" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Badge :variant="getStatusBadgeVariant(status)" class="w-16 justify-center">
                  {{ status }}
                </Badge>
              </div>
              <span class="font-semibold text-gray-900">{{ count }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- User List -->
    <UserListComponent 
      v-model:selected-users="selectedUsers"
      @edit-user="handleEditUser"
      @view-user="handleViewUser"
      @delete-user="handleDeleteUser"
      @change-status="handleChangeStatus"
      @promote-user="handlePromoteUser"
    />

    <!-- Create User Dialog -->
    <Dialog :open="showCreateUser" @update:open="showCreateUser = false">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system with appropriate role and permissions.
          </DialogDescription>
        </DialogHeader>
        
        <CreateUserFormComponent 
          @submit="handleCreateUser"
          @cancel="showCreateUser = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Edit User Dialog -->
    <Dialog :open="showEditUser" @update:open="showEditUser = false">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <EditUserFormComponent 
          v-if="selectedUser"
          :user="selectedUser"
          @submit="handleUpdateUser"
          @cancel="showEditUser = false"
        />
      </DialogContent>
    </Dialog>

    <!-- User Detail Dialog -->
    <Dialog :open="showUserDetail" @update:open="showUserDetail = false">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <UserDetailView 
          v-if="selectedUser"
          :user="selectedUser"
          @edit="handleEditUser"
          @delete="handleDeleteUser"
          @change-status="handleChangeStatus"
          @promote="handlePromoteUser"
          @close="showUserDetail = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Bulk Operations Dialog -->
    <Dialog :open="showBulkOperations" @update:open="showBulkOperations = false">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Operations</DialogTitle>
          <DialogDescription>
            Perform actions on {{ selectedUsers.length }} selected users.
          </DialogDescription>
        </DialogHeader>
        
        <BulkOperationsComponent
          :selected-users="selectedUsers"
          @submit="handleBulkOperation"
          @cancel="showBulkOperations = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Status Change Dialog -->
    <Dialog :open="showStatusChange" @update:open="showStatusChange = false">
      <DialogContent class="max-w-md">
        <StatusChangeDialog
          v-if="selectedUser"
          :user="selectedUser"
          @submit="handleStatusChangeConfirm"
          @cancel="showStatusChange = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Role Promotion Dialog -->
    <Dialog :open="showRolePromotion" @update:open="showRolePromotion = false">
      <DialogContent class="max-w-2xl">
        <RolePromotionDialog
          v-if="selectedUser"
          :user="selectedUser"
          @submit="handleRolePromotionConfirm"
          @cancel="showRolePromotion = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserManagementStore } from '@/stores/userManagement';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/use-toast';
import type { User, CreateUserForm, UpdateUserForm, UserStatus, UserRole, BulkUserOperation } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Custom Components
import UserListComponent from '@/components/users/UserList.vue';
import CreateUserFormComponent from '@/components/users/CreateUserForm.vue';
import EditUserFormComponent from '@/components/users/EditUserForm.vue';
import UserDetailView from '@/components/users/UserDetailView.vue';
import BulkOperationsComponent from '@/components/users/BulkOperations.vue';
import StatusChangeDialog from '@/components/users/StatusChangeDialog.vue';
import RolePromotionDialog from '@/components/users/RolePromotionDialog.vue';

// Icons
import { 
  Plus, Download, Users, UserCheck, UserPlus, Shield
} from 'lucide-vue-next';

// Stores and composables
const userManagementStore = useUserManagementStore();
const authStore = useAuthStore();
const { toast } = useToast();

// State
const selectedUsers = ref<string[]>([]);
const selectedUser = ref<User | null>(null);
const showCreateUser = ref(false);
const showEditUser = ref(false);
const showUserDetail = ref(false);
const showBulkOperations = ref(false);
const showStatusChange = ref(false);
const showRolePromotion = ref(false);

// Computed
const loading = computed(() => userManagementStore.loading);
const userStats = computed(() => userManagementStore.userManagementStats);

// Badge variants
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

// Event handlers
const handleCreateUser = async (userData: CreateUserForm) => {
  try {
    await userManagementStore.createUser(userData);
    showCreateUser.value = false;
    toast({
      title: 'User Created',
      description: `User ${userData.name} has been created successfully.`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to create user',
      variant: 'destructive'
    });
  }
};

const handleEditUser = (user: User) => {
  selectedUser.value = user;
  showEditUser.value = true;
};

const handleViewUser = (user: User) => {
  selectedUser.value = user;
  showUserDetail.value = true;
};

const handleUpdateUser = async (userData: UpdateUserForm) => {
  if (!selectedUser.value) return;
  
  try {
    await userManagementStore.updateUser(selectedUser.value.id, userData);
    showEditUser.value = false;
    selectedUser.value = null;
    toast({
      title: 'User Updated',
      description: 'User information has been updated successfully.'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to update user',
      variant: 'destructive'
    });
  }
};

const handleDeleteUser = (user: User) => {
  selectedUser.value = user;
  // In a real implementation, this would show a confirmation dialog
  toast({
    title: 'Delete User',
    description: 'Delete functionality will be implemented in the next phase.',
    variant: 'destructive'
  });
};

const handleChangeStatus = (user: User) => {
  selectedUser.value = user;
  showStatusChange.value = true;
};

const handleStatusChangeConfirm = async (data: { status: UserStatus; reason: string }) => {
  if (!selectedUser.value) return;
  
  try {
    await userManagementStore.changeUserStatus(selectedUser.value.id, data.status, data.reason);
    showStatusChange.value = false;
    selectedUser.value = null;
    toast({
      title: 'Status Changed',
      description: `User status has been changed to ${data.status}.`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to change user status',
      variant: 'destructive'
    });
  }
};

const handlePromoteUser = (user: User) => {
  selectedUser.value = user;
  showRolePromotion.value = true;
};

const handleRolePromotionConfirm = async (data: { 
  role: UserRole; 
  reason: string; 
  trainingCompleted: boolean;
  performanceScore?: number;
}) => {
  if (!selectedUser.value) return;
  
  try {
    await userManagementStore.promoteUser(
      selectedUser.value.id, 
      data.role, 
      data.reason, 
      data.trainingCompleted,
      data.performanceScore
    );
    showRolePromotion.value = false;
    selectedUser.value = null;
    toast({
      title: 'Role Changed',
      description: `User has been promoted to ${data.role}.`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to promote user',
      variant: 'destructive'
    });
  }
};

const handleBulkOperation = async (operation: BulkUserOperation) => {
  try {
    await userManagementStore.bulkUpdateUsers(operation);
    showBulkOperations.value = false;
    selectedUsers.value = [];
    
    const progress = userManagementStore.bulkOperationProgress;
    toast({
      title: 'Bulk Operation Complete',
      description: `Processed ${progress.completed}/${progress.total} users. ${progress.errors.length} errors.`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to complete bulk operation',
      variant: 'destructive'
    });
  }
};

const exportUsers = async () => {
  try {
    const result = await userManagementStore.exportUsers(
      selectedUsers.value.length > 0 ? selectedUsers.value : undefined
    );
    
    // Create and trigger download
    const blob = new Blob([result.content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: `Exported ${result.count} users to ${result.filename}`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to export users',
      variant: 'destructive'
    });
  }
};

// Initialize
onMounted(async () => {
  // Initialize user management store if not already done
  authStore.initializeUserManagement();
  
  // Fetch users
  await userManagementStore.fetchUsers();
});
</script>