import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkOrderStore } from '@/stores/workorder'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'

export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'work-order' | 'inventory' | 'user' | 'invoice' | 'page'
  url: string
  score: number
  category: string
  icon?: string
}

export function useGlobalSearch() {
  const router = useRouter()
  const workOrderStore = useWorkOrderStore()
  const inventoryStore = useInventoryStore()
  const authStore = useAuthStore()

  const searchQuery = ref('')
  const isSearching = ref(false)
  const results = ref<SearchResult[]>([])

  // Define searchable pages
  const searchablePages = [
    { id: 'dashboard', title: 'Dashboard', url: '/dashboard', description: 'Main dashboard overview', category: 'Navigation' },
    { id: 'inbox', title: 'Inbox', url: '/inbox', description: 'Messages and communications', category: 'Navigation' },
    { id: 'analytics', title: 'Analytics', url: '/analytics', description: 'Reports and analytics', category: 'Navigation' },
    { id: 'work-orders', title: 'Work Orders', url: '/work-orders', description: 'Maintenance work orders', category: 'Navigation' },
    { id: 'inventory', title: 'Inventory', url: '/inventory', description: 'Inventory management', category: 'Navigation', condition: () => authStore.hasPermission('manage_inventory') || authStore.hasPermission('access_personal_data') },
    { id: 'invoices', title: 'Invoices', url: '/invoices', description: 'Financial invoices', category: 'Navigation', condition: () => authStore.hasPermission('view_invoices') },
    { id: 'reports', title: 'Reports', url: '/reports', description: 'System reports', category: 'Navigation', condition: () => authStore.isAdmin },
    { id: 'users', title: 'Users', url: '/users', description: 'User management', category: 'Navigation', condition: () => authStore.isAdmin },
    { id: 'settings', title: 'Settings', url: '/settings', description: 'Application settings', category: 'Navigation', condition: () => authStore.isAdmin },
  ]

  // Search function with fuzzy matching
  const search = async (query: string) => {
    searchQuery.value = query
    if (!query.trim()) {
      results.value = []
      return
    }

    isSearching.value = true
    
    try {
      const searchResults: SearchResult[] = []
      const lowerQuery = query.toLowerCase()

      // Search pages
      searchablePages.forEach(page => {
        if (page.condition && !page.condition()) return

        const titleMatch = page.title.toLowerCase().includes(lowerQuery)
        const descMatch = page.description.toLowerCase().includes(lowerQuery)
        
        if (titleMatch || descMatch) {
          const score = titleMatch ? 100 : 50
          searchResults.push({
            id: `page-${page.id}`,
            title: page.title,
            description: page.description,
            type: 'page',
            url: page.url,
            score,
            category: page.category
          })
        }
      })

      // Search work orders
      workOrderStore.workOrders.forEach(workOrder => {
        const titleMatch = workOrder.title.toLowerCase().includes(lowerQuery)
        const descMatch = workOrder.description.toLowerCase().includes(lowerQuery)
        const terminalMatch = workOrder.terminalId.toLowerCase().includes(lowerQuery)
        const statusMatch = workOrder.status.toLowerCase().includes(lowerQuery)
        
        if (titleMatch || descMatch || terminalMatch || statusMatch) {
          let score = 0
          if (titleMatch) score += 100
          if (descMatch) score += 50
          if (terminalMatch) score += 30
          if (statusMatch) score += 20

          searchResults.push({
            id: `wo-${workOrder.id}`,
            title: workOrder.title,
            description: `${workOrder.terminalId} • ${workOrder.status} • Due: ${new Date(workOrder.dueDate).toLocaleDateString()}`,
            type: 'work-order',
            url: `/work-orders/${workOrder.id}`,
            score,
            category: 'Work Orders'
          })
        }
      })

      // Search inventory items
      inventoryStore.items.forEach(item => {
        const nameMatch = item.name.toLowerCase().includes(lowerQuery)
        const categoryMatch = item.category.toLowerCase().includes(lowerQuery)
        const codeMatch = item.code.toLowerCase().includes(lowerQuery)
        
        if (nameMatch || categoryMatch || codeMatch) {
          let score = 0
          if (nameMatch) score += 100
          if (codeMatch) score += 80
          if (categoryMatch) score += 40

          searchResults.push({
            id: `inv-${item.id}`,
            title: item.name,
            description: `${item.category} • ${item.currentStock} units • Code: ${item.code}`,
            type: 'inventory',
            url: `/inventory/${item.id}`,
            score,
            category: 'Inventory'
          })
        }
      })

      // Sort by score (relevance)
      searchResults.sort((a, b) => b.score - a.score)
      
      // Limit to top 10 results
      results.value = searchResults.slice(0, 10)
      
    } catch (error) {
      console.error('Search error:', error)
      results.value = []
    } finally {
      isSearching.value = false
    }
  }

  // Navigate to result
  const navigateToResult = (result: SearchResult) => {
    router.push(result.url)
  }

  // Group results by category
  const groupedResults = computed(() => {
    const grouped: Record<string, SearchResult[]> = {}
    results.value.forEach(result => {
      if (!grouped[result.category]) {
        grouped[result.category] = []
      }
      grouped[result.category]!.push(result)
    })
    return grouped
  })

  // Clear search
  const clearSearch = () => {
    searchQuery.value = ''
    results.value = []
  }

  return {
    searchQuery,
    isSearching,
    results,
    groupedResults,
    search,
    navigateToResult,
    clearSearch
  }
}