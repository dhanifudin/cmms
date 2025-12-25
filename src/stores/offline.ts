/**
 * Offline Store
 *
 * Manages offline data caching and synchronization for the CMMS application.
 * Handles pending uploads, work order caching, and sync status.
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { WorkOrder } from '@/types';
import { getCurrentUserId } from '@/utils/auth';

// Types
export interface PendingUpload {
  id: string;
  type: 'photo' | 'checklist' | 'documentation' | 'work_order_update';
  workOrderId: string;
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

export interface CachedWorkOrder {
  workOrder: WorkOrder;
  cachedAt: string;
  expiresAt: string;
}

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'offline';

// IndexedDB configuration
const DB_NAME = 'cmms_offline';
const DB_VERSION = 1;
const PENDING_STORE = 'pending_uploads';
const CACHE_STORE = 'cached_workorders';

/**
 * Initialize IndexedDB for offline storage
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open offline IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create pending uploads store
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        const pendingStore = db.createObjectStore(PENDING_STORE, { keyPath: 'id' });
        pendingStore.createIndex('workOrderId', 'workOrderId', { unique: false });
        pendingStore.createIndex('status', 'status', { unique: false });
        pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create cached work orders store
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'workOrder.id' });
        cacheStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

export const useOfflineStore = defineStore('offline', () => {
  // State
  const isOnline = ref(navigator.onLine);
  const syncStatus = ref<SyncStatus>(navigator.onLine ? 'synced' : 'offline');
  const lastSyncTime = ref<string | null>(null);
  const pendingUploads = ref<PendingUpload[]>([]);
  const cachedWorkOrders = ref<CachedWorkOrder[]>([]);
  const isSyncing = ref(false);
  const syncError = ref<string | null>(null);

  // Computed
  const hasPendingSync = computed(() => {
    return pendingUploads.value.some(u => u.status === 'pending' || u.status === 'failed');
  });

  const pendingCount = computed(() => {
    return pendingUploads.value.filter(u => u.status === 'pending').length;
  });

  const failedCount = computed(() => {
    return pendingUploads.value.filter(u => u.status === 'failed').length;
  });

  const canSync = computed(() => {
    return isOnline.value && hasPendingSync.value && !isSyncing.value;
  });

  // Initialize online/offline listeners
  const initializeNetworkListeners = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const handleOnline = () => {
    isOnline.value = true;
    syncStatus.value = hasPendingSync.value ? 'pending' : 'synced';
    // Auto-sync when coming back online
    if (hasPendingSync.value) {
      processPendingQueue();
    }
  };

  const handleOffline = () => {
    isOnline.value = false;
    syncStatus.value = 'offline';
  };

  // Load pending uploads from IndexedDB
  const loadPendingUploads = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(PENDING_STORE, 'readonly');
      const store = transaction.objectStore(PENDING_STORE);
      const request = store.getAll();

      return new Promise<void>((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          pendingUploads.value = request.result;
          if (pendingUploads.value.some(u => u.status === 'pending')) {
            syncStatus.value = isOnline.value ? 'pending' : 'offline';
          }
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to load pending uploads:', error);
    }
  };

  // Load cached work orders from IndexedDB
  const loadCachedWorkOrders = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(CACHE_STORE, 'readonly');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.getAll();

      return new Promise<void>((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          // Filter out expired cache entries
          const now = new Date().toISOString();
          cachedWorkOrders.value = request.result.filter(
            (item: CachedWorkOrder) => item.expiresAt > now
          );
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to load cached work orders:', error);
    }
  };

  // Add item to pending queue
  const addToPendingQueue = async (item: Omit<PendingUpload, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    const pendingItem: PendingUpload = {
      ...item,
      id: `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    };

    try {
      const db = await initDB();
      const transaction = db.transaction(PENDING_STORE, 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      store.put(pendingItem);

      pendingUploads.value.push(pendingItem);
      syncStatus.value = isOnline.value ? 'pending' : 'offline';

      // Try to sync immediately if online
      if (isOnline.value) {
        processPendingQueue();
      }

      return pendingItem;
    } catch (error) {
      console.error('Failed to add to pending queue:', error);
      throw error;
    }
  };

  // Remove item from pending queue
  const removeFromQueue = async (id: string) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(PENDING_STORE, 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      store.delete(id);

      pendingUploads.value = pendingUploads.value.filter(u => u.id !== id);

      if (!hasPendingSync.value) {
        syncStatus.value = 'synced';
      }
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  };

  // Update pending item status
  const updatePendingStatus = async (id: string, status: PendingUpload['status'], error?: string) => {
    const item = pendingUploads.value.find(u => u.id === id);
    if (!item) return;

    item.status = status;
    if (error) item.error = error;
    if (status === 'failed') item.retryCount++;

    try {
      const db = await initDB();
      const transaction = db.transaction(PENDING_STORE, 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      store.put(item);
    } catch (err) {
      console.error('Failed to update pending status:', err);
    }
  };

  // Process pending upload queue
  const processPendingQueue = async () => {
    if (!isOnline.value || isSyncing.value) return;

    const pendingItems = pendingUploads.value.filter(
      u => u.status === 'pending' || (u.status === 'failed' && u.retryCount < 3)
    );

    if (pendingItems.length === 0) {
      syncStatus.value = 'synced';
      return;
    }

    isSyncing.value = true;
    syncStatus.value = 'syncing';
    syncError.value = null;

    for (const item of pendingItems) {
      try {
        await updatePendingStatus(item.id, 'processing');
        await processUploadItem(item);
        await removeFromQueue(item.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await updatePendingStatus(item.id, 'failed', errorMessage);
        console.error(`Failed to process pending item ${item.id}:`, error);
      }
    }

    isSyncing.value = false;
    lastSyncTime.value = new Date().toISOString();

    // Update sync status
    if (failedCount.value > 0) {
      syncStatus.value = 'error';
      syncError.value = `${failedCount.value} item(s) failed to sync`;
    } else if (pendingCount.value > 0) {
      syncStatus.value = 'pending';
    } else {
      syncStatus.value = 'synced';
    }
  };

  // Process individual upload item
  const processUploadItem = async (item: PendingUpload) => {
    // In a real implementation, this would make API calls
    // For now, we simulate the upload process
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (item.type) {
      case 'photo':
        console.log(`Syncing photo for work order ${item.workOrderId}`);
        break;
      case 'documentation':
        console.log(`Syncing documentation for work order ${item.workOrderId}`);
        break;
      case 'checklist':
        console.log(`Syncing checklist for work order ${item.workOrderId}`);
        break;
      case 'work_order_update':
        console.log(`Syncing work order update ${item.workOrderId}`);
        break;
    }

    // Simulate success (in real app, would handle API response)
    return true;
  };

  // Cache a work order for offline access
  const cacheWorkOrder = async (workOrder: WorkOrder) => {
    const cacheEntry: CachedWorkOrder = {
      workOrder,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    try {
      const db = await initDB();
      const transaction = db.transaction(CACHE_STORE, 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      store.put(cacheEntry);

      // Update local state
      const existingIndex = cachedWorkOrders.value.findIndex(
        c => c.workOrder.id === workOrder.id
      );
      if (existingIndex >= 0) {
        cachedWorkOrders.value[existingIndex] = cacheEntry;
      } else {
        cachedWorkOrders.value.push(cacheEntry);
      }
    } catch (error) {
      console.error('Failed to cache work order:', error);
    }
  };

  // Get cached work order
  const getCachedWorkOrder = (workOrderId: string): WorkOrder | null => {
    const cached = cachedWorkOrders.value.find(c => c.workOrder.id === workOrderId);
    if (!cached) return null;

    // Check if expired
    if (new Date(cached.expiresAt) < new Date()) {
      removeCachedWorkOrder(workOrderId);
      return null;
    }

    return cached.workOrder;
  };

  // Remove cached work order
  const removeCachedWorkOrder = async (workOrderId: string) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(CACHE_STORE, 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      store.delete(workOrderId);

      cachedWorkOrders.value = cachedWorkOrders.value.filter(
        c => c.workOrder.id !== workOrderId
      );
    } catch (error) {
      console.error('Failed to remove cached work order:', error);
    }
  };

  // Clear all caches
  const clearAllCaches = async () => {
    try {
      const db = await initDB();

      // Clear pending uploads
      const pendingTransaction = db.transaction(PENDING_STORE, 'readwrite');
      pendingTransaction.objectStore(PENDING_STORE).clear();

      // Clear cached work orders
      const cacheTransaction = db.transaction(CACHE_STORE, 'readwrite');
      cacheTransaction.objectStore(CACHE_STORE).clear();

      pendingUploads.value = [];
      cachedWorkOrders.value = [];
      syncStatus.value = 'synced';
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  };

  // Clean up expired cache entries
  const cleanupExpiredCache = async () => {
    const now = new Date().toISOString();
    const expired = cachedWorkOrders.value.filter(c => c.expiresAt < now);

    for (const item of expired) {
      await removeCachedWorkOrder(item.workOrder.id);
    }
  };

  // Get sync statistics
  const getSyncStats = () => {
    return {
      isOnline: isOnline.value,
      syncStatus: syncStatus.value,
      pendingCount: pendingCount.value,
      failedCount: failedCount.value,
      cachedWorkOrderCount: cachedWorkOrders.value.length,
      lastSyncTime: lastSyncTime.value
    };
  };

  // Initialize the store
  const initialize = async () => {
    initializeNetworkListeners();
    await loadPendingUploads();
    await loadCachedWorkOrders();
    await cleanupExpiredCache();

    // Auto-sync if online and has pending items
    if (isOnline.value && hasPendingSync.value) {
      processPendingQueue();
    }
  };

  // Cleanup on unmount
  const cleanup = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };

  return {
    // State
    isOnline,
    syncStatus,
    lastSyncTime,
    pendingUploads,
    cachedWorkOrders,
    isSyncing,
    syncError,

    // Computed
    hasPendingSync,
    pendingCount,
    failedCount,
    canSync,

    // Actions
    initialize,
    cleanup,
    addToPendingQueue,
    removeFromQueue,
    processPendingQueue,
    cacheWorkOrder,
    getCachedWorkOrder,
    removeCachedWorkOrder,
    clearAllCaches,
    cleanupExpiredCache,
    getSyncStats
  };
});
