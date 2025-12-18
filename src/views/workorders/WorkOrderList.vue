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
        <Button
          v-if="hasPermission('create_work_orders')"
          as-child
        >
          <router-link to="/work-orders/create">
            <Plus class="w-4 h-4 mr-2" />
            Create Work Order
          </router-link>
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="submitted_for_review">For Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Priority</Label>
            <Select v-model="filters.priority">
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Type</Label>
            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Search</Label>
            <div class="relative">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="filters.search"
                type="text"
                placeholder="Search work orders..."
                class="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Work Orders List -->
    <Card>
      <CardContent class="p-0">
        <div v-if="isLoading" class="p-8">
          <div class="space-y-4">
            <Skeleton class="h-20 w-full" />
            <Skeleton class="h-20 w-full" />
            <Skeleton class="h-20 w-full" />
          </div>
        </div>

        <Alert v-else-if="filteredWorkOrders.length === 0" class="m-6">
          <ClipboardList class="h-4 w-4" />
          <AlertTitle>No work orders found</AlertTitle>
          <AlertDescription>Try adjusting your filters or create a new work order.</AlertDescription>
        </Alert>

        <div v-else class="divide-y divide-border">
          <div
            v-for="workOrder in filteredWorkOrders"
            :key="workOrder.id"
            class="p-6 hover:bg-muted/50 cursor-pointer transition-colors"
            @click="$router.push(`/work-orders/${workOrder.id}`)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-lg font-medium truncate">
                    {{ workOrder.title }}
                  </h3>
                  <Badge :variant="getPriorityVariant(workOrder.priority)">
                    {{ workOrder.priority.toUpperCase() }}
                  </Badge>
                  <Badge :variant="getStatusVariant(workOrder.status)">
                    {{ formatStatus(workOrder.status) }}
                  </Badge>
                  <Badge v-if="isOverdue(workOrder)" variant="destructive">
                    OVERDUE
                  </Badge>
                </div>


                <p class="mt-1 text-sm text-muted-foreground">
                  {{ workOrder.description }}
                </p>

                <div class="mt-2 flex items-center gap-6 text-sm text-muted-foreground">
                  <div class="flex items-center gap-1">
                    <Building class="w-4 h-4" />
                    Terminal {{ workOrder.terminalId?.slice(-1) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <Calendar class="w-4 h-4" />
                    Due: {{ formatDate(workOrder.dueDate) }}
                  </div>
                  <div v-if="workOrder.assignedWorkerId" class="flex items-center gap-1">
                    <User class="w-4 h-4" />
                    Worker assigned
                  </div>
                  <div class="flex items-center gap-1">
                    <Clock class="w-4 h-4" />
                    {{ workOrder.estimatedDuration }}h estimated
                  </div>
                </div>
              </div>


              <div class="flex items-center gap-2">
                <!-- Quick Actions -->
                <div v-if="isSupervisor && workOrder.status === 'pending_approval'" class="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    class="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    @click.stop="approveWorkOrder(workOrder.id)"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    class="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    @click.stop="rejectWorkOrder(workOrder.id)"
                  >
                    Reject
                  </Button>
                </div>

                <div v-if="isWorker && workOrder.assignedWorkerId === currentUser?.id">
                  <Button
                    v-if="workOrder.status === 'assigned'"
                    size="sm"
                    variant="outline"
                    @click.stop="startWork(workOrder.id)"
                  >
                    Start Work
                  </Button>
                  <Button
                    v-else-if="workOrder.status === 'in_progress'"
                    size="sm"
                    variant="outline"
                    class="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    @click.stop="$router.push(`/work-orders/${workOrder.id}?action=submit`)"
                  >
                    Submit
                  </Button>
                </div>

                <ChevronRight class="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'secondary';
    case 'normal':
      return 'outline';
    case 'high':
      return 'default';
    case 'urgent':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'draft':
      return 'secondary';
    case 'pending_approval':
      return 'outline';
    case 'assigned':
      return 'default';
    case 'in_progress':
      return 'default';
    case 'submitted_for_review':
      return 'outline';
    case 'completed':
      return 'default';
    case 'rejected':
    case 'revision_required':
      return 'destructive';
    default:
      return 'secondary';
  }
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