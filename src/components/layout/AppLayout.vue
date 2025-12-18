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
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === item.to 
            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
            : 'text-gray-700 hover:bg-gray-50'"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </nav>
      
      <!-- User section -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t">
        <div class="flex items-center mb-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span class="text-sm font-medium text-blue-600">
              {{ currentUser?.name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ currentUser?.name }}</p>
            <p class="text-xs text-gray-500 capitalize">{{ currentUser?.role }}</p>
          </div>
        </div>
        
        <!-- Role switcher for demo -->
        <select 
          v-model="selectedDemoUser"
          @change="switchDemoUser"
          class="w-full mb-2 px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="">Switch User (Demo)</option>
          <option v-for="user in demoUsers" :key="user.id" :value="user.id">
            {{ user.name }} ({{ user.role }})
          </option>
        </select>
        
        <button
          @click="logout"
          class="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
    
    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden">
      <div class="absolute inset-0 bg-gray-600 opacity-75" @click="sidebarOpen = false"></div>
    </div>
    
    <!-- Main content -->
    <div class="lg:ml-64">
      <!-- Top bar -->
      <div class="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Menu class="w-6 h-6" />
          </button>
          
          <div class="flex-1">
            <h1 class="text-lg font-semibold text-gray-900 lg:ml-0 ml-4">
              {{ currentPageTitle }}
            </h1>
          </div>
          
          <!-- Notifications -->
          <button class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
            <Bell class="w-5 h-5" />
          </button>
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
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  FileText, 
  Users, 
  Settings,
  Menu,
  Bell,
  BarChart
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const sidebarOpen = ref(false);
const selectedDemoUser = ref('');

const currentUser = computed(() => authStore.currentUser);

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
    default: return 'CMMS';
  }
});

const navigationItems = computed(() => {
  const baseItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }
  ];
  
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

const switchDemoUser = () => {
  const user = demoUsers.find(u => u.id === selectedDemoUser.value);
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

onMounted(() => {
  // Close sidebar on large screens by default
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = false;
  }
});
</script>