import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserRole } from '@/types';
import { mockUsers } from '@/mock/users';

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
          avatar: '/avatars/admin.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        'supervisor@pertamc.com': {
          id: 'supervisor1',
          name: 'Budi Santoso',
          email: 'supervisor@pertamc.com',
          role: 'supervisor',
          regionId: 'region1',
          status: 'active',
          avatar: '/avatars/supervisor.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        'worker@terminal1.com': {
          id: 'worker1',
          name: 'Candra Wijaya',
          email: 'worker@terminal1.com',
          role: 'worker',
          terminalId: 'terminal1',
          regionId: 'region1',
          status: 'active',
          avatar: '/avatars/worker.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        'leader@pertamc.com': {
          id: 'leader1',
          name: 'Diana Sari',
          email: 'leader@pertamc.com',
          role: 'leader',
          regionId: 'region1',
          status: 'active',
          avatar: '/avatars/leader.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
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

  // Initialize user management store with mock data
  const initializeUserManagement = () => {
    try {
      // Dynamically import to avoid circular dependencies
      import('./userManagement').then(({ useUserManagementStore }) => {
        const userManagementStore = useUserManagementStore();
        userManagementStore.initializeStore(mockUsers);
      });
    } catch (error) {
      console.warn('Failed to initialize user management store:', error);
    }
  };

  // SSO Authentication Methods
  const handleSSOCallback = async (
    code: string,
    provider: 'talenta' | 'idaman'
  ) => {
    isLoading.value = true;

    try {
      // Simulate API call delay (realistic SSO processing time)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Validate mock code format
      if (!code.startsWith('MOCK_')) {
        throw new Error('Invalid authorization code format');
      }

      // Extract userId from code
      // Format: MOCK_{PROVIDER}_{timestamp}_{userId}
      const parts = code.split('_');
      if (parts.length < 4) {
        throw new Error('Malformed authorization code');
      }
      const userId = parts.slice(3).join('_');

      // Fetch user data based on provider and userId
      const userData = fetchUserFromProvider(provider, userId);

      if (!userData) {
        throw new Error('User not found');
      }

      // Validate role matches provider
      validateRoleProviderMatch(userData.role, provider);

      // Update current user with SSO provider info
      currentUser.value = {
        ...userData,
        ssoProvider: provider,
        lastLogin: new Date().toISOString()
      };

      // Persist to localStorage
      localStorage.setItem('cmms_user', JSON.stringify(currentUser.value));
      localStorage.setItem('cmms_sso_provider', provider);

      return { success: true, user: currentUser.value };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SSO authentication failed'
      };
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUserFromProvider = (
    provider: 'talenta' | 'idaman',
    userId: string
  ): User | null => {
    // Mock user databases matching SSO providers
    const talentaUsers: Record<string, User> = {
      'admin1': {
        id: 'admin1',
        name: 'Ahmad Sutrisno',
        email: 'admin@terminal1.com',
        role: 'admin',
        terminalId: 'terminal1',
        regionId: 'region1',
        status: 'active',
        avatar: '/avatars/admin.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      'worker1': {
        id: 'worker1',
        name: 'Candra Wijaya',
        email: 'worker@terminal1.com',
        role: 'worker',
        terminalId: 'terminal1',
        regionId: 'region1',
        status: 'active',
        avatar: '/avatars/worker.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      'worker2': {
        id: 'worker2',
        name: 'Eko Prasetyo',
        email: 'worker2@terminal2.com',
        role: 'worker',
        terminalId: 'terminal2',
        regionId: 'region1',
        status: 'active',
        avatar: '/avatars/worker2.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      'admin2': {
        id: 'admin2',
        name: 'Farah Amalia',
        email: 'admin2@terminal3.com',
        role: 'admin',
        terminalId: 'terminal3',
        regionId: 'region2',
        status: 'active',
        avatar: '/avatars/admin2.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      'worker3': {
        id: 'worker3',
        name: 'Gilang Ramadhan',
        email: 'worker3@terminal4.com',
        role: 'worker',
        terminalId: 'terminal4',
        regionId: 'region2',
        status: 'active',
        avatar: '/avatars/worker3.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    };

    const idamanUsers: Record<string, User> = {
      'supervisor1': {
        id: 'supervisor1',
        name: 'Budi Santoso',
        email: 'supervisor@pertamc.com',
        role: 'supervisor',
        regionId: 'region1',
        status: 'active',
        avatar: '/avatars/supervisor.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      'leader1': {
        id: 'leader1',
        name: 'Diana Sari',
        email: 'leader@pertamc.com',
        role: 'leader',
        regionId: 'region1',
        status: 'active',
        avatar: '/avatars/leader.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      'supervisor2': {
        id: 'supervisor2',
        name: 'Fikri Rahman',
        email: 'supervisor@patraniaga.com',
        role: 'supervisor',
        regionId: 'region2',
        status: 'active',
        avatar: '/avatars/supervisor2.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      'leader2': {
        id: 'leader2',
        name: 'Hani Wijayanti',
        email: 'leader2@pertamc.com',
        role: 'leader',
        regionId: 'region3',
        status: 'active',
        avatar: '/avatars/leader2.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      'supervisor3': {
        id: 'supervisor3',
        name: 'Indra Kurniawan',
        email: 'supervisor3@patraniaga.com',
        role: 'supervisor',
        regionId: 'region4',
        status: 'active',
        avatar: '/avatars/supervisor3.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    };

    const userDatabase = provider === 'talenta' ? talentaUsers : idamanUsers;
    return userDatabase[userId] || null;
  };

  const validateRoleProviderMatch = (
    role: UserRole,
    provider: 'talenta' | 'idaman'
  ): void => {
    const talentaRoles: UserRole[] = ['admin', 'worker'];
    const idamanRoles: UserRole[] = ['supervisor', 'leader'];

    if (provider === 'talenta' && !talentaRoles.includes(role)) {
      throw new Error(
        `Invalid authentication: ${role} users must use Idaman SSO, not Talenta`
      );
    }

    if (provider === 'idaman' && !idamanRoles.includes(role)) {
      throw new Error(
        `Invalid authentication: ${role} users must use Talenta, not Idaman SSO`
      );
    }
  };

  const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('cmms_user');
    localStorage.removeItem('cmms_sso_provider');
    sessionStorage.removeItem('sso_state');
    sessionStorage.removeItem('sso_nonce');
  };

  const checkAuth = () => {
    const stored = localStorage.getItem('cmms_user');
    const ssoProvider = localStorage.getItem('cmms_sso_provider');

    if (stored) {
      try {
        const user = JSON.parse(stored);
        currentUser.value = {
          ...user,
          ssoProvider: ssoProvider || undefined
        };
      } catch (error) {
        // Clear corrupted session data
        localStorage.removeItem('cmms_user');
        localStorage.removeItem('cmms_sso_provider');
        sessionStorage.removeItem('sso_state');
        sessionStorage.removeItem('sso_nonce');
      }
    } else {
      // Auto-login for development/demo - set a default admin user
      const defaultUser = {
        id: 'admin1',
        name: 'Ahmad Sutrisno',
        email: 'admin@terminal1.com',
        role: 'admin' as const,
        terminalId: 'terminal1',
        regionId: 'region1',
        status: 'active' as const,
        avatar: '/avatars/admin.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      currentUser.value = defaultUser;
      localStorage.setItem('cmms_user', JSON.stringify(defaultUser));
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
        'access_all_terminals',
        'manage_categories',
        'manage_templates',
        'promote_users',
        'bulk_operations',
        'view_audit_trail',
        'manage_permissions',
        'system_admin',
        'security_admin'
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

  // SSO-related computed properties
  const ssoProvider = computed(() => currentUser.value?.ssoProvider);
  const isTalentaUser = computed(() => ssoProvider.value === 'talenta');
  const isIdamanUser = computed(() => ssoProvider.value === 'idaman');

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
    hasPermission,
    // SSO methods
    handleSSOCallback,
    // Initialization
    initializeUserManagement,
    // SSO computed properties
    ssoProvider,
    isTalentaUser,
    isIdamanUser
  };
});