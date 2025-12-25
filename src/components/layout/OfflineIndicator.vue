<template>
  <Transition name="slide-down">
    <div
      v-if="showIndicator"
      class="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm"
      :class="indicatorClass"
    >
      <div class="flex items-center justify-center gap-2">
        <component :is="statusIcon" class="h-4 w-4" :class="iconAnimationClass" />
        <span>{{ statusMessage }}</span>
        <Badge v-if="pendingCount > 0" variant="secondary" class="ml-2">
          {{ pendingCount }} pending
        </Badge>
        <Button
          v-if="canSync"
          size="sm"
          variant="ghost"
          class="ml-2 h-6 px-2 text-xs"
          @click="syncNow"
        >
          Sync Now
        </Button>
        <Button
          v-if="showDismiss"
          size="sm"
          variant="ghost"
          class="ml-2 h-6 w-6 p-0"
          @click="dismiss"
        >
          <X class="h-3 w-3" />
        </Button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useOfflineStore } from '@/stores/offline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-vue-next';

const offlineStore = useOfflineStore();

const dismissed = ref(false);
const autoHideTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Computed properties
const showIndicator = computed(() => {
  if (dismissed.value) return false;

  // Always show when offline
  if (!offlineStore.isOnline) return true;

  // Show when syncing
  if (offlineStore.isSyncing) return true;

  // Show when there are pending items
  if (offlineStore.hasPendingSync) return true;

  // Show error state
  if (offlineStore.syncStatus === 'error') return true;

  return false;
});

const showDismiss = computed(() => {
  return offlineStore.syncStatus === 'synced' || offlineStore.syncStatus === 'error';
});

const canSync = computed(() => offlineStore.canSync);

const pendingCount = computed(() => offlineStore.pendingCount);

const statusIcon = computed(() => {
  switch (offlineStore.syncStatus) {
    case 'offline':
      return WifiOff;
    case 'syncing':
      return RefreshCw;
    case 'pending':
      return RefreshCw;
    case 'error':
      return AlertCircle;
    case 'synced':
      return CheckCircle;
    default:
      return Wifi;
  }
});

const iconAnimationClass = computed(() => {
  if (offlineStore.syncStatus === 'syncing') {
    return 'animate-spin';
  }
  return '';
});

const indicatorClass = computed(() => {
  switch (offlineStore.syncStatus) {
    case 'offline':
      return 'bg-yellow-500 text-yellow-950';
    case 'syncing':
      return 'bg-blue-500 text-white';
    case 'pending':
      return 'bg-orange-500 text-white';
    case 'error':
      return 'bg-red-500 text-white';
    case 'synced':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
});

const statusMessage = computed(() => {
  switch (offlineStore.syncStatus) {
    case 'offline':
      return 'You are offline. Changes will be saved locally.';
    case 'syncing':
      return 'Syncing your changes...';
    case 'pending':
      return `${offlineStore.pendingCount} change(s) waiting to sync`;
    case 'error':
      return offlineStore.syncError || 'Some changes failed to sync';
    case 'synced':
      return 'All changes synced';
    default:
      return 'Connected';
  }
});

const syncNow = async () => {
  await offlineStore.processPendingQueue();
};

const dismiss = () => {
  dismissed.value = true;
};

// Auto-hide synced message after 3 seconds
watch(() => offlineStore.syncStatus, (newStatus) => {
  dismissed.value = false;

  if (autoHideTimeout.value) {
    clearTimeout(autoHideTimeout.value);
  }

  if (newStatus === 'synced') {
    autoHideTimeout.value = setTimeout(() => {
      dismissed.value = true;
    }, 3000);
  }
});

onMounted(() => {
  offlineStore.initialize();
});

onUnmounted(() => {
  offlineStore.cleanup();
  if (autoHideTimeout.value) {
    clearTimeout(autoHideTimeout.value);
  }
});
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
