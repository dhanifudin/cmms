import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { 
  User, 
  UserFilter, 
  CreateUserForm, 
  UpdateUserForm, 
  BulkUserOperation, 
  UserStatusHistory,
  UserRoleHistory,
  UserAuditLog,
  UserManagementStats,
  UserStatus,
  UserRole,
  UserAuditAction
} from '@/types';
import type { PaginationState, UserPaginationSizes } from '@/types/pagination';
import { getPaginationConfig } from '@/config/pagination';
import { useAuthStore } from './auth';

export const useUserManagementStore = defineStore('userManagement', () => {
  // State
  const users = ref<User[]>([]);
  const statusHistory = ref<UserStatusHistory[]>([]);
  const roleHistory = ref<UserRoleHistory[]>([]);
  const auditLogs = ref<UserAuditLog[]>([]);
  const currentUser = ref<User | null>(null);
  const filters = ref<UserFilter>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Standardized pagination state
  const paginationConfig = getPaginationConfig('users');
  const paginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Search and filter state
  const searchQuery = ref('');
  const roleFilter = ref<string>('');
  const statusFilter = ref<string>('');
  const terminalFilter = ref<string>('');
  const regionFilter = ref<string>('');
  const sortBy = ref<'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLogin'>('name');
  const sortOrder = ref<'asc' | 'desc'>('asc');

  // Bulk operations
  const bulkOperationProgress = ref({
    isRunning: false,
    total: 0,
    completed: 0,
    errors: [] as string[]
  });

  // Auth store reference
  const authStore = useAuthStore();

  // Terminal-based filtering helper
  const getAccessibleUsers = computed(() => {
    if (!authStore.currentUser) return [];

    // Workers: Cannot access user management
    if (authStore.isWorker) {
      return [];
    }

    // Admins: Can only manage users from their terminal
    if (authStore.isAdmin && authStore.currentUser.terminalId) {
      return users.value.filter(user => 
        user.terminalId === authStore.currentUser?.terminalId
      );
    }

    // Supervisors: Can manage users from all terminals in their region
    if (authStore.isSupervisor && authStore.currentUser?.regionId) {
      return users.value.filter(user => 
        user.regionId === authStore.currentUser?.regionId
      );
    }

    // Leaders: Regional access (TBD scope - for now same as supervisor)
    if (authStore.isLeader && authStore.currentUser?.regionId) {
      return users.value.filter(user => 
        user.regionId === authStore.currentUser?.regionId
      );
    }

    // Fallback: no access
    return [];
  });

  // Search and filter computed properties
  const filteredAndSearchedUsers = computed(() => {
    let result = getAccessibleUsers.value;

    // Apply search query
    if (searchQuery.value.trim()) {
      const search = searchQuery.value.trim().toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(search))
      );
    }

    // Apply role filter
    if (roleFilter.value) {
      result = result.filter(user => user.role === roleFilter.value);
    }

    // Apply status filter
    if (statusFilter.value) {
      result = result.filter(user => user.status === statusFilter.value);
    }

    // Apply terminal filter
    if (terminalFilter.value) {
      result = result.filter(user => user.terminalId === terminalFilter.value);
    }

    // Apply region filter
    if (regionFilter.value) {
      result = result.filter(user => user.regionId === regionFilter.value);
    }

    // Apply legacy filters for backward compatibility
    if (filters.value.department) {
      result = result.filter(user => user.department === filters.value.department);
    }

    if (filters.value.ssoProvider) {
      result = result.filter(user => user.ssoProvider === filters.value.ssoProvider);
    }

    if (filters.value.mfaEnabled !== undefined) {
      result = result.filter(user => user.mfaEnabled === filters.value.mfaEnabled);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy.value) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastLogin':
          aValue = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          bValue = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });

    // Update pagination total
    paginationState.value.totalItems = result.length;
    paginationState.value.totalPages = Math.ceil(result.length / paginationState.value.pageSize);
    
    // Ensure current page is valid
    if (paginationState.value.currentPage > paginationState.value.totalPages && paginationState.value.totalPages > 0) {
      paginationState.value.currentPage = paginationState.value.totalPages;
    }

    return result;
  });

  // Paginated users
  const paginatedUsers = computed(() => {
    const startIndex = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    const endIndex = startIndex + paginationState.value.pageSize;
    return filteredAndSearchedUsers.value.slice(startIndex, endIndex);
  });

  // Backward compatibility
  const filteredUsers = computed(() => filteredAndSearchedUsers.value);
  const totalPages = computed(() => paginationState.value.totalPages);

  // Legacy computed properties - maintained for backward compatibility
  const activeUsers = computed(() => {
    return getAccessibleUsers.value.filter(user => user.status === 'active');
  });

  const usersByRole = computed(() => {
    const counts: Record<UserRole, number> = {
      admin: 0,
      supervisor: 0,
      leader: 0,
      worker: 0
    };

    getAccessibleUsers.value.forEach(user => {
      counts[user.role]++;
    });

    return counts;
  });

  const usersByStatus = computed(() => {
    const counts: Record<UserStatus, number> = {
      active: 0,
      inactive: 0,
      suspended: 0,
      terminated: 0
    };

    getAccessibleUsers.value.forEach(user => {
      counts[user.status]++;
    });

    return counts;
  });

  const userManagementStats = computed((): UserManagementStats => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Use accessible users instead of all users for scoped stats
    const accessibleUsers = getAccessibleUsers.value;
    const accessibleActiveUsers = accessibleUsers.filter(user => user.status === 'active');
    
    // Calculate role distribution for accessible users only
    const scopedUsersByRole = accessibleUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, { admin: 0, supervisor: 0, leader: 0, worker: 0 } as Record<UserRole, number>);
    
    // Calculate status distribution for accessible users only
    const scopedUsersByStatus = accessibleUsers.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, { active: 0, inactive: 0, suspended: 0, terminated: 0 } as Record<UserStatus, number>);
    
    return {
      totalUsers: accessibleUsers.length,
      activeUsers: accessibleActiveUsers.length,
      newUsersThisMonth: accessibleUsers.filter(user => 
        new Date(user.createdAt) >= thisMonthStart
      ).length,
      usersByRole: scopedUsersByRole,
      usersByStatus: scopedUsersByStatus,
      usersByTerminal: accessibleUsers.reduce((acc, user) => {
        if (user.terminalId) {
          acc[user.terminalId] = (acc[user.terminalId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      mfaAdoptionRate: accessibleUsers.length > 0 
        ? (accessibleUsers.filter(user => user.mfaEnabled).length / accessibleUsers.length) * 100 
        : 0,
      averageSessionDuration: 120, // Mock value in minutes
      recentLoginCount: accessibleUsers.filter(user => 
        user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
  });

  // Available filter options
  const availableRoles = computed(() => {
    const roles = new Set<string>();
    getAccessibleUsers.value.forEach(user => roles.add(user.role));
    return Array.from(roles).sort();
  });

  const availableStatuses = computed(() => {
    const statuses = new Set<string>();
    getAccessibleUsers.value.forEach(user => statuses.add(user.status));
    return Array.from(statuses).sort();
  });

  const availableTerminals = computed(() => {
    const terminals = new Set<string>();
    getAccessibleUsers.value.forEach(user => {
      if (user.terminalId) terminals.add(user.terminalId);
    });
    return Array.from(terminals).sort();
  });

  const availableRegions = computed(() => {
    const regions = new Set<string>();
    getAccessibleUsers.value.forEach(user => {
      if (user.regionId) regions.add(user.regionId);
    });
    return Array.from(regions).sort();
  });

  // Actions
  const fetchUsers = async (filter?: UserFilter) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (filter) {
        filters.value = { ...filter };
      }
      
      // Users are loaded from mock data - this would be an API call in production
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
    } finally {
      loading.value = false;
    }
  };

  const fetchUserById = async (userId: string) => {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = users.value.find(u => u.id === userId);
      if (user) {
        currentUser.value = user;
        return user;
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: CreateUserForm) => {
    loading.value = true;
    error.value = null;

    try {
      // Validate admin permission
      if (!authStore.hasPermission('manage_users')) {
        throw new Error('Insufficient permissions to create users');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check for duplicate email or employee ID
      const emailExists = users.value.some(user => user.email === userData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      if (userData.employeeId) {
        const employeeIdExists = users.value.some(user => user.employeeId === userData.employeeId);
        if (employeeIdExists) {
          throw new Error('Employee ID already exists');
        }
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: userData.name,
        email: userData.email,
        employeeId: userData.employeeId,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        status: userData.status,
        terminalId: userData.terminalId,
        regionId: userData.regionId,
        department: userData.department,
        hireDate: userData.hireDate,
        ssoProvider: userData.ssoProvider,
        mfaEnabled: userData.mfaEnabled || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: authStore.currentUser?.id,
        lastModifiedBy: authStore.currentUser?.id
      };

      users.value.push(newUser);
      
      // Log the action
      await logAuditAction('user_created', `Created user: ${userData.name}`, newUser.id);

      return newUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (userId: string, userData: UpdateUserForm) => {
    loading.value = true;
    error.value = null;

    try {
      // Validate admin permission
      if (!authStore.hasPermission('manage_users')) {
        throw new Error('Insufficient permissions to update users');
      }

      // Prevent self-modification of critical attributes
      if (userId === authStore.currentUser?.id && userData.email) {
        throw new Error('Cannot modify your own email address');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const userIndex = users.value.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const existingUser = users.value[userIndex];
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      const oldUser = { ...existingUser };
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        id: userId, // Ensure ID is preserved
        name: userData.name ?? existingUser.name,
        email: userData.email ?? existingUser.email,
        role: userData.role ?? existingUser.role,
        status: userData.status ?? existingUser.status,
        createdAt: existingUser.createdAt, // Preserve creation timestamp
        ssoProvider: (userData.ssoProvider as 'talenta' | 'idaman') ?? existingUser.ssoProvider,
        updatedAt: new Date().toISOString(),
        lastModifiedBy: authStore.currentUser?.id || 'system'
      };

      users.value[userIndex] = updatedUser;

      // Update current user if it's the same
      if (authStore.currentUser?.id === userId) {
        authStore.currentUser = updatedUser;
      }

      // Log the action
      await logAuditAction('user_updated', `Updated user: ${updatedUser.name}`, userId, oldUser, userData);

      return updatedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const changeUserStatus = async (userId: string, newStatus: UserStatus, reason: string) => {
    loading.value = true;
    error.value = null;

    try {
      // Validate admin permission
      if (!authStore.hasPermission('manage_users')) {
        throw new Error('Insufficient permissions to change user status');
      }

      // Prevent self-deactivation
      if (userId === authStore.currentUser?.id && newStatus !== 'active') {
        throw new Error('Cannot deactivate your own account');
      }

      // Check minimum admin count
      const user = users.value.find(u => u.id === userId);
      if (user && user.role === 'admin' && newStatus !== 'active') {
        const activeAdmins = users.value.filter(u => u.role === 'admin' && u.status === 'active' && u.id !== userId);
        if (activeAdmins.length < 2) {
          throw new Error('Cannot deactivate admin. System requires at least 2 active administrators.');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const userIndex = users.value.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const targetUser = users.value[userIndex];
      if (!targetUser) {
        throw new Error('User not found in array');
      }

      const oldStatus = targetUser.status;
      targetUser.status = newStatus;
      targetUser.updatedAt = new Date().toISOString();
      targetUser.lastModifiedBy = authStore.currentUser?.id || 'system';

      // Add to status history
      const historyEntry: UserStatusHistory = {
        id: `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        previousStatus: oldStatus,
        newStatus,
        reason,
        changedBy: authStore.currentUser?.id || 'system',
        changedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString()
      };
      statusHistory.value.push(historyEntry);

      // Log the action
      await logAuditAction('status_changed', `Changed user status from ${oldStatus} to ${newStatus}: ${reason}`, userId);

      return users.value[userIndex];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to change user status';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const promoteUser = async (userId: string, newRole: UserRole, reason: string, trainingCompleted = false, performanceScore?: number) => {
    loading.value = true;
    error.value = null;

    try {
      // Validate promotion permission
      if (!authStore.hasPermission('promote_users')) {
        throw new Error('Insufficient permissions to promote users');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const userIndex = users.value.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const promotionUser = users.value[userIndex];
      if (!promotionUser) {
        throw new Error('User not found in array');
      }

      const oldRole = promotionUser.role;
      
      // Validate promotion path (typically worker -> admin)
      if (oldRole === 'worker' && newRole === 'admin') {
        if (!trainingCompleted) {
          throw new Error('Admin training must be completed before promotion');
        }
      }

      promotionUser.role = newRole;
      promotionUser.updatedAt = new Date().toISOString();
      promotionUser.lastModifiedBy = authStore.currentUser?.id || 'system';

      // Add to role history
      const historyEntry: UserRoleHistory = {
        id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        previousRole: oldRole,
        newRole,
        promotionReason: reason,
        approvedBy: authStore.currentUser?.id || 'system',
        approvedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
        trainingCompleted,
        performanceScore
      };
      roleHistory.value.push(historyEntry);

      // Log the action
      await logAuditAction('role_changed', `Promoted user from ${oldRole} to ${newRole}: ${reason}`, userId);

      return users.value[userIndex];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to promote user';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkUpdateUsers = async (operation: BulkUserOperation) => {
    loading.value = true;
    bulkOperationProgress.value = {
      isRunning: true,
      total: operation.userIds.length,
      completed: 0,
      errors: []
    };

    try {
      // Validate bulk operations permission
      if (!authStore.hasPermission('bulk_operations')) {
        throw new Error('Insufficient permissions for bulk operations');
      }

      // Simulate processing each user
      for (let i = 0; i < operation.userIds.length; i++) {
        const userId = operation.userIds[i];
        
        if (!userId) {
          bulkOperationProgress.value.errors.push('Invalid user ID');
          continue;
        }
        
        try {
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 200));
          
          switch (operation.operation) {
            case 'status_change':
              if (operation.parameters?.status && operation.reason) {
                await changeUserStatus(userId, operation.parameters.status, operation.reason);
              }
              break;
            case 'role_change':
              if (operation.parameters?.role && operation.reason) {
                await promoteUser(userId, operation.parameters.role, operation.reason, true);
              }
              break;
            case 'delete':
              if (operation.reason) {
                await deleteUser(userId, operation.reason);
              }
              break;
          }
          
          bulkOperationProgress.value.completed++;
        } catch (err) {
          bulkOperationProgress.value.errors.push(`User ${userId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // Log bulk operation
      await logAuditAction('bulk_operation', `Bulk ${operation.operation} on ${operation.userIds.length} users`, undefined, undefined, operation);

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to complete bulk operation';
      throw err;
    } finally {
      loading.value = false;
      bulkOperationProgress.value.isRunning = false;
    }
  };

  const deleteUser = async (userId: string, reason: string) => {
    // Validate admin permission
    if (!authStore.hasPermission('manage_users')) {
      throw new Error('Insufficient permissions to delete users');
    }

    // Prevent self-deletion
    if (userId === authStore.currentUser?.id) {
      throw new Error('Cannot delete your own account');
    }

    const userIndex = users.value.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const deletionUser = users.value[userIndex];
    if (!deletionUser) {
      throw new Error('User not found in array');
    }
    
    // Check admin count before deletion
    if (deletionUser.role === 'admin') {
      const activeAdmins = users.value.filter(u => u.role === 'admin' && u.status === 'active' && u.id !== userId);
      if (activeAdmins.length < 2) {
        throw new Error('Cannot delete admin. System requires at least 2 active administrators.');
      }
    }

    // Soft delete - change status to terminated
    deletionUser.status = 'terminated';
    deletionUser.updatedAt = new Date().toISOString();
    deletionUser.lastModifiedBy = authStore.currentUser?.id || 'system';

    // Log the action
    await logAuditAction('user_deleted', `Deleted user: ${reason}`, userId);
  };

  const exportUsers = async (userIds?: string[]) => {
    // Validate export permission
    if (!authStore.hasPermission('view_audit_trail')) {
      throw new Error('Insufficient permissions to export user data');
    }

    const usersToExport = userIds 
      ? users.value.filter(u => userIds.includes(u.id))
      : filteredUsers.value;

    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Employee ID', 'Role', 'Status', 'Terminal ID', 'Created At', 'Last Login'];
    const rows = usersToExport.map(user => [
      user.id,
      user.name,
      user.email,
      user.employeeId || '',
      user.role,
      user.status,
      user.terminalId || '',
      user.createdAt,
      user.lastLogin || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Log export action
    await logAuditAction('data_export', `Exported ${usersToExport.length} user records`);

    return {
      content: csvContent,
      filename: `users_export_${new Date().toISOString().split('T')[0]}.csv`,
      count: usersToExport.length
    };
  };

  const logAuditAction = async (
    actionType: UserAuditAction, 
    description: string, 
    userId?: string,
    oldValues?: any,
    newValues?: any
  ) => {
    const auditLog: UserAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      actionType,
      actionDescription: description,
      performedBy: authStore.currentUser?.id || 'system',
      ipAddress: '127.0.0.1', // Would be real IP in production
      timestamp: new Date().toISOString(),
      oldValues,
      newValues
    };

    auditLogs.value.push(auditLog);
  };

  const fetchAuditTrail = async (userId?: string, limit = 100) => {
    loading.value = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let logs = auditLogs.value;
      if (userId) {
        logs = logs.filter(log => log.userId === userId || log.performedBy === userId);
      }
      
      return logs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } finally {
      loading.value = false;
    }
  };

  // Pagination methods
  const setPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, paginationState.value.totalPages));
    paginationState.value.currentPage = newPage;
  };

  const setPageSize = (pageSize: UserPaginationSizes) => {
    // Calculate current first item index
    const currentFirstItem = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    
    // Update page size
    paginationState.value.pageSize = pageSize;
    
    // Calculate new page to keep roughly the same position
    const newPage = Math.floor(currentFirstItem / pageSize) + 1;
    setPage(newPage);
  };

  const nextPage = () => {
    if (paginationState.value.currentPage < paginationState.value.totalPages) {
      setPage(paginationState.value.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (paginationState.value.currentPage > 1) {
      setPage(paginationState.value.currentPage - 1);
    }
  };

  const firstPage = () => {
    setPage(1);
  };

  const lastPage = () => {
    setPage(paginationState.value.totalPages);
  };

  const resetPagination = () => {
    paginationState.value.currentPage = 1;
  };

  // Search and filter methods
  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    resetPagination(); // Reset to first page when search changes
  };

  const setRoleFilter = (role: string) => {
    roleFilter.value = role;
    resetPagination();
  };

  const setStatusFilter = (status: string) => {
    statusFilter.value = status;
    resetPagination();
  };

  const setTerminalFilter = (terminalId: string) => {
    terminalFilter.value = terminalId;
    resetPagination();
  };

  const setRegionFilter = (regionId: string) => {
    regionFilter.value = regionId;
    resetPagination();
  };

  const setSorting = (by: 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLogin', order: 'asc' | 'desc') => {
    sortBy.value = by;
    sortOrder.value = order;
    resetPagination();
  };

  const clearAllFilters = () => {
    searchQuery.value = '';
    roleFilter.value = '';
    statusFilter.value = '';
    terminalFilter.value = '';
    regionFilter.value = '';
    sortBy.value = 'name';
    sortOrder.value = 'asc';
    filters.value = {};
    resetPagination();
  };

  // Additional filter methods for compatibility
  const setSsoFilter = (provider: string) => {
    const validProvider = provider === 'talenta' || provider === 'idaman' ? provider : undefined;
    filters.value = { ...filters.value, ssoProvider: validProvider };
    resetPagination();
  };

  const toggleSort = (field: string) => {
    const validFields = ['name', 'email', 'role', 'status', 'createdAt', 'lastLogin'];
    if (validFields.includes(field)) {
      if (sortBy.value === field) {
        // Toggle order if same field
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        // Change field, default to ascending
        sortBy.value = field as any;
        sortOrder.value = 'asc';
      }
      resetPagination();
    }
  };

  const clearFilters = clearAllFilters; // Alias for compatibility

  // Initialize with mock data
  const initializeStore = (mockUsers: User[]) => {
    users.value = mockUsers;
  };

  return {
    // Original state
    users,
    statusHistory,
    roleHistory,
    auditLogs,
    currentUser,
    filters,
    loading,
    error,
    bulkOperationProgress,

    // New pagination and filtering properties
    paginationState: readonly(paginationState),
    paginatedUsers,
    filteredAndSearchedUsers,
    availableRoles,
    availableStatuses,
    availableTerminals,
    availableRegions,
    searchQuery: readonly(searchQuery),
    roleFilter: readonly(roleFilter),
    statusFilter: readonly(statusFilter),
    terminalFilter: readonly(terminalFilter),
    regionFilter: readonly(regionFilter),
    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),

    // Backward compatibility
    filteredUsers,
    totalPages,
    activeUsers,
    usersByRole,
    usersByStatus,
    userManagementStats,

    // Original actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    changeUserStatus,
    promoteUser,
    bulkUpdateUsers,
    deleteUser,
    exportUsers,
    fetchAuditTrail,
    initializeStore,
    logAuditAction,

    // New pagination actions
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    resetPagination,

    // New filter actions
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setTerminalFilter,
    setRegionFilter,
    setSorting,
    clearAllFilters,
    setSsoFilter,
    toggleSort,
    clearFilters
  };
});