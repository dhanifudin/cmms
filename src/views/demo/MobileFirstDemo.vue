<template>
  <div class="min-h-screen bg-gray-50">
    <!-- PWA Install Banner -->
    <div 
      v-if="pwa.state.canInstall && showInstallBanner"
      class="bg-blue-600 text-white p-4 sticky top-0 z-50"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium">Install CMMS App</p>
          <p class="text-xs opacity-90">Get the full app experience</p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="installApp"
            class="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-md hover:bg-gray-100"
            :class="{ 'touch-manipulation': responsive.isTouch }"
          >
            Install
          </button>
          <button
            @click="showInstallBanner = false"
            class="p-1.5 text-white hover:bg-blue-700 rounded-md"
            :class="{ 'touch-manipulation': responsive.isTouch }"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Offline Banner -->
    <div 
      v-if="pwa.state.isOffline"
      class="bg-yellow-500 text-white p-3 text-center text-sm font-medium"
    >
      <Wifi class="inline h-4 w-4 mr-2" />
      You're offline. Some features may be limited.
    </div>

    <!-- Update Available Banner -->
    <div 
      v-if="pwa.state.hasUpdate"
      class="bg-green-600 text-white p-3"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <RefreshCw class="h-4 w-4 mr-2" />
          <span class="text-sm font-medium">Update available!</span>
        </div>
        <button
          @click="pwa.applyUpdate"
          :disabled="pwa.state.isUpdating"
          class="px-3 py-1 bg-white text-green-600 text-sm font-medium rounded-md hover:bg-gray-100 disabled:opacity-50"
          :class="{ 'touch-manipulation': responsive.isTouch }"
        >
          {{ pwa.state.isUpdating ? 'Updating...' : 'Update' }}
        </button>
      </div>
    </div>

    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="px-4 sm:px-6">
        <div class="flex items-center justify-between py-4">
          <div>
            <h1 :class="responsive.isMobile ? 'text-lg' : 'text-2xl'" class="font-bold text-gray-900">
              Mobile-First CMMS
            </h1>
            <p class="text-sm text-gray-600">
              {{ responsive.screenSize }} • {{ responsive.deviceInfo.platform }} 
              {{ responsive.deviceInfo.isTouch ? '• Touch' : '' }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <!-- Network Status -->
            <div 
              :class="[
                'flex items-center px-2 py-1 rounded-md text-xs font-medium',
                pwa.state.isOnline 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              ]"
            >
              <div 
                :class="[
                  'w-2 h-2 rounded-full mr-1',
                  pwa.state.isOnline ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              {{ pwa.state.isOnline ? 'Online' : 'Offline' }}
            </div>
            
            <!-- Menu Button for Mobile -->
            <button
              v-if="responsive.isMobile"
              @click="showMobileMenu = !showMobileMenu"
              class="p-2 text-gray-600 hover:text-gray-800"
              :class="{ 'touch-manipulation': responsive.isTouch }"
            >
              <Menu class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div 
      v-if="responsive.isMobile && showMobileMenu"
      class="fixed inset-0 bg-black bg-opacity-25 z-50"
      @click="showMobileMenu = false"
    >
      <div 
        class="absolute right-0 top-0 h-full w-64 bg-white shadow-lg"
        @click.stop
      >
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-gray-900">Menu</h3>
            <button
              @click="showMobileMenu = false"
              class="p-1 text-gray-400 hover:text-gray-600"
              :class="{ 'touch-manipulation': responsive.isTouch }"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="p-4 space-y-3">
          <button
            @click="requestNotifications"
            class="w-full flex items-center space-x-3 p-3 text-left rounded-md hover:bg-gray-100"
            :class="{ 'touch-manipulation': responsive.isTouch }"
          >
            <Bell class="h-5 w-5 text-gray-400" />
            <span>Enable Notifications</span>
          </button>
          <button
            v-if="responsive.deviceInfo.isTouch"
            @click="toggleFullscreen"
            class="w-full flex items-center space-x-3 p-3 text-left rounded-md hover:bg-gray-100"
            :class="{ 'touch-manipulation': responsive.isTouch }"
          >
            <Maximize class="h-5 w-5 text-gray-400" />
            <span>{{ pwa.state.isFullscreen ? 'Exit' : 'Enter' }} Fullscreen</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div 
      class="px-4 sm:px-6 py-6"
      ref="mainContainer"
    >
      <!-- Device Info Cards -->
      <div :class="responsive.getResponsiveColumns(1, 2, 3, 4)" class="grid gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="flex items-center">
            <Smartphone class="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p class="text-sm font-medium text-gray-900">Device Type</p>
              <p class="text-xs text-gray-500">
                {{ responsive.isMobile ? 'Mobile' : responsive.isTablet ? 'Tablet' : 'Desktop' }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="flex items-center">
            <Monitor class="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p class="text-sm font-medium text-gray-900">Screen Size</p>
              <p class="text-xs text-gray-500">
                {{ responsive.windowWidth }} × {{ responsive.windowHeight }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="flex items-center">
            <RotateCcw class="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p class="text-sm font-medium text-gray-900">Orientation</p>
              <p class="text-xs text-gray-500 capitalize">{{ responsive.orientation }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="flex items-center">
            <Zap class="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p class="text-sm font-medium text-gray-900">App Mode</p>
              <p class="text-xs text-gray-500">
                {{ pwa.state.isStandalone ? 'Installed' : 'Browser' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Gesture Demo Area -->
      <div class="bg-white rounded-lg border border-gray-200 mb-6">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-medium text-gray-900">Touch Gestures Demo</h3>
          <p class="text-sm text-gray-500 mt-1">
            Try swiping, long press, or pull to refresh
          </p>
        </div>
        <div 
          ref="gestureArea"
          class="p-6 min-h-[200px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative"
          :style="{ transform: `translateY(${touchState.pullDistance * 0.5}px)` }"
        >
          <div class="text-center">
            <div 
              v-if="touchState.isPulling && touchState.pullDistance > pullThreshold"
              class="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-blue-600"
            >
              <RefreshCw class="h-4 w-4 animate-spin" />
              <span class="text-sm font-medium">Release to refresh</span>
            </div>
            
            <div class="space-y-2">
              <div class="text-2xl">{{ gestureEmoji }}</div>
              <p class="font-medium text-gray-900">{{ gestureMessage }}</p>
              <div class="text-sm text-gray-500">
                <p v-if="touchState.isPressed">Touch active</p>
                <p v-if="touchState.isSwiping">Swiping {{ touchState.swipeDirection }}</p>
                <p v-if="touchState.isLongPressing">Long press detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Responsive Data Demo -->
      <div class="space-y-6">
        <!-- Filters -->
        <ResponsiveFilters
          :search-query="filters.searchQuery"
          :filter-values="filters.values"
          :filters="filterConfigs"
          :total-items="mockData.length"
          :filtered-items="filteredData.length"
          :show-quick-filters="true"
          :quick-filters="quickFilters"
          @update:search-query="filters.searchQuery = $event"
          @update:filter-values="filters.values = $event"
          @clear-all-filters="clearAllFilters"
        />

        <!-- Data Table -->
        <ResponsiveDataTable
          :items="paginatedData"
          :columns="tableColumns"
          :selected-items="bulkOps.selectedItems"
          :show-bulk-selection="true"
          :allow-selection="true"
          :is-all-selected="bulkOps.isAllSelected"
          :is-partial-selection="bulkOps.isPartialSelection"
          :current-sort="sort.field"
          :sort-direction="sort.direction"
          :card-fields="cardFields"
          :card-actions="cardActions"
          :table-actions="tableActions"
          @item-select="bulkOps.toggleItem"
          @select-all-toggle="bulkOps.toggleSelectAll"
          @sort="handleSort"
          @action="handleAction"
        />

        <!-- Mobile Bulk Operations -->
        <MobileBulkOperations
          :selected-count="bulkOps.selectionCount"
          :is-all-selected="bulkOps.isAllSelected"
          :is-partial-selection="bulkOps.isPartialSelection"
          :is-all-selected-across-pages="false"
          :operations="bulkOperations"
          :is-operation-in-progress="bulkOps.isOperationInProgress"
          :current-operation="bulkOps.currentOperation"
          @select-all="bulkOps.selectAll"
          @clear-selection="bulkOps.deselectAll"
          @execute-operation="bulkOps.executeOperation"
        />

        <!-- Mobile Pagination -->
        <MobileDataPagination
          :pagination-state="pagination.paginationState"
          :page-sizes="[10, 25, 50]"
          @page-change="pagination.setPage"
          @page-size-change="pagination.setPageSize"
        />
      </div>

      <!-- Performance Metrics (Development) -->
      <div v-if="showDevMetrics" class="mt-8 bg-gray-100 rounded-lg p-4">
        <h4 class="font-medium text-gray-900 mb-2">Performance Metrics</h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-gray-500">Items Rendered</p>
            <p class="font-medium">{{ paginatedData.length }}</p>
          </div>
          <div>
            <p class="text-gray-500">Total Items</p>
            <p class="font-medium">{{ mockData.length }}</p>
          </div>
          <div>
            <p class="text-gray-500">Page Size</p>
            <p class="font-medium">{{ pagination.paginationState.pageSize }}</p>
          </div>
          <div>
            <p class="text-gray-500">Memory Usage</p>
            <p class="font-medium">~{{ Math.round(paginatedData.length * 0.1) }}KB</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div 
      v-for="(toast, index) in toasts"
      :key="toast.id"
      :class="[
        'fixed z-50 transition-all duration-300',
        responsive.isMobile 
          ? 'bottom-20 left-4 right-4' 
          : `top-6 right-6 w-80`
      ]"
      :style="{ transform: `translateY(-${index * 70}px)` }"
    >
      <div 
        :class="[
          'bg-white border rounded-lg shadow-lg p-4 flex items-center space-x-3',
          toast.type === 'success' ? 'border-green-200' : 
          toast.type === 'error' ? 'border-red-200' : 'border-blue-200'
        ]"
      >
        <div 
          :class="[
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            toast.type === 'success' ? 'bg-green-100' : 
            toast.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
          ]"
        >
          <CheckCircle 
            v-if="toast.type === 'success'"
            :class="[
              'h-5 w-5',
              toast.type === 'success' ? 'text-green-600' : 
              toast.type === 'error' ? 'text-red-600' : 'text-blue-600'
            ]" 
          />
          <AlertTriangle 
            v-else-if="toast.type === 'error'"
            :class="[
              'h-5 w-5',
              toast.type === 'success' ? 'text-green-600' : 
              toast.type === 'error' ? 'text-red-600' : 'text-blue-600'
            ]" 
          />
          <Info 
            v-else
            :class="[
              'h-5 w-5',
              toast.type === 'success' ? 'text-green-600' : 
              toast.type === 'error' ? 'text-red-600' : 'text-blue-600'
            ]" 
          />
        </div>
        <div class="flex-1">
          <p :class="[
            'text-sm font-medium',
            toast.type === 'success' ? 'text-green-800' : 
            toast.type === 'error' ? 'text-red-800' : 'text-blue-800'
          ]">
            {{ toast.message }}
          </p>
        </div>
        <button
          @click="removeToast(toast.id)"
          class="text-gray-400 hover:text-gray-600"
          :class="{ 'touch-manipulation': responsive.isTouch }"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  X,
  Menu,
  Bell,
  Maximize,
  Wifi,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Smartphone,
  Monitor,
  RotateCcw,
  Zap
} from 'lucide-vue-next';

// Import our composables and components
import { useResponsive } from '@/composables/useResponsive';
import { useTouchGestures } from '@/composables/useTouchGestures';
import { useUrlPagination } from '@/composables/useUrlPagination';
import { useBulkOperations, createBulkOperations } from '@/composables/useBulkOperations';
import { usePWA } from '@/composables/usePWA';

import ResponsiveFilters from '@/components/ui/ResponsiveFilters.vue';
import ResponsiveDataTable from '@/components/ui/ResponsiveDataTable.vue';
import MobileBulkOperations from '@/components/ui/MobileBulkOperations.vue';
import MobileDataPagination from '@/components/ui/MobileDataPagination.vue';

// Composable setup
const responsive = useResponsive();
const pwa = usePWA({
  enableInstallPrompt: true,
  enableOfflineMode: true,
  enableUpdateNotifications: true
});

// Refs for gesture handling
const gestureArea = ref<HTMLElement>();
const mainContainer = ref<HTMLElement>();

// Local state
const showInstallBanner = ref(true);
const showMobileMenu = ref(false);
const showDevMetrics = ref(true);

// Mock data
interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'pending' | 'inactive';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  value: number;
}

const mockData = ref<DemoItem[]>(
  Array.from({ length: 100 }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Work Order ${i + 1}`,
    category: ['Electrical', 'Mechanical', 'Safety', 'Maintenance'][Math.floor(Math.random() * 4)],
    status: ['active', 'pending', 'inactive'][Math.floor(Math.random() * 3)] as DemoItem['status'],
    priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as DemoItem['priority'],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    value: Math.floor(Math.random() * 10000) + 1000
  }))
);

// Filters
const filters = ref({
  searchQuery: '',
  values: {} as Record<string, any>
});

const filterConfigs = [
  {
    key: 'category',
    label: 'Category',
    type: 'select' as const,
    options: [
      { label: 'Electrical', value: 'Electrical' },
      { label: 'Mechanical', value: 'Mechanical' },
      { label: 'Safety', value: 'Safety' },
      { label: 'Maintenance', value: 'Maintenance' }
    ]
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Inactive', value: 'inactive' }
    ]
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select' as const,
    options: [
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' }
    ]
  }
];

const quickFilters = [
  {
    key: 'high-priority',
    label: 'High Priority',
    filters: { priority: 'high' }
  },
  {
    key: 'active-electrical',
    label: 'Active Electrical',
    filters: { status: 'active', category: 'Electrical' }
  }
];

// Sorting
const sort = ref({
  field: '',
  direction: 'asc' as 'asc' | 'desc'
});

// URL pagination
const pagination = useUrlPagination({
  defaultPageSize: responsive.getOptimalPageSize().value
});

// Filtered data
const filteredData = computed(() => {
  let result = mockData.value;
  
  // Apply search
  if (filters.value.searchQuery) {
    const search = filters.value.searchQuery.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );
  }
  
  // Apply filters
  Object.entries(filters.value.values).forEach(([key, value]) => {
    if (value) {
      result = result.filter(item => item[key as keyof DemoItem] === value);
    }
  });
  
  // Apply sorting
  if (sort.value.field) {
    result.sort((a, b) => {
      const aValue = a[sort.value.field as keyof DemoItem];
      const bValue = b[sort.value.field as keyof DemoItem];
      
      if (aValue < bValue) return sort.value.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.value.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  pagination.updateTotalItems(result.length);
  return result;
});

// Paginated data
const paginatedData = computed(() => {
  const start = (pagination.paginationState.currentPage - 1) * pagination.paginationState.pageSize;
  const end = start + pagination.paginationState.pageSize;
  return filteredData.value.slice(start, end);
});

// Table configuration
const tableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true, mobileHidden: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true, tabletHidden: true },
  { key: 'value', label: 'Value', sortable: true, mobileHidden: true }
];

const cardFields = [
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'value', label: 'Value' }
];

const cardActions = [
  { key: 'view', label: 'View', variant: 'primary' as const },
  { key: 'edit', label: 'Edit', variant: 'secondary' as const }
];

const tableActions = [
  { key: 'view', label: 'View', variant: 'primary' as const },
  { key: 'edit', label: 'Edit', variant: 'secondary' as const }
];

// Bulk operations
const bulkOps = useBulkOperations(paginatedData, {
  operations: [
    createBulkOperations.delete(async (items) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('success', `Deleted ${items.length} items`);
      return { success: true };
    }),
    createBulkOperations.export(async (items) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      addToast('success', `Exported ${items.length} items`);
      return { success: true };
    })
  ]
});

const bulkOperations = bulkOps.availableOperations.value;

// Touch gestures
const gestureMessage = ref('Try touch gestures here');
const gestureEmoji = ref('👋');
const pullThreshold = 80;

const touchGestures = useTouchGestures(gestureArea, {
  pullToRefreshThreshold: pullThreshold
});

const touchState = touchGestures.state;

// Toast notifications
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const toasts = ref<Toast[]>([]);

// Methods
const addToast = (type: Toast['type'], message: string) => {
  const id = Date.now().toString();
  toasts.value.push({ id, message, type });
  
  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const handleSort = (field: string) => {
  if (sort.value.field === field) {
    sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sort.value.field = field;
    sort.value.direction = 'asc';
  }
};

const handleAction = (actionKey: string, item: DemoItem) => {
  addToast('info', `${actionKey} action on ${item.name}`);
};

const clearAllFilters = () => {
  filters.value.searchQuery = '';
  filters.value.values = {};
};

const installApp = async () => {
  const success = await pwa.showInstallPrompt();
  if (success) {
    showInstallBanner.value = false;
    addToast('success', 'App installation started');
  }
};

const requestNotifications = async () => {
  const permission = await pwa.requestNotificationPermission();
  if (permission === 'granted') {
    addToast('success', 'Notifications enabled');
    pwa.showNotification('CMMS Notifications', {
      body: 'You will now receive updates and reminders',
      icon: '/icons/icon-192x192.png'
    });
  } else {
    addToast('error', 'Notification permission denied');
  }
  showMobileMenu.value = false;
};

const toggleFullscreen = async () => {
  if (pwa.state.isFullscreen) {
    await pwa.exitFullscreen();
  } else {
    await pwa.enterFullscreen();
  }
  showMobileMenu.value = false;
};

// Touch gesture callbacks
onMounted(() => {
  touchGestures.onSwipeLeft(() => {
    gestureMessage.value = 'Swiped left!';
    gestureEmoji.value = '👈';
  });
  
  touchGestures.onSwipeRight(() => {
    gestureMessage.value = 'Swiped right!';
    gestureEmoji.value = '👉';
  });
  
  touchGestures.onSwipeUp(() => {
    gestureMessage.value = 'Swiped up!';
    gestureEmoji.value = '👆';
  });
  
  touchGestures.onSwipeDown(() => {
    gestureMessage.value = 'Swiped down!';
    gestureEmoji.value = '👇';
  });
  
  touchGestures.onLongPress(() => {
    gestureMessage.value = 'Long press detected!';
    gestureEmoji.value = '👍';
  });
  
  touchGestures.onPullToRefresh(() => {
    gestureMessage.value = 'Refreshing...';
    gestureEmoji.value = '🔄';
    
    setTimeout(() => {
      gestureMessage.value = 'Refreshed!';
      gestureEmoji.value = '✅';
      addToast('success', 'Content refreshed');
    }, 1000);
  });
  
  touchGestures.onTap(() => {
    gestureMessage.value = 'Tapped!';
    gestureEmoji.value = '👆';
  });
  
  touchGestures.onDoubleTap(() => {
    gestureMessage.value = 'Double tapped!';
    gestureEmoji.value = '👆👆';
  });
  
  // PWA callbacks
  pwa.onInstalled(() => {
    addToast('success', 'App installed successfully!');
  });
  
  pwa.onUpdateAvailable(() => {
    addToast('info', 'App update available');
  });
  
  pwa.onOnline(() => {
    addToast('success', 'Connection restored');
  });
  
  pwa.onOffline(() => {
    addToast('info', 'You are now offline');
  });
});
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Ensure touch targets are at least 44px */
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Focus styles for accessibility */
button:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Smooth animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>