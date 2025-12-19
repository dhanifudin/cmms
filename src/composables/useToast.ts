import { toast } from 'vue-sonner'

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    })
  }

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000, // Error messages stay longer
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    })
  }

  const warning = (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    })
  }

  const info = (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    })
  }

  const loading = (message: string, options?: Omit<ToastOptions, 'action'>) => {
    return toast.loading(message, {
      description: options?.description,
      duration: options?.duration
    })
  }

  const promise = <T>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage
    })
  }

  const dismiss = (id?: string) => {
    toast.dismiss(id)
  }

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    // Direct access to toast for custom use cases
    toast
  }
}