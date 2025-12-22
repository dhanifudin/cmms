<template>
  <div id="app">
    <router-view v-if="showLogin" />
    <AuthenticatedLayout v-else>
      <router-view />
    </AuthenticatedLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout.vue';

const route = useRoute();
const authStore = useAuthStore();

const showLogin = computed(() => {
  return route.name === 'Login' || 
         route.name === 'TalentaSSO' || 
         route.name === 'IdamanSSO' || 
         route.name === 'SSOCallback' || 
         !authStore.isAuthenticated;
});

onMounted(() => {
  // Only check auth if not on login-related pages
  if (!showLogin.value) {
    authStore.checkAuth();
  }
});
</script>
