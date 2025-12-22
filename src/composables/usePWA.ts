// Enterprise-standard Progressive Web App features
import { ref, onMounted, onUnmounted } from 'vue';

export interface PWAConfig {
  // Installation
  enableInstallPrompt: boolean;
  installPromptDelay: number;
  
  // Offline support
  enableOfflineMode: boolean;
  offlineMessage: string;
  
  // Updates
  enableUpdateNotifications: boolean;
  updateCheckInterval: number;
  
  // Push notifications
  enablePushNotifications: boolean;
  vapidKey?: string;
  
  // Background sync
  enableBackgroundSync: boolean;
  
  // App-like behavior
  enableFullscreen: boolean;
  preventZoom: boolean;
}

export interface PWAState {
  // Installation
  isInstallable: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  
  // Network
  isOnline: boolean;
  isOffline: boolean;
  
  // Updates
  hasUpdate: boolean;
  isUpdating: boolean;
  
  // Notifications
  notificationPermission: NotificationPermission;
  pushSupported: boolean;
  
  // App state
  isStandalone: boolean;
  isFullscreen: boolean;
}

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DEFAULT_CONFIG: PWAConfig = {
  enableInstallPrompt: true,
  installPromptDelay: 5000,
  enableOfflineMode: true,
  offlineMessage: 'You are currently offline. Some features may not be available.',
  enableUpdateNotifications: true,
  updateCheckInterval: 60000, // 1 minute
  enablePushNotifications: false,
  enableBackgroundSync: false,
  enableFullscreen: false,
  preventZoom: true
};

export function usePWA(config: Partial<PWAConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const state = ref<PWAState>({
    isInstallable: false,
    isInstalled: false,
    canInstall: false,
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    hasUpdate: false,
    isUpdating: false,
    notificationPermission: 'default',
    pushSupported: false,
    isStandalone: false,
    isFullscreen: false
  });
  
  // Installation
  let installPromptEvent: InstallPromptEvent | null = null;
  let installPromptTimer: NodeJS.Timeout | null = null;
  
  // Service Worker
  let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  let updateCheckTimer: NodeJS.Timeout | null = null;
  
  // Callbacks
  const callbacks = {
    onInstallable: [] as Array<() => void>,
    onInstalled: [] as Array<() => void>,
    onOnline: [] as Array<() => void>,
    onOffline: [] as Array<() => void>,
    onUpdateAvailable: [] as Array<() => void>,
    onUpdateInstalled: [] as Array<() => void>,
    onNotificationPermissionChange: [] as Array<(permission: NotificationPermission) => void>
  };
  
  // Installation detection
  const detectInstallation = () => {
    // Check if app is installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         // @ts-ignore
                         window.navigator.standalone ||
                         document.referrer.includes('android-app://');
    
    state.value.isStandalone = isStandalone;
    state.value.isInstalled = isStandalone;
    
    // Check fullscreen
    state.value.isFullscreen = document.fullscreenElement !== null;
  };
  
  // Service Worker management
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      serviceWorkerRegistration = registration;
      
      // Check for updates
      if (mergedConfig.enableUpdateNotifications) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                state.value.hasUpdate = true;
                triggerCallbacks('onUpdateAvailable');
              }
            });
          }
        });
        
        // Start update check timer
        startUpdateChecker();
      }
      
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };
  
  const startUpdateChecker = () => {
    if (updateCheckTimer) clearInterval(updateCheckTimer);
    
    updateCheckTimer = setInterval(() => {
      if (serviceWorkerRegistration) {
        serviceWorkerRegistration.update();
      }
    }, mergedConfig.updateCheckInterval);
  };
  
  // Installation prompt
  const handleBeforeInstallPrompt = (event: Event) => {
    const e = event as InstallPromptEvent;
    e.preventDefault();
    installPromptEvent = e;
    state.value.isInstallable = true;
    state.value.canInstall = true;
    
    triggerCallbacks('onInstallable');
    
    // Show install prompt after delay if configured
    if (mergedConfig.enableInstallPrompt && mergedConfig.installPromptDelay > 0) {
      installPromptTimer = setTimeout(() => {
        showInstallPrompt();
      }, mergedConfig.installPromptDelay);
    }
  };
  
  const showInstallPrompt = async (): Promise<boolean> => {
    if (!installPromptEvent) {
      console.warn('Install prompt not available');
      return false;
    }
    
    try {
      await installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      
      if (choice.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        state.value.canInstall = false;
        installPromptEvent = null;
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  };
  
  const handleAppInstalled = () => {
    console.log('App was installed');
    state.value.isInstalled = true;
    state.value.canInstall = false;
    state.value.isInstallable = false;
    installPromptEvent = null;
    
    if (installPromptTimer) {
      clearTimeout(installPromptTimer);
      installPromptTimer = null;
    }
    
    triggerCallbacks('onInstalled');
  };
  
  // Network status
  const handleOnline = () => {
    state.value.isOnline = true;
    state.value.isOffline = false;
    triggerCallbacks('onOnline');
  };
  
  const handleOffline = () => {
    state.value.isOnline = false;
    state.value.isOffline = true;
    triggerCallbacks('onOffline');
  };
  
  // Notifications
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }
    
    try {
      const permission = await Notification.requestPermission();
      state.value.notificationPermission = permission;
      triggerCallbacks('onNotificationPermissionChange', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };
  
  const showNotification = (title: string, options: NotificationOptions = {}) => {
    if (state.value.notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }
    
    if (serviceWorkerRegistration) {
      serviceWorkerRegistration.showNotification(title, {
        badge: '/icons/badge-72x72.png',
        icon: '/icons/icon-192x192.png',
        ...options
      });
    } else {
      new Notification(title, options);
    }
  };
  
  // Push notifications
  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    if (!mergedConfig.enablePushNotifications || !mergedConfig.vapidKey) {
      console.warn('Push notifications not configured');
      return null;
    }
    
    if (!serviceWorkerRegistration) {
      console.warn('Service Worker not registered');
      return null;
    }
    
    try {
      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: mergedConfig.vapidKey
      });
      
      console.log('Push subscription successful');
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };
  
  // App behavior
  const enterFullscreen = async (): Promise<boolean> => {
    if (!mergedConfig.enableFullscreen || !document.documentElement.requestFullscreen) {
      return false;
    }
    
    try {
      await document.documentElement.requestFullscreen();
      state.value.isFullscreen = true;
      return true;
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      return false;
    }
  };
  
  const exitFullscreen = async (): Promise<boolean> => {
    if (!document.exitFullscreen) {
      return false;
    }
    
    try {
      await document.exitFullscreen();
      state.value.isFullscreen = false;
      return true;
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
      return false;
    }
  };
  
  const preventZoom = () => {
    if (!mergedConfig.preventZoom) return;
    
    // Prevent pinch zoom
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  };
  
  // Update management
  const applyUpdate = async (): Promise<boolean> => {
    if (!serviceWorkerRegistration || !state.value.hasUpdate) {
      return false;
    }
    
    state.value.isUpdating = true;
    
    try {
      const waitingWorker = serviceWorkerRegistration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for the controlling worker change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          state.value.isUpdating = false;
          state.value.hasUpdate = false;
          triggerCallbacks('onUpdateInstalled');
          
          // Reload the page to get the new version
          window.location.reload();
        });
        
        return true;
      }
      
      state.value.isUpdating = false;
      return false;
    } catch (error) {
      console.error('Error applying update:', error);
      state.value.isUpdating = false;
      return false;
    }
  };
  
  // Helper to trigger callbacks
  const triggerCallbacks = (type: keyof typeof callbacks, data?: any) => {
    callbacks[type].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.warn(`PWA callback error for ${type}:`, error);
      }
    });
  };
  
  // Public API for registering callbacks
  const onInstallable = (callback: () => void) => {
    callbacks.onInstallable.push(callback);
    return () => {
      const index = callbacks.onInstallable.indexOf(callback);
      if (index > -1) callbacks.onInstallable.splice(index, 1);
    };
  };
  
  const onInstalled = (callback: () => void) => {
    callbacks.onInstalled.push(callback);
    return () => {
      const index = callbacks.onInstalled.indexOf(callback);
      if (index > -1) callbacks.onInstalled.splice(index, 1);
    };
  };
  
  const onOnline = (callback: () => void) => {
    callbacks.onOnline.push(callback);
    return () => {
      const index = callbacks.onOnline.indexOf(callback);
      if (index > -1) callbacks.onOnline.splice(index, 1);
    };
  };
  
  const onOffline = (callback: () => void) => {
    callbacks.onOffline.push(callback);
    return () => {
      const index = callbacks.onOffline.indexOf(callback);
      if (index > -1) callbacks.onOffline.splice(index, 1);
    };
  };
  
  const onUpdateAvailable = (callback: () => void) => {
    callbacks.onUpdateAvailable.push(callback);
    return () => {
      const index = callbacks.onUpdateAvailable.indexOf(callback);
      if (index > -1) callbacks.onUpdateAvailable.splice(index, 1);
    };
  };
  
  const onUpdateInstalled = (callback: () => void) => {
    callbacks.onUpdateInstalled.push(callback);
    return () => {
      const index = callbacks.onUpdateInstalled.indexOf(callback);
      if (index > -1) callbacks.onUpdateInstalled.splice(index, 1);
    };
  };
  
  const onNotificationPermissionChange = (callback: (permission: NotificationPermission) => void) => {
    callbacks.onNotificationPermissionChange.push(callback);
    return () => {
      const index = callbacks.onNotificationPermissionChange.indexOf(callback);
      if (index > -1) callbacks.onNotificationPermissionChange.splice(index, 1);
    };
  };
  
  // Lifecycle
  onMounted(() => {
    // Initialize detection
    detectInstallation();
    
    // Check notification support and permission
    if ('Notification' in window) {
      state.value.notificationPermission = Notification.permission;
    }
    
    // Check push notification support
    state.value.pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    
    // Register Service Worker
    registerServiceWorker();
    
    // Set up event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Fullscreen change detection
    document.addEventListener('fullscreenchange', () => {
      state.value.isFullscreen = document.fullscreenElement !== null;
    });
    
    // Prevent zoom if configured
    preventZoom();
  });
  
  onUnmounted(() => {
    // Clean up event listeners
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    
    // Clear timers
    if (installPromptTimer) {
      clearTimeout(installPromptTimer);
    }
    
    if (updateCheckTimer) {
      clearInterval(updateCheckTimer);
    }
  });
  
  return {
    // State
    state,
    
    // Installation
    showInstallPrompt,
    
    // Notifications
    requestNotificationPermission,
    showNotification,
    subscribeToPush,
    
    // App behavior
    enterFullscreen,
    exitFullscreen,
    
    // Updates
    applyUpdate,
    
    // Event registration
    onInstallable,
    onInstalled,
    onOnline,
    onOffline,
    onUpdateAvailable,
    onUpdateInstalled,
    onNotificationPermissionChange
  };
}

// Specialized composable for data management apps
export function useDataAppPWA() {
  return usePWA({
    enableInstallPrompt: true,
    installPromptDelay: 10000, // Show after 10 seconds
    enableOfflineMode: true,
    enableUpdateNotifications: true,
    updateCheckInterval: 300000, // Check every 5 minutes
    preventZoom: true
  });
}