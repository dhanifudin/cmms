<template>
  <div class="h-full flex flex-col">
    <!-- Page Header -->
    <div class="border-b border-gray-200 p-3 md:p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg md:text-2xl font-bold">Work Orders</h1>
          <p class="text-gray-600 mt-1 text-sm md:text-base hidden sm:block">
            Manage and monitor all work orders
          </p>
        </div>
        
        <!-- Quick Stats -->
        <div class="hidden lg:flex items-center space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ overdueCount }}</div>
            <div class="text-xs text-gray-500">Overdue</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ inProgressCount }}</div>
            <div class="text-xs text-gray-500">In Progress</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ assignedCount }}</div>
            <div class="text-xs text-gray-500">Assigned</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ completedTodayCount }}</div>
            <div class="text-xs text-gray-500">Completed Today</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <WorkOrderTable
        :user-role="currentUserRole"
        @create="handleCreateWorkOrder"
        @view="handleViewWorkOrder"
        @edit="handleEditWorkOrder"
        @delete="handleDeleteWorkOrder"
        @status-change="handleStatusChange"
        @reassign="handleReassign"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useWorkOrderTableStore } from '@/stores/work-order-table';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderTableRow } from '@/types';

// Components
import WorkOrderTable from '@/components/work-order/WorkOrderTable.vue';

// Store and composables
const workOrderStore = useWorkOrderTableStore();
const authStore = useAuthStore();
const { toast } = useToast();

// Local state
const currentUserRole = computed(() => {
  // Map auth store role to work order table role
  const role = authStore.currentUser?.role;
  if (role === 'admin' || role === 'supervisor') return role;
  return 'worker';
});

// Computed stats
const overdueCount = computed(() => {
  return workOrderStore.state.rows.filter(wo => wo.isOverdue).length;
});

const inProgressCount = computed(() => {
  return workOrderStore.state.rows.filter(wo => wo.status === 'in_progress').length;
});

const assignedCount = computed(() => {
  return workOrderStore.state.rows.filter(wo => wo.status === 'assigned').length;
});

const completedTodayCount = computed(() => {
  const today = new Date().toISOString().split('T')[0] || '';
  return workOrderStore.state.rows.filter(wo => 
    wo.status === 'completed' && wo.lastUpdated.startsWith(today)
  ).length;
});

// Event handlers
const handleCreateWorkOrder = () => {
  console.log('Create work order');
};

const handleViewWorkOrder = (workOrder: WorkOrderTableRow) => {
  console.log('View work order:', workOrder);
};

const handleEditWorkOrder = (workOrder: WorkOrderTableRow) => {
  console.log('Edit work order:', workOrder);
};

const handleDeleteWorkOrder = async (workOrder: WorkOrderTableRow) => {
  try {
    await workOrderStore.executeBulkAction({
      type: 'delete',
      workOrderIds: [workOrder.id]
    });
    
    toast({
      title: 'Success',
      description: `Work order ${workOrder.code} deleted successfully`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to delete work order',
      variant: 'destructive'
    });
  }
};

const handleStatusChange = async (workOrder: WorkOrderTableRow, newStatus: string) => {
  try {
    await workOrderStore.updateWorkOrder(workOrder.id, { 
      status: newStatus as WorkOrderTableRow['status'] 
    });
    
    toast({
      title: 'Success',
      description: `Work order status updated to ${newStatus.replace('_', ' ')}`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update work order status',
      variant: 'destructive'
    });
  }
};

const handleReassign = async (workOrder: WorkOrderTableRow, newAssigneeId: string) => {
  try {
    const mockUser = {
      id: newAssigneeId,
      name: 'New Worker',
      role: 'worker' as const
    };
    
    await workOrderStore.updateWorkOrder(workOrder.id, { 
      assignedTo: mockUser
    });
    
    toast({
      title: 'Success',
      description: `Work order reassigned to ${mockUser.name}`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to reassign work order',
      variant: 'destructive'
    });
  }
};

// Lifecycle
onMounted(() => {
  // Set user role in store for permissions
  workOrderStore.setUserRole(currentUserRole.value);
  
  // Fetch initial data if not already loaded
  if (workOrderStore.state.rows.length === 0) {
    workOrderStore.fetchWorkOrders();
  }
});
</script>