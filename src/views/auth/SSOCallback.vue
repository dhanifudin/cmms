<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Loading State -->
      <div v-if="state === 'loading'" class="text-center">
        <div class="mb-6">
          <div v-if="provider === 'talenta'" class="flex items-center justify-center">
            <img src="/logos/talenta-logo.svg" alt="Talenta" class="h-16" />
          </div>
          <div v-else-if="provider === 'idaman'" class="flex items-center justify-center">
            <img src="/logos/idaman-logo.svg" alt="IdAMan" class="h-16" />
          </div>
        </div>

        <div class="flex justify-center mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2"
               :class="provider === 'talenta' ? 'border-[#E31E24]' : 'border-[#0066CC]'">
          </div>
        </div>

        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          Signing you in to CMMS
        </h2>
        <p class="text-sm text-gray-600">
          Please wait while we complete your authentication...
        </p>

        <div class="mt-6 w-full bg-gray-200 rounded-full h-2">
          <div class="h-2 rounded-full transition-all duration-1000"
               :class="provider === 'talenta' ? 'bg-[#E31E24]' : 'bg-[#0066CC]'"
               :style="{ width: progress + '%' }">
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="state === 'success'" class="text-center">
        <div class="mb-6 flex justify-center">
          <div class="rounded-full p-3"
               :class="provider === 'talenta' ? 'bg-[#E31E24]' : 'bg-[#0066CC]'">
            <svg class="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Success!
        </h2>
        <p class="text-sm text-gray-600">
          Welcome back, {{ userName }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Redirecting to dashboard...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="state === 'error'" class="text-center">
        <div class="mb-6 flex justify-center">
          <div class="rounded-full bg-red-100 p-3">
            <svg class="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Authentication Failed
        </h2>
        <p class="text-sm text-gray-600 mb-4">
          {{ errorMessage }}
        </p>

        <!-- Error Details (Collapsible) -->
        <div v-if="errorDetails" class="mb-6">
          <button
            @click="showDetails = !showDetails"
            class="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {{ showDetails ? 'Hide' : 'Show' }} technical details
          </button>
          <div v-if="showDetails" class="mt-2 p-3 bg-gray-100 rounded text-left">
            <p class="text-xs text-gray-700 font-mono">{{ errorDetails }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <Button
            @click="returnToLogin"
            class="w-full"
          >
            Return to Login
          </Button>
          <Button
            @click="tryAgain"
            variant="outline"
            class="w-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

type CallbackState = 'loading' | 'success' | 'error';

const state = ref<CallbackState>('loading');
const provider = ref<string>('');
const errorMessage = ref<string>('');
const errorDetails = ref<string>('');
const showDetails = ref<boolean>(false);
const userName = ref<string>('');
const progress = ref<number>(0);

onMounted(async () => {
  // Get parameters from URL
  const code = route.query.code as string;
  provider.value = route.query.provider as string;
  const stateParam = route.query.state as string;

  // Start progress animation
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10;
    }
  }, 150);

  try {
    // Validate required parameters
    if (!code) {
      throw new Error('Missing authorization code parameter');
    }

    if (!provider.value) {
      throw new Error('Missing provider parameter');
    }

    if (provider.value !== 'talenta' && provider.value !== 'idaman') {
      throw new Error(`Invalid provider: ${provider.value}`);
    }

    // Optional: Validate state token for CSRF protection
    const savedState = sessionStorage.getItem('sso_state');
    if (stateParam && savedState && stateParam !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Call auth store to process SSO callback
    const result = await authStore.handleSSOCallback(
      code,
      provider.value as 'talenta' | 'idaman'
    );

    // Complete progress
    progress.value = 100;
    clearInterval(progressInterval);

    if (result.success) {
      state.value = 'success';
      userName.value = result.user?.name || 'User';

      // Clear SSO state
      sessionStorage.removeItem('sso_state');
      sessionStorage.removeItem('sso_nonce');

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      throw new Error(result.error || 'Authentication failed');
    }
  } catch (error) {
    clearInterval(progressInterval);
    state.value = 'error';

    if (error instanceof Error) {
      errorMessage.value = getUserFriendlyError(error.message);
      errorDetails.value = error.message;
    } else {
      errorMessage.value = 'An unexpected error occurred during authentication';
      errorDetails.value = String(error);
    }

    // Clear SSO state on error
    sessionStorage.removeItem('sso_state');
    sessionStorage.removeItem('sso_nonce');

    console.error('SSO Callback Error:', error);
  }
});

const getUserFriendlyError = (technicalError: string): string => {
  const errorMap: Record<string, string> = {
    'Missing authorization code parameter': 'Invalid authentication response. Please try signing in again.',
    'Missing provider parameter': 'Authentication provider not specified. Please return to login.',
    'Invalid authorization code format': 'Invalid authentication code. Please sign in again.',
    'User not found': 'Your account was not found. Please contact support.',
    'Invalid state parameter': 'Session security check failed. Please start over.',
    'Malformed authorization code': 'Invalid authentication data received. Please try again.',
  };

  // Check for role-provider mismatch errors
  if (technicalError.includes('must use')) {
    return 'You selected the wrong sign-in provider for your role. Please use the correct provider.';
  }

  return errorMap[technicalError] || 'We couldn\'t sign you in. Please try again.';
};

const returnToLogin = () => {
  router.push('/login');
};

const tryAgain = () => {
  if (provider.value === 'talenta' || provider.value === 'idaman') {
    router.push(`/auth/sso/${provider.value}`);
  } else {
    router.push('/login');
  }
};
</script>
