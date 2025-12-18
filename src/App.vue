<template>
  <div id="app">
    <router-view v-if="showLogin" />
    <AppLayout v-else>
      <router-view />
    </AppLayout>
    
    <!-- Global notification toasts -->
    <NotificationToast />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/components/layout/AppLayout.vue';
import NotificationToast from '@/components/notifications/NotificationToast.vue';

const route = useRoute();
const authStore = useAuthStore();

const showLogin = computed(() => {
  return route.name === 'Login' || !authStore.isAuthenticated;
});

onMounted(() => {
  authStore.checkAuth();
});
</script>
