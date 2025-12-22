<template>
  <div class="work-order-management h-full flex flex-col">
    <!-- Page Header -->
    <div class="bg-card border-b border-border p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Work Order Management</h1>
          <p class="text-muted-foreground mt-1">
            Manage and monitor all work orders with advanced filtering and search
          </p>
        </div>
        
        <!-- Quick Stats -->
        <div class="hidden lg:flex items-center space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-destructive">{{ overdueCount }}</div>
            <div class="text-xs text-muted-foreground">Overdue</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ inProgressCount }}</div>
            <div class="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ assignedCount }}</div>
            <div class="text-xs text-muted-foreground">Assigned</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ completedTodayCount }}</div>
            <div class="text-xs text-muted-foreground">Completed Today</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Stats Cards -->
    <div class="lg:hidden bg-background p-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="text-center p-3 bg-card border rounded-lg">
          <div class="text-lg font-bold text-destructive">{{ overdueCount }}</div>
          <div class="text-xs text-muted-foreground">Overdue</div>
        </div>
        <div class="text-center p-3 bg-card border rounded-lg">
          <div class="text-lg font-bold text-orange-600">{{ inProgressCount }}</div>
          <div class="text-xs text-muted-foreground">In Progress</div>
        </div>
        <div class="text-center p-3 bg-card border rounded-lg">
          <div class="text-lg font-bold text-blue-600">{{ assignedCount }}</div>
          <div class="text-xs text-muted-foreground">Assigned</div>
        </div>
        <div class="text-center p-3 bg-card border rounded-lg">
          <div class="text-lg font-bold text-green-600">{{ completedTodayCount }}</div>
          <div class="text-xs text-muted-foreground">Today</div>
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
    
    <!-- Work Order Detail Modal -->
    <WorkOrderDetailModal
      v-if="selectedWorkOrder"
      :work-order="selectedWorkOrder"
      :permissions="workOrderStore.permissions"
      @close="selectedWorkOrder = null"
      @edit="handleEditWorkOrder"
      @status-change="handleStatusChange"
      @reassign="handleReassign"
    />
    
    <!-- Create/Edit Work Order Modal -->
    <WorkOrderFormModal
      v-if="showWorkOrderForm"
      :work-order="editingWorkOrder"
      :mode="editingWorkOrder ? 'edit' : 'create'"
      @save="handleSaveWorkOrder"
      @cancel="closeWorkOrderForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWorkOrderTableStore } from '@/stores/work-order-table';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderTableRow } from '@/types';

// Components
import WorkOrderTable from '@/components/work-order/WorkOrderTable.vue';
import WorkOrderDetailModal from '@/components/work-order/WorkOrderDetailModal.vue';
import WorkOrderFormModal from '@/components/work-order/WorkOrderFormModal.vue';

// Store and composables
const workOrderStore = useWorkOrderTableStore();
const { toast } = useToast();

// Local state
const selectedWorkOrder = ref<WorkOrderTableRow | null>(null);
const editingWorkOrder = ref<WorkOrderTableRow | null>(null);
const showWorkOrderForm = ref(false);
// Get current user role from auth store
const authStore = useAuthStore();
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
  editingWorkOrder.value = null;
  showWorkOrderForm.value = true;
};

const handleViewWorkOrder = (workOrder: WorkOrderTableRow) => {
  selectedWorkOrder.value = workOrder;
};

const handleEditWorkOrder = (workOrder: WorkOrderTableRow) => {
  editingWorkOrder.value = workOrder;
  showWorkOrderForm.value = true;
  selectedWorkOrder.value = null; // Close detail modal if open
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
    
    // Close modals if the deleted work order was selected
    if (selectedWorkOrder.value?.id === workOrder.id) {
      selectedWorkOrder.value = null;
    }
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
    
    // Update selected work order if it's the same one
    if (selectedWorkOrder.value?.id === workOrder.id) {
      selectedWorkOrder.value = { ...selectedWorkOrder.value, status: newStatus as WorkOrderTableRow['status'] };
    }
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
    // In a real app, this would fetch user details from API
    const mockUser = {
      id: newAssigneeId,
      name: 'New Worker', // Would be fetched from API
      role: 'worker' as const
    };
    
    await workOrderStore.updateWorkOrder(workOrder.id, { 
      assignedTo: mockUser
    });
    
    toast({
      title: 'Success',
      description: `Work order reassigned to ${mockUser.name}`
    });
    
    // Update selected work order if it's the same one
    if (selectedWorkOrder.value?.id === workOrder.id) {
      selectedWorkOrder.value = { ...selectedWorkOrder.value, assignedTo: mockUser };
    }
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to reassign work order',
      variant: 'destructive'
    });
  }
};

const handleSaveWorkOrder = async (workOrderData: any) => {
  try {
    if (editingWorkOrder.value) {
      // Update existing work order
      await workOrderStore.updateWorkOrder(editingWorkOrder.value.id, workOrderData);
      toast({
        title: 'Success',
        description: 'Work order updated successfully'
      });
    } else {
      // Create new work order
      // In a real app, this would call a create API
      console.log('Creating new work order:', workOrderData);
      toast({
        title: 'Success',
        description: 'Work order created successfully'
      });
    }
    
    closeWorkOrderForm();
    
    // Refresh data to show changes
    await workOrderStore.fetchWorkOrders({ forceRefresh: true });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to save work order',
      variant: 'destructive'
    });
  }
};

const closeWorkOrderForm = () => {
  showWorkOrderForm.value = false;
  editingWorkOrder.value = null;
};

// Lifecycle
onMounted(() => {
  // Fetch initial data if not already loaded
  if (workOrderStore.state.rows.length === 0) {
    workOrderStore.fetchWorkOrders();
  }
});
</script>

<style scoped>
.work-order-management {
  height: calc(100vh - 4rem); /* Account for main layout */
}

/* Responsive layout adjustments */
@media (max-width: 768px) {
  .work-order-management {
    height: 100vh;
  }
}
</style>