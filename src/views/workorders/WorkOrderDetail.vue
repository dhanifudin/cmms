<template>
  <div v-if="workOrder" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            @click="$router.back()"
          >
            <ArrowLeft class="w-5 h-5" />
          </Button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ workOrder.title }}</h1>
            <p class="text-sm text-muted-foreground">Work Order ID: {{ workOrder.id }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <Badge :variant="getStatusVariant(workOrder.status)">
          {{ formatStatus(workOrder.status) }}
        </Badge>
        <Badge :variant="getPriorityVariant(workOrder.priority)">
          {{ workOrder.priority.toUpperCase() }}
        </Badge>
      </div>
    </div>

    <!-- Work Order Details -->
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Description</h3>
          <p class="text-sm">{{ workOrder.description }}</p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Type</h3>
          <p class="text-sm capitalize">
            {{ workOrder.type }}
            <span v-if="workOrder.subType" class="text-muted-foreground">
              ({{ workOrder.subType }})
            </span>
          </p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Terminal</h3>
          <p class="text-sm">Terminal {{ workOrder.terminalId?.slice(-1) }}</p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Assigned Worker</h3>
          <p class="text-sm">
            {{ workOrder.assignedWorkerId ? 'Candra Wijaya' : 'Not assigned' }}
          </p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Start Date</h3>
          <p class="text-sm">{{ formatDateTime(workOrder.startDate) }}</p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
          <p class="text-sm" :class="isOverdue ? 'text-destructive' : ''">
            {{ formatDateTime(workOrder.dueDate) }}
            <Badge v-if="isOverdue" variant="destructive" class="ml-2">OVERDUE</Badge>
          </p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Estimated Duration</h3>
          <p class="text-sm">{{ workOrder.estimatedDuration }} hours</p>
        </div>

        <div v-if="workOrder.completedAt">
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Completed At</h3>
          <p class="text-sm">{{ formatDateTime(workOrder.completedAt) }}</p>
        </div>
        </div>
      </CardContent>
    </Card>

    <!-- Materials -->
    <Card v-if="workOrder.materials.length > 0">
      <CardHeader>
        <CardTitle>Required Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div
            v-for="material in workOrder.materials"
            :key="material.itemId"
            class="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div class="flex-1">
              <p class="text-sm font-medium">
                {{ getInventoryItemName(material.itemId) }}
              </p>
              <p class="text-xs text-muted-foreground">Item ID: {{ material.itemId }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">
                Planned: {{ material.plannedQuantity }}
              </p>
              <p v-if="material.actualQuantity !== undefined" class="text-sm text-muted-foreground">
                Used: {{ material.actualQuantity }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Checklist -->
    <Card v-if="workOrder.checklist.length > 0">
      <CardHeader>
        <CardTitle>Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="item in workOrder.checklist"
            :key="item.id"
            class="border border-border rounded-lg p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium">{{ item.label }}</h4>
                <Badge v-if="item.required" variant="destructive" class="mt-1">Required</Badge>
              </div>
              <div class="text-right space-y-1">
                <div v-if="item.beforeValue !== undefined">
                  <span class="text-xs text-muted-foreground">Before: </span>
                  <span class="text-sm">{{ formatChecklistValue(item.beforeValue, item) }}</span>
                </div>
                <div v-if="item.afterValue !== undefined">
                  <span class="text-xs text-muted-foreground">After: </span>
                  <span class="text-sm">{{ formatChecklistValue(item.afterValue, item) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Documentation -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Before Documentation -->
      <Card>
        <CardHeader>
          <CardTitle>Before Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="workOrder.beforeNotes" class="mb-4">
            <h3 class="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
            <p class="text-sm bg-muted/50 p-3 rounded-lg">{{ workOrder.beforeNotes }}</p>
          </div>

          <div v-if="workOrder.beforePhotos.length > 0">
            <h3 class="text-sm font-medium text-muted-foreground mb-2">Photos</h3>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="photo in workOrder.beforePhotos"
                :key="photo.id"
                class="group cursor-pointer"
                @click="openPhotoModal(photo)"
              >
                <div class="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    :src="photo.url"
                    :alt="photo.caption || 'Before photo'"
                    class="w-full h-full object-cover transition-transform group-hover:scale-105"
                    @error="handleImageError"
                  />
                </div>
                <p v-if="photo.caption" class="text-xs text-muted-foreground mt-1 truncate">
                  {{ photo.caption }}
                </p>
              </div>
            </div>
          </div>

          <Alert v-if="!workOrder.beforeNotes && workOrder.beforePhotos.length === 0">
            <Camera class="h-4 w-4" />
            <AlertTitle>No documentation yet</AlertTitle>
            <AlertDescription>Before documentation will appear here once the worker starts the work.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <!-- After Documentation -->
      <Card>
        <CardHeader>
          <CardTitle>After Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="workOrder.afterNotes" class="mb-4">
            <h3 class="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
            <p class="text-sm bg-muted/50 p-3 rounded-lg">{{ workOrder.afterNotes }}</p>
          </div>

          <div v-if="workOrder.afterPhotos.length > 0">
            <h3 class="text-sm font-medium text-muted-foreground mb-2">Photos</h3>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="photo in workOrder.afterPhotos"
                :key="photo.id"
                class="group cursor-pointer"
                @click="openPhotoModal(photo)"
              >
                <div class="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    :src="photo.url"
                    :alt="photo.caption || 'After photo'"
                    class="w-full h-full object-cover transition-transform group-hover:scale-105"
                    @error="handleImageError"
                  />
                </div>
                <p v-if="photo.caption" class="text-xs text-muted-foreground mt-1 truncate">
                  {{ photo.caption }}
                </p>
              </div>
            </div>
          </div>

          <Alert v-if="!workOrder.afterNotes && workOrder.afterPhotos.length === 0">
            <Camera class="h-4 w-4" />
            <AlertTitle>No documentation yet</AlertTitle>
            <AlertDescription>After documentation will appear here once the worker completes the work.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>

    <!-- Action Buttons -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-wrap gap-3">
          <!-- Worker Actions -->
          <template v-if="isWorker && workOrder.assignedWorkerId === currentUser?.id">
            <Button
              v-if="workOrder.status === 'assigned'"
              @click="showBeforeDocumentationModal = true"
            >
              <Play class="w-4 h-4 mr-2" />
              Start Work & Submit Before Documentation
            </Button>

            <Button
              v-if="workOrder.status === 'in_progress'"
              variant="default"
              @click="showAfterDocumentationModal = true"
              class="bg-green-600 hover:bg-green-700"
            >
              <Upload class="w-4 h-4 mr-2" />
              Submit After Documentation
            </Button>
          </template>

          <!-- Supervisor Actions -->
          <template v-if="isSupervisor">
            <Button
              v-if="workOrder.status === 'pending_approval'"
              @click="approveWorkOrder"
              class="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle class="w-4 h-4 mr-2" />
              Approve
            </Button>

            <Button
              v-if="workOrder.status === 'pending_approval'"
              variant="outline"
              @click="rejectWorkOrder"
              class="border-red-300 text-red-700 hover:bg-red-50"
            >
              <XCircle class="w-4 h-4 mr-2" />
              Reject
            </Button>

            <Button
              v-if="workOrder.status === 'submitted_for_review'"
              @click="completeWorkOrder"
              class="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle class="w-4 h-4 mr-2" />
              Complete
            </Button>
          </template>

          <!-- Admin Actions -->
          <template v-if="isAdmin">
            <Button
              v-if="['draft', 'rejected'].includes(workOrder.status)"
              variant="outline"
            >
              <Edit class="w-4 h-4 mr-2" />
              Edit
            </Button>
          </template>
        </div>
      </CardContent>
    </Card>

    <!-- Documentation Modals -->
    <DocumentationModal
      v-if="showBeforeDocumentationModal"
      :work-order-id="workOrder.id"
      :is-before-submission="true"
      :checklist="workOrder.checklist"
      :materials="workOrder.materials"
      @close="showBeforeDocumentationModal = false"
      @submit="handleBeforeDocumentationSubmit"
    />

    <DocumentationModal
      v-if="showAfterDocumentationModal"
      :work-order-id="workOrder.id"
      :is-before-submission="false"
      :checklist="workOrder.checklist"
      :materials="workOrder.materials"
      @close="showAfterDocumentationModal = false"
      @submit="handleAfterDocumentationSubmit"
    />
  </div>
  
  <div v-else class="space-y-6">
    <div class="flex items-center space-x-4">
      <Skeleton class="h-10 w-10 rounded-lg" />
      <div class="space-y-2 flex-1">
        <Skeleton class="h-6 w-64" />
        <Skeleton class="h-4 w-32" />
      </div>
    </div>
    <Skeleton class="h-64 w-full" />
    <Skeleton class="h-48 w-full" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { useInventoryStore } from '@/stores/inventory';
import { useNotificationStore } from '@/stores/notification';
import DocumentationModal from '@/components/workorder/DocumentationModal.vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Camera,
  Play,
  Upload,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-vue-next';
import type { WorkOrder, Photo } from '@/types';

const route = useRoute();
const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();
const inventoryStore = useInventoryStore();
const notificationStore = useNotificationStore();

const workOrder = ref<WorkOrder | null>(null);
const showBeforeDocumentationModal = ref(false);
const showAfterDocumentationModal = ref(false);
const selectedPhoto = ref<Photo | null>(null);
const showPhotoModal = ref(false);

const currentUser = computed(() => authStore.currentUser);
const isWorker = computed(() => authStore.isWorker);
const isSupervisor = computed(() => authStore.isSupervisor);
const isAdmin = computed(() => authStore.isAdmin);

const isOverdue = computed(() => {
  if (!workOrder.value) return false;
  const now = new Date();
  const dueDate = new Date(workOrder.value.dueDate);
  return dueDate < now && !['completed', 'rejected'].includes(workOrder.value.status);
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

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatChecklistValue = (value: any, item: any) => {
  if (item.type === 'yes_no') {
    return value ? 'Yes' : 'No';
  }
  if (item.type === 'number' && item.unit) {
    return `${value} ${item.unit}`;
  }
  return value?.toString() || '';
};

const getInventoryItemName = (itemId: string) => {
  const item = inventoryStore.getItemById(itemId);
  return item?.name || `Item ${itemId}`;
};


const approveWorkOrder = async () => {
  if (!workOrder.value) return;
  try {
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'assigned');
    workOrder.value.status = 'assigned';
  } catch (error) {
    console.error('Failed to approve work order:', error);
  }
};

const rejectWorkOrder = async () => {
  if (!workOrder.value) return;
  try {
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'rejected');
    workOrder.value.status = 'rejected';
  } catch (error) {
    console.error('Failed to reject work order:', error);
  }
};

const completeWorkOrder = async () => {
  if (!workOrder.value) return;
  try {
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'completed');
    workOrder.value.status = 'completed';
    
    // Send notification
    notificationStore.showSuccess('Work order completed successfully');
  } catch (error) {
    console.error('Failed to complete work order:', error);
    notificationStore.showError('Failed to complete work order');
  }
};

const handleBeforeDocumentationSubmit = async (data: {
  photos: File[];
  photoCaptions: string[];
  notes: string;
  checklistValues?: Record<string, any>;
}) => {
  if (!workOrder.value) return;
  
  try {
    // Create photo objects (simulate upload)
    const photos: Photo[] = data.photos.map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      url: URL.createObjectURL(file), // In real app, this would be uploaded URL
      caption: data.photoCaptions[index],
      timestamp: new Date().toISOString(),
      workOrderId: workOrder.value!.id,
      type: 'before'
    }));
    
    // Update checklist with before values
    if (data.checklistValues) {
      workOrder.value.checklist.forEach(item => {
        if (data.checklistValues![item.id] !== undefined) {
          item.beforeValue = data.checklistValues![item.id];
        }
      });
    }
    
    // Update work order with before documentation
    workOrder.value.beforePhotos = photos;
    workOrder.value.beforeNotes = data.notes;
    workOrder.value.status = 'in_progress';
    
    // Simulate API call
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'in_progress');
    
    showBeforeDocumentationModal.value = false;
    
    notificationStore.showSuccess('Before documentation submitted. You can now start the maintenance work.');
    
  } catch (error) {
    console.error('Failed to submit before documentation:', error);
    notificationStore.showError('Failed to submit before documentation');
  }
};

const handleAfterDocumentationSubmit = async (data: {
  photos: File[];
  photoCaptions: string[];
  notes: string;
  materialUsage?: Record<string, number>;
}) => {
  if (!workOrder.value) return;
  
  try {
    // Create photo objects (simulate upload)
    const photos: Photo[] = data.photos.map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      url: URL.createObjectURL(file), // In real app, this would be uploaded URL
      caption: data.photoCaptions[index],
      timestamp: new Date().toISOString(),
      workOrderId: workOrder.value!.id,
      type: 'after'
    }));
    
    // Update material usage
    if (data.materialUsage) {
      workOrder.value.materials.forEach(material => {
        if (data.materialUsage![material.itemId] !== undefined) {
          material.actualQuantity = data.materialUsage![material.itemId];
        }
      });
    }
    
    // Update work order with after documentation
    workOrder.value.afterPhotos = photos;
    workOrder.value.afterNotes = data.notes;
    workOrder.value.status = 'submitted_for_review';
    workOrder.value.completedAt = new Date().toISOString();
    
    // Simulate API call
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'submitted_for_review');
    
    showAfterDocumentationModal.value = false;
    
    notificationStore.showSuccess('Work completed and submitted for supervisor review.');
    
    // Notify supervisor about completion
    notificationStore.notifyWorkOrderCompleted(workOrder.value.id, workOrder.value.title);
    
  } catch (error) {
    console.error('Failed to submit after documentation:', error);
    notificationStore.showError('Failed to submit after documentation');
  }
};

const openPhotoModal = (photo: Photo) => {
  selectedPhoto.value = photo;
  showPhotoModal.value = true;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJMMTEgMTRMMTUgMTBNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NDQgMjEgMyAxNi45NzA2IDMgMTJDMyA3LjAyOTQ0IDcuMDI5NDQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQ0IDIxIDEyWiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
};

onMounted(async () => {
  const workOrderId = route.params.id as string;
  
  // Load work orders if not already loaded
  if (workOrderStore.workOrders.length === 0) {
    await workOrderStore.fetchWorkOrders();
  }
  
  // Load inventory items
  await inventoryStore.fetchInventoryItems();
  
  // Find the work order
  workOrder.value = workOrderStore.getWorkOrderById(workOrderId) ?? null;
});
</script>