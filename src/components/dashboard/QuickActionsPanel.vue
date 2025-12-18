<template>
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Create Work Order -->
        <Button
          v-if="hasPermission('create_work_orders')"
          variant="outline"
          as-child
          class="h-auto justify-start p-4"
        >
          <router-link to="/work-orders/create" class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Plus class="w-5 h-5 text-blue-600" />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium">Create Work Order</p>
              <p class="text-xs text-muted-foreground">Schedule new maintenance</p>
            </div>
          </router-link>
        </Button>

        <!-- Add Inventory Item -->
        <Button
          v-if="hasPermission('manage_inventory')"
          variant="outline"
          as-child
          class="h-auto justify-start p-4"
        >
          <router-link to="/inventory/create" class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Package class="w-5 h-5 text-green-600" />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium">Add Inventory</p>
              <p class="text-xs text-muted-foreground">Stock new items</p>
            </div>
          </router-link>
        </Button>

        <!-- Search Work Orders -->
        <Button
          variant="outline"
          as-child
          class="h-auto justify-start p-4"
        >
          <router-link to="/work-orders" class="flex items-center">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Search class="w-5 h-5 text-purple-600" />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium">Search Work Orders</p>
              <p class="text-xs text-muted-foreground">Find existing tasks</p>
            </div>
          </router-link>
        </Button>

        <!-- View Analytics -->
        <Button
          variant="outline"
          as-child
          class="h-auto justify-start p-4"
        >
          <router-link to="/analytics" class="flex items-center">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <BarChart class="w-5 h-5 text-orange-600" />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium">View Analytics</p>
              <p class="text-xs text-muted-foreground">Performance insights</p>
            </div>
          </router-link>
        </Button>

        <!-- Start Work (Worker only) -->
        <Button
          v-if="isWorker && nextWorkOrder"
          variant="outline"
          class="h-auto justify-start p-4"
          @click="startNextWork"
        >
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <PlayCircle class="w-5 h-5 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0 text-left">
            <p class="text-sm font-medium">Start Next Work</p>
            <p class="text-xs text-muted-foreground truncate">{{ nextWorkOrder.title }}</p>
          </div>
        </Button>

        <!-- Approve Work Orders (Supervisor only) -->
        <Button
          v-if="isSupervisor && pendingCount > 0"
          variant="outline"
          as-child
          class="h-auto justify-start p-4"
        >
          <router-link to="/work-orders?filter=pending_approval" class="flex items-center">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <Clock class="w-5 h-5 text-yellow-600" />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium">Pending Approvals</p>
              <p class="text-xs text-muted-foreground">{{ pendingCount }} orders waiting</p>
            </div>
          </router-link>
        </Button>

        <!-- Emergency Actions -->
        <Button
          v-if="hasPermission('create_work_orders')"
          variant="outline"
          class="h-auto justify-start p-4 border-red-200 hover:bg-red-50"
          @click="createEmergencyOrder"
        >
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            <AlertTriangle class="w-5 h-5 text-red-600" />
          </div>
          <div class="text-left">
            <p class="text-sm font-medium">Emergency Order</p>
            <p class="text-xs text-muted-foreground">Urgent maintenance</p>
          </div>
        </Button>

        <!-- Check Inventory (Admin only) -->
        <Button
          v-if="isAdmin"
          variant="outline"
          as-child
          class="h-auto justify-start p-4"
        >
          <router-link to="/inventory?filter=low_stock" class="flex items-center">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <AlertTriangle class="w-5 h-5 text-orange-600" />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium">Low Stock Items</p>
              <p class="text-xs text-muted-foreground">{{ lowStockCount }} items need attention</p>
            </div>
          </router-link>
        </Button>
      </div>

      <!-- Emergency Banner -->
      <Alert v-if="hasUrgentItems" variant="destructive">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>Urgent Attention Required</AlertTitle>
        <AlertDescription class="flex items-center justify-between">
          <span>{{ urgentItemsCount }} critical items need immediate action</span>
          <Button
            variant="link"
            size="sm"
            class="h-auto p-0"
            @click="viewUrgentItems"
          >
            View All
          </Button>
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { useInventoryStore } from '@/stores/inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Package,
  Search,
  BarChart,
  PlayCircle,
  Clock,
  AlertTriangle
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();
const inventoryStore = useInventoryStore();

// Computed properties
const isWorker = computed(() => authStore.isWorker);
const isSupervisor = computed(() => authStore.isSupervisor);
const isAdmin = computed(() => authStore.isAdmin);

const nextWorkOrder = computed(() => {
  if (!isWorker.value) return null;
  return workOrderStore.myWorkOrders.find(wo => wo.status === 'assigned');
});

const pendingCount = computed(() => workOrderStore.pendingApproval.length);
const lowStockCount = computed(() => inventoryStore.lowStockItems.length);

const hasUrgentItems = computed(() => {
  const urgentWorkOrders = workOrderStore.workOrders.filter(wo =>
    wo.priority === 'urgent' && wo.status !== 'completed'
  ).length;

  const criticalStock = inventoryStore.lowStockItems.filter(item =>
    item.currentStock <= item.minThreshold * 0.5
  ).length;

  return urgentWorkOrders > 0 || criticalStock > 0;
});

const urgentItemsCount = computed(() => {
  const urgentWorkOrders = workOrderStore.workOrders.filter(wo =>
    wo.priority === 'urgent' && wo.status !== 'completed'
  ).length;

  const criticalStock = inventoryStore.lowStockItems.filter(item =>
    item.currentStock <= item.minThreshold * 0.5
  ).length;

  return urgentWorkOrders + criticalStock;
});

// Methods
const hasPermission = (permission: string) => authStore.hasPermission(permission);

const startNextWork = () => {
  if (nextWorkOrder.value) {
    router.push(`/work-orders/${nextWorkOrder.value.id}`);
  }
};

const createEmergencyOrder = () => {
  router.push('/work-orders/create?priority=urgent&type=corrective');
};

const viewUrgentItems = () => {
  if (isAdmin.value) {
    router.push('/inventory?filter=critical');
  } else {
    router.push('/work-orders?filter=urgent');
  }
};
</script>
