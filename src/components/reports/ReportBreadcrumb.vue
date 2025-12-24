<template>
  <nav class="flex items-center space-x-2 text-sm" aria-label="Report navigation">
    <!-- Home/Reports link -->
    <router-link
      to="/reports"
      class="text-gray-500 hover:text-gray-700 transition-colors"
    >
      <FileText class="h-4 w-4" />
    </router-link>

    <template v-for="(item, index) in items" :key="item.path">
      <ChevronRight class="h-4 w-4 text-gray-400 flex-shrink-0" />

      <!-- Clickable link for non-current items -->
      <router-link
        v-if="index < items.length - 1"
        :to="item.path"
        class="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[150px]"
        :title="item.label"
      >
        {{ item.label }}
      </router-link>

      <!-- Current item (not clickable) -->
      <span
        v-else
        class="text-gray-900 font-medium truncate max-w-[200px]"
        :title="item.label"
      >
        {{ item.label }}
      </span>
    </template>

    <!-- Drill level indicator badge -->
    <span
      v-if="currentLevel"
      class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
    >
      {{ formatLevel(currentLevel) }}
    </span>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronRight, FileText } from 'lucide-vue-next';

export interface BreadcrumbItem {
  label: string;
  path: string;
  level?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const props = defineProps<Props>();

const currentLevel = computed(() => {
  if (props.items.length === 0) return null;
  const lastItem = props.items[props.items.length - 1];
  return lastItem?.level ?? null;
});

const formatLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    'all': 'All Regions',
    'region': 'Region View',
    'terminal': 'Terminal View',
    'worker': 'Worker View',
    'workorder': 'Work Order'
  };
  return levelMap[level] || level;
};
</script>
