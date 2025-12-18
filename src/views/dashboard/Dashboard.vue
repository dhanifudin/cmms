<template>
  <div class="space-y-6">
    <!-- Dashboard Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-600">
          Welcome back, {{ currentUser?.name }} 
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2"
                :class="roleColors[currentUser?.role || 'worker']">
            {{ currentUser?.role?.toUpperCase() }}
          </span>
        </p>
      </div>
      <div class="text-right text-sm text-gray-500">
        {{ currentDateTime }}
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="stat in dashboardStats" 
        :key="stat.title"
        class="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <component 
              :is="stat.icon" 
              class="h-6 w-6"
              :class="stat.iconColor"
            />
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-500">{{ stat.title }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
            <p class="text-sm" :class="stat.changeColor">
              {{ stat.change }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Work Orders Section -->
      <div class="lg:col-span-2 space-y-6">
        <!-- My Work Orders / Recent Work Orders -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ isWorker ? 'My Work Orders' : 'Recent Work Orders' }}
              </h2>
              <router-link 
                to="/work-orders"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all
              </router-link>
            </div>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="workOrder in displayWorkOrders" 
              :key="workOrder.id"
              class="p-4 hover:bg-gray-50 cursor-pointer"
              @click="$router.push(`/work-orders/${workOrder.id}`)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ workOrder.title }}
                  </h4>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ workOrder.type === 'preventive' ? 'Preventive' : 'Corrective' }} • 
                    Terminal {{ workOrder.terminalId?.slice(-1) }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    Due: {{ formatDate(workOrder.dueDate) }}
                  </p>
                </div>
                <div class="flex items-center space-x-3">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="priorityColors[workOrder.priority]"
                  >
                    {{ workOrder.priority }}
                  </span>
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="statusColors[workOrder.status]"
                  >
                    {{ formatStatus(workOrder.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="displayWorkOrders.length === 0" class="p-6 text-center text-gray-500">
            No work orders found
          </div>
        </div>

        <!-- Pending Approvals (Supervisor only) -->
        <div v-if="isSupervisor && pendingApprovals.length > 0" 
             class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="workOrder in pendingApprovals.slice(0, 3)" 
              :key="workOrder.id"
              class="p-4 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ workOrder.title }}
                  </h4>
                  <p class="text-sm text-gray-500">
                    Created by: Admin • {{ formatDate(workOrder.createdAt) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="approveWorkOrder(workOrder.id)"
                    class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200"
                  >
                    Approve
                  </button>
                  <button class="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Priority Notifications -->
        <NotificationAlerts />
        
        <!-- Low Stock Alert (Admin only) -->
        <div v-if="isAdmin && lowStockItems.length > 0" 
             class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center">
              <AlertTriangle class="h-5 w-5 text-orange-500 mr-2" />
              <h2 class="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
          </div>
          <div class="p-4 space-y-3">
            <div 
              v-for="item in lowStockItems.slice(0, 3)" 
              :key="item.id"
              class="flex items-center justify-between"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                <p class="text-xs text-gray-500">{{ item.category }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-orange-600">{{ item.currentStock }}</p>
                <p class="text-xs text-gray-500">min: {{ item.minThreshold }}</p>
              </div>
            </div>
            <router-link 
              to="/inventory"
              class="block w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 border-t pt-3"
            >
              View Inventory
            </router-link>
          </div>
        </div>

        <!-- Quick Actions -->
        <QuickActionsPanel />
        
        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">Work order completed</p>
                <p class="text-xs text-gray-500">Pump Station P3 Maintenance - 2 hours ago</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">New work order assigned</p>
                <p class="text-xs text-gray-500">Gas Pipeline Pressure Test - 4 hours ago</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">Low stock alert</p>
                <p class="text-xs text-gray-500">Gas detector sensors - 6 hours ago</p>
              </div>
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
import { useInventoryStore } from '@/stores/inventory';
import { useDashboardStore } from '@/stores/dashboard';
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle, 
  Clock
} from 'lucide-vue-next';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel.vue';
import NotificationAlerts from '@/components/dashboard/NotificationAlerts.vue';

const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();
const inventoryStore = useInventoryStore();
const dashboardStore = useDashboardStore();

const currentDateTime = ref('');

const currentUser = computed(() => authStore.currentUser);
const isWorker = computed(() => authStore.isWorker);
const isAdmin = computed(() => authStore.isAdmin);
const isSupervisor = computed(() => authStore.isSupervisor);

const displayWorkOrders = computed(() => {
  if (isWorker.value) {
    return workOrderStore.myWorkOrders.slice(0, 5);
  }
  return workOrderStore.workOrders.slice(0, 5);
});

const pendingApprovals = computed(() => workOrderStore.pendingApproval.slice(0, 3));
const lowStockItems = computed(() => inventoryStore.lowStockItems.slice(0, 3));

const dashboardStats = computed(() => {
  return dashboardStore.currentUserKPIs.map(kpi => ({
    title: kpi.title,
    value: kpi.value,
    change: kpi.period,
    changeColor: kpi.changeType === 'increase' ? 'text-green-600' : 
                kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500',
    icon: kpi.icon === 'ClipboardList' ? ClipboardList :
          kpi.icon === 'CheckCircle' ? CheckCircle :
          kpi.icon === 'AlertTriangle' ? AlertTriangle :
          kpi.icon === 'Clock' ? Clock : ClipboardList,
    iconColor: `text-${kpi.color}-500`
  }));
});

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  supervisor: 'bg-blue-100 text-blue-800',
  worker: 'bg-green-100 text-green-800',
  leader: 'bg-orange-100 text-orange-800'
};

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const approveWorkOrder = async (workOrderId: string) => {
  try {
    await workOrderStore.updateWorkOrderStatus(workOrderId, 'assigned');
  } catch (error) {
    console.error('Failed to approve work order:', error);
  }
};

const updateDateTime = () => {
  currentDateTime.value = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(async () => {
  updateDateTime();
  setInterval(updateDateTime, 60000); // Update every minute
  
  // Load data
  await Promise.all([
    workOrderStore.fetchWorkOrders(),
    inventoryStore.fetchInventoryItems(),
    dashboardStore.refreshDashboard()
  ]);
});
</script>