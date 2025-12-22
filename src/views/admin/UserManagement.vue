<template>
  <div class="space-y-3 p-2 sm:p-4 lg:p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
    </div>

    <!-- Compact Summary Bar -->
    <div class="bg-gray-50 rounded-lg p-2 sm:p-3">
      <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <!-- Top/Left: Key metrics -->
        <div class="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm">
          <div class="flex items-center space-x-1 sm:space-x-2">
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></div>
            <span class="text-gray-600 whitespace-nowrap">{{ userStats.totalUsers }} Total</span>
          </div>
          <div class="flex items-center space-x-1 sm:space-x-2">
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
            <span class="text-gray-600 whitespace-nowrap">{{ userStats.activeUsers }} Active</span>
          </div>
          <div v-if="selectedUsers.length > 0" class="flex items-center space-x-1 sm:space-x-2">
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"></div>
            <span class="text-blue-600 font-medium whitespace-nowrap">{{ selectedUsers.length }} Selected</span>
          </div>
        </div>

        <!-- Bottom/Right: Quick actions -->
        <div class="flex items-center justify-between sm:justify-end">
          <div class="text-xs text-gray-500 sm:hidden">
            SSO managed
          </div>
          
          <div class="flex items-center space-x-1 sm:space-x-2">
            <Button 
              v-if="selectedUsers.length > 0"
              variant="outline" 
              size="sm"
              class="px-2 sm:px-3"
              @click="showBulkOperations = true"
            >
              <Users class="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span class="hidden sm:inline">Bulk</span> ({{ selectedUsers.length }})
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              class="px-2 sm:px-3"
              @click="exportUsers" 
              :disabled="loading"
            >
              <Download class="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span class="hidden sm:inline">Export</span>
            </Button>
            
            <div class="hidden sm:block text-xs text-gray-500">
              Users managed via SSO
            </div>
          </div>
        </div>
      </div>
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
import type { User, UpdateUserForm, UserStatus, UserRole, BulkUserOperation } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Custom Components
import UserListComponent from '@/components/users/UserList.vue';
import EditUserFormComponent from '@/components/users/EditUserForm.vue';
import UserDetailView from '@/components/users/UserDetailView.vue';
import BulkOperationsComponent from '@/components/users/BulkOperations.vue';
import StatusChangeDialog from '@/components/users/StatusChangeDialog.vue';
import RolePromotionDialog from '@/components/users/RolePromotionDialog.vue';

// Icons
import { 
  Download, Users
} from 'lucide-vue-next';

// Stores and composables
const userManagementStore = useUserManagementStore();
const authStore = useAuthStore();
const { toast } = useToast();

// State
const selectedUsers = ref<string[]>([]);
const selectedUser = ref<User | null>(null);
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
  // Users cannot be deleted - they are managed via SSO
  toast({
    title: 'Action Not Allowed',
    description: 'Users cannot be deleted. Please manage user access through the SSO system (Talenta/Idaman).',
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