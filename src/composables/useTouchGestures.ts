// Enterprise-standard touch gesture handling for mobile interfaces
import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export interface TouchGestureConfig {
  // Swipe detection
  swipeThreshold: number;      // Minimum distance for swipe
  swipeVelocity: number;       // Minimum velocity for swipe
  swipeMaxTime: number;        // Maximum time for swipe gesture
  
  // Pull to refresh
  pullToRefreshThreshold: number;  // Distance to trigger refresh
  pullToRefreshEnabled: boolean;
  
  // Long press
  longPressDelay: number;      // Time to trigger long press
  longPressEnabled: boolean;
  
  // Tap detection
  doubleTapDelay: number;      // Max time between taps for double tap
  tapThreshold: number;        // Max movement for tap
  
  // Pinch/zoom (for future use)
  pinchEnabled: boolean;
  
  // Scroll behavior
  preventOverscroll: boolean;
  elasticScroll: boolean;
}

export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

export interface TouchGestureState {
  isPressed: boolean;
  isSwiping: boolean;
  isPulling: boolean;
  isLongPressing: boolean;
  pullDistance: number;
  swipeDirection: SwipeEvent['direction'] | null;
}

const DEFAULT_CONFIG: TouchGestureConfig = {
  swipeThreshold: 50,
  swipeVelocity: 0.3,
  swipeMaxTime: 300,
  pullToRefreshThreshold: 80,
  pullToRefreshEnabled: true,
  longPressDelay: 500,
  longPressEnabled: true,
  doubleTapDelay: 300,
  tapThreshold: 10,
  pinchEnabled: false,
  preventOverscroll: true,
  elasticScroll: false
};

export function useTouchGestures(
  element: Ref<HTMLElement | null> | HTMLElement | null,
  config: Partial<TouchGestureConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const state = ref<TouchGestureState>({
    isPressed: false,
    isSwiping: false,
    isPulling: false,
    isLongPressing: false,
    pullDistance: 0,
    swipeDirection: null
  });
  
  // Touch tracking
  let startPosition: TouchPosition | null = null;
  let currentPosition: TouchPosition | null = null;
  let longPressTimer: NodeJS.Timeout | null = null;
  let lastTapTime = 0;
  let tapCount = 0;
  
  // Callbacks
  const callbacks = {
    onSwipe: [] as Array<(event: SwipeEvent) => void>,
    onSwipeLeft: [] as Array<(event: SwipeEvent) => void>,
    onSwipeRight: [] as Array<(event: SwipeEvent) => void>,
    onSwipeUp: [] as Array<(event: SwipeEvent) => void>,
    onSwipeDown: [] as Array<(event: SwipeEvent) => void>,
    onPullToRefresh: [] as Array<() => void>,
    onLongPress: [] as Array<(position: TouchPosition) => void>,
    onTap: [] as Array<(position: TouchPosition) => void>,
    onDoubleTap: [] as Array<(position: TouchPosition) => void>,
    onTouchStart: [] as Array<(position: TouchPosition) => void>,
    onTouchEnd: [] as Array<(position: TouchPosition) => void>
  };
  
  // Utility functions
  const getDistance = (start: TouchPosition, end: TouchPosition): number => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const getVelocity = (start: TouchPosition, end: TouchPosition): number => {
    const distance = getDistance(start, end);
    const time = end.timestamp - start.timestamp;
    return time > 0 ? distance / time : 0;
  };
  
  const getSwipeDirection = (start: TouchPosition, end: TouchPosition): SwipeEvent['direction'] => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };
  
  const getTouchPosition = (touch: Touch): TouchPosition => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  });
  
  const isScrollableElement = (el: Element): boolean => {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
  };
  
  const canElementScroll = (el: Element, direction: 'up' | 'down'): boolean => {
    if (!isScrollableElement(el)) return false;
    
    if (direction === 'up') {
      return el.scrollTop > 0;
    } else {
      return el.scrollTop < el.scrollHeight - el.clientHeight;
    }
  };
  
  const shouldPreventDefault = (direction: SwipeEvent['direction']): boolean => {
    if (!mergedConfig.preventOverscroll) return false;
    
    const targetElement = getElementRef();
    if (!targetElement) return false;
    
    // Find scrollable parent
    let scrollParent = targetElement.parentElement;
    while (scrollParent && !isScrollableElement(scrollParent)) {
      scrollParent = scrollParent.parentElement;
    }
    
    if (!scrollParent) return false;
    
    // Check if we should prevent based on scroll position
    if (direction === 'up' && !canElementScroll(scrollParent, 'up')) {
      return true; // Prevent pull-to-refresh at top
    }
    
    if (direction === 'down' && !canElementScroll(scrollParent, 'down')) {
      return true; // Prevent overscroll at bottom
    }
    
    return false;
  };
  
  // Event handlers
  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    if (!touch) return;
    
    startPosition = getTouchPosition(touch);
    currentPosition = startPosition;
    
    state.value.isPressed = true;
    state.value.isSwiping = false;
    state.value.swipeDirection = null;
    
    // Start long press timer
    if (mergedConfig.longPressEnabled) {
      longPressTimer = setTimeout(() => {
        if (state.value.isPressed && startPosition) {
          state.value.isLongPressing = true;
          triggerCallbacks('onLongPress', startPosition);
        }
      }, mergedConfig.longPressDelay);
    }
    
    triggerCallbacks('onTouchStart', startPosition);
  };
  
  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length !== 1 || !startPosition) return;
    
    const touch = event.touches[0];
    if (!touch) return;
    
    currentPosition = getTouchPosition(touch);
    
    const distance = getDistance(startPosition, currentPosition);
    const direction = getSwipeDirection(startPosition, currentPosition);
    
    // Clear long press if moved too much
    if (distance > mergedConfig.tapThreshold && longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
      state.value.isLongPressing = false;
    }
    
    // Handle pull to refresh
    if (mergedConfig.pullToRefreshEnabled && direction === 'down') {
      const pullDistance = currentPosition.y - startPosition.y;
      
      if (pullDistance > 0) {
        state.value.isPulling = true;
        state.value.pullDistance = Math.min(pullDistance, mergedConfig.pullToRefreshThreshold * 2);
        
        // Prevent default scroll behavior
        if (shouldPreventDefault(direction)) {
          event.preventDefault();
        }
      }
    }
    
    // Handle swipe detection
    if (distance > mergedConfig.swipeThreshold) {
      state.value.isSwiping = true;
      state.value.swipeDirection = direction;
      
      // Prevent default for horizontal swipes to avoid back navigation
      if ((direction === 'left' || direction === 'right') && 
          mergedConfig.preventOverscroll) {
        event.preventDefault();
      }
    }
  };
  
  const handleTouchEnd = (event: TouchEvent) => {
    if (!startPosition || !currentPosition) return;
    
    const endPosition = currentPosition;
    const distance = getDistance(startPosition, endPosition);
    const duration = endPosition.timestamp - startPosition.timestamp;
    const velocity = getVelocity(startPosition, endPosition);
    
    // Clear timers
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    
    // Handle pull to refresh
    if (state.value.isPulling && 
        state.value.pullDistance >= mergedConfig.pullToRefreshThreshold) {
      triggerCallbacks('onPullToRefresh');
    }
    
    // Handle swipe
    if (state.value.isSwiping && 
        distance >= mergedConfig.swipeThreshold &&
        velocity >= mergedConfig.swipeVelocity &&
        duration <= mergedConfig.swipeMaxTime) {
      
      const direction = getSwipeDirection(startPosition, endPosition);
      const swipeEvent: SwipeEvent = {
        direction,
        distance,
        velocity,
        duration,
        startX: startPosition.x,
        startY: startPosition.y,
        endX: endPosition.x,
        endY: endPosition.y
      };
      
      triggerCallbacks('onSwipe', swipeEvent);
      triggerCallbacks(`onSwipe${direction.charAt(0).toUpperCase() + direction.slice(1)}` as keyof typeof callbacks, swipeEvent);
    }
    
    // Handle tap/double tap
    if (!state.value.isSwiping && !state.value.isLongPressing && 
        distance <= mergedConfig.tapThreshold) {
      
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime;
      
      if (timeSinceLastTap <= mergedConfig.doubleTapDelay) {
        tapCount++;
      } else {
        tapCount = 1;
      }
      
      lastTapTime = now;
      
      if (tapCount === 1) {
        // Single tap (with delay to check for double tap)
        setTimeout(() => {
          if (tapCount === 1) {
            triggerCallbacks('onTap', endPosition);
          }
        }, mergedConfig.doubleTapDelay);
      } else if (tapCount === 2) {
        // Double tap
        triggerCallbacks('onDoubleTap', endPosition);
        tapCount = 0;
      }
    }
    
    // Reset state
    state.value.isPressed = false;
    state.value.isSwiping = false;
    state.value.isPulling = false;
    state.value.isLongPressing = false;
    state.value.pullDistance = 0;
    state.value.swipeDirection = null;
    
    startPosition = null;
    currentPosition = null;
    
    triggerCallbacks('onTouchEnd', endPosition);
  };
  
  const handleTouchCancel = () => {
    // Reset everything on cancel
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    
    state.value.isPressed = false;
    state.value.isSwiping = false;
    state.value.isPulling = false;
    state.value.isLongPressing = false;
    state.value.pullDistance = 0;
    state.value.swipeDirection = null;
    
    startPosition = null;
    currentPosition = null;
  };
  
  // Helper to trigger callbacks
  const triggerCallbacks = (type: keyof typeof callbacks, data?: any) => {
    callbacks[type].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.warn(`Touch gesture callback error for ${type}:`, error);
      }
    });
  };
  
  // Get element reference
  const getElementRef = (): HTMLElement | null => {
    if (element === null) return null;
    if ('value' in element) return element.value;
    return element;
  };
  
  // Public API for registering callbacks
  const onSwipe = (callback: (event: SwipeEvent) => void) => {
    callbacks.onSwipe.push(callback);
    return () => {
      const index = callbacks.onSwipe.indexOf(callback);
      if (index > -1) callbacks.onSwipe.splice(index, 1);
    };
  };
  
  const onSwipeLeft = (callback: (event: SwipeEvent) => void) => {
    callbacks.onSwipeLeft.push(callback);
    return () => {
      const index = callbacks.onSwipeLeft.indexOf(callback);
      if (index > -1) callbacks.onSwipeLeft.splice(index, 1);
    };
  };
  
  const onSwipeRight = (callback: (event: SwipeEvent) => void) => {
    callbacks.onSwipeRight.push(callback);
    return () => {
      const index = callbacks.onSwipeRight.indexOf(callback);
      if (index > -1) callbacks.onSwipeRight.splice(index, 1);
    };
  };
  
  const onSwipeUp = (callback: (event: SwipeEvent) => void) => {
    callbacks.onSwipeUp.push(callback);
    return () => {
      const index = callbacks.onSwipeUp.indexOf(callback);
      if (index > -1) callbacks.onSwipeUp.splice(index, 1);
    };
  };
  
  const onSwipeDown = (callback: (event: SwipeEvent) => void) => {
    callbacks.onSwipeDown.push(callback);
    return () => {
      const index = callbacks.onSwipeDown.indexOf(callback);
      if (index > -1) callbacks.onSwipeDown.splice(index, 1);
    };
  };
  
  const onPullToRefresh = (callback: () => void) => {
    callbacks.onPullToRefresh.push(callback);
    return () => {
      const index = callbacks.onPullToRefresh.indexOf(callback);
      if (index > -1) callbacks.onPullToRefresh.splice(index, 1);
    };
  };
  
  const onLongPress = (callback: (position: TouchPosition) => void) => {
    callbacks.onLongPress.push(callback);
    return () => {
      const index = callbacks.onLongPress.indexOf(callback);
      if (index > -1) callbacks.onLongPress.splice(index, 1);
    };
  };
  
  const onTap = (callback: (position: TouchPosition) => void) => {
    callbacks.onTap.push(callback);
    return () => {
      const index = callbacks.onTap.indexOf(callback);
      if (index > -1) callbacks.onTap.splice(index, 1);
    };
  };
  
  const onDoubleTap = (callback: (position: TouchPosition) => void) => {
    callbacks.onDoubleTap.push(callback);
    return () => {
      const index = callbacks.onDoubleTap.indexOf(callback);
      if (index > -1) callbacks.onDoubleTap.splice(index, 1);
    };
  };
  
  const onTouchStart = (callback: (position: TouchPosition) => void) => {
    callbacks.onTouchStart.push(callback);
    return () => {
      const index = callbacks.onTouchStart.indexOf(callback);
      if (index > -1) callbacks.onTouchStart.splice(index, 1);
    };
  };
  
  const onTouchEnd = (callback: (position: TouchPosition) => void) => {
    callbacks.onTouchEnd.push(callback);
    return () => {
      const index = callbacks.onTouchEnd.indexOf(callback);
      if (index > -1) callbacks.onTouchEnd.splice(index, 1);
    };
  };
  
  // Lifecycle
  onMounted(() => {
    const targetElement = getElementRef();
    if (targetElement) {
      targetElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      targetElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      targetElement.addEventListener('touchend', handleTouchEnd, { passive: true });
      targetElement.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    }
  });
  
  onUnmounted(() => {
    const targetElement = getElementRef();
    if (targetElement) {
      targetElement.removeEventListener('touchstart', handleTouchStart);
      targetElement.removeEventListener('touchmove', handleTouchMove);
      targetElement.removeEventListener('touchend', handleTouchEnd);
      targetElement.removeEventListener('touchcancel', handleTouchCancel);
    }
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
  });
  
  return {
    // State
    state,
    
    // Event registration
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    onLongPress,
    onTap,
    onDoubleTap,
    onTouchStart,
    onTouchEnd
  };
}

// Specialized composable for data table gestures
export function useTableGestures(element: Ref<HTMLElement | null> | HTMLElement | null) {
  return useTouchGestures(element, {
    swipeThreshold: 60,
    swipeVelocity: 0.5,
    pullToRefreshEnabled: true,
    longPressEnabled: true,
    longPressDelay: 600,
    preventOverscroll: true
  });
}

// Specialized composable for pagination gestures
export function usePaginationGestures(element: Ref<HTMLElement | null> | HTMLElement | null) {
  return useTouchGestures(element, {
    swipeThreshold: 80,
    swipeVelocity: 0.4,
    pullToRefreshEnabled: false,
    longPressEnabled: false,
    preventOverscroll: false
  });
}