import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WorkOrder, CreateWorkOrderForm, WorkOrderStatus, Priority } from '@/types';
import { useAuthStore } from './auth';

export const useWorkOrderStore = defineStore('workorder', () => {
  const workOrders = ref<WorkOrder[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Terminal-based filtering helper
  const getFilteredWorkOrders = computed(() => {
    if (!authStore.currentUser) return [];

    // Workers: Only see work orders assigned to them in their terminal
    if (authStore.isWorker && authStore.currentUser?.terminalId) {
      return workOrders.value.filter(wo => 
        wo.assignedWorkerId === authStore.currentUser?.id &&
        wo.terminalId === authStore.currentUser?.terminalId
      );
    }

    // Admins: Only see work orders from their terminal
    if (authStore.isAdmin && authStore.currentUser?.terminalId) {
      return workOrders.value.filter(wo => 
        wo.terminalId === authStore.currentUser?.terminalId
      );
    }

    // Supervisors: See work orders from all terminals in their region
    if (authStore.isSupervisor && authStore.currentUser?.regionId) {
      return workOrders.value.filter(wo => 
        wo.regionId === authStore.currentUser?.regionId
      );
    }

    // Leaders: Regional access (TBD scope - for now same as supervisor)
    if (authStore.isLeader && authStore.currentUser?.regionId) {
      return workOrders.value.filter(wo => 
        wo.regionId === authStore.currentUser?.regionId
      );
    }

    // Fallback: no access
    return [];
  });

  // Computed getters based on filtered data
  const myWorkOrders = computed(() => getFilteredWorkOrders.value);

  const pendingApproval = computed(() => 
    getFilteredWorkOrders.value.filter(wo => wo.status === 'pending_approval')
  );

  const inProgress = computed(() => 
    getFilteredWorkOrders.value.filter(wo => wo.status === 'in_progress')
  );

  const overdue = computed(() => 
    getFilteredWorkOrders.value.filter(wo => {
      const now = new Date();
      const dueDate = new Date(wo.dueDate);
      return dueDate < now && !['completed', 'rejected'].includes(wo.status);
    })
  );

  const submitForReview = computed(() =>
    getFilteredWorkOrders.value.filter(wo => wo.status === 'submitted_for_review')
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

  // Create work order from supervisor memo
  const createWorkOrderFromMemo = async (memoId: string, memoData: import('@/types').MemoData, additionalData?: Partial<CreateWorkOrderForm>) => {
    if (!authStore.currentUser || !authStore.isAdmin) {
      throw new Error('Only admins can create work orders from memos');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const workOrderData: CreateWorkOrderForm = {
        title: memoData.workOrderSpecs.title,
        description: memoData.workOrderSpecs.description,
        type: memoData.workOrderSpecs.category.includes('Preventive') ? 'preventive' : 'corrective',
        subType: memoData.workOrderSpecs.category.includes('Emergency') ? 'incidental' : 'planned',
        priority: memoData.workOrderSpecs.priority,
        terminalId: memoData.workOrderSpecs.terminalId,
        assignedWorkerId: memoData.workOrderSpecs.suggestedWorkerId,
        startDate: new Date().toISOString(), // Start ASAP by default
        dueDate: new Date(Date.now() + (memoData.workOrderSpecs.estimatedDuration * 24 * 60 * 60 * 1000)).toISOString(),
        estimatedDuration: memoData.workOrderSpecs.estimatedDuration,
        materials: (memoData.workOrderSpecs.requiredMaterials || []).map((materialName, index) => ({
          itemId: `temp-${index}`, // Temporary ID - should be replaced with actual inventory item ID
          itemName: materialName,
          plannedQuantity: 1,
          notes: 'Added from supervisor memo'
        })),
        
        // Override with any additional data provided by admin
        ...additionalData
      };

      const newWorkOrder: WorkOrder = {
        id: `wo_memo_${Date.now()}`,
        title: workOrderData.title,
        description: workOrderData.description,
        type: workOrderData.type,
        subType: workOrderData.subType,
        status: 'pending_approval', // Goes to supervisor for approval
        priority: workOrderData.priority,
        terminalId: workOrderData.terminalId,
        assignedWorkerId: workOrderData.assignedWorkerId,
        createdBy: authStore.currentUser.id,
        startDate: workOrderData.startDate,
        dueDate: workOrderData.dueDate,
        estimatedDuration: workOrderData.estimatedDuration,
        parentId: workOrderData.parentId,
        
        // Track memo origin
        createdFromMemo: memoId,
        memoJustification: memoData.justification,
        memoUrgency: memoData.urgencyLevel,
        
        // Template integration fields
        inheritedFromTemplate: false,
        customizations: [],
        checklistLocked: false,
        
        checklist: [],
        beforePhotos: [],
        afterPhotos: [],
        materials: workOrderData.materials,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add special instructions if provided
      if (memoData.workOrderSpecs.specialInstructions) {
        newWorkOrder.description += `\n\n**Special Instructions**: ${memoData.workOrderSpecs.specialInstructions}`;
      }

      workOrders.value.push(newWorkOrder);
      
      // Update memo status to converted
      memoData.status = 'converted';
      memoData.convertedToWorkOrderId = newWorkOrder.id;
      
      return newWorkOrder;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create work order from memo';
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
    // First check if the work order exists in the filtered list (respecting permissions)
    const filteredWorkOrder = getFilteredWorkOrders.value.find(wo => wo.id === id);
    if (filteredWorkOrder) {
      return filteredWorkOrder;
    }
    
    // If not found in filtered list but user is admin/supervisor, check all work orders
    // This allows cross-terminal access for admin/supervisor roles
    if (authStore.isAdmin || authStore.isSupervisor) {
      return workOrders.value.find(wo => wo.id === id);
    }
    
    // For workers, only return work orders they have access to
    return null;
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
    createWorkOrderFromMemo,
    updateWorkOrderStatus,
    assignWorker,
    submitDocumentation,
    getWorkOrderById,
    getWorkOrderByIdAsync,
    getWorkOrdersByStatus,
    getWorkOrdersByPriority
  };
});