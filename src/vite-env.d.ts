/// <reference types="vite/client" />
/// <reference types="node" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Fix for PWA and other NodeJS timer types
interface Window {
  DeviceMotionEvent: any;
  DeviceOrientationEvent: any;
}