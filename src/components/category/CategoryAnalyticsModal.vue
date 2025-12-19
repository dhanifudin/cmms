<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Category Analytics</DialogTitle>
      </DialogHeader>
      
      <div class="space-y-6">
        <!-- Overview Stats -->
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center p-4 bg-muted/30 rounded-lg">
            <div class="text-2xl font-bold text-foreground">{{ totalCategories }}</div>
            <div class="text-sm text-muted-foreground">Total Categories</div>
          </div>
          <div class="text-center p-4 bg-muted/30 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ activeCategories }}</div>
            <div class="text-sm text-muted-foreground">Active Categories</div>
          </div>
          <div class="text-center p-4 bg-muted/30 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ totalTemplates }}</div>
            <div class="text-sm text-muted-foreground">Total Templates</div>
          </div>
          <div class="text-center p-4 bg-muted/30 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ averageDepth }}</div>
            <div class="text-sm text-muted-foreground">Avg Depth</div>
          </div>
        </div>
        
        <!-- Category Distribution -->
        <div>
          <h3 class="text-lg font-medium mb-4">Category Distribution</h3>
          <div class="space-y-2">
            <!-- Placeholder for chart/visualization -->
            <div class="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
              <div class="text-center text-muted-foreground">
                <BarChart3 class="h-8 w-8 mx-auto mb-2" />
                <p>Category distribution chart would go here</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Top Categories -->
        <div>
          <h3 class="text-lg font-medium mb-4">Most Active Categories</h3>
          <div class="space-y-2">
            <div 
              v-for="category in topCategories"
              :key="category.id"
              class="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div 
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="font-medium">{{ category.name }}</span>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ getTemplateCount(category.id) }} templates
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" @click="$emit('close')">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useTemplateStore } from '@/stores/template';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import { BarChart3 } from 'lucide-vue-next';

defineEmits<{
  close: [];
}>();

const categoryStore = useCategoryStore();
const templateStore = useTemplateStore();

const totalCategories = computed(() => categoryStore.categories.length);
const activeCategories = computed(() => categoryStore.activeCategories.length);
const totalTemplates = computed(() => templateStore.templates.length);

const averageDepth = computed(() => {
  const depths = categoryStore.categories.map(cat => cat.level);
  const sum = depths.reduce((acc, depth) => acc + depth, 0);
  return depths.length > 0 ? Math.round(sum / depths.length * 10) / 10 : 0;
});

const topCategories = computed(() => {
  return categoryStore.activeCategories
    .slice(0, 10)
    .sort((a, b) => getTemplateCount(b.id) - getTemplateCount(a.id));
});

const getTemplateCount = (categoryId: string): number => {
  return templateStore.getTemplatesByCategoryId(categoryId).length;
};
</script>