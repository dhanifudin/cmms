import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserRole } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => currentUser.value !== null);
  const userRole = computed(() => currentUser.value?.role);
  const isAdmin = computed(() => userRole.value === 'admin');
  const isSupervisor = computed(() => userRole.value === 'supervisor');
  const isWorker = computed(() => userRole.value === 'worker');
  const isLeader = computed(() => userRole.value === 'leader');

  // Mock authentication - simulates Talenta HRIS for workers/admin and Idaman SSO for supervisors/leaders
  const login = async (email: string, password: string) => {
    isLoading.value = true;
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      const mockUsers: Record<string, User> = {
        'admin@terminal1.com': {
          id: 'admin1',
          name: 'Ahmad Sutrisno',
          email: 'admin@terminal1.com',
          role: 'admin',
          terminalId: 'terminal1',
          regionId: 'region1',
          status: 'active',
          avatar: '/avatars/admin.jpg'
        },
        'supervisor@pertamc.com': {
          id: 'supervisor1',
          name: 'Budi Santoso',
          email: 'supervisor@pertamc.com',
          role: 'supervisor',
          regionId: 'region1',
          status: 'active',
          avatar: '/avatars/supervisor.jpg'
        },
        'worker@terminal1.com': {
          id: 'worker1',
          name: 'Candra Wijaya',
          email: 'worker@terminal1.com',
          role: 'worker',
          terminalId: 'terminal1',
          regionId: 'region1',
          status: 'active',
          avatar: '/avatars/worker.jpg'
        },
        'leader@pertamc.com': {
          id: 'leader1',
          name: 'Diana Sari',
          email: 'leader@pertamc.com',
          role: 'leader',
          regionId: 'region1',
          status: 'active',
          avatar: '/avatars/leader.jpg'
        }
      };

      const user = mockUsers[email];
      
      if (!user || password !== 'password') {
        throw new Error('Invalid credentials');
      }

      currentUser.value = user;
      
      // Store in localStorage for persistence
      localStorage.setItem('cmms_user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('cmms_user');
  };

  const checkAuth = () => {
    const stored = localStorage.getItem('cmms_user');
    if (stored) {
      try {
        currentUser.value = JSON.parse(stored);
      } catch (error) {
        localStorage.removeItem('cmms_user');
      }
    }
  };

  const switchUser = (user: User) => {
    currentUser.value = user;
    localStorage.setItem('cmms_user', JSON.stringify(user));
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser.value) return false;

    const permissions: Record<UserRole, string[]> = {
      admin: [
        'create_work_orders',
        'manage_inventory',
        'configure_pricing',
        'manage_users',
        'generate_invoices',
        'manage_invoices',
        'view_invoices',
        'view_reports',
        'access_all_terminals'
      ],
      supervisor: [
        'approve_work_orders',
        'modify_work_orders',
        'assign_workers',
        'review_completions',
        'configure_pricing',
        'generate_invoices',
        'manage_invoices',
        'view_invoices',
        'view_reports',
        'access_regional_data'
      ],
      worker: [
        'view_assigned_work_orders',
        'submit_documentation',
        'complete_work_orders',
        'access_personal_data'
      ],
      leader: [
        // TBD - permissions not yet defined
        'access_regional_data'
      ]
    };

    return permissions[currentUser.value.role]?.includes(permission) || false;
  };

  return {
    currentUser,
    isLoading,
    isAuthenticated,
    userRole,
    isAdmin,
    isSupervisor,
    isWorker,
    isLeader,
    login,
    logout,
    checkAuth,
    switchUser,
    hasPermission
  };
});