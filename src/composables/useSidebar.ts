import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export function useSidebar() {
  // Persist sidebar state in localStorage
  const sidebarOpen = useLocalStorage('sidebar-open', true)
  const sidebarCollapsed = ref(false)

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const collapseSidebar = () => {
    sidebarCollapsed.value = true
  }

  const expandSidebar = () => {
    sidebarCollapsed.value = false
  }

  const toggleCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const isOpen = computed(() => sidebarOpen.value)
  const isCollapsed = computed(() => sidebarCollapsed.value)
  const isExpanded = computed(() => !sidebarCollapsed.value && sidebarOpen.value)

  return {
    sidebarOpen,
    sidebarCollapsed,
    isOpen,
    isCollapsed,
    isExpanded,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    toggleCollapse
  }
}