// Simple toast hook for notifications

import { ref } from 'vue';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const toasts = ref<(ToastOptions & { id: string })[]>([]);

export function useToast() {
  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toastItem = { ...options, id };
    
    toasts.value.push(toastItem);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.value.splice(index, 1);
      }
    }, 3000);
    
    // For now, just log to console
    console.log(`Toast: ${options.title}${options.description ? ' - ' + options.description : ''}`);
  };

  return {
    toast,
    toasts
  };
}