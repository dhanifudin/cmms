<template>
  <div v-if="asset" class="space-y-6">
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
            <h1 class="text-2xl font-bold text-gray-900">{{ asset.name }}</h1>
            <p class="text-sm text-muted-foreground">{{ asset.code }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <Badge :class="getStatusClass(asset.status)">
          {{ getStatusLabel(asset.status) }}
        </Badge>
        <Badge :class="getCriticalityClass(asset.criticality)">
          {{ getCriticalityLabel(asset.criticality) }}
        </Badge>
      </div>
    </div>

    <!-- Asset Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Information -->
        <Card>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p class="text-sm">{{ asset.description || 'No description provided' }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                <div class="flex items-center gap-2">
                  <component :is="getCategoryIcon(asset.category)" class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm">{{ getCategoryLabel(asset.category) }}</span>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Type</h3>
                <p class="text-sm">{{ asset.type || 'Not specified' }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                <p class="text-sm">{{ asset.location }}</p>
                <p class="text-xs text-muted-foreground">{{ getTerminalName(asset.terminalId) }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Manufacturer</h3>
                <p class="text-sm">{{ asset.manufacturer || 'Not specified' }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Model</h3>
                <p class="text-sm">{{ asset.model || 'Not specified' }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Serial Number</h3>
                <p class="text-sm font-mono">{{ asset.serialNumber || 'Not specified' }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Acquisition Date</h3>
                <p class="text-sm">{{ asset.acquisitionDate ? formatDate(asset.acquisitionDate) : 'Not specified' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Specifications -->
        <Card v-if="asset.specifications && Object.keys(asset.specifications).length > 0">
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(value, key) in asset.specifications"
                :key="key"
                class="flex justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span class="text-sm text-muted-foreground">{{ key }}</span>
                <span class="text-sm font-medium">{{ value }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Maintenance History -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Maintenance History</CardTitle>
              <Button variant="ghost" size="sm" @click="showCreateWorkOrder = true">
                <Plus class="w-4 h-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="linkedWorkOrders.length === 0" class="text-center py-8 text-muted-foreground">
              <Wrench class="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p class="text-sm">No maintenance records</p>
            </div>

            <div v-else class="space-y-3">
              <Card
                v-for="wo in linkedWorkOrders.slice(0, 5)"
                :key="wo.id"
                class="border-border cursor-pointer hover:bg-muted/50"
                @click="$router.push(`/workorders/${wo.id}`)"
              >
                <CardContent class="p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium">{{ wo.title }}</p>
                      <p class="text-xs text-muted-foreground">{{ wo.id }}</p>
                    </div>
                    <div class="text-right">
                      <Badge variant="outline" class="text-xs">
                        {{ wo.status }}
                      </Badge>
                      <p class="text-xs text-muted-foreground mt-1">
                        {{ formatDate(wo.dueDate) }}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <!-- Child Assets -->
        <Card v-if="childAssets.length > 0">
          <CardHeader>
            <CardTitle>Child Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <Card
                v-for="child in childAssets"
                :key="child.id"
                class="border-border cursor-pointer hover:bg-muted/50"
                @click="$router.push(`/assets/${child.id}`)"
              >
                <CardContent class="p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <component :is="getCategoryIcon(child.category)" class="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p class="text-sm font-medium">{{ child.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ child.code }}</p>
                      </div>
                    </div>
                    <Badge :class="getStatusClass(child.status)">
                      {{ getStatusLabel(child.status) }}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Metrics Card -->
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-if="metrics">
                <!-- Health Score -->
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-muted-foreground">Health Score</span>
                    <span :class="getHealthScoreClass(metrics.healthScore)">{{ metrics.healthScore }}%</span>
                  </div>
                  <div class="w-full bg-secondary rounded-full h-2">
                    <div
                      class="h-2 rounded-full"
                      :class="getHealthScoreBarClass(metrics.healthScore)"
                      :style="{ width: metrics.healthScore + '%' }"
                    ></div>
                  </div>
                </div>

                <Separator />

                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">MTBF</span>
                  <span class="text-sm font-medium">{{ formatHours(metrics.mtbf) }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">MTTR</span>
                  <span class="text-sm font-medium">{{ formatHours(metrics.mttr) }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">Availability</span>
                  <span class="text-sm font-medium">{{ metrics.availability.toFixed(1) }}%</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">Total Work Orders</span>
                  <span class="text-sm font-medium">{{ metrics.totalWorkOrders }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Maintenance Schedule -->
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Last Maintenance</h3>
                <p class="text-sm">
                  {{ asset.lastMaintenanceDate ? formatDate(asset.lastMaintenanceDate) : 'Never' }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Next Scheduled</h3>
                <p
                  v-if="asset.nextScheduledMaintenance"
                  class="text-sm"
                  :class="getMaintenanceUrgencyClass(asset.nextScheduledMaintenance)"
                >
                  {{ formatDate(asset.nextScheduledMaintenance) }}
                  <span class="block text-xs text-muted-foreground">
                    {{ getMaintenanceUrgencyText(asset.nextScheduledMaintenance) }}
                  </span>
                </p>
                <p v-else class="text-sm text-muted-foreground">Not scheduled</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Frequency</h3>
                <p class="text-sm">
                  {{ asset.maintenanceFrequency?.type ? capitalize(asset.maintenanceFrequency.type) : 'Not set' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Financial Information -->
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Acquisition Cost</span>
                <span class="text-sm font-medium">
                  {{ asset.acquisitionCost ? formatCurrency(asset.acquisitionCost) : '-' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Current Value</span>
                <span class="text-sm font-medium text-green-600">
                  {{ asset.currentValue ? formatCurrency(asset.currentValue) : '-' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Total Maintenance Cost</span>
                <span class="text-sm font-medium">
                  {{ asset.totalMaintenanceCost ? formatCurrency(asset.totalMaintenanceCost) : '-' }}
                </span>
              </div>

              <div v-if="asset.warrantyExpiration">
                <h3 class="text-sm font-medium text-muted-foreground mb-1">Warranty Expires</h3>
                <p class="text-sm" :class="isWarrantyExpired ? 'text-red-600' : ''">
                  {{ formatDate(asset.warrantyExpiration) }}
                  <span v-if="isWarrantyExpired" class="text-xs">(Expired)</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card v-if="hasPermission('manage_assets')">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <Button
                variant="outline"
                class="w-full"
                @click="showStatusModal = true"
              >
                <RefreshCw class="w-4 h-4 mr-2" />
                Update Status
              </Button>

              <Button
                variant="outline"
                class="w-full"
                @click="$router.push(`/assets/${asset.id}/edit`)"
              >
                <Edit class="w-4 h-4 mr-2" />
                Edit Asset
              </Button>

              <Button
                variant="outline"
                class="w-full"
                @click="showCreateWorkOrder = true"
              >
                <Plus class="w-4 h-4 mr-2" />
                Create Work Order
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Parent Asset -->
        <Card v-if="parentAsset">
          <CardHeader>
            <CardTitle>Parent Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <Card
              class="border-border cursor-pointer hover:bg-muted/50"
              @click="$router.push(`/assets/${parentAsset.id}`)"
            >
              <CardContent class="p-4">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <component :is="getCategoryIcon(parentAsset.category)" class="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p class="text-sm font-medium">{{ parentAsset.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ parentAsset.code }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Status Update Modal -->
    <Dialog v-model:open="showStatusModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Asset Status</DialogTitle>
          <DialogDescription>
            Change the operational status of this asset.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <Select v-model="newStatus">
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showStatusModal = false">
            Cancel
          </Button>
          <Button @click="updateStatus">
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Create Work Order Modal -->
    <Dialog v-model:open="showCreateWorkOrder">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance</DialogTitle>
          <DialogDescription>
            Create a work order for this asset. This feature will be fully implemented soon.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="default" @click="showCreateWorkOrder = false">
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
      Loading asset details...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAssetStore } from '@/stores/asset';
import { useWorkOrderStore } from '@/stores/workorder';
import { mockTerminals } from '@/mock/terminals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Plus,
  Edit,
  RefreshCw,
  Wrench,
  Droplets,
  Wind,
  Workflow,
  GitBranch,
  Database,
  Zap,
  Plug,
  Gauge,
  ShieldCheck,
  Thermometer,
  Truck,
  Package,
  Settings
} from 'lucide-vue-next';
import type { Asset, AssetCategory, AssetStatus, AssetCriticality, AssetMetrics } from '@/types/asset';
import {
  ASSET_CATEGORY_CONFIG,
  ASSET_STATUS_CONFIG,
  ASSET_CRITICALITY_CONFIG
} from '@/types/asset';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const assetStore = useAssetStore();
const workOrderStore = useWorkOrderStore();

const asset = ref<Asset | null>(null);
const showStatusModal = ref(false);
const showCreateWorkOrder = ref(false);
const newStatus = ref<AssetStatus>('operational');

// Computed
const metrics = computed((): AssetMetrics | null => {
  if (!asset.value) return null;
  return assetStore.getAssetMetrics(asset.value.id);
});

const parentAsset = computed(() => {
  if (!asset.value) return null;
  return assetStore.getParentAsset(asset.value.id);
});

const childAssets = computed(() => {
  if (!asset.value) return [];
  return assetStore.getChildAssets(asset.value.id);
});

const linkedWorkOrders = computed(() => {
  if (!asset.value?.linkedWorkOrderIds) return [];
  return asset.value.linkedWorkOrderIds
    .map(id => workOrderStore.getWorkOrderById(id))
    .filter((wo): wo is NonNullable<typeof wo> => wo !== undefined);
});

const isWarrantyExpired = computed(() => {
  if (!asset.value?.warrantyExpiration) return false;
  return new Date(asset.value.warrantyExpiration) < new Date();
});

const statusOptions = computed(() => {
  return Object.entries(ASSET_STATUS_CONFIG).map(([value, config]) => ({
    value: value as AssetStatus,
    label: config.label
  }));
});

// Methods
const hasPermission = (permission: string) => authStore.hasPermission(permission);

const getCategoryIcon = (category: AssetCategory) => {
  const iconMap: Record<AssetCategory, any> = {
    pump: Droplets,
    compressor: Wind,
    pipeline: Workflow,
    valve: GitBranch,
    tank: Database,
    generator: Zap,
    electrical: Plug,
    instrumentation: Gauge,
    safety_system: ShieldCheck,
    hvac: Thermometer,
    vehicle: Truck,
    tool: Wrench,
    other: Package
  };
  return iconMap[category] || Settings;
};

const getCategoryLabel = (category: AssetCategory) => {
  return ASSET_CATEGORY_CONFIG[category]?.label || category;
};

const getStatusLabel = (status: AssetStatus) => {
  return ASSET_STATUS_CONFIG[status]?.label || status;
};

const getStatusClass = (status: AssetStatus) => {
  const config = ASSET_STATUS_CONFIG[status];
  return `${config?.color || ''} ${config?.bgColor || ''}`;
};

const getCriticalityLabel = (criticality: AssetCriticality) => {
  return ASSET_CRITICALITY_CONFIG[criticality]?.label || criticality;
};

const getCriticalityClass = (criticality: AssetCriticality) => {
  const colorMap: Record<AssetCriticality, string> = {
    critical: 'bg-red-100 text-red-700',
    important: 'bg-orange-100 text-orange-700',
    standard: 'bg-blue-100 text-blue-700',
    low: 'bg-gray-100 text-gray-700'
  };
  return colorMap[criticality];
};

const getTerminalName = (terminalId: string) => {
  const terminal = mockTerminals.find(t => t.id === terminalId);
  return terminal?.name || terminalId;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatHours = (hours: number) => {
  if (hours === 0) return '-';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getMaintenanceUrgencyClass = (nextMaintenance: string) => {
  const now = new Date();
  const maintDate = new Date(nextMaintenance);
  const daysUntil = (maintDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (daysUntil < 0) return 'text-red-600 font-medium';
  if (daysUntil <= 7) return 'text-orange-600 font-medium';
  return 'text-gray-900';
};

const getMaintenanceUrgencyText = (nextMaintenance: string) => {
  const now = new Date();
  const maintDate = new Date(nextMaintenance);
  const daysUntil = Math.ceil((maintDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  return `In ${daysUntil} days`;
};

const getHealthScoreClass = (score: number) => {
  if (score >= 80) return 'text-green-600 font-medium';
  if (score >= 50) return 'text-yellow-600 font-medium';
  return 'text-red-600 font-medium';
};

const getHealthScoreBarClass = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const updateStatus = async () => {
  if (!asset.value) return;
  await assetStore.updateAssetStatus(asset.value.id, newStatus.value);
  asset.value = assetStore.getAssetById(asset.value.id) || null;
  showStatusModal.value = false;
};

onMounted(() => {
  const assetId = route.params.id as string;
  asset.value = assetStore.getAssetById(assetId) || null;

  if (asset.value) {
    newStatus.value = asset.value.status;
  }
});
</script>
