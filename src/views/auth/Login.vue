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
          <div class="space-y-2">
            <Label for="email">Email address</Label>
            <Input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              placeholder="Enter your email"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="Enter your password"
            />
          </div>
        </div>

        <Alert v-if="error" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <Button
          type="submit"
          :disabled="isLoading"
          class="w-full"
        >
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </Button>

        <!-- Demo credentials -->
        <Alert class="mt-6">
          <Info class="h-4 w-4" />
          <AlertTitle>Demo Credentials</AlertTitle>
          <AlertDescription>
            <div class="space-y-1 text-xs mt-2">
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
          </AlertDescription>
        </Alert>

        <!-- Quick login buttons -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <Button
            v-for="user in quickLoginUsers"
            :key="user.email"
            type="button"
            variant="outline"
            @click="quickLogin(user)"
          >
            {{ user.role }} Demo
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Info } from 'lucide-vue-next';

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