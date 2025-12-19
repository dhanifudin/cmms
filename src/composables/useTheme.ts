import { ref, computed, watch } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'

export type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const preferredDark = usePreferredDark()
  const storedTheme = useLocalStorage<Theme>('theme', 'system')
  
  const theme = ref<Theme>(storedTheme.value)

  const isDark = computed(() => {
    if (theme.value === 'system') {
      return preferredDark.value
    }
    return theme.value === 'dark'
  })

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    storedTheme.value = newTheme
    applyTheme()
  }

  const toggleTheme = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const applyTheme = () => {
    const root = document.documentElement
    
    if (isDark.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Apply theme on mount and when it changes
  watch(isDark, applyTheme, { immediate: true })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  }
}