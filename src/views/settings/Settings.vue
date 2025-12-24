<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="text-sm text-gray-600">Manage your account preferences and notification settings</p>
      </div>
    </div>

    <!-- Settings Navigation Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="{
            'border-blue-500 text-blue-600': activeTab === tab.id,
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.id
          }"
        >
          <component :is="tab.icon" class="h-4 w-4 mr-2 inline" />
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              :value="currentUser?.name"
              type="text"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              :value="currentUser?.email"
              type="email"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              :value="currentUser?.role.toUpperCase()"
              type="text"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          
          <div v-if="currentUser?.terminalId">
            <label class="block text-sm font-medium text-gray-700 mb-1">Terminal</label>
            <input
              :value="`Terminal ${currentUser.terminalId.slice(-1)}`"
              type="text"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          
          <p class="text-sm text-gray-500 italic">
            Profile information is managed by your system administrator.
          </p>
        </form>
      </div>

      <!-- Preferences Tab -->
      <div v-else-if="activeTab === 'preferences'" class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">General Preferences</h2>
        
        <form @submit.prevent="savePreferences" class="space-y-6">
          <div>
            <h3 class="text-base font-medium text-gray-900 mb-4">Theme</h3>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="preferences.theme"
                  type="radio"
                  value="light"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Light Theme</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="preferences.theme"
                  type="radio"
                  value="dark"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Dark Theme (Coming Soon)</span>
              </label>
            </div>
          </div>
          
          <div>
            <h3 class="text-base font-medium text-gray-900 mb-4">Language</h3>
            <select
              v-model="preferences.language"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia (Coming Soon)</option>
            </select>
          </div>
          
          <div>
            <h3 class="text-base font-medium text-gray-900 mb-4">Date Format</h3>
            <select
              v-model="preferences.dateFormat"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
              <option value="dd/MM/yyyy">DD/MM/YYYY (International)</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
            </select>
          </div>
          
          <div class="flex justify-end">
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      <!-- About Tab -->
      <div v-else-if="activeTab === 'about'" class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">About CMMS</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-900">System Information</h3>
            <dl class="mt-2 space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-600">Version:</dt>
                <dd class="text-gray-900">1.0.0 (Prototype)</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Build:</dt>
                <dd class="text-gray-900">{{ new Date().getFullYear() }}.{{ new Date().getMonth() + 1 }}.{{ new Date().getDate() }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Environment:</dt>
                <dd class="text-gray-900">Development</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 class="text-base font-medium text-gray-900">Support</h3>
            <p class="mt-2 text-sm text-gray-600">
              For technical support or questions about this system, please contact your system administrator.
            </p>
          </div>
          
          <div>
            <h3 class="text-base font-medium text-gray-900">Features</h3>
            <ul class="mt-2 space-y-1 text-sm text-gray-600">
              <li>• Work Order Management</li>
              <li>• Inventory Tracking</li>
              <li>• Invoice Generation</li>
              <li>• Real-time Notifications</li>
              <li>• Photo Documentation</li>
              <li>• Role-based Access Control</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import {
  User as ProfileIcon,
  Settings as PreferencesIcon,
  Info as AboutIcon
} from 'lucide-vue-next';

const authStore = useAuthStore();

const activeTab = ref('profile');
const preferences = ref({
  theme: 'light',
  language: 'en',
  dateFormat: 'MM/dd/yyyy'
});

const currentUser = computed(() => authStore.currentUser);

const tabs = [
  { id: 'profile', name: 'Profile', icon: ProfileIcon },
  { id: 'preferences', name: 'Preferences', icon: PreferencesIcon },
  { id: 'about', name: 'About', icon: AboutIcon }
];

onMounted(async () => {
  // Initialize settings
});


const savePreferences = () => {
  // In a real app, this would save to backend
  console.log('Preferences saved successfully!');
};
</script>