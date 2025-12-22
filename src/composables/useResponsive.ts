// Enterprise-standard responsive design composable
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export interface ResponsiveBreakpoints {
  xs: number;    // Extra small devices (phones)
  sm: number;    // Small devices (tablets)
  md: number;    // Medium devices (small laptops)
  lg: number;    // Large devices (desktops)
  xl: number;    // Extra large devices (large desktops)
  '2xl': number; // 2X Large devices (very large desktops)
}

export interface ResponsiveConfig {
  breakpoints: ResponsiveBreakpoints;
  debounceDelay: number;
  useMatchMedia: boolean;
  enableOrientationDetection: boolean;
  enableTouchDetection: boolean;
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 475,    // Mobile phones
  sm: 640,    // Large phones / small tablets
  md: 768,    // Tablets
  lg: 1024,   // Small laptops
  xl: 1280,   // Large laptops / desktops
  '2xl': 1536 // Large desktops
};

const DEFAULT_CONFIG: ResponsiveConfig = {
  breakpoints: DEFAULT_BREAKPOINTS,
  debounceDelay: 100,
  useMatchMedia: true,
  enableOrientationDetection: true,
  enableTouchDetection: true
};

export function useResponsive(config: Partial<ResponsiveConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const windowWidth = ref(0);
  const windowHeight = ref(0);
  const orientation = ref<'portrait' | 'landscape'>('portrait');
  const isTouch = ref(false);
  
  // Debounced resize handler
  let resizeTimeoutId: NodeJS.Timeout | null = null;
  
  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
      
      if (mergedConfig.enableOrientationDetection) {
        orientation.value = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      }
    }
  };
  
  const debouncedUpdate = () => {
    if (resizeTimeoutId) {
      clearTimeout(resizeTimeoutId);
    }
    
    resizeTimeoutId = setTimeout(() => {
      updateDimensions();
    }, mergedConfig.debounceDelay);
  };
  
  // Touch detection
  const detectTouch = () => {
    if (!mergedConfig.enableTouchDetection || typeof window === 'undefined') {
      return false;
    }
    
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
  };
  
  // Platform detection
  const detectPlatform = (): DeviceInfo['platform'] => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 'unknown';
    }
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    
    if (/android/.test(userAgent)) {
      return 'android';
    }
    
    return 'desktop';
  };
  
  // Breakpoint checks
  const isExtraSmall = computed(() => windowWidth.value < mergedConfig.breakpoints.xs);
  const isSmall = computed(() => windowWidth.value >= mergedConfig.breakpoints.xs && windowWidth.value < mergedConfig.breakpoints.sm);
  const isMedium = computed(() => windowWidth.value >= mergedConfig.breakpoints.sm && windowWidth.value < mergedConfig.breakpoints.md);
  const isLarge = computed(() => windowWidth.value >= mergedConfig.breakpoints.md && windowWidth.value < mergedConfig.breakpoints.lg);
  const isExtraLarge = computed(() => windowWidth.value >= mergedConfig.breakpoints.lg && windowWidth.value < mergedConfig.breakpoints.xl);
  const is2ExtraLarge = computed(() => windowWidth.value >= mergedConfig.breakpoints.xl);
  
  // Device type detection
  const isMobile = computed(() => windowWidth.value < mergedConfig.breakpoints.md);
  const isTablet = computed(() => 
    windowWidth.value >= mergedConfig.breakpoints.md && 
    windowWidth.value < mergedConfig.breakpoints.lg &&
    isTouch.value
  );
  const isDesktop = computed(() => windowWidth.value >= mergedConfig.breakpoints.lg);
  
  // Screen size categories
  const screenSize = computed(() => {
    if (isExtraSmall.value) return 'xs';
    if (isSmall.value) return 'sm';
    if (isMedium.value) return 'md';
    if (isLarge.value) return 'lg';
    if (isExtraLarge.value) return 'xl';
    return '2xl';
  });
  
  // Device information
  const deviceInfo = computed<DeviceInfo>(() => ({
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    isDesktop: isDesktop.value,
    isTouch: isTouch.value,
    orientation: orientation.value,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    platform: detectPlatform()
  }));
  
  // Utility functions
  const isBreakpointAndUp = (breakpoint: keyof ResponsiveBreakpoints) => {
    return computed(() => windowWidth.value >= mergedConfig.breakpoints[breakpoint]);
  };
  
  const isBreakpointAndDown = (breakpoint: keyof ResponsiveBreakpoints) => {
    return computed(() => windowWidth.value <= mergedConfig.breakpoints[breakpoint]);
  };
  
  const isBetweenBreakpoints = (min: keyof ResponsiveBreakpoints, max: keyof ResponsiveBreakpoints) => {
    return computed(() => 
      windowWidth.value >= mergedConfig.breakpoints[min] && 
      windowWidth.value < mergedConfig.breakpoints[max]
    );
  };
  
  // Grid system helpers
  const getResponsiveColumns = (
    mobile: number = 1,
    tablet: number = 2,
    desktop: number = 3,
    largeDesktop: number = 4
  ) => {
    return computed(() => {
      if (isMobile.value) return mobile;
      if (isTablet.value) return tablet;
      if (isDesktop.value && windowWidth.value < mergedConfig.breakpoints.xl) return desktop;
      return largeDesktop;
    });
  };
  
  const getResponsiveValue = <T>(values: Partial<Record<keyof ResponsiveBreakpoints | 'default', T>>): T | undefined => {
    const size = screenSize.value as keyof ResponsiveBreakpoints;
    
    // Ensure size is valid
    if (!size) {
      return values.default;
    }
    
    // Check for exact match first
    if (values[size] !== undefined) {
      return values[size];
    }
    
    // Fallback to smaller breakpoints
    const fallbackOrder: (keyof ResponsiveBreakpoints)[] = ['xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = fallbackOrder.indexOf(size);
    
    if (currentIndex === -1) {
      return values.default;
    }
    
    for (let i = currentIndex; i < fallbackOrder.length; i++) {
      const key = fallbackOrder[i];
      if (key && values[key] !== undefined) {
        return values[key];
      }
    }
    
    // Final fallback to default
    return values.default;
  };
  
  // Media query helpers (if matchMedia is supported)
  const createMediaQuery = (query: string): Ref<boolean> => {
    const matches = ref(false);
    
    if (typeof window !== 'undefined' && mergedConfig.useMatchMedia && window.matchMedia) {
      const mediaQuery = window.matchMedia(query);
      matches.value = mediaQuery.matches;
      
      const handler = (e: MediaQueryListEvent) => {
        matches.value = e.matches;
      };
      
      mediaQuery.addListener(handler);
      
      // Cleanup function will be called on unmount
      onUnmounted(() => {
        mediaQuery.removeListener(handler);
      });
    }
    
    return matches;
  };
  
  // Predefined media queries
  const prefersDarkMode = createMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = createMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersHighContrast = createMediaQuery('(prefers-contrast: high)');
  
  // Container query helper for data tables
  const getTableLayout = () => {
    return computed(() => {
      if (windowWidth.value < 640) return 'cards';
      if (windowWidth.value < 1024) return 'compact';
      return 'full';
    });
  };
  
  // Pagination size helper
  const getOptimalPageSize = () => {
    return computed(() => {
      if (isMobile.value) return 10;
      if (isTablet.value) return 25;
      return 50;
    });
  };
  
  // Event handlers
  const handleResize = () => {
    debouncedUpdate();
  };
  
  const handleOrientationChange = () => {
    // Small delay to allow browser to update dimensions
    setTimeout(() => {
      updateDimensions();
    }, 100);
  };
  
  // Lifecycle
  onMounted(() => {
    if (typeof window !== 'undefined') {
      // Initial setup
      updateDimensions();
      isTouch.value = detectTouch();
      
      // Event listeners
      window.addEventListener('resize', handleResize, { passive: true });
      
      if (mergedConfig.enableOrientationDetection) {
        window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
      }
    }
  });
  
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
      
      if (mergedConfig.enableOrientationDetection) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    }
    
    if (resizeTimeoutId) {
      clearTimeout(resizeTimeoutId);
    }
  });
  
  return {
    // State
    windowWidth,
    windowHeight,
    orientation,
    isTouch,
    
    // Breakpoint checks
    isExtraSmall,
    isSmall,
    isMedium,
    isLarge,
    isExtraLarge,
    is2ExtraLarge,
    
    // Device types
    isMobile,
    isTablet,
    isDesktop,
    
    // Computed
    screenSize,
    deviceInfo,
    
    // Media queries
    prefersDarkMode,
    prefersReducedMotion,
    prefersHighContrast,
    
    // Utility functions
    isBreakpointAndUp,
    isBreakpointAndDown,
    isBetweenBreakpoints,
    getResponsiveColumns,
    getResponsiveValue,
    createMediaQuery,
    
    // Specialized helpers
    getTableLayout,
    getOptimalPageSize,
    
    // Manual update
    updateDimensions
  };
}

// Hook for getting current breakpoint
export function useBreakpoint() {
  const { screenSize, isMobile, isTablet, isDesktop } = useResponsive();
  
  return {
    current: screenSize,
    isMobile,
    isTablet,
    isDesktop
  };
}

// Hook for responsive grid columns
export function useResponsiveGrid(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
  largeDesktop: number = 4
) {
  const { getResponsiveColumns } = useResponsive();
  
  return getResponsiveColumns(mobile, tablet, desktop, largeDesktop);
}