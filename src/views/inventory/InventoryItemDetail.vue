<template>
  <div v-if="item" class="space-y-6">
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
            <h1 class="text-2xl font-bold text-gray-900">{{ item.name }}</h1>
            <p class="text-sm text-muted-foreground">{{ item.code }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <Badge :variant="item.currentStock <= item.minThreshold ? 'destructive' : 'default'">
          {{ item.currentStock <= item.minThreshold ? 'Low Stock' : 'In Stock' }}
        </Badge>
        <Badge variant="outline">
          {{ item.category }}
        </Badge>
      </div>
    </div>

    <!-- Item Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Details -->
      <div class="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p class="text-sm">{{ item.description || 'No description provided' }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                <p class="text-sm">{{ item.category }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Unit of Measure</h3>
                <p class="text-sm">{{ item.unitOfMeasure }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Unit Price</h3>
                <p class="text-sm">Rp {{ item.unitPrice.toLocaleString('id-ID') }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Storage Location</h3>
                <p class="text-sm">{{ item.storageLocation || 'Not specified' }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Supplier</h3>
                <p class="text-sm">{{ item.supplier || 'Not specified' }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                <p class="text-sm">{{ formatDate(item.lastUpdated) }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <Badge variant="default">
                  {{ item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Stock Information -->
      <div class="space-y-6">
        <!-- Stock Stats -->
        <Card>
          <CardHeader>
            <CardTitle>Stock Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">Current Stock</span>
                <span class="text-lg font-semibold">
                  {{ item.currentStock }} {{ item.unitOfMeasure }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">Minimum Threshold</span>
                <span class="text-sm text-muted-foreground">
                  {{ item.minThreshold }} {{ item.unitOfMeasure }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">Total Value</span>
                <span class="text-lg font-semibold text-green-600">
                  Rp {{ (item.currentStock * item.unitPrice).toLocaleString('id-ID') }}
                </span>
              </div>

              <!-- Stock Level Indicator -->
              <div>
                <div class="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Stock Level</span>
                  <span>{{ getStockPercentage() }}%</span>
                </div>
                <div class="w-full bg-secondary rounded-full h-2">
                  <div
                    class="h-2 rounded-full"
                    :class="getStockLevelColor()"
                    :style="{ width: getStockPercentage() + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card v-if="hasPermission('manage_inventory')">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <Button
                variant="outline"
                class="w-full"
                @click="showAdjustStockModal = true"
              >
                <TrendingUp class="w-4 h-4 mr-2" />
                Adjust Stock
              </Button>

              <Button
                variant="outline"
                class="w-full"
              >
                <Edit class="w-4 h-4 mr-2" />
                Edit Item
              </Button>

              <Button
                variant="outline"
                class="w-full"
              >
                <ShoppingCart class="w-4 h-4 mr-2" />
                Create Purchase Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Stock Movements History -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Stock Movement History</CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="stockMovements.length === 0" class="text-center py-8 text-muted-foreground">
          <TrendingUp class="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p class="text-sm">No stock movements recorded</p>
        </div>

        <div v-else class="space-y-3">
          <Card
            v-for="movement in stockMovements.slice(0, 5)"
            :key="movement.id"
            class="border-border"
          >
            <CardContent class="p-4">
              <div class="flex items-center justify-between">
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
                    <p class="text-sm font-medium capitalize">
                      {{ movement.type.replace('_', ' ') }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ formatDate(movement.createdAt || new Date().toISOString()) }}
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
                  <p v-if="movement.reference" class="text-xs text-muted-foreground">
                    Ref: {{ movement.reference }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Stock Adjustment Modal -->
    <Dialog v-model:open="showAdjustStockModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Feature coming soon. Stock adjustments will be available in the next update.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="default" @click="showAdjustStockModal = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { InventoryItem } from '@/types';

const route = useRoute();
const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

const item = ref<InventoryItem | null>(null);
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
  item.value = inventoryStore.getItemById(itemId) ?? null;
});
</script>