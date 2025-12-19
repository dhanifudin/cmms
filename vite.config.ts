import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group shadcn UI components together to avoid circular dependencies
          'shadcn-ui': [
            'src/components/ui/select/index.ts',
            'src/components/ui/select/Select.vue',
            'src/components/ui/select/SelectContent.vue',
            'src/components/ui/select/SelectItem.vue',
            'src/components/ui/select/SelectTrigger.vue',
            'src/components/ui/select/SelectValue.vue'
          ]
        }
      }
    }
  }
});
