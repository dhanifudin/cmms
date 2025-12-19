<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to CMMS
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Computerized Maintenance Management System
        </p>
      </div>

      <div class="mt-8 space-y-6 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <!-- SSO Provider Buttons -->
        <div class="space-y-4">
          <button
            @click="handleSSOClick('talenta')"
            :disabled="isLoading"
            class="group w-full rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <div class="flex items-center justify-between px-4 py-3">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <img src="/logos/talenta-logo.svg" alt="Talenta" class="h-5 w-auto" />
                </div>
                <div class="text-left">
                  <div class="text-sm font-medium text-gray-900">Sign in with Talenta</div>
                  <div class="text-xs text-gray-500">For Workers and Admin</div>
                </div>
              </div>
              <div class="w-1 h-8 bg-talenta rounded-full"></div>
            </div>
          </button>

          <button
            @click="handleSSOClick('idaman')"
            :disabled="isLoading"
            class="group w-full rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <div class="flex items-center justify-between px-4 py-3">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <img src="/logos/idaman-logo.svg" alt="IdAMan" class="h-5 w-auto" />
                </div>
                <div class="text-left">
                  <div class="text-sm font-medium text-gray-900">Sign in with Idaman</div>
                  <div class="text-xs text-gray-500">For Supervisors and Leaders</div>
                </div>
              </div>
              <div class="w-1 h-8 bg-idaman rounded-full"></div>
            </div>
          </button>
        </div>

        <Alert v-if="error" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <!-- Demo Information -->
        <Alert class="mt-6 bg-white/95 border-gray-300">
          <Info class="h-4 w-4" />
          <AlertTitle>SSO Provider Information</AlertTitle>
          <AlertDescription>
            <div class="space-y-2 text-sm mt-2">
              <div>
                <strong class="text-[#E31E24]">Talenta (Mekari):</strong>
                <p class="ml-2 mt-1 text-gray-700">Workers and Admin users</p>
              </div>
              <div>
                <strong class="text-[#0066CC]">Idaman SSO:</strong>
                <p class="ml-2 mt-1 text-gray-700">Supervisors and Leaders</p>
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