<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all"
    @click="focusMain"
  >
    Skip to main content
  </a>
</template>

<script setup lang="ts">
const focusMain = () => {
  // Focus the main content area when skip link is activated
  setTimeout(() => {
    const main = document.getElementById('main-content')
    if (main) {
      main.focus()
      main.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}
</script>

<style scoped>
/* Screen reader only class that becomes visible on focus */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.focus\:not-sr-only:focus {
  position: static !important;
  width: auto !important;
  height: auto !important;
  padding: 0.5rem 1rem !important;
  margin: 0 !important;
  overflow: visible !important;
  clip: auto !important;
  white-space: normal !important;
}
</style>