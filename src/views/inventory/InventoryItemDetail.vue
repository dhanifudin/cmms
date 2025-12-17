<template>
  <div v-if="item" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center space-x-4">
          <button
            @click="$router.back()"
            class="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ item.name }}</h1>
            <p class="text-sm text-gray-600">{{ item.code }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="item.currentStock <= item.minThreshold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
        >
          {{ item.currentStock <= item.minThreshold ? 'Low Stock' : 'In Stock' }}
        </span>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {{ item.category }}
        </span>
      </div>
    </div>

    <!-- Item Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Details -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Item Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p class="text-sm text-gray-900">{{ item.description || 'No description provided' }}</p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Category</h3>
              <p class="text-sm text-gray-900">{{ item.category }}</p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Unit of Measure</h3>
              <p class="text-sm text-gray-900">{{ item.unitOfMeasure }}</p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Unit Price</h3>
              <p class="text-sm text-gray-900">${{ item.unitPrice.toFixed(2) }}</p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Storage Location</h3>
              <p class="text-sm text-gray-900">{{ item.storageLocation || 'Not specified' }}</p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Supplier</h3>
              <p class="text-sm text-gray-900">{{ item.supplier || 'Not specified' }}</p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p class="text-sm text-gray-900">{{ formatDate(item.lastUpdated) }}</p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Information -->
      <div class="space-y-6">
        <!-- Stock Stats -->
        <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Stock Information</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500">Current Stock</span>
              <span class="text-lg font-semibold text-gray-900">
                {{ item.currentStock }} {{ item.unitOfMeasure }}
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500">Minimum Threshold</span>
              <span class="text-sm text-gray-600">
                {{ item.minThreshold }} {{ item.unitOfMeasure }}
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500">Total Value</span>
              <span class="text-lg font-semibold text-green-600">
                ${{ (item.currentStock * item.unitPrice).toFixed(2) }}
              </span>
            </div>
            
            <!-- Stock Level Indicator -->
            <div>
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Stock Level</span>
                <span>{{ getStockPercentage() }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full"
                  :class="getStockLevelColor()"
                  :style="{ width: getStockPercentage() + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div v-if="hasPermission('manage_inventory')" class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div class="space-y-3">
            <button
              @click="showAdjustStockModal = true"
              class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <TrendingUp class="w-4 h-4 mr-2" />
              Adjust Stock
            </button>
            
            <button
              class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit class="w-4 h-4 mr-2" />
              Edit Item
            </button>
            
            <button
              class="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            >
              <ShoppingCart class="w-4 h-4 mr-2" />
              Create Purchase Request
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Movements History -->
    <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Stock Movement History</h2>
        <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>
      
      <div v-if="stockMovements.length === 0" class="text-center py-8 text-gray-500">
        <TrendingUp class="mx-auto h-8 w-8 text-gray-300 mb-2" />
        <p class="text-sm">No stock movements recorded</p>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="movement in stockMovements.slice(0, 5)"
          :key="movement.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="getMovementTypeColor(movement.type)"
            >
              <component 
                :is="getMovementTypeIcon(movement.type)" 
                class="w-4 h-4" 
              />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 capitalize">
                {{ movement.type.replace('_', ' ') }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatDate(movement.createdAt) }}
              </p>
            </div>
          </div>
          
          <div class="text-right">
            <p 
              class="text-sm font-medium"
              :class="movement.type === 'outbound' ? 'text-red-600' : 'text-green-600'"
            >
              {{ movement.type === 'outbound' ? '-' : '+' }}{{ movement.quantity }}
            </p>
            <p v-if="movement.reference" class="text-xs text-gray-500">
              Ref: {{ movement.reference }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Adjustment Modal (placeholder) -->
    <div 
      v-if="showAdjustStockModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      @click="showAdjustStockModal = false"
    >
      <div 
        class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
        @click.stop
      >
        <h3 class="text-lg font-medium text-gray-900 mb-4">Adjust Stock</h3>
        <p class="text-sm text-gray-600 mb-4">
          Feature coming soon. Stock adjustments will be available in the next update.
        </p>
        <button
          @click="showAdjustStockModal = false"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-12">
    <div class="inline-flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading item details...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useInventoryStore } from '@/stores/inventory';
import { 
  ArrowLeft, 
  TrendingUp, 
  Edit, 
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from 'lucide-vue-next';

const route = useRoute();
const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

const item = ref(null);
const showAdjustStockModal = ref(false);

const stockMovements = computed(() => {
  if (!item.value) return [];
  return inventoryStore.getMovementsByItem(item.value.id);
});

const hasPermission = (permission: string) => authStore.hasPermission(permission);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStockPercentage = () => {
  if (!item.value) return 0;
  const ratio = item.value.currentStock / (item.value.minThreshold * 2);
  return Math.min(Math.max(ratio * 100, 0), 100);
};

const getStockLevelColor = () => {
  if (!item.value) return 'bg-gray-500';
  
  if (item.value.currentStock <= item.value.minThreshold) {
    return 'bg-red-500';
  } else if (item.value.currentStock <= item.value.minThreshold * 1.5) {
    return 'bg-yellow-500';
  }
  return 'bg-green-500';
};

const getMovementTypeColor = (type: string) => {
  switch (type) {
    case 'inbound': return 'bg-green-100 text-green-600';
    case 'outbound': return 'bg-red-100 text-red-600';
    case 'adjustment': return 'bg-blue-100 text-blue-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getMovementTypeIcon = (type: string) => {
  switch (type) {
    case 'inbound': return ArrowUp;
    case 'outbound': return ArrowDown;
    case 'adjustment': return RotateCcw;
    default: return TrendingUp;
  }
};

onMounted(async () => {
  const itemId = route.params.id as string;
  
  // Load inventory items if not already loaded
  if (inventoryStore.items.length === 0) {
    await inventoryStore.fetchInventoryItems();
  }
  
  // Load stock movements
  await inventoryStore.fetchStockMovements();
  
  // Find the item
  item.value = inventoryStore.getItemById(itemId);
});
</script>