<template>
  <Sidebar variant="inset">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <router-link to="/dashboard" class="flex items-center">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building class="size-4 icon-theme-primary" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold sidebar-text-theme">CMMS</span>
                <span class="truncate text-xs sidebar-text-muted-theme">Maintenance System</span>
              </div>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- Main Navigation Group -->
      <SidebarGroup>
        <SidebarGroupLabel class="sidebar-text-muted-theme">Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="$route.path === '/dashboard'">
                <router-link to="/dashboard" class="flex items-center">
                  <LayoutDashboard class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Dashboard</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/inbox')">
                <router-link to="/inbox" class="flex items-center">
                  <Inbox class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Inbox</span>
                  <SidebarMenuBadge v-if="messageStore.unreadCount > 0">
                    {{ messageStore.unreadCount > 99 ? '99+' : messageStore.unreadCount }}
                  </SidebarMenuBadge>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/analytics')">
                <router-link to="/analytics" class="flex items-center">
                  <BarChart class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Analytics</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- Operations Group -->
      <SidebarGroup>
        <SidebarGroupLabel class="sidebar-text-muted-theme">Operations</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <!-- Supervisor only: Create and track memos -->
            <SidebarMenuItem v-if="authStore.isSupervisor">
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/memos')">
                <router-link to="/memos/my-requests" class="flex items-center">
                  <FileText class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Memo</span>
                  <SidebarMenuBadge v-if="myPendingMemoCount > 0" variant="outline">
                    {{ myPendingMemoCount }}
                  </SidebarMenuBadge>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="$route.path === '/work-orders'">
                <router-link to="/work-orders" class="flex items-center">
                  <ClipboardList class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Work Orders</span>
                  <SidebarMenuBadge v-if="pendingWorkOrders > 0" variant="outline">
                    {{ pendingWorkOrders }}
                  </SidebarMenuBadge>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem v-if="canViewHistory">
              <SidebarMenuButton as-child :is-active="$route.path === '/work-orders/history'">
                <router-link to="/work-orders/history" class="flex items-center">
                  <Archive class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Work Order History</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem v-if="authStore.hasPermission('manage_inventory') || authStore.hasPermission('access_personal_data')">
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/inventory')">
                <router-link to="/inventory" class="flex items-center">
                  <Package class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Inventory</span>
                  <SidebarMenuBadge v-if="lowStockCount > 0" variant="destructive">
                    {{ lowStockCount }}
                  </SidebarMenuBadge>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem v-if="authStore.hasPermission('view_invoices')">
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/invoices')">
                <router-link to="/invoices" class="flex items-center">
                  <FileText class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Invoices</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- Reports Group (Role-Based) -->
      <SidebarGroup v-if="canViewReports">
        <SidebarGroupLabel class="sidebar-text-muted-theme">Reports</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <!-- Work Order Status Report (Admin, Supervisor, Leader) -->
            <SidebarMenuItem v-if="canViewOperationalReports">
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/reports/work-orders/status')">
                <router-link to="/reports/work-orders/status" class="flex items-center">
                  <PieChart class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Work Order Status</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Overdue Report (Admin, Supervisor, Leader) -->
            <SidebarMenuItem v-if="canViewOperationalReports">
              <SidebarMenuButton as-child :is-active="$route.path === '/reports/work-orders/overdue'">
                <router-link to="/reports/work-orders/overdue" class="flex items-center">
                  <AlertTriangle class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Overdue Work Orders</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Activity Report (All Roles) -->
            <SidebarMenuItem v-if="canViewActivityReport">
              <SidebarMenuButton as-child :is-active="$route.path === '/reports/activity'">
                <router-link to="/reports/activity" class="flex items-center">
                  <Activity class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Activity Report</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- All Reports (Admin Only) -->
            <SidebarMenuItem v-if="authStore.isAdmin">
              <SidebarMenuButton as-child :is-active="$route.path === '/reports' && !$route.path.includes('/reports/')">
                <router-link to="/reports" class="flex items-center">
                  <FileBarChart class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">All Reports</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- Administration Group (Admin Only) -->
      <SidebarGroup v-if="authStore.isAdmin">
        <SidebarGroupLabel class="sidebar-text-muted-theme">Administration</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-if="authStore.hasPermission('manage_users')">
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/users')">
                <router-link to="/users" class="flex items-center">
                  <Users class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">User Management</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/categories')">
                <router-link to="/categories" class="flex items-center">
                  <FolderTree class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Categories</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/templates')">
                <router-link to="/templates" class="flex items-center">
                  <File class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Templates</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="$route.path.startsWith('/settings')">
                <router-link to="/settings" class="flex items-center">
                  <Settings class="size-4 icon-theme-primary" />
                  <span class="sidebar-text-theme">Settings</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton
                size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarFallback class="rounded-lg bg-primary text-primary-foreground">
                    {{ currentUser?.name.charAt(0).toUpperCase() }}
                  </AvatarFallback>
                </Avatar>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold sidebar-text-theme">{{ currentUser?.name }}</span>
                  <span class="truncate text-xs capitalize sidebar-text-muted-theme">{{ currentUser?.role }}</span>
                </div>
                <ChevronsUpDown class="ml-auto size-4 icon-theme-secondary" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="bottom"
              align="end"
              :side-offset="4"
            >
              <DropdownMenuLabel class="p-0 font-normal">
                <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarFallback class="rounded-lg bg-primary text-primary-foreground">
                      {{ currentUser?.name.charAt(0).toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold sidebar-text-theme">{{ currentUser?.name }}</span>
                    <span class="truncate text-xs sidebar-text-muted-theme">{{ currentUser?.email }}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem as-child>
                  <router-link to="/settings" class="flex items-center">
                    <Settings class="mr-2 h-4 w-4 icon-theme-primary" />
                    Settings
                  </router-link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              
              <!-- Demo User Switcher -->
              <DropdownMenuLabel class="text-xs font-medium text-muted-foreground">
                Switch User (Demo)
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  v-for="user in demoUsers"
                  :key="user.id"
                  @click="switchDemoUser(user.id)"
                  class="flex items-center"
                >
                  <Avatar class="mr-2 h-6 w-6">
                    <AvatarFallback>{{ user.name.charAt(0).toUpperCase() }}</AvatarFallback>
                  </Avatar>
                  <div class="flex flex-col">
                    <span class="text-sm">{{ user.name }}</span>
                    <span class="text-xs text-muted-foreground capitalize">{{ user.role }}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="logout" class="text-destructive focus:text-destructive">
                <LogOut class="mr-2 h-4 w-4 icon-theme-primary" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import { useWorkOrderStore } from '@/stores/workorder'
import { useInventoryStore } from '@/stores/inventory'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import {
  Building,
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
  ChevronsUpDown,
  FolderTree,
  File,
  Archive,
  AlertTriangle,
  Activity,
  PieChart,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const messageStore = useMessageStore()
const workOrderStore = useWorkOrderStore()
const inventoryStore = useInventoryStore()

const currentUser = computed(() => authStore.currentUser)

// Role-based permissions
const canViewHistory = computed(() => {
  const userRole = authStore.currentUser?.role;
  return ['admin', 'supervisor', 'leader'].includes(userRole || '');
})

// Role-based report visibility
const canViewReports = computed(() => {
  // All roles can view at least some reports
  return true
})

const canViewOperationalReports = computed(() => {
  // Admin, Supervisor, Leader can view operational reports
  const userRole = authStore.currentUser?.role
  return ['admin', 'supervisor', 'leader'].includes(userRole || '')
})

const canViewActivityReport = computed(() => {
  // All roles can view activity report (workers see only their own activity)
  return true
})

// Badge counts
const pendingWorkOrders = computed(() => {
  if (authStore.isSupervisor || authStore.isAdmin) {
    return workOrderStore.pendingApproval.length
  }
  return 0
})

const lowStockCount = computed(() => {
  if (authStore.isAdmin) {
    return inventoryStore.lowStockItems.length
  }
  return 0
})

// Supervisor: Count their own pending memos
const myPendingMemoCount = computed(() => {
  if (!authStore.isSupervisor) return 0;

  return messageStore.messages.filter(message => {
    if (message.type !== 'supervisor_memo' || !message.memoData) return false;
    return message.senderId === authStore.currentUser?.id && message.memoData.status === 'pending';
  }).length;
})

// Demo user switching
const demoUsers = [
  { id: 'admin1', name: 'Ahmad Sutrisno', role: 'admin' as const, email: 'admin@terminal1.com', terminalId: 'terminal1', regionId: 'region1', status: 'active' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'supervisor1', name: 'Budi Santoso', role: 'supervisor' as const, email: 'supervisor@pertamc.com', regionId: 'region1', status: 'active' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'worker1', name: 'Candra Wijaya', role: 'worker' as const, email: 'worker@terminal1.com', terminalId: 'terminal1', regionId: 'region1', status: 'active' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'leader1', name: 'Diana Sari', role: 'leader' as const, email: 'leader@pertamc.com', regionId: 'region1', status: 'active' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
]

const switchDemoUser = (userId: string) => {
  const user = demoUsers.find(u => u.id === userId)
  if (user) {
    authStore.switchUser(user)
    router.push('/dashboard')
  }
}

const logout = async () => {
  try {
    authStore.logout();
    await router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
}
</script>