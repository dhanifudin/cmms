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
              <p class="text-2xl font-semibold">${{ formatCurrency(totalValue) }}</p>
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
            <Select v-model="filters.category">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Categories</SelectItem>
                <SelectItem v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Stock Status</Label>
            <Select v-model="filters.stockStatus">
              <SelectTrigger>
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Items</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
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
                placeholder="Search items..."
                class="pl-10"
              />
            </div>
          </div>
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

        <Alert v-else-if="filteredItems.length === 0" class="m-6">
          <Package class="h-4 w-4" />
          <AlertTitle>No items found</AlertTitle>
          <AlertDescription>Try adjusting your filters or add a new item.</AlertDescription>
        </Alert>

        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in filteredItems"
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
                  ${{ item.unitPrice.toFixed(2) }}
                </TableCell>
                <TableCell class="text-sm font-medium">
                  ${{ (item.currentStock * item.unitPrice).toFixed(2) }}
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
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useInventoryStore } from '@/stores/inventory';
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
  return Object.keys(itemsByCategory.value).filter(cat => cat && cat.trim()).sort();
});

const filteredItems = computed(() => {
  let items = activeItems.value;
  
  // Filter by category
  if (filters.value.category && filters.value.category !== '__ALL__') {
    items = items.filter(item => item.category === filters.value.category);
  }
  
  // Filter by stock status
  if (filters.value.stockStatus === 'low') {
    items = items.filter(item => item.currentStock <= item.minThreshold);
  } else if (filters.value.stockStatus === 'normal') {
    items = items.filter(item => item.currentStock > item.minThreshold);
  }
  // '__ALL__' or null shows all items, no filtering needed
  
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