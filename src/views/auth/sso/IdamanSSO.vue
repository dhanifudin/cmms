<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full">
      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-xl border border-gray-200 p-8 sm:p-10">
        <!-- IdAMan Logo and Header -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-4">
            <img src="/logos/idaman-logo.svg" alt="IdAMan" class="h-14" />
          </div>
          <h2 class="text-3xl font-bold text-idaman">IdAMan 3.0</h2>
          <p class="mt-2 text-sm text-slate-600">
            Identity & Access Management
          </p>
          <p class="mt-1 text-sm text-slate-600">
            Select your account to continue
          </p>
        </div>

        <!-- Decorative Element -->
        <div class="flex items-center justify-center mb-6">
          <div class="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-full"></div>
        </div>

        <!-- User Selection Grid -->
        <div class="space-y-3 mb-6">
          <button
            v-for="user in idamanUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-idaman hover:bg-gray-50 transition-all duration-200 text-left flex items-center space-x-4 group shadow-sm hover:shadow-md"
          >
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                {{ user.name.charAt(0) }}
              </div>
            </div>

            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <p class="text-sm font-semibold text-gray-900">
                  {{ user.name }}
                </p>
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded-md"
                  :class="user.role === 'supervisor'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-cyan-50 text-cyan-700 border border-cyan-200'"
                >
                  {{ user.role === 'supervisor' ? 'Supervisor' : 'Leader' }}
                </span>
              </div>
              <p class="text-xs text-gray-600">{{ user.position }}</p>
              <div class="flex items-center space-x-1 mt-1">
                <p class="text-xs text-gray-500">{{ user.email }}</p>
                <span class="text-gray-400">•</span>
                <p class="text-xs text-gray-500">{{ user.organization }}</p>
              </div>
              <p class="text-xs text-gray-500">{{ user.regionName }}</p>
            </div>

            <!-- Brand Accent -->
            <div class="flex-shrink-0">
              <div class="w-1 h-12 bg-idaman rounded-full"></div>
            </div>
          </button>
        </div>

        <!-- Security Notice -->
        <div class="bg-idaman-light border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-idaman flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div>
              <p class="text-sm font-bold text-idaman">Secure Authentication</p>
              <p class="text-xs text-gray-600 mt-1">Your account is protected by Pertamina's security infrastructure</p>
            </div>
          </div>
        </div>

        <!-- Back to Login Button -->
        <div class="text-center">
          <button
            @click="backToLogin"
            class="px-6 py-2.5 bg-white border-2 border-gray-300 hover:border-idaman text-gray-700 hover:text-idaman font-medium rounded-lg transition-all duration-200 hover:bg-idaman-light"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Login</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <p class="text-sm font-bold text-idaman">
          PT Pertamina (Persero)
        </p>
        <p class="text-sm font-medium text-gray-700 mt-1">
          © 2025 All Rights Reserved
        </p>
        <div class="mt-3 flex items-center justify-center space-x-3 text-xs">
          <a href="#" class="text-idaman hover:underline font-medium">Privacy Policy</a>
          <span class="text-gray-400">•</span>
          <a href="#" class="text-idaman hover:underline font-medium">Terms of Service</a>
          <span class="text-gray-400">•</span>
          <a href="#" class="text-idaman hover:underline font-medium">Help</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

interface IdamanUser {
  id: string;
  name: string;
  email: string;
  role: 'supervisor' | 'leader';
  organization: 'PertaMC' | 'PatraNiaga';
  regionId: string;
  regionName: string;
  position: string;
}

// Mock Idaman users (Supervisors and Leaders only)
const idamanUsers: IdamanUser[] = [
  {
    id: 'supervisor_demo',
    name: 'Budi Santoso',
    email: 'supervisor1@pertamc.com',
    role: 'supervisor',
    organization: 'PertaMC',
    regionId: 'region1',
    regionName: 'Region 1 - Jawa Barat (includes Terminal 1)',
    position: 'Regional Supervisor'
  },
  {
    id: 'leader_demo',
    name: 'Diana Sari',
    email: 'leader1@pertamc.com',
    role: 'leader',
    organization: 'PertaMC',
    regionId: 'region1',
    regionName: 'Region 1 - Jawa Barat (oversees Terminal 1)',
    position: 'Regional Leader'
  }
];

const generateAuthCode = (userId: string): string => {
  const timestamp = Date.now();
  return `MOCK_IDAMAN_${timestamp}_${userId}`;
};

const generateState = (): string => {
  return `STATE_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

const generateNonce = (): string => {
  return `NONCE_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

const selectUser = (user: IdamanUser) => {
  // Generate mock authorization code with OIDC parameters
  const code = generateAuthCode(user.id);
  const state = generateState();
  const nonce = generateNonce();

  // Store state and nonce for validation (optional)
  sessionStorage.setItem('sso_state', state);
  sessionStorage.setItem('sso_nonce', nonce);

  // Redirect to callback with authorization code
  // Using query params to simulate OIDC callback
  router.push({
    path: '/auth/callback',
    query: {
      code,
      provider: 'idaman',
      state
    }
  });
};

const backToLogin = () => {
  router.push('/login');
};
</script>
