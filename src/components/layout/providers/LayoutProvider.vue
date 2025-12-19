<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { useSidebar } from '@/composables/useSidebar'

const {
  sidebarOpen,
  sidebarCollapsed,
  isOpen,
  isCollapsed,
  isExpanded,
  toggleSidebar,
  collapseSidebar,
  expandSidebar,
  toggleCollapse
} = useSidebar()

// Provide sidebar state and methods to child components
provide('sidebar', {
  sidebarOpen,
  sidebarCollapsed,
  isOpen,
  isCollapsed,
  isExpanded,
  toggleSidebar,
  collapseSidebar,
  expandSidebar,
  toggleCollapse
})
</script>