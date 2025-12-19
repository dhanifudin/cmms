import { inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  condition?: () => boolean
}

export function useKeyboardShortcuts() {
  const router = useRouter()
  const authStore = useAuthStore()
  const theme = inject('theme') as any

  // Define all keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: '1',
      metaKey: true,
      action: () => router.push('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: '2',
      metaKey: true,
      action: () => router.push('/inbox'),
      description: 'Go to Inbox',
    },
    {
      key: '3',
      metaKey: true,
      action: () => router.push('/analytics'),
      description: 'Go to Analytics',
    },
    {
      key: '4',
      metaKey: true,
      action: () => router.push('/work-orders'),
      description: 'Go to Work Orders',
    },
    {
      key: '5',
      metaKey: true,
      action: () => router.push('/inventory'),
      description: 'Go to Inventory',
      condition: () => authStore.hasPermission('manage_inventory') || authStore.hasPermission('access_personal_data'),
    },
    {
      key: '6',
      metaKey: true,
      action: () => router.push('/invoices'),
      description: 'Go to Invoices',
      condition: () => authStore.hasPermission('view_invoices'),
    },
    {
      key: '7',
      metaKey: true,
      action: () => router.push('/reports'),
      description: 'Go to Reports',
      condition: () => authStore.isAdmin,
    },
    {
      key: '8',
      metaKey: true,
      action: () => router.push('/users'),
      description: 'Go to Users',
      condition: () => authStore.isAdmin,
    },

    // Quick action shortcuts
    {
      key: 'n',
      metaKey: true,
      action: () => router.push('/work-orders/create'),
      description: 'Create New Work Order',
      condition: () => authStore.isAdmin || authStore.isSupervisor,
    },
    {
      key: 'd',
      metaKey: true,
      action: () => {
        const isDark = theme?.isDark.value || false
        theme?.setTheme(isDark ? 'light' : 'dark')
      },
      description: 'Toggle Dark Mode',
    },
    {
      key: ',',
      metaKey: true,
      action: () => router.push('/settings'),
      description: 'Go to Settings',
      condition: () => authStore.isAdmin,
    },
    {
      key: 'q',
      metaKey: true,
      action: () => {
        authStore.logout()
        router.push('/login')
      },
      description: 'Sign Out',
    },

    // Special shortcuts
    {
      key: '/',
      action: () => {
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus Search',
    },
    {
      key: '?',
      shiftKey: true,
      action: () => {
        // TODO: Open help dialog/shortcuts reference
        console.log('Show keyboard shortcuts help')
      },
      description: 'Show Keyboard Shortcuts Help',
    },
  ]

  const handleKeydown = (event: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow some shortcuts even in input fields
      if (event.key !== 'Escape' && event.key !== '/') {
        return
      }
    }

    // Skip if any modal/dialog is open (except for specific keys)
    const hasOpenModal = document.querySelector('[role="dialog"]') || document.querySelector('[aria-modal="true"]')
    if (hasOpenModal && event.key !== 'Escape') {
      return
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      const metaMatch = !!shortcut.metaKey === (event.metaKey || event.ctrlKey)
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey
      const altMatch = !!shortcut.altKey === event.altKey
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
      
      return keyMatch && metaMatch && shiftMatch && altMatch
    })

    if (matchingShortcut) {
      // Check condition if provided
      if (matchingShortcut.condition && !matchingShortcut.condition()) {
        return
      }

      event.preventDefault()
      matchingShortcut.action()
    }
  }

  // Mount/unmount event listeners
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  // Return shortcuts for reference (e.g., for help dialog)
  const getAvailableShortcuts = () => {
    return shortcuts.filter(shortcut => {
      return !shortcut.condition || shortcut.condition()
    })
  }

  return {
    getAvailableShortcuts,
  }
}