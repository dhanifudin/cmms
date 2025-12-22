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
      path: '/auth/sso/talenta',
      name: 'TalentaSSO',
      component: () => import('@/views/auth/sso/TalentaSSO.vue'),
      meta: {
        requiresGuest: true,
        title: 'Sign in with Talenta'
      }
    },
    {
      path: '/auth/sso/idaman',
      name: 'IdamanSSO',
      component: () => import('@/views/auth/sso/IdamanSSO.vue'),
      meta: {
        requiresGuest: true,
        title: 'Sign in with Idaman'
      }
    },
    {
      path: '/auth/callback',
      name: 'SSOCallback',
      component: () => import('@/views/auth/SSOCallback.vue'),
      meta: {
        requiresGuest: true,
        title: 'Completing sign in...'
      }
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
      component: () => import('@/views/workorders/WorkOrderTableView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/work-orders/history',
      name: 'WorkOrderHistory',
      component: () => import('@/views/workorders/WorkOrderHistory.vue'),
      meta: { 
        requiresAuth: true,
        requiresRole: ['admin', 'supervisor', 'leader'],
        title: 'Work Order History'
      }
    },
    {
      path: '/work-orders/create',
      name: 'CreateWorkOrder',
      component: () => import('@/views/workorders/CreateWorkOrderWithTemplates.vue'),
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
    },
    {
      path: '/memos',
      name: 'MemoManagement',
      component: () => import('@/views/memo/MemoManagement.vue'),
      meta: { 
        requiresAuth: true,
        requiresRole: ['admin', 'supervisor'],
        title: 'Work Order Memos'
      }
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import('@/views/reports/Reports.vue'),
      meta: { requiresAuth: true, permission: 'view_reports' }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/settings/Settings.vue'),
      meta: { requiresAuth: true }
    },
    // Category Management
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('@/views/admin/CategoryManagement.vue'),
      meta: { requiresAuth: true, permission: 'manage_categories' }
    },
    // Template Management
    {
      path: '/templates',
      name: 'Templates',
      component: () => import('@/views/admin/TemplateManagement.vue'),
      meta: { requiresAuth: true, permission: 'manage_templates' }
    },
    {
      path: '/templates/create',
      name: 'CreateTemplate',
      component: () => import('@/views/admin/CreateTemplate.vue'),
      meta: { requiresAuth: true, permission: 'manage_templates' }
    },
    {
      path: '/templates/:id',
      name: 'TemplateDetail',
      component: () => import('@/views/admin/TemplateDetail.vue'),
      meta: { requiresAuth: true, permission: 'manage_templates' }
    },
    {
      path: '/templates/:id/edit',
      name: 'EditTemplate',
      component: () => import('@/views/admin/EditTemplate.vue'),
      meta: { requiresAuth: true, permission: 'manage_templates' }
    },
    // User Management
    {
      path: '/users',
      name: 'UserManagement',
      component: () => import('@/views/admin/UserManagement.vue'),
      meta: { requiresAuth: true, permission: 'manage_users' }
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
  
  // Check role requirements
  if (to.meta.requiresRole && authStore.currentUser) {
    const requiredRoles = Array.isArray(to.meta.requiresRole) 
      ? to.meta.requiresRole 
      : [to.meta.requiresRole];
    
    if (!requiredRoles.includes(authStore.currentUser.role)) {
      // Redirect to dashboard with error message
      next('/dashboard');
      return;
    }
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