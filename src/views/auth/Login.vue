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
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
        </div>
        
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
        
        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-blue-300 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
              </svg>
            </span>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
        
        <!-- Demo credentials -->
        <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 class="text-sm font-medium text-yellow-800 mb-2">Demo Credentials:</h4>
          <div class="space-y-1 text-xs text-yellow-700">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <strong>Admin:</strong><br>
                admin@terminal1.com
              </div>
              <div>
                <strong>Supervisor:</strong><br>
                supervisor@pertamc.com
              </div>
              <div>
                <strong>Worker:</strong><br>
                worker@terminal1.com
              </div>
              <div>
                <strong>Leader:</strong><br>
                leader@pertamc.com
              </div>
            </div>
            <p class="mt-2"><strong>Password for all:</strong> password</p>
          </div>
        </div>
        
        <!-- Quick login buttons -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button
            v-for="user in quickLoginUsers"
            :key="user.email"
            type="button"
            @click="quickLogin(user)"
            class="py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {{ user.role }} Demo
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const error = ref('');
const isLoading = ref(false);

const quickLoginUsers = [
  { email: 'admin@terminal1.com', role: 'Admin' },
  { email: 'supervisor@pertamc.com', role: 'Supervisor' },
  { email: 'worker@terminal1.com', role: 'Worker' },
  { email: 'leader@pertamc.com', role: 'Leader' }
];

const handleLogin = async () => {
  error.value = '';
  isLoading.value = true;
  
  try {
    const result = await authStore.login(form.value.email, form.value.password);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      error.value = result.error || 'Login failed';
    }
  } catch (err) {
    error.value = 'An unexpected error occurred';
  } finally {
    isLoading.value = false;
  }
};

const quickLogin = (user: { email: string; role: string }) => {
  form.value.email = user.email;
  form.value.password = 'password';
  handleLogin();
};

onMounted(() => {
  // Check if user is already authenticated
  authStore.checkAuth();
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});
</script>