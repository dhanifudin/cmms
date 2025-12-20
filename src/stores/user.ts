import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useUserManagementStore } from './userManagement';

export const useUserStore = defineStore('user', () => {
  const userManagementStore = useUserManagementStore();

  // Re-export user management state
  const users = computed(() => userManagementStore.users);
  const loading = computed(() => userManagementStore.loading);
  const error = computed(() => userManagementStore.error);

  // Helper method to get user by ID synchronously
  const getUserById = (userId: string) => {
    return userManagementStore.users.find(user => user.id === userId) || null;
  };

  // Re-export async method for fetching user by ID
  const fetchUserById = userManagementStore.fetchUserById;

  return {
    users,
    loading,
    error,
    getUserById,
    fetchUserById,
    // Re-export other useful methods
    fetchUsers: userManagementStore.fetchUsers,
    createUser: userManagementStore.createUser,
    updateUser: userManagementStore.updateUser,
    deleteUser: userManagementStore.deleteUser,
  };
});