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
        <Button
          v-if="hasPermission('manage_inventory')"
          as-child
        >
          <router-link to="/inventory/create">
            <Plus class="w-4 h-4 mr-2" />
            Add Item
          </router-link>
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Package class="h-6 w-6 text-blue-500" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-muted-foreground">Total Items</p>
              <p class="text-2xl font-semibold">{{ activeItems.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <AlertTriangle class="h-6 w-6 text-orange-500" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p class="text-2xl font-semibold">{{ lowStockItems.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DollarSign class="h-6 w-6 text-green-500" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-muted-foreground">Total Value</p>
              <p class="text-2xl font-semibold">{{ formatCurrency(totalValue) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TrendingUp class="h-6 w-6 text-purple-500" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-muted-foreground">Categories</p>
              <p class="text-2xl font-semibold">{{ Object.keys(itemsByCategory).length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and Search -->
    <Card>
      <CardContent class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label>Category</Label>
            <Select v-model="categorySelect">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Categories</SelectItem>
                <SelectItem v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Stock Status</Label>
            <Select v-model="statusSelect">
              <SelectTrigger>
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="active">Active Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Search</Label>
            <div class="relative">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchInput"
                type="text"
                placeholder="Search items..."
                class="pl-10"
              />
            </div>
          </div>
        </div>
        
        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            Showing {{ paginatedItems.length }} of {{ filteredAndSearchedItems.length }} items
          </div>
          <Button
            variant="ghost"
            size="sm"
            @click="clearAllFilters"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Inventory Table -->
    <Card>
      <CardContent class="p-0">
        <div v-if="isLoading" class="p-8">
          <div class="space-y-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>
        </div>

        <Alert v-else-if="paginatedItems.length === 0" class="m-6">
          <Package class="h-4 w-4" />
          <AlertTitle>No items found</AlertTitle>
          <AlertDescription>Try adjusting your filters or add a new item.</AlertDescription>
        </Alert>

        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    @click="handleSort('name')"
                    class="flex items-center space-x-1 text-left hover:text-gray-900"
                  >
                    <span>Item</span>
                    <ArrowUpDown :class="getSortIcon('name')" class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    @click="handleSort('category')"
                    class="flex items-center space-x-1 text-left hover:text-gray-900"
                  >
                    <span>Category</span>
                    <ArrowUpDown :class="getSortIcon('category')" class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    @click="handleSort('stock')"
                    class="flex items-center space-x-1 text-left hover:text-gray-900"
                  >
                    <span>Stock</span>
                    <ArrowUpDown :class="getSortIcon('stock')" class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>
                  <button
                    @click="handleSort('value')"
                    class="flex items-center space-x-1 text-left hover:text-gray-900"
                  >
                    <span>Total Value</span>
                    <ArrowUpDown :class="getSortIcon('value')" class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in paginatedItems"
                :key="item.id"
                class="cursor-pointer"
                @click="$router.push(`/inventory/${item.id}`)"
              >
                <TableCell>
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package class="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium">{{ item.name }}</div>
                      <div class="text-sm text-muted-foreground">{{ item.code }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{{ item.category }}</Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <div class="flex-1">
                      <div class="text-sm font-medium">
                        {{ item.currentStock }} {{ item.unitOfMeasure }}
                      </div>
                      <div class="text-xs text-muted-foreground">
                        Min: {{ item.minThreshold }} {{ item.unitOfMeasure }}
                      </div>
                    </div>
                    <div class="ml-2">
                      <div class="h-2 w-16 bg-secondary rounded-full">
                        <div
                          class="h-2 rounded-full"
                          :class="getStockLevelColor(item)"
                          :style="{ width: getStockPercentage(item) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="text-sm">
                  Rp {{ item.unitPrice.toLocaleString('id-ID') }}
                </TableCell>
                <TableCell class="text-sm font-medium">
                  Rp {{ (item.currentStock * item.unitPrice).toLocaleString('id-ID') }}
                </TableCell>
                <TableCell>
                  <Badge :variant="item.currentStock <= item.minThreshold ? 'destructive' : 'default'">
                    {{ item.currentStock <= item.minThreshold ? 'Low Stock' : 'In Stock' }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      v-if="hasPermission('manage_inventory')"
                      variant="ghost"
                      size="sm"
                      @click.stop="adjustStock(item)"
                    >
                      Adjust Stock
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click.stop="$router.push(`/inventory/${item.id}`)"
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <!-- Pagination -->
        <div class="border-t border-gray-200">
          <DataPagination
            :current-page="paginationState.currentPage"
            :page-size="paginationState.pageSize"
            :total-items="paginationState.totalItems"
            :total-pages="paginationState.totalPages"
            :page-sizes="[25, 50, 100]"
            :loading="isLoading"
            show-page-size-selector
            show-quick-jump
            show-page-info
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useInventoryStore } from '@/stores/inventory';
import { DataPagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowUpDown
} from 'lucide-vue-next';

const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

// Use store's pagination and filtering
const isLoading = computed(() => inventoryStore.isLoading);
const activeItems = computed(() => inventoryStore.activeItems);
const lowStockItems = computed(() => inventoryStore.lowStockItems);
const totalValue = computed(() => inventoryStore.totalValue);
const itemsByCategory = computed(() => inventoryStore.itemsByCategory);
const paginatedItems = computed(() => inventoryStore.paginatedItems);
const filteredAndSearchedItems = computed(() => inventoryStore.filteredAndSearchedItems);
const paginationState = computed(() => inventoryStore.paginationState);
const availableCategories = computed(() => inventoryStore.availableCategories);
const searchQuery = computed(() => inventoryStore.searchQuery);
const categoryFilter = computed(() => inventoryStore.categoryFilter);
const statusFilter = computed(() => inventoryStore.statusFilter);
const sortBy = computed(() => inventoryStore.sortBy);
const sortOrder = computed(() => inventoryStore.sortOrder);

// Local refs for form controls
const searchInput = ref('');
const categorySelect = ref('__ALL__');
const statusSelect = ref<'all' | 'active' | 'low_stock' | 'out_of_stock'>('all');

// Watchers to sync local refs with store
watch(searchInput, (newValue) => {
  inventoryStore.setSearchQuery(newValue);
});

watch(categorySelect, (newValue) => {
  // Convert the special __ALL__ value to empty string for the store
  inventoryStore.setCategoryFilter(newValue === '__ALL__' ? '' : newValue);
});

watch(statusSelect, (newValue) => {
  inventoryStore.setStatusFilter(newValue);
});

// Initialize local refs from store
searchInput.value = searchQuery.value;
categorySelect.value = categoryFilter.value || '__ALL__';
statusSelect.value = statusFilter.value;

const hasPermission = (permission: string) => authStore.hasPermission(permission);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
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

// Pagination handlers
const handlePageChange = (page: number) => {
  inventoryStore.setPage(page);
};

const handlePageSizeChange = (pageSize: number) => {
  inventoryStore.setPageSize(pageSize as any);
};

// Sorting handlers
const handleSort = (field: 'name' | 'category' | 'stock' | 'value') => {
  const currentOrder = sortBy.value === field && sortOrder.value === 'asc' ? 'desc' : 'asc';
  inventoryStore.setSorting(field, currentOrder);
};

const getSortIcon = (field: string) => {
  if (sortBy.value !== field) return 'text-gray-400';
  return sortOrder.value === 'asc' ? 'text-blue-600 rotate-180' : 'text-blue-600';
};

// Clear all filters
const clearAllFilters = () => {
  inventoryStore.clearFilters();
  // Reset local refs
  searchInput.value = '';
  categorySelect.value = '__ALL__';
  statusSelect.value = 'all';
};

onMounted(() => {
  inventoryStore.fetchInventoryItems();
});
</script>