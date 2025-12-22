<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full">
      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-xl border border-gray-200 p-8 sm:p-10">
        <!-- Mekari/Talenta Logo and Header -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-4">
            <img src="/logos/talenta-logo.svg" alt="Talenta" class="h-12" />
          </div>
          <h2 class="text-2xl font-bold text-[#212121]">Sign in to Talenta</h2>
          <p class="mt-2 text-sm text-[#777]">
            Satu akun untuk Jurnal, Klikpajak, Talenta dan Qontak
          </p>
          <p class="mt-1 text-sm text-[#777]">
            Select your account to continue to CMMS
          </p>
        </div>

        <!-- User Selection Grid -->
        <div class="space-y-3 mb-6">
          <button
            v-for="user in talentaUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-talenta hover:bg-gray-50 transition-all duration-200 text-left flex items-center space-x-4 group shadow-sm hover:shadow-md"
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
                  :class="user.role === 'admin'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-orange-50 text-orange-700 border border-orange-200'"
                >
                  {{ user.role === 'admin' ? 'Admin' : 'Worker' }}
                </span>
              </div>
              <p class="text-xs text-gray-600">{{ user.email }}</p>
              <p class="text-xs text-gray-500">{{ user.terminalName }}</p>
            </div>

            <!-- Brand Accent -->
            <div class="flex-shrink-0">
              <div class="w-1 h-12 bg-talenta rounded-full"></div>
            </div>
          </button>
        </div>

        <!-- Back to Login Button -->
        <div class="text-center">
          <button
            @click="backToLogin"
            class="px-6 py-2.5 bg-white border-2 border-gray-300 hover:border-talenta text-gray-700 hover:text-talenta font-medium rounded-lg transition-all duration-200 hover:bg-talenta-light"
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
        <p class="text-sm font-medium text-gray-700">
          © 2025 PT Mid Solusi Nusantara
        </p>
        <div class="mt-2 flex items-center justify-center space-x-4 text-xs">
          <a href="#" class="text-talenta hover:underline font-medium">Privacy Policy</a>
          <span class="text-gray-400">•</span>
          <a href="#" class="text-talenta hover:underline font-medium">Terms of Service</a>
          <span class="text-gray-400">•</span>
          <button class="text-talenta hover:underline font-medium">English</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

interface TalentaUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'worker';
  terminalId: string;
  terminalName: string;
  regionId: string;
}

// Demo Talenta users - all at Terminal 1 for consistency
const talentaUsers: TalentaUser[] = [
  {
    id: 'admin_demo',
    name: 'Ahmad Sutrisno',
    email: 'admin1@terminal1.com',
    role: 'admin',
    terminalId: 'terminal1',
    terminalName: 'Terminal 1 - Jakarta',
    regionId: 'region1'
  },
  {
    id: 'worker_demo',
    name: 'Candra Wijaya',
    email: 'candra.wijaya@terminal1.com',
    role: 'worker',
    terminalId: 'terminal1',
    terminalName: 'Terminal 1 - Jakarta (has ongoing work orders)',
    regionId: 'region1'
  }
];

const generateAuthCode = (userId: string): string => {
  const timestamp = Date.now();
  return `MOCK_TALENTA_${timestamp}_${userId}`;
};

const generateState = (): string => {
  return `STATE_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

const selectUser = (user: TalentaUser) => {
  // Generate mock authorization code
  const code = generateAuthCode(user.id);
  const state = generateState();

  // Store state for validation (optional)
  sessionStorage.setItem('sso_state', state);

  // Redirect to callback with authorization code
  router.push({
    path: '/auth/callback',
    query: {
      code,
      provider: 'talenta',
      state
    }
  });
};

const backToLogin = () => {
  router.push('/login');
};
</script>
