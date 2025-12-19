<template>
  <CommandDialog :open="isOpen" @update:open="setIsOpen">
    <CommandInput 
      placeholder="Type a command or search..." 
      @input="handleSearchInput"
    />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      
      <!-- Search Results (when searching) -->
      <template v-if="results.length > 0">
        <CommandGroup 
          v-for="(categoryResults, category) in groupedResults" 
          :key="category" 
          :heading="category"
        >
          <CommandItem
            v-for="result in categoryResults"
            :key="result.id"
            :value="result.id"
            @select="handleSearchResult(result)"
          >
            <component :is="getResultIcon(result.type)" class="mr-2 h-4 w-4 icon-theme-primary" />
            <div class="flex flex-col">
              <span class="text-sm">{{ result.title }}</span>
              <span class="text-xs text-muted-foreground">{{ result.description }}</span>
            </div>
          </CommandItem>
        </CommandGroup>
      </template>
      
      <!-- Default Commands (when not searching) -->
      <template v-else>
        <!-- Navigation Group -->
        <CommandGroup heading="Navigation">
          <CommandItem
            v-for="navItem in navigationItems"
            :key="navItem.id"
            :value="navItem.id"
            @select="handleNavigation(navItem.path)"
            :class="{ 'opacity-50': navItem.disabled }"
          >
            <component :is="navItem.icon" class="mr-2 h-4 w-4 icon-theme-primary" />
            <span>{{ navItem.label }}</span>
            <CommandShortcut v-if="navItem.shortcut">{{ navItem.shortcut }}</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <!-- Quick Actions Group -->
        <CommandGroup heading="Quick Actions">
          <CommandItem
            v-for="action in quickActions"
            :key="action.id"
            :value="action.id"
            @select="handleAction(action.action)"
            :class="{ 'opacity-50': action.disabled }"
          >
            <component :is="action.icon" class="mr-2 h-4 w-4 icon-theme-primary" />
            <span>{{ action.label }}</span>
            <CommandShortcut v-if="action.shortcut">{{ action.shortcut }}</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <!-- Theme & Settings Group -->
        <CommandGroup heading="Settings">
          <CommandItem value="toggle-theme" @select="toggleTheme">
            <component :is="isDark ? Sun : Moon" class="mr-2 h-4 w-4 icon-theme-primary" />
            <span>Switch to {{ isDark ? 'Light' : 'Dark' }} Mode</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem value="settings" @select="handleNavigation('/settings')" :disabled="!authStore.isAdmin">
            <Settings class="mr-2 h-4 w-4 icon-theme-primary" />
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem value="logout" @select="logout">
            <LogOut class="mr-2 h-4 w-4 icon-theme-primary" />
            <span>Sign Out</span>
            <CommandShortcut>⌘Q</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </template>
    </CommandList>
  </CommandDialog>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useGlobalSearch } from '@/composables/useGlobalSearch'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

import {
  LayoutDashboard,
  Inbox,
  BarChart,
  ClipboardList,
  Package,
  FileText,
  FileBarChart,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
  Search,
  File,
  User,
} from 'lucide-vue-next'

interface Props {
  open?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()
const { success, info } = useToast()
const { search, results, groupedResults, navigateToResult, clearSearch } = useGlobalSearch()

// Theme controls
const theme = inject('theme') as any
const isDark = computed(() => theme?.isDark.value || false)
const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  theme?.setTheme(newTheme)
  success(`Switched to ${newTheme} mode`)
}

// Command palette state
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const setIsOpen = (value: boolean) => {
  emit('update:open', value)
}

// Navigation items based on user permissions
const navigationItems = computed(() => {
  const items = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      shortcut: '⌘1',
      disabled: false
    },
    {
      id: 'inbox',
      label: 'Inbox',
      path: '/inbox',
      icon: Inbox,
      shortcut: '⌘2',
      disabled: false
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/analytics',
      icon: BarChart,
      shortcut: '⌘3',
      disabled: false
    },
    {
      id: 'work-orders',
      label: 'Work Orders',
      path: '/work-orders',
      icon: ClipboardList,
      shortcut: '⌘4',
      disabled: false
    }
  ]

  // Add conditional items based on permissions
  if (authStore.hasPermission('manage_inventory') || authStore.hasPermission('access_personal_data')) {
    items.push({
      id: 'inventory',
      label: 'Inventory',
      path: '/inventory',
      icon: Package,
      shortcut: '⌘5',
      disabled: false
    })
  }

  if (authStore.hasPermission('view_invoices')) {
    items.push({
      id: 'invoices',
      label: 'Invoices',
      path: '/invoices',
      icon: FileText,
      shortcut: '⌘6',
      disabled: false
    })
  }

  if (authStore.isAdmin) {
    items.push(
      {
        id: 'reports',
        label: 'Reports',
        path: '/reports',
        icon: FileBarChart,
        shortcut: '⌘7',
        disabled: false
      },
      {
        id: 'users',
        label: 'Users',
        path: '/users',
        icon: Users,
        shortcut: '⌘8',
        disabled: false
      }
    )
  }

  return items
})

// Quick actions based on user role
const quickActions = computed(() => {
  const actions = [
    {
      id: 'search',
      label: 'Global Search',
      action: 'global-search',
      icon: Search,
      shortcut: '⌘F',
      disabled: false
    }
  ]

  // Add role-specific quick actions
  if (authStore.isAdmin || authStore.isSupervisor) {
    actions.push({
      id: 'create-work-order',
      label: 'Create Work Order',
      action: 'create-work-order',
      icon: Plus,
      shortcut: '⌘N',
      disabled: false
    })
  }

  return actions
})

// Handle navigation
const handleNavigation = (path: string) => {
  router.push(path)
  setIsOpen(false)
  
  // Show navigation feedback
  const pageNames: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/inbox': 'Inbox',
    '/analytics': 'Analytics',
    '/work-orders': 'Work Orders',
    '/inventory': 'Inventory',
    '/invoices': 'Invoices',
    '/reports': 'Reports',
    '/users': 'Users',
    '/settings': 'Settings'
  }
  
  const pageName = pageNames[path] || 'Page'
  info(`Navigating to ${pageName}`)
}

// Handle actions
const handleAction = (action: string) => {
  setIsOpen(false)
  
  switch (action) {
    case 'global-search':
      info('Global search opened')
      // TODO: Implement global search
      console.log('Global search triggered')
      break
    case 'create-work-order':
      router.push('/work-orders/create')
      info('Creating new work order')
      break
    default:
      console.log('Unknown action:', action)
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
  setIsOpen(false)
  success('Successfully signed out')
}

// Search functionality
const handleSearchInput = (event: Event) => {
  const query = (event.target as HTMLInputElement).value
  if (query.trim()) {
    search(query)
  } else {
    clearSearch()
  }
}

const handleSearchResult = (result: any) => {
  navigateToResult(result)
  setIsOpen(false)
}

const getResultIcon = (type: string) => {
  switch (type) {
    case 'work-order':
      return ClipboardList
    case 'inventory':
      return Package
    case 'user':
      return User
    case 'invoice':
      return FileText
    case 'page':
      return File
    default:
      return File
  }
}

// Keyboard shortcut to open command palette (Cmd+K / Ctrl+K)
const handleKeydown = (e: KeyboardEvent) => {
  // Cmd+K or Ctrl+K to open command palette
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    setIsOpen(!isOpen.value)
  }
  
  // ESC to close command palette
  if (e.key === 'Escape' && isOpen.value) {
    setIsOpen(false)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>