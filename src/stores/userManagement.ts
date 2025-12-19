import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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
  
  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalUsers = ref(0);

  // Bulk operations
  const bulkOperationProgress = ref({
    isRunning: false,
    total: 0,
    completed: 0,
    errors: [] as string[]
  });

  // Auth store reference
  const authStore = useAuthStore();

  // Getters
  const filteredUsers = computed(() => {
    let result = users.value;

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(search))
      );
    }

    if (filters.value.role) {
      result = result.filter(user => user.role === filters.value.role);
    }

    if (filters.value.status) {
      result = result.filter(user => user.status === filters.value.status);
    }

    if (filters.value.terminalId) {
      result = result.filter(user => user.terminalId === filters.value.terminalId);
    }

    if (filters.value.regionId) {
      result = result.filter(user => user.regionId === filters.value.regionId);
    }

    if (filters.value.department) {
      result = result.filter(user => user.department === filters.value.department);
    }

    if (filters.value.ssoProvider) {
      result = result.filter(user => user.ssoProvider === filters.value.ssoProvider);
    }

    if (filters.value.mfaEnabled !== undefined) {
      result = result.filter(user => user.mfaEnabled === filters.value.mfaEnabled);
    }

    return result;
  });

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredUsers.value.slice(start, end);
  });

  const totalPages = computed(() => {
    return Math.ceil(filteredUsers.value.length / pageSize.value);
  });

  const activeUsers = computed(() => {
    return users.value.filter(user => user.status === 'active');
  });

  const usersByRole = computed(() => {
    const counts: Record<UserRole, number> = {
      admin: 0,
      supervisor: 0,
      leader: 0,
      worker: 0
    };

    users.value.forEach(user => {
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

    users.value.forEach(user => {
      counts[user.status]++;
    });

    return counts;
  });

  const userManagementStats = computed((): UserManagementStats => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      totalUsers: users.value.length,
      activeUsers: activeUsers.value.length,
      newUsersThisMonth: users.value.filter(user => 
        new Date(user.createdAt) >= thisMonthStart
      ).length,
      usersByRole: usersByRole.value,
      usersByStatus: usersByStatus.value,
      usersByTerminal: users.value.reduce((acc, user) => {
        if (user.terminalId) {
          acc[user.terminalId] = (acc[user.terminalId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      mfaAdoptionRate: users.value.length > 0 
        ? (users.value.filter(user => user.mfaEnabled).length / users.value.length) * 100 
        : 0,
      averageSessionDuration: 120, // Mock value in minutes
      recentLoginCount: users.value.filter(user => 
        user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
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
      totalUsers.value = filteredUsers.value.length;
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

  // Initialize with mock data
  const initializeStore = (mockUsers: User[]) => {
    users.value = mockUsers;
    totalUsers.value = mockUsers.length;
  };

  const clearFilters = () => {
    filters.value = {};
    currentPage.value = 1;
  };

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  return {
    // State
    users,
    statusHistory,
    roleHistory,
    auditLogs,
    currentUser,
    filters,
    loading,
    error,
    currentPage,
    pageSize,
    totalUsers,
    bulkOperationProgress,

    // Getters
    filteredUsers,
    paginatedUsers,
    totalPages,
    activeUsers,
    usersByRole,
    usersByStatus,
    userManagementStats,

    // Actions
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
    clearFilters,
    setPage,
    logAuditAction
  };
});