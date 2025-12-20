import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WorkOrder, CreateWorkOrderForm, WorkOrderStatus, Priority } from '@/types';
import { useAuthStore } from './auth';

export const useWorkOrderStore = defineStore('workorder', () => {
  const workOrders = ref<WorkOrder[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Computed getters
  const myWorkOrders = computed(() => {
    if (!authStore.currentUser) return [];

    if (authStore.isWorker) {
      return workOrders.value.filter(wo => wo.assignedWorkerId === authStore.currentUser?.id);
    }

    if (authStore.isAdmin && authStore.currentUser?.terminalId) {
      return workOrders.value.filter(wo => wo.terminalId === authStore.currentUser?.terminalId);
    }

    if (authStore.isSupervisor && authStore.currentUser?.regionId) {
      // Get work orders from terminals in the supervisor's region
      // TODO: implement proper region-based filtering
      return workOrders.value;
    }

    // Default: return all work orders
    return workOrders.value;
  });

  const pendingApproval = computed(() => 
    workOrders.value.filter(wo => wo.status === 'pending_approval')
  );

  const inProgress = computed(() => 
    workOrders.value.filter(wo => wo.status === 'in_progress')
  );

  const overdue = computed(() => 
    workOrders.value.filter(wo => {
      const now = new Date();
      const dueDate = new Date(wo.dueDate);
      return dueDate < now && !['completed', 'rejected'].includes(wo.status);
    })
  );

  const submitForReview = computed(() =>
    workOrders.value.filter(wo => wo.status === 'submitted_for_review')
  );

  // Actions
  const fetchWorkOrders = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data will be loaded from mock service
      const mockWorkOrders = await import('@/mock/workorders').then(m => m.mockWorkOrders);
      
      if (!mockWorkOrders || !Array.isArray(mockWorkOrders)) {
        throw new Error('Invalid work orders data received');
      }
      
      workOrders.value = mockWorkOrders;
      console.log(`Loaded ${mockWorkOrders.length} work orders`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work orders';
      error.value = errorMessage;
      console.error('fetchWorkOrders error:', err);
      throw err; // Re-throw to allow components to handle
    } finally {
      isLoading.value = false;
    }
  };

  const createWorkOrder = async (formData: CreateWorkOrderForm) => {
    if (!authStore.currentUser) {
      throw new Error('User not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newWorkOrder: WorkOrder = {
        id: `wo_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        subType: formData.subType,
        status: 'draft',
        priority: formData.priority,
        terminalId: formData.terminalId,
        assignedWorkerId: formData.assignedWorkerId,
        createdBy: authStore.currentUser.id,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        estimatedDuration: formData.estimatedDuration,
        parentId: formData.parentId,
        
        // Template integration fields
        inheritedFromTemplate: false,
        customizations: [],
        checklistLocked: false,
        
        checklist: [],
        beforePhotos: [],
        afterPhotos: [],
        materials: formData.materials,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      workOrders.value.push(newWorkOrder);
      return newWorkOrder;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create work order';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateWorkOrderStatus = async (id: string, status: WorkOrderStatus, _notes?: string) => {
    if (!authStore.currentUser) {
      throw new Error('User not authenticated');
    }

    const workOrder = workOrders.value.find(wo => wo.id === id);
    if (!workOrder) {
      throw new Error('Work order not found');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      workOrder.status = status;
      workOrder.updatedAt = new Date().toISOString();

      if (status === 'completed') {
        workOrder.completedAt = new Date().toISOString();
      }

      if (status === 'pending_approval') {
        workOrder.status = 'pending_approval';
      }

      if (status === 'assigned' && authStore.isSupervisor) {
        workOrder.approvedBy = authStore.currentUser.id;
      }

      return workOrder;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update work order';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const assignWorker = async (workOrderId: string, workerId: string) => {
    if (!authStore.hasPermission('assign_workers')) {
      throw new Error('Insufficient permissions');
    }

    const workOrder = workOrders.value.find(wo => wo.id === workOrderId);
    if (!workOrder) {
      throw new Error('Work order not found');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      workOrder.assignedWorkerId = workerId;
      workOrder.status = 'assigned';
      workOrder.updatedAt = new Date().toISOString();

      return workOrder;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to assign worker';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const submitDocumentation = async (
    workOrderId: string, 
    documentation: {
      type: 'before' | 'after';
      photos: File[];
      notes: string;
      checklistData: Record<string, any>;
    }
  ) => {
    if (!authStore.isWorker) {
      throw new Error('Only workers can submit documentation');
    }

    const workOrder = workOrders.value.find(wo => wo.id === workOrderId);
    if (!workOrder) {
      throw new Error('Work order not found');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (documentation.type === 'before') {
        workOrder.beforeNotes = documentation.notes;
        workOrder.status = 'in_progress';
        // Update checklist before values
        workOrder.checklist.forEach(item => {
          if (documentation.checklistData[item.id] !== undefined) {
            item.beforeValue = documentation.checklistData[item.id];
          }
        });
      } else {
        workOrder.afterNotes = documentation.notes;
        workOrder.status = 'submitted_for_review';
        // Update checklist after values
        workOrder.checklist.forEach(item => {
          if (documentation.checklistData[item.id] !== undefined) {
            item.afterValue = documentation.checklistData[item.id];
          }
        });
      }

      workOrder.updatedAt = new Date().toISOString();

      return workOrder;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit documentation';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getWorkOrderById = (id: string) => {
    return workOrders.value.find(wo => wo.id === id);
  };

  const getWorkOrderByIdAsync = async (id: string): Promise<WorkOrder | null> => {
    // Check if already in store
    let workOrder = workOrders.value.find(wo => wo.id === id);
    if (workOrder) {
      return workOrder;
    }
    
    // If not found and store is empty, try fetching all
    if (workOrders.value.length === 0) {
      await fetchWorkOrders();
      workOrder = workOrders.value.find(wo => wo.id === id);
    }
    
    // If still not found, try direct fetch (for future API implementation)
    if (!workOrder) {
      try {
        // This would be a direct API call in real implementation
        // For now, return null as it's not in mock data
        console.log(`Work order ${id} not found in mock data`);
        return null;
      } catch (error) {
        console.error('Failed to fetch individual work order:', error);
        return null;
      }
    }
    
    return workOrder;
  };

  const getWorkOrdersByStatus = (status: WorkOrderStatus) => {
    return workOrders.value.filter(wo => wo.status === status);
  };

  const getWorkOrdersByPriority = (priority: Priority) => {
    return workOrders.value.filter(wo => wo.priority === priority);
  };

  return {
    workOrders,
    isLoading,
    error,
    myWorkOrders,
    pendingApproval,
    inProgress,
    overdue,
    submitForReview,
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrderStatus,
    assignWorker,
    submitDocumentation,
    getWorkOrderById,
    getWorkOrderByIdAsync,
    getWorkOrdersByStatus,
    getWorkOrdersByPriority
  };
});