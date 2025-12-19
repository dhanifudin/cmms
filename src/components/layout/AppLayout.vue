<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 transition-transform duration-200 ease-in-out"
         :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
      
      <!-- Logo -->
      <div class="flex items-center h-16 px-6 bg-blue-600">
        <h1 class="text-xl font-bold text-white">CMMS</h1>
      </div>
      
      <!-- Navigation -->
      <nav class="mt-8 px-4 space-y-2">
        <Button
          v-for="item in navigationItems"
          :key="item.name"
          as-child
          :variant="$route.path === item.to ? 'secondary' : 'ghost'"
          class="w-full justify-start relative"
        >
          <router-link :to="item.to" class="flex items-center">
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.name }}
            <Badge
              v-if="item.badge"
              variant="destructive"
              class="ml-auto"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </Badge>
          </router-link>
        </Button>
      </nav>
      
      <!-- User section -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t">
        <div class="flex items-center mb-3">
          <Avatar class="mr-3">
            <AvatarFallback class="bg-blue-100 text-blue-600">
              {{ currentUser?.name.charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ currentUser?.name }}</p>
            <Badge variant="secondary" class="text-xs capitalize">{{ currentUser?.role }}</Badge>
          </div>
        </div>

        <Separator class="my-2" />

        <!-- Role switcher for demo -->
        <Select v-model="selectedDemoUser" @update:model-value="switchDemoUser">
          <SelectTrigger class="w-full mb-2">
            <SelectValue placeholder="Switch User (Demo)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="user in demoUsers" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.role }})
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          class="w-full justify-start"
          @click="logout"
        >
          <LogOut class="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
    
    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden">
      <div class="absolute inset-0 bg-gray-600 opacity-75" @click="sidebarOpen = false"></div>
    </div>
    
    <!-- Main content -->
    <div class="lg:ml-64">
      <!-- Top bar -->
      <div class="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div class="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              class="lg:hidden"
              @click="sidebarOpen = !sidebarOpen"
            >
              <Menu class="w-6 h-6" />
            </Button>
            <div>
              <h1 class="text-lg font-semibold">{{ currentPageTitle }}</h1>
              <p v-if="currentPageTitle === 'Dashboard'" class="text-sm text-muted-foreground lg:hidden">
                Welcome back, {{ currentUser?.name }}
                <Badge v-if="currentUser?.role" :variant="getRoleVariant(currentUser.role)" class="ml-2">
                  {{ currentUser.role.toUpperCase() }}
                </Badge>
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="hidden lg:block">
              <div v-if="currentPageTitle === 'Dashboard'" class="text-right">
                <p class="text-sm text-muted-foreground">
                  Welcome back, {{ currentUser?.name }}
                  <Badge v-if="currentUser?.role" :variant="getRoleVariant(currentUser.role)" class="ml-2">
                    {{ currentUser.role.toUpperCase() }}
                  </Badge>
                </p>
              </div>
              <div class="text-sm text-muted-foreground">{{ currentDateTime }}</div>
            </div>
            <NotificationCenter />
          </div>
        </div>
      </div>
      
      <!-- Page content -->
      <main class="flex-1">
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useMessageStore } from '@/stores/message';
import { useNotificationStore } from '@/stores/notification';
import NotificationCenter from '@/components/notifications/NotificationCenter.vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  FileText,
  Users,
  Settings,
  Menu,
  BarChart,
  Inbox as InboxIcon,
  LogOut
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const messageStore = useMessageStore();
const notificationStore = useNotificationStore();
const sidebarOpen = ref(false);
const selectedDemoUser = ref('');
const currentDateTime = ref('');

const currentUser = computed(() => authStore.currentUser);

// Role badge variants
const getRoleVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive';
    case 'supervisor': return 'default';
    case 'leader': return 'secondary';
    case 'worker': return 'outline';
    default: return 'outline';
  }
};

// Update datetime function
const updateDateTime = () => {
  currentDateTime.value = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const currentPageTitle = computed(() => {
  const route = router.currentRoute.value;
  switch (route.name) {
    case 'Dashboard': return 'Dashboard';
    case 'Analytics': return 'Analytics';
    case 'WorkOrders': return 'Work Orders';
    case 'CreateWorkOrder': return 'Create Work Order';
    case 'WorkOrderDetail': return 'Work Order Details';
    case 'Inventory': return 'Inventory';
    case 'CreateInventoryItem': return 'Add Inventory Item';
    case 'InventoryItemDetail': return 'Inventory Details';
    case 'Invoices': return 'Invoices';
    case 'InvoiceDetail': return 'Invoice Details';
    case 'Inbox': return 'Inbox';
    case 'Reports': return 'Reports & Analytics';
    default: return 'CMMS';
  }
});

interface NavigationItem {
  name: string;
  to: string;
  icon: any;
  badge?: number;
}

const navigationItems = computed((): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }
  ];
  
  // Inbox - available for all authenticated users
  const unreadCount = messageStore.unreadCount;
  baseItems.push({ 
    name: 'Inbox', 
    to: '/inbox', 
    icon: InboxIcon,
    badge: unreadCount > 0 ? unreadCount : undefined
  });
  
  // Analytics - available for all authenticated users
  baseItems.push({ name: 'Analytics', to: '/analytics', icon: BarChart });
  
  // Work Orders - all roles can view, but permissions differ
  baseItems.push({ name: 'Work Orders', to: '/work-orders', icon: ClipboardList });
  
  // Inventory - admin and workers can view, admin can manage
  if (authStore.hasPermission('manage_inventory') || authStore.hasPermission('access_personal_data')) {
    baseItems.push({ name: 'Inventory', to: '/inventory', icon: Package });
  }
  
  // Invoices - admins and supervisors can access
  if (authStore.hasPermission('view_invoices')) {
    baseItems.push({ name: 'Invoices', to: '/invoices', icon: FileText });
  }
  
  // Admin-only sections
  if (authStore.isAdmin) {
    baseItems.push(
      { name: 'Reports', to: '/reports', icon: FileText },
      { name: 'Users', to: '/users', icon: Users },
      { name: 'Settings', to: '/settings', icon: Settings }
    );
  }
  
  return baseItems;
});

// Demo user switching
const demoUsers = [
  { id: 'admin1', name: 'Ahmad Sutrisno', role: 'admin' as const, email: 'admin@terminal1.com', terminalId: 'terminal1', regionId: 'region1', status: 'active' as const },
  { id: 'supervisor1', name: 'Budi Santoso', role: 'supervisor' as const, email: 'supervisor@pertamc.com', regionId: 'region1', status: 'active' as const },
  { id: 'worker1', name: 'Candra Wijaya', role: 'worker' as const, email: 'worker@terminal1.com', terminalId: 'terminal1', regionId: 'region1', status: 'active' as const },
  { id: 'leader1', name: 'Diana Sari', role: 'leader' as const, email: 'leader@pertamc.com', regionId: 'region1', status: 'active' as const }
];

const switchDemoUser = (value: any) => {
  const userId = typeof value === 'string' ? value : String(value);
  if (!userId) return;
  const user = demoUsers.find(u => u.id === userId);
  if (user) {
    authStore.switchUser(user);
    router.push('/dashboard');
  }
  selectedDemoUser.value = '';
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(async () => {
  // Initialize stores
  messageStore.initializeInbox();
  await notificationStore.initializeNotifications();
  
  // Initialize datetime
  updateDateTime();
  setInterval(updateDateTime, 60000); // Update every minute
  
  // Close sidebar on large screens by default
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = false;
  }
});
</script>