<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Inventory</h1>
        <p class="mt-1 text-sm text-gray-600">
          Manage petroleum equipment and maintenance materials
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <router-link
          v-if="hasPermission('manage_inventory')"
          to="/inventory/create"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Item
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Package class="h-6 w-6 text-blue-500" />
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-500">Total Items</p>
            <p class="text-2xl font-semibold text-gray-900">{{ activeItems.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <AlertTriangle class="h-6 w-6 text-orange-500" />
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-500">Low Stock</p>
            <p class="text-2xl font-semibold text-gray-900">{{ lowStockItems.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <DollarSign class="h-6 w-6 text-green-500" />
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-500">Total Value</p>
            <p class="text-2xl font-semibold text-gray-900">${{ formatCurrency(totalValue) }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TrendingUp class="h-6 w-6 text-purple-500" />
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-500">Categories</p>
            <p class="text-2xl font-semibold text-gray-900">{{ Object.keys(itemsByCategory).length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            v-model="filters.category"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
          <select
            v-model="filters.stockStatus"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Items</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal Stock</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <Search class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search items..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading inventory...
        </div>
      </div>

      <div v-else-if="filteredItems.length === 0" class="p-8 text-center text-gray-500">
        <Package class="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p class="text-lg font-medium">No items found</p>
        <p class="mt-1">Try adjusting your filters or add a new item.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="$router.push(`/inventory/${item.id}`)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package class="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                    <div class="text-sm text-gray-500">{{ item.code }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ item.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">
                      {{ item.currentStock }} {{ item.unitOfMeasure }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Min: {{ item.minThreshold }} {{ item.unitOfMeasure }}
                    </div>
                  </div>
                  <div class="ml-2">
                    <div 
                      class="h-2 w-16 bg-gray-200 rounded-full"
                      :class="getStockLevelColor(item)"
                    >
                      <div 
                        class="h-2 rounded-full"
                        :class="getStockLevelColor(item)"
                        :style="{ width: getStockPercentage(item) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ item.unitPrice.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ (item.currentStock * item.unitPrice).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="item.currentStock <= item.minThreshold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                >
                  {{ item.currentStock <= item.minThreshold ? 'Low Stock' : 'In Stock' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="hasPermission('manage_inventory')"
                  @click.stop="adjustStock(item)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Adjust Stock
                </button>
                <button
                  @click.stop="$router.push(`/inventory/${item.id}`)"
                  class="text-gray-600 hover:text-gray-900"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useInventoryStore } from '@/stores/inventory';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

const filters = ref({
  category: '',
  stockStatus: '',
  search: ''
});

const isLoading = computed(() => inventoryStore.isLoading);
const activeItems = computed(() => inventoryStore.activeItems);
const lowStockItems = computed(() => inventoryStore.lowStockItems);
const totalValue = computed(() => inventoryStore.totalValue);
const itemsByCategory = computed(() => inventoryStore.itemsByCategory);

const categories = computed(() => {
  return Object.keys(itemsByCategory.value).sort();
});

const filteredItems = computed(() => {
  let items = activeItems.value;
  
  // Filter by category
  if (filters.value.category) {
    items = items.filter(item => item.category === filters.value.category);
  }
  
  // Filter by stock status
  if (filters.value.stockStatus === 'low') {
    items = items.filter(item => item.currentStock <= item.minThreshold);
  } else if (filters.value.stockStatus === 'normal') {
    items = items.filter(item => item.currentStock > item.minThreshold);
  }
  
  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    items = items.filter(item => 
      item.name.toLowerCase().includes(search) ||
      item.code.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
    );
  }
  
  return items.sort((a, b) => a.name.localeCompare(b.name));
});

const hasPermission = (permission: string) => authStore.hasPermission(permission);

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const getStockPercentage = (item: any) => {
  const ratio = item.currentStock / (item.minThreshold * 2); // Use 2x threshold as "full"
  return Math.min(Math.max(ratio * 100, 0), 100);
};

const getStockLevelColor = (item: any) => {
  if (item.currentStock <= item.minThreshold) {
    return 'bg-red-500';
  } else if (item.currentStock <= item.minThreshold * 1.5) {
    return 'bg-yellow-500';
  }
  return 'bg-green-500';
};

const adjustStock = (item: any) => {
  // TODO: Implement stock adjustment modal
  console.log('Adjust stock for item:', item.name);
};

onMounted(() => {
  inventoryStore.fetchInventoryItems();
});
</script>