<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Work Orders</h1>
        <p class="mt-1 text-sm text-gray-600">
          Manage and track maintenance work orders
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <router-link
          v-if="hasPermission('create_work_orders')"
          to="/work-orders/create"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus class="w-4 h-4 mr-2" />
          Create Work Order
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted_for_review">For Review</option>
            <option value="completed">Completed</option>
            <option value="pending_approval">Pending Approval</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            v-model="filters.priority"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="filters.type"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <Search class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search work orders..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Work Orders List -->
    <div class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading work orders...
        </div>
      </div>

      <div v-else-if="filteredWorkOrders.length === 0" class="p-8 text-center text-gray-500">
        <ClipboardList class="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p class="text-lg font-medium">No work orders found</p>
        <p class="mt-1">Try adjusting your filters or create a new work order.</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="workOrder in filteredWorkOrders"
          :key="workOrder.id"
          class="p-6 hover:bg-gray-50 cursor-pointer"
          @click="$router.push(`/work-orders/${workOrder.id}`)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center">
                <h3 class="text-lg font-medium text-gray-900 truncate">
                  {{ workOrder.title }}
                </h3>
                <div class="ml-4 flex space-x-2">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="priorityColors[workOrder.priority]"
                  >
                    {{ workOrder.priority.toUpperCase() }}
                  </span>
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="statusColors[workOrder.status]"
                  >
                    {{ formatStatus(workOrder.status) }}
                  </span>
                  <span 
                    v-if="isOverdue(workOrder)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    OVERDUE
                  </span>
                </div>
              </div>
              
              <p class="mt-1 text-sm text-gray-600">
                {{ workOrder.description }}
              </p>
              
              <div class="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                <div class="flex items-center">
                  <Building class="w-4 h-4 mr-1" />
                  Terminal {{ workOrder.terminalId?.slice(-1) }}
                </div>
                <div class="flex items-center">
                  <Calendar class="w-4 h-4 mr-1" />
                  Due: {{ formatDate(workOrder.dueDate) }}
                </div>
                <div class="flex items-center" v-if="workOrder.assignedWorkerId">
                  <User class="w-4 h-4 mr-1" />
                  Worker assigned
                </div>
                <div class="flex items-center">
                  <Clock class="w-4 h-4 mr-1" />
                  {{ workOrder.estimatedDuration }}h estimated
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <!-- Quick Actions -->
              <div v-if="isSupervisor && workOrder.status === 'pending_approval'" class="flex space-x-2">
                <button
                  @click.stop="approveWorkOrder(workOrder.id)"
                  class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200"
                >
                  Approve
                </button>
                <button
                  @click.stop="rejectWorkOrder(workOrder.id)"
                  class="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200"
                >
                  Reject
                </button>
              </div>
              
              <div v-if="isWorker && workOrder.assignedWorkerId === currentUser?.id">
                <button
                  v-if="workOrder.status === 'assigned'"
                  @click.stop="startWork(workOrder.id)"
                  class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200"
                >
                  Start Work
                </button>
                <button
                  v-else-if="workOrder.status === 'in_progress'"
                  @click.stop="$router.push(`/work-orders/${workOrder.id}?action=submit`)"
                  class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200"
                >
                  Submit
                </button>
              </div>
              
              <ChevronRight class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { 
  Plus, 
  Search, 
  ClipboardList, 
  Building, 
  Calendar, 
  User, 
  Clock, 
  ChevronRight 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();

const filters = ref({
  status: '',
  priority: '',
  type: '',
  search: ''
});

const currentUser = computed(() => authStore.currentUser);
const isLoading = computed(() => workOrderStore.isLoading);
const isWorker = computed(() => authStore.isWorker);
const isSupervisor = computed(() => authStore.isSupervisor);

const filteredWorkOrders = computed(() => {
  let workOrders = workOrderStore.myWorkOrders;
  
  // Filter by status
  if (filters.value.status) {
    workOrders = workOrders.filter(wo => wo.status === filters.value.status);
  }
  
  // Filter by priority
  if (filters.value.priority) {
    workOrders = workOrders.filter(wo => wo.priority === filters.value.priority);
  }
  
  // Filter by type
  if (filters.value.type) {
    workOrders = workOrders.filter(wo => wo.type === filters.value.type);
  }
  
  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    workOrders = workOrders.filter(wo => 
      wo.title.toLowerCase().includes(search) ||
      wo.description.toLowerCase().includes(search)
    );
  }
  
  return workOrders.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
});

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  submitted_for_review: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revision_required: 'bg-red-100 text-red-800'
};

const hasPermission = (permission: string) => authStore.hasPermission(permission);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const isOverdue = (workOrder: any) => {
  const now = new Date();
  const dueDate = new Date(workOrder.dueDate);
  return dueDate < now && !['completed', 'rejected'].includes(workOrder.status);
};

const approveWorkOrder = async (workOrderId: string) => {
  try {
    await workOrderStore.updateWorkOrderStatus(workOrderId, 'assigned');
  } catch (error) {
    console.error('Failed to approve work order:', error);
  }
};

const rejectWorkOrder = async (workOrderId: string) => {
  try {
    await workOrderStore.updateWorkOrderStatus(workOrderId, 'rejected');
  } catch (error) {
    console.error('Failed to reject work order:', error);
  }
};

const startWork = async (workOrderId: string) => {
  try {
    await workOrderStore.updateWorkOrderStatus(workOrderId, 'in_progress');
  } catch (error) {
    console.error('Failed to start work:', error);
  }
};

onMounted(() => {
  workOrderStore.fetchWorkOrders();
});
</script>