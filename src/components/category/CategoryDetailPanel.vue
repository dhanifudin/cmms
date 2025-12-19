<template>
  <div class="category-detail-panel">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-foreground">Category Details</h3>
      <Button variant="ghost" size="sm" @click="$emit('close')">
        <X class="h-4 w-4" />
      </Button>
    </div>
    
    <div class="space-y-4">
      <!-- Basic Info -->
      <div>
        <div class="flex items-center space-x-3 mb-3">
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center"
            :style="{ backgroundColor: category.color || '#6B7280' }"
          >
            <component :is="getCategoryIcon(category.iconName)" class="h-3 w-3 text-white" />
          </div>
          <div>
            <h4 class="font-medium text-foreground">{{ category.name }}</h4>
            <Badge v-if="!category.isActive" variant="secondary" class="text-xs">
              Inactive
            </Badge>
          </div>
        </div>
        
        <p v-if="category.description" class="text-sm text-muted-foreground mb-3">
          {{ category.description }}
        </p>
      </div>
      
      <!-- Properties -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Level:</span>
          <span class="text-foreground">{{ category.level }}</span>
        </div>
        
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Sort Order:</span>
          <span class="text-foreground">{{ category.sortOrder }}</span>
        </div>
        
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Status:</span>
          <Badge :variant="category.isActive ? 'default' : 'secondary'" class="text-xs">
            {{ category.isActive ? 'Active' : 'Inactive' }}
          </Badge>
        </div>
        
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Templates:</span>
          <span class="text-foreground">{{ templateCount }}</span>
        </div>
      </div>
      
      <!-- Metadata -->
      <div class="pt-3 border-t border-border">
        <div class="space-y-2 text-xs text-muted-foreground">
          <div>Created: {{ formatDate(category.createdAt) }}</div>
          <div>Updated: {{ formatDate(category.updatedAt) }}</div>
          <div>Created by: {{ category.createdBy }}</div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="pt-3 border-t border-border">
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" @click="$emit('update', category.id, {})">
            <Edit class="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            @click="$emit('update', category.id, { isActive: !category.isActive })"
          >
            <Power class="h-4 w-4 mr-2" />
            {{ category.isActive ? 'Deactivate' : 'Activate' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateStore } from '@/stores/template';
import type { WorkOrderCategory } from '@/types/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Power, Folder, Settings, Shield, Package, Zap } from 'lucide-vue-next';

interface Props {
  category: WorkOrderCategory;
}

const props = defineProps<Props>();

defineEmits<{
  close: [];
  update: [categoryId: string, updates: any];
}>();

const templateStore = useTemplateStore();

const templateCount = computed(() => {
  const templates = templateStore.getTemplatesByCategoryId(props.category.id);
  return templates.length;
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getCategoryIcon = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    'PipeIcon': Package,
    'GearIcon': Settings,
    'ShieldIcon': Shield,
    'TankIcon': Package,
    'ZapIcon': Zap,
  };
  
  return iconMap[iconName || ''] || Folder;
};
</script>