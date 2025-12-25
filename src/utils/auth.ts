/**
 * Auth utility functions for getting current user information
 * Use these functions instead of hardcoding 'current-user' strings
 */

import { useAuthStore } from '@/stores/auth';

/**
 * Get the current authenticated user's ID
 * Returns 'system' if no user is authenticated
 */
export function getCurrentUserId(): string {
  const authStore = useAuthStore();
  return authStore.currentUser?.id || 'system';
}

/**
 * Get the current authenticated user's name
 * Returns 'System' if no user is authenticated
 */
export function getCurrentUserName(): string {
  const authStore = useAuthStore();
  return authStore.currentUser?.name || 'System';
}

/**
 * Get the current authenticated user's email
 * Returns undefined if no user is authenticated
 */
export function getCurrentUserEmail(): string | undefined {
  const authStore = useAuthStore();
  return authStore.currentUser?.email;
}

/**
 * Get the current authenticated user's role
 * Returns undefined if no user is authenticated
 */
export function getCurrentUserRole(): string | undefined {
  const authStore = useAuthStore();
  return authStore.currentUser?.role;
}

/**
 * Get the current authenticated user's terminal ID
 * Returns undefined if no user is authenticated or user has no terminal
 */
export function getCurrentUserTerminalId(): string | undefined {
  const authStore = useAuthStore();
  return authStore.currentUser?.terminalId;
}

/**
 * Get the current authenticated user's region ID
 * Returns undefined if no user is authenticated or user has no region
 */
export function getCurrentUserRegionId(): string | undefined {
  const authStore = useAuthStore();
  return authStore.currentUser?.regionId;
}

/**
 * Check if there is an authenticated user
 */
export function isAuthenticated(): boolean {
  const authStore = useAuthStore();
  return authStore.isAuthenticated;
}

/**
 * Get full user info for audit purposes
 */
export function getAuditUserInfo(): {
  userId: string;
  userName: string;
  userRole: string | undefined;
  timestamp: string;
} {
  return {
    userId: getCurrentUserId(),
    userName: getCurrentUserName(),
    userRole: getCurrentUserRole(),
    timestamp: new Date().toISOString()
  };
}
