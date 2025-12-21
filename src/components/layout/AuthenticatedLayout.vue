<template>
  <ThemeProvider>
    <LayoutProvider>
      <div class="min-h-screen bg-background">
        <SkipToMain />
        
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            
            <main id="main-content" tabindex="-1" class="flex-1 p-6">
              <slot />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <!-- Toast Notifications -->
      <Toaster />
    </LayoutProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import { useWorkOrderStore } from '@/stores/workorder'
import { useInventoryStore } from '@/stores/inventory'
import { useNotificationStore } from '@/stores/notification'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import ThemeProvider from './providers/ThemeProvider.vue'
import LayoutProvider from './providers/LayoutProvider.vue'
import SkipToMain from './SkipToMain.vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

// Initialize stores
const authStore = useAuthStore()
const messageStore = useMessageStore()
const workOrderStore = useWorkOrderStore()
const inventoryStore = useInventoryStore()
const notificationStore = useNotificationStore()

// Initialize keyboard shortcuts
useKeyboardShortcuts()

const initializeStores = async () => {
  try {
    await Promise.all([
      messageStore.initializeInbox(),
      workOrderStore.fetchWorkOrders(),
      inventoryStore.fetchInventoryItems(),
    ])
    
    // Initialize demo notifications after other stores are ready
    notificationStore.initializeDemoNotifications()
  } catch (error) {
    console.error('Failed to initialize stores:', error)
  }
}

onMounted(async () => {
  // Wait for auth to be initialized before loading data stores
  if (authStore.isAuthenticated) {
    await initializeStores()
  }
})

// Watch for auth status changes to initialize stores when user is authenticated
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    await initializeStores()
  }
}, { immediate: false })
</script>