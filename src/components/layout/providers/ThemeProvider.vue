<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, isDark, setTheme, toggleTheme } = useTheme()

// Provide theme state and methods to child components
provide('theme', {
  theme,
  isDark,
  setTheme,
  toggleTheme
})
</script>