/**
 * Offline Sync Composable
 *
 * Provides offline synchronization capabilities for components.
 * Handles caching work orders and queueing updates for later sync.
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useOfflineStore } from '@/stores/offline';
import type { WorkOrder } from '@/types';

export interface UseOfflineSyncOptions {
  autoCache?: boolean;
  autoCacheInterval?: number; // in milliseconds
}

export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const {
    autoCache = false,
    autoCacheInterval = 5 * 60 * 1000 // 5 minutes
  } = options;

  const offlineStore = useOfflineStore();
  const autoCacheTimer = ref<ReturnType<typeof setInterval> | null>(null);

  // Computed
  const isOnline = computed(() => offlineStore.isOnline);
  const syncStatus = computed(() => offlineStore.syncStatus);
  const hasPendingSync = computed(() => offlineStore.hasPendingSync);
  const pendingCount = computed(() => offlineStore.pendingCount);
  const isSyncing = computed(() => offlineStore.isSyncing);

  /**
   * Queue a documentation submission for sync
   */
  const queueDocumentationSubmission = async (
    workOrderId: string,
    submissionData: {
      type: 'before' | 'after';
      photos: string[]; // photo IDs
      notes: string;
      checklistData: Record<string, any>;
      materialUsage?: Record<string, number>;
    }
  ) => {
    return offlineStore.addToPendingQueue({
      type: 'documentation',
      workOrderId,
      data: submissionData
    });
  };

  /**
   * Queue a work order status update for sync
   */
  const queueWorkOrderUpdate = async (
    workOrderId: string,
    updates: Partial<WorkOrder>
  ) => {
    return offlineStore.addToPendingQueue({
      type: 'work_order_update',
      workOrderId,
      data: updates
    });
  };

  /**
   * Queue a photo upload for sync
   */
  const queuePhotoUpload = async (
    workOrderId: string,
    photoData: {
      photoId: string;
      type: 'before' | 'after';
      caption?: string;
    }
  ) => {
    return offlineStore.addToPendingQueue({
      type: 'photo',
      workOrderId,
      data: photoData
    });
  };

  /**
   * Queue a checklist update for sync
   */
  const queueChecklistUpdate = async (
    workOrderId: string,
    checklistData: Record<string, any>
  ) => {
    return offlineStore.addToPendingQueue({
      type: 'checklist',
      workOrderId,
      data: checklistData
    });
  };

  /**
   * Cache a work order for offline access
   */
  const cacheWorkOrder = async (workOrder: WorkOrder) => {
    await offlineStore.cacheWorkOrder(workOrder);
  };

  /**
   * Cache multiple work orders
   */
  const cacheWorkOrders = async (workOrders: WorkOrder[]) => {
    for (const workOrder of workOrders) {
      await offlineStore.cacheWorkOrder(workOrder);
    }
  };

  /**
   * Get a cached work order
   */
  const getCachedWorkOrder = (workOrderId: string): WorkOrder | null => {
    return offlineStore.getCachedWorkOrder(workOrderId);
  };

  /**
   * Get all cached work orders
   */
  const getAllCachedWorkOrders = (): WorkOrder[] => {
    return offlineStore.cachedWorkOrders.map(c => c.workOrder);
  };

  /**
   * Clear cache for a specific work order
   */
  const clearWorkOrderCache = async (workOrderId: string) => {
    await offlineStore.removeCachedWorkOrder(workOrderId);
  };

  /**
   * Force sync now
   */
  const syncNow = async () => {
    if (isOnline.value) {
      await offlineStore.processPendingQueue();
    }
  };

  /**
   * Get sync statistics
   */
  const getSyncStats = () => {
    return offlineStore.getSyncStats();
  };

  /**
   * Check if a work order is available offline
   */
  const isWorkOrderCached = (workOrderId: string): boolean => {
    return offlineStore.cachedWorkOrders.some(c => c.workOrder.id === workOrderId);
  };

  /**
   * Start auto-caching (caches work orders periodically)
   */
  const startAutoCache = (workOrdersFn: () => WorkOrder[]) => {
    if (autoCacheTimer.value) {
      clearInterval(autoCacheTimer.value);
    }

    // Initial cache
    const workOrders = workOrdersFn();
    cacheWorkOrders(workOrders);

    // Set up interval
    autoCacheTimer.value = setInterval(() => {
      const workOrders = workOrdersFn();
      cacheWorkOrders(workOrders);
    }, autoCacheInterval);
  };

  /**
   * Stop auto-caching
   */
  const stopAutoCache = () => {
    if (autoCacheTimer.value) {
      clearInterval(autoCacheTimer.value);
      autoCacheTimer.value = null;
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    stopAutoCache();
  });

  return {
    // State
    isOnline,
    syncStatus,
    hasPendingSync,
    pendingCount,
    isSyncing,

    // Queue methods
    queueDocumentationSubmission,
    queueWorkOrderUpdate,
    queuePhotoUpload,
    queueChecklistUpdate,

    // Cache methods
    cacheWorkOrder,
    cacheWorkOrders,
    getCachedWorkOrder,
    getAllCachedWorkOrders,
    clearWorkOrderCache,
    isWorkOrderCached,

    // Sync methods
    syncNow,
    getSyncStats,

    // Auto-cache methods
    startAutoCache,
    stopAutoCache
  };
}

export default useOfflineSync;
