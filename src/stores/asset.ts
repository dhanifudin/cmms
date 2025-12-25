/**
 * Asset Store
 *
 * Manages asset data for the CMMS Asset Management module.
 * Handles CRUD operations, filtering, and asset-work order integration.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Asset,
  AssetFilter,
  AssetCategory,
  AssetStatus,
  AssetCriticality,
  CreateAssetForm,
  UpdateAssetForm,
  AssetMetrics,
  MaintenanceRecord
} from '@/types/asset';
import { mockAssets, generateAssetCode } from '@/mock/assets';
import { getCurrentUserId } from '@/utils/auth';

export const useAssetStore = defineStore('asset', () => {
  // State
  const assets = ref<Asset[]>([...mockAssets]);
  const selectedAssetId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Current filter state
  const filter = ref<AssetFilter>({
    search: '',
    category: null,
    status: null,
    criticality: null,
    terminalId: null,
    regionId: null,
    needsMaintenance: false
  });

  // Computed
  const filteredAssets = computed(() => {
    let result = [...assets.value];

    // Search filter
    if (filter.value.search) {
      const searchLower = filter.value.search.toLowerCase();
      result = result.filter(asset =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.code.toLowerCase().includes(searchLower) ||
        asset.description?.toLowerCase().includes(searchLower) ||
        asset.manufacturer?.toLowerCase().includes(searchLower) ||
        asset.model?.toLowerCase().includes(searchLower) ||
        asset.serialNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filter.value.category) {
      result = result.filter(asset => asset.category === filter.value.category);
    }

    // Status filter
    if (filter.value.status) {
      result = result.filter(asset => asset.status === filter.value.status);
    }

    // Criticality filter
    if (filter.value.criticality) {
      result = result.filter(asset => asset.criticality === filter.value.criticality);
    }

    // Terminal filter
    if (filter.value.terminalId) {
      result = result.filter(asset => asset.terminalId === filter.value.terminalId);
    }

    // Region filter
    if (filter.value.regionId) {
      result = result.filter(asset => asset.regionId === filter.value.regionId);
    }

    // Needs maintenance filter
    if (filter.value.needsMaintenance) {
      const now = new Date();
      result = result.filter(asset => {
        if (!asset.nextScheduledMaintenance) return false;
        const nextMaint = new Date(asset.nextScheduledMaintenance);
        // Due within 7 days or overdue
        const daysUntilMaint = (nextMaint.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilMaint <= 7;
      });
    }

    return result;
  });

  const selectedAsset = computed(() => {
    if (!selectedAssetId.value) return null;
    return assets.value.find(a => a.id === selectedAssetId.value) || null;
  });

  const assetsByCategory = computed(() => {
    const grouped: Record<AssetCategory, Asset[]> = {
      pump: [],
      compressor: [],
      pipeline: [],
      valve: [],
      tank: [],
      generator: [],
      electrical: [],
      instrumentation: [],
      safety_system: [],
      hvac: [],
      vehicle: [],
      tool: [],
      other: []
    };

    assets.value.forEach(asset => {
      grouped[asset.category].push(asset);
    });

    return grouped;
  });

  const assetsByStatus = computed(() => {
    const grouped: Record<AssetStatus, Asset[]> = {
      operational: [],
      under_maintenance: [],
      out_of_service: [],
      decommissioned: [],
      pending_installation: []
    };

    assets.value.forEach(asset => {
      grouped[asset.status].push(asset);
    });

    return grouped;
  });

  const assetsByTerminal = computed(() => {
    const grouped: Record<string, Asset[]> = {};

    assets.value.forEach(asset => {
      const terminalId = asset.terminalId;
      if (!grouped[terminalId]) {
        grouped[terminalId] = [];
      }
      grouped[terminalId].push(asset);
    });

    return grouped;
  });

  const criticalAssets = computed(() => {
    return assets.value.filter(a => a.criticality === 'critical');
  });

  const assetsNeedingMaintenance = computed(() => {
    const now = new Date();
    return assets.value.filter(asset => {
      if (!asset.nextScheduledMaintenance) return false;
      const nextMaint = new Date(asset.nextScheduledMaintenance);
      const daysUntilMaint = (nextMaint.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilMaint <= 7;
    });
  });

  const totalAssetValue = computed(() => {
    return assets.value.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
  });

  const totalMaintenanceCost = computed(() => {
    return assets.value.reduce((sum, asset) => sum + (asset.totalMaintenanceCost || 0), 0);
  });

  // Actions
  const setFilter = (newFilter: Partial<AssetFilter>) => {
    filter.value = { ...filter.value, ...newFilter };
  };

  const clearFilter = () => {
    filter.value = {
      search: '',
      category: null,
      status: null,
      criticality: null,
      terminalId: null,
      regionId: null,
      needsMaintenance: false
    };
  };

  const selectAsset = (assetId: string | null) => {
    selectedAssetId.value = assetId;
  };

  const getAssetById = (assetId: string): Asset | undefined => {
    return assets.value.find(a => a.id === assetId);
  };

  const getAssetByCode = (code: string): Asset | undefined => {
    return assets.value.find(a => a.code === code);
  };

  const createAsset = async (form: CreateAssetForm): Promise<Asset> => {
    isLoading.value = true;
    error.value = null;

    try {
      const now = new Date().toISOString();
      const code = form.code || generateAssetCode(form.category, form.terminalId);

      const newAsset: Asset = {
        id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        code,
        name: form.name,
        description: form.description,
        category: form.category,
        type: form.type,
        criticality: form.criticality,
        terminalId: form.terminalId,
        regionId: form.regionId,
        location: form.location,
        manufacturer: form.manufacturer,
        model: form.model,
        serialNumber: form.serialNumber,
        specifications: form.specifications,
        status: form.status || 'operational',
        acquisitionDate: form.acquisitionDate,
        warrantyExpiration: form.warrantyExpiration,
        expectedLifeYears: form.expectedLifeYears,
        maintenanceFrequency: form.maintenanceFrequency,
        acquisitionCost: form.acquisitionCost,
        currentValue: form.acquisitionCost, // Initially same as acquisition cost
        parentAssetId: form.parentAssetId,
        createdAt: now,
        createdBy: getCurrentUserId(),
        updatedAt: now
      };

      // If this asset has a parent, add it to parent's children
      if (form.parentAssetId) {
        const parent = assets.value.find(a => a.id === form.parentAssetId);
        if (parent) {
          if (!parent.childAssetIds) {
            parent.childAssetIds = [];
          }
          parent.childAssetIds.push(newAsset.id);
        }
      }

      assets.value.push(newAsset);
      return newAsset;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create asset';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateAsset = async (form: UpdateAssetForm): Promise<Asset> => {
    isLoading.value = true;
    error.value = null;

    try {
      const index = assets.value.findIndex(a => a.id === form.id);
      if (index === -1) {
        throw new Error(`Asset with id ${form.id} not found`);
      }

      const existingAsset = assets.value[index];
      // Create updated asset by merging only defined values from form
      const updatedAsset: Asset = Object.assign({}, existingAsset, {
        updatedAt: new Date().toISOString(),
        updatedBy: getCurrentUserId()
      });

      // Apply form updates (only defined values, excluding id)
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          (updatedAsset as any)[key] = value;
        }
      });

      assets.value[index] = updatedAsset;
      return updatedAsset;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update asset';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteAsset = async (assetId: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const asset = assets.value.find(a => a.id === assetId);
      if (!asset) {
        throw new Error(`Asset with id ${assetId} not found`);
      }

      // Remove from parent's children list
      if (asset.parentAssetId) {
        const parent = assets.value.find(a => a.id === asset.parentAssetId);
        if (parent && parent.childAssetIds) {
          parent.childAssetIds = parent.childAssetIds.filter(id => id !== assetId);
        }
      }

      // Handle children - either orphan them or prevent deletion
      if (asset.childAssetIds && asset.childAssetIds.length > 0) {
        // Orphan children by removing parent reference
        asset.childAssetIds.forEach(childId => {
          const child = assets.value.find(a => a.id === childId);
          if (child) {
            child.parentAssetId = undefined;
          }
        });
      }

      assets.value = assets.value.filter(a => a.id !== assetId);

      if (selectedAssetId.value === assetId) {
        selectedAssetId.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete asset';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateAssetStatus = async (assetId: string, status: AssetStatus): Promise<void> => {
    const asset = assets.value.find(a => a.id === assetId);
    if (asset) {
      asset.status = status;
      asset.updatedAt = new Date().toISOString();
      asset.updatedBy = getCurrentUserId();
    }
  };

  const recordMaintenance = async (
    assetId: string,
    maintenanceDate: string,
    nextMaintenanceDate?: string
  ): Promise<void> => {
    const asset = assets.value.find(a => a.id === assetId);
    if (asset) {
      asset.lastMaintenanceDate = maintenanceDate;
      if (nextMaintenanceDate) {
        asset.nextScheduledMaintenance = nextMaintenanceDate;
      }
      asset.updatedAt = new Date().toISOString();
      asset.updatedBy = getCurrentUserId();
    }
  };

  const linkWorkOrder = async (assetId: string, workOrderId: string): Promise<void> => {
    const asset = assets.value.find(a => a.id === assetId);
    if (asset) {
      if (!asset.linkedWorkOrderIds) {
        asset.linkedWorkOrderIds = [];
      }
      if (!asset.linkedWorkOrderIds.includes(workOrderId)) {
        asset.linkedWorkOrderIds.push(workOrderId);
        asset.updatedAt = new Date().toISOString();
      }
    }
  };

  const unlinkWorkOrder = async (assetId: string, workOrderId: string): Promise<void> => {
    const asset = assets.value.find(a => a.id === assetId);
    if (asset && asset.linkedWorkOrderIds) {
      asset.linkedWorkOrderIds = asset.linkedWorkOrderIds.filter(id => id !== workOrderId);
      asset.updatedAt = new Date().toISOString();
    }
  };

  const getAssetMetrics = (assetId: string): AssetMetrics | null => {
    const asset = assets.value.find(a => a.id === assetId);
    if (!asset) return null;

    // Calculate availability based on MTBF and MTTR
    const mtbf = asset.mtbf || 0;
    const mttr = asset.mttr || 0;
    const availability = mtbf > 0 ? (mtbf / (mtbf + mttr)) * 100 : 100;

    // Calculate health score based on various factors
    let healthScore = 100;

    // Deduct for status issues
    if (asset.status === 'out_of_service') healthScore -= 50;
    else if (asset.status === 'under_maintenance') healthScore -= 20;
    else if (asset.status === 'decommissioned') healthScore = 0;

    // Deduct for high failure count
    if (asset.failureCount && asset.failureCount > 5) healthScore -= 20;
    else if (asset.failureCount && asset.failureCount > 2) healthScore -= 10;

    // Deduct for overdue maintenance
    if (asset.nextScheduledMaintenance) {
      const now = new Date();
      const nextMaint = new Date(asset.nextScheduledMaintenance);
      if (nextMaint < now) healthScore -= 15;
    }

    healthScore = Math.max(0, healthScore);

    return {
      mtbf: asset.mtbf || 0,
      mttr: asset.mttr || 0,
      availability,
      totalWorkOrders: asset.linkedWorkOrderIds?.length || 0,
      completedWorkOrders: 0, // Would need work order integration
      overdueWorkOrders: 0, // Would need work order integration
      totalMaintenanceCost: asset.totalMaintenanceCost || 0,
      healthScore,
      lastMaintenanceDate: asset.lastMaintenanceDate,
      nextMaintenanceDate: asset.nextScheduledMaintenance
    };
  };

  const getChildAssets = (assetId: string): Asset[] => {
    const asset = assets.value.find(a => a.id === assetId);
    if (!asset || !asset.childAssetIds) return [];

    return asset.childAssetIds
      .map(id => assets.value.find(a => a.id === id))
      .filter((a): a is Asset => a !== undefined);
  };

  const getParentAsset = (assetId: string): Asset | null => {
    const asset = assets.value.find(a => a.id === assetId);
    if (!asset || !asset.parentAssetId) return null;

    return assets.value.find(a => a.id === asset.parentAssetId) || null;
  };

  const getAssetHierarchy = (assetId: string): Asset[] => {
    const hierarchy: Asset[] = [];
    let current = assets.value.find(a => a.id === assetId);

    while (current) {
      hierarchy.unshift(current);
      if (current.parentAssetId) {
        current = assets.value.find(a => a.id === current!.parentAssetId);
      } else {
        break;
      }
    }

    return hierarchy;
  };

  // Statistics
  const getStatistics = () => {
    const stats = {
      total: assets.value.length,
      byStatus: {
        operational: 0,
        under_maintenance: 0,
        out_of_service: 0,
        decommissioned: 0,
        pending_installation: 0
      } as Record<AssetStatus, number>,
      byCriticality: {
        critical: 0,
        important: 0,
        standard: 0,
        low: 0
      } as Record<AssetCriticality, number>,
      byCategory: {} as Record<AssetCategory, number>,
      totalValue: totalAssetValue.value,
      totalMaintenanceCost: totalMaintenanceCost.value,
      needingMaintenance: assetsNeedingMaintenance.value.length
    };

    assets.value.forEach(asset => {
      stats.byStatus[asset.status]++;
      stats.byCriticality[asset.criticality]++;

      if (!stats.byCategory[asset.category]) {
        stats.byCategory[asset.category] = 0;
      }
      stats.byCategory[asset.category]++;
    });

    return stats;
  };

  return {
    // State
    assets,
    selectedAssetId,
    isLoading,
    error,
    filter,

    // Computed
    filteredAssets,
    selectedAsset,
    assetsByCategory,
    assetsByStatus,
    assetsByTerminal,
    criticalAssets,
    assetsNeedingMaintenance,
    totalAssetValue,
    totalMaintenanceCost,

    // Actions
    setFilter,
    clearFilter,
    selectAsset,
    getAssetById,
    getAssetByCode,
    createAsset,
    updateAsset,
    deleteAsset,
    updateAssetStatus,
    recordMaintenance,
    linkWorkOrder,
    unlinkWorkOrder,
    getAssetMetrics,
    getChildAssets,
    getParentAsset,
    getAssetHierarchy,
    getStatistics
  };
});
