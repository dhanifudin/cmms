<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Asset Registry</h1>
        <p class="mt-1 text-sm text-gray-600">
          Manage equipment and asset lifecycle
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <Button
          v-if="hasPermission('manage_assets')"
          as-child
        >
          <router-link to="/assets/create">
            <Plus class="w-4 h-4 mr-2" />
            Add Asset
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
              <Settings class="h-6 w-6 text-blue-500" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-muted-foreground">Total Assets</p>
              <p class="text-2xl font-semibold">{{ statistics.total }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircle class="h-6 w-6 text-green-500" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-muted-foreground">Operational</p>
              <p class="text-2xl font-semibold">{{ statistics.byStatus.operational }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Wrench class="h-6 w-6 text-yellow-500" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-muted-foreground">Under Maintenance</p>
              <p class="text-2xl font-semibold">{{ statistics.byStatus.under_maintenance }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <AlertTriangle class="h-6 w-6 text-red-500" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-muted-foreground">Needs Maintenance</p>
              <p class="text-2xl font-semibold">{{ statistics.needingMaintenance }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and Search -->
    <Card>
      <CardContent class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>Category</Label>
            <Select v-model="categorySelect">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Categories</SelectItem>
                <SelectItem v-for="cat in categoryOptions" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="statusSelect">
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Statuses</SelectItem>
                <SelectItem v-for="status in statusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Criticality</Label>
            <Select v-model="criticalitySelect">
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Levels</SelectItem>
                <SelectItem v-for="crit in criticalityOptions" :key="crit.value" :value="crit.value">
                  {{ crit.label }}
                </SelectItem>
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
                placeholder="Search assets..."
                class="pl-10"
              />
            </div>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-600">
              Showing {{ paginatedAssets.length }} of {{ filteredAssets.length }} assets
            </div>
            <div class="flex items-center gap-2">
              <Checkbox id="needsMaintenance" v-model:checked="needsMaintenanceFilter" />
              <label for="needsMaintenance" class="text-sm text-gray-600 cursor-pointer">
                Needs maintenance soon
              </label>
            </div>
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

    <!-- Asset Table -->
    <Card>
      <CardContent class="p-0">
        <div v-if="isLoading" class="p-8">
          <div class="space-y-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>
        </div>

        <Alert v-else-if="paginatedAssets.length === 0" class="m-6">
          <Settings class="h-4 w-4" />
          <AlertTitle>No assets found</AlertTitle>
          <AlertDescription>Try adjusting your filters or add a new asset.</AlertDescription>
        </Alert>

        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    @click="handleSort('code')"
                    class="flex items-center space-x-1 text-left hover:text-gray-900"
                  >
                    <span>Asset</span>
                    <ArrowUpDown :class="getSortIcon('code')" class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>
                  <button
                    @click="handleSort('nextMaintenance')"
                    class="flex items-center space-x-1 text-left hover:text-gray-900"
                  >
                    <span>Next Maintenance</span>
                    <ArrowUpDown :class="getSortIcon('nextMaintenance')" class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="asset in paginatedAssets"
                :key="asset.id"
                class="cursor-pointer"
                @click="$router.push(`/assets/${asset.id}`)"
              >
                <TableCell>
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <component :is="getCategoryIcon(asset.category)" class="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium">{{ asset.name }}</div>
                      <div class="text-sm text-muted-foreground">{{ asset.code }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{{ getCategoryLabel(asset.category) }}</Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm">{{ asset.location }}</div>
                  <div class="text-xs text-muted-foreground">{{ getTerminalName(asset.terminalId) }}</div>
                </TableCell>
                <TableCell>
                  <Badge :class="getStatusClass(asset.status)">
                    {{ getStatusLabel(asset.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :class="getCriticalityClass(asset.criticality)">
                    {{ getCriticalityLabel(asset.criticality) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div v-if="asset.nextScheduledMaintenance" class="text-sm">
                    <div :class="getMaintenanceUrgencyClass(asset.nextScheduledMaintenance)">
                      {{ formatDate(asset.nextScheduledMaintenance) }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ getMaintenanceUrgencyText(asset.nextScheduledMaintenance) }}
                    </div>
                  </div>
                  <span v-else class="text-sm text-muted-foreground">Not scheduled</span>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click.stop="$router.push(`/assets/${asset.id}`)"
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
            :current-page="currentPage"
            :page-size="pageSize"
            :total-items="filteredAssets.length"
            :total-pages="totalPages"
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
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAssetStore } from '@/stores/asset';
import { mockTerminals } from '@/mock/terminals';
import { DataPagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus,
  Search,
  Settings,
  CheckCircle,
  Wrench,
  AlertTriangle,
  ArrowUpDown,
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
  Package
} from 'lucide-vue-next';
import type { AssetCategory, AssetStatus, AssetCriticality, Asset } from '@/types/asset';
import {
  ASSET_CATEGORY_CONFIG,
  ASSET_STATUS_CONFIG,
  ASSET_CRITICALITY_CONFIG
} from '@/types/asset';

const authStore = useAuthStore();
const assetStore = useAssetStore();

// Local state
const isLoading = computed(() => assetStore.isLoading);
const searchInput = ref('');
const categorySelect = ref('__ALL__');
const statusSelect = ref('__ALL__');
const criticalitySelect = ref('__ALL__');
const needsMaintenanceFilter = ref(false);
const currentPage = ref(1);
const pageSize = ref(25);
const sortField = ref<'code' | 'nextMaintenance'>('code');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Watch filters and update store
watch([searchInput, categorySelect, statusSelect, criticalitySelect, needsMaintenanceFilter], () => {
  assetStore.setFilter({
    search: searchInput.value,
    category: categorySelect.value === '__ALL__' ? null : categorySelect.value as AssetCategory,
    status: statusSelect.value === '__ALL__' ? null : statusSelect.value as AssetStatus,
    criticality: criticalitySelect.value === '__ALL__' ? null : criticalitySelect.value as AssetCriticality,
    needsMaintenance: needsMaintenanceFilter.value
  });
  currentPage.value = 1;
});

// Computed
const filteredAssets = computed(() => assetStore.filteredAssets);
const statistics = computed(() => assetStore.getStatistics());

const sortedAssets = computed(() => {
  const assets = [...filteredAssets.value];

  assets.sort((a, b) => {
    let comparison = 0;

    if (sortField.value === 'code') {
      comparison = a.code.localeCompare(b.code);
    } else if (sortField.value === 'nextMaintenance') {
      const dateA = a.nextScheduledMaintenance ? new Date(a.nextScheduledMaintenance).getTime() : Infinity;
      const dateB = b.nextScheduledMaintenance ? new Date(b.nextScheduledMaintenance).getTime() : Infinity;
      comparison = dateA - dateB;
    }

    return sortOrder.value === 'asc' ? comparison : -comparison;
  });

  return assets;
});

const paginatedAssets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return sortedAssets.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAssets.value.length / pageSize.value));

// Options for selects
const categoryOptions = computed(() => {
  return Object.entries(ASSET_CATEGORY_CONFIG).map(([value, config]) => ({
    value,
    label: config.label
  }));
});

const statusOptions = computed(() => {
  return Object.entries(ASSET_STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label
  }));
});

const criticalityOptions = computed(() => {
  return Object.entries(ASSET_CRITICALITY_CONFIG).map(([value, config]) => ({
    value,
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
  if (daysUntil <= 7) return `In ${daysUntil} days`;
  return `In ${daysUntil} days`;
};

// Handlers
const handleSort = (field: 'code' | 'nextMaintenance') => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

const getSortIcon = (field: string) => {
  if (sortField.value !== field) return 'text-gray-400';
  return sortOrder.value === 'asc' ? 'text-blue-600 rotate-180' : 'text-blue-600';
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const clearAllFilters = () => {
  searchInput.value = '';
  categorySelect.value = '__ALL__';
  statusSelect.value = '__ALL__';
  criticalitySelect.value = '__ALL__';
  needsMaintenanceFilter.value = false;
  assetStore.clearFilter();
};

onMounted(() => {
  // Assets are already loaded from mock data in the store
});
</script>
