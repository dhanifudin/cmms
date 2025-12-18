import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('@/views/dashboard/AnalyticsDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/work-orders',
      name: 'WorkOrders',
      component: () => import('@/views/workorders/WorkOrderList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/work-orders/create',
      name: 'CreateWorkOrder',
      component: () => import('@/views/workorders/CreateWorkOrder.vue'),
      meta: { requiresAuth: true, permission: 'create_work_orders' }
    },
    {
      path: '/work-orders/:id',
      name: 'WorkOrderDetail',
      component: () => import('@/views/workorders/WorkOrderDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: () => import('@/views/inventory/InventoryList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory/create',
      name: 'CreateInventoryItem',
      component: () => import('@/views/inventory/CreateInventoryItem.vue'),
      meta: { requiresAuth: true, permission: 'manage_inventory' }
    },
    {
      path: '/inventory/:id',
      name: 'InventoryItemDetail',
      component: () => import('@/views/inventory/InventoryItemDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/invoices',
      name: 'Invoices',
      component: () => import('@/views/invoices/InvoiceList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/invoices/:id',
      name: 'InvoiceDetail',
      component: () => import('@/views/invoices/InvoiceDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/inbox',
      name: 'Inbox',
      component: () => import('@/views/inbox/Inbox.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  
  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard');
    return;
  }
  
  // Check permissions
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
    // Redirect to dashboard with error message
    next('/dashboard');
    return;
  }
  
  next();
});

export default router;