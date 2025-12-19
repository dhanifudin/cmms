<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to CMMS
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Computerized Maintenance Management System
        </p>
      </div>

      <div class="mt-8 space-y-6">
        <!-- SSO Provider Buttons -->
        <div class="space-y-4">
          <button
            @click="handleSSOClick('talenta')"
            :disabled="isLoading"
            class="group w-full rounded-lg border-2 border-talenta bg-talenta hover:bg-talenta-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl"
          >
            <div class="flex items-center justify-between p-5">
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0 bg-white rounded-lg p-2 shadow-sm">
                  <img src="/logos/talenta-logo.svg" alt="Talenta" class="h-8 w-auto" />
                </div>
                <div class="text-left">
                  <div class="text-lg font-bold text-white">Sign in with Talenta</div>
                  <div class="text-sm text-white/90 mt-0.5">For Workers and Admin</div>
                </div>
              </div>
              <svg class="w-6 h-6 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            @click="handleSSOClick('idaman')"
            :disabled="isLoading"
            class="group w-full rounded-lg border-2 border-idaman bg-idaman hover:bg-idaman-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl"
          >
            <div class="flex items-center justify-between p-5">
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0 bg-white rounded-lg p-2 shadow-sm">
                  <img src="/logos/idaman-logo.svg" alt="IdAMan" class="h-8 w-auto" />
                </div>
                <div class="text-left">
                  <div class="text-lg font-bold text-white">Sign in with Idaman</div>
                  <div class="text-sm text-white/90 mt-0.5">For Supervisors and Leaders</div>
                </div>
              </div>
              <svg class="w-6 h-6 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <Alert v-if="error" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <!-- Demo Information -->
        <Alert class="mt-6">
          <Info class="h-4 w-4" />
          <AlertTitle>SSO Provider Information</AlertTitle>
          <AlertDescription>
            <div class="space-y-2 text-xs mt-2">
              <div>
                <strong class="text-[#E31E24]">Talenta (Mekari):</strong>
                <p class="ml-2 mt-1">Workers and Admin users</p>
              </div>
              <div>
                <strong class="text-[#0066CC]">Idaman SSO:</strong>
                <p class="ml-2 mt-1">Supervisors and Leaders</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const error = ref('');
const isLoading = ref(false);

const handleSSOClick = (provider: 'talenta' | 'idaman') => {
  error.value = '';
  isLoading.value = true;

  // Navigate to SSO provider page
  router.push(`/auth/sso/${provider}`);
};

onMounted(() => {
  // Check if user is already authenticated
  authStore.checkAuth();
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});
</script>