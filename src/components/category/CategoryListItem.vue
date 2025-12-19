<template>
  <div class="category-list-item p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <Checkbox
          :checked="isSelected"
          @update:checked="$emit('select', category.id)"
        />
        
        <div 
          class="w-4 h-4 rounded-full flex items-center justify-center"
          :style="{ backgroundColor: category.color || '#6B7280' }"
        >
          <Folder class="h-2.5 w-2.5 text-white" />
        </div>
        
        <div>
          <h3 class="font-medium text-foreground">{{ category.name }}</h3>
          <p v-if="category.description" class="text-sm text-muted-foreground">
            {{ category.description }}
          </p>
          <div class="flex items-center space-x-2 mt-1">
            <Badge v-if="!category.isActive" variant="secondary" class="text-xs">
              Inactive
            </Badge>
            <Badge variant="outline" class="text-xs">
              Level {{ category.level }}
            </Badge>
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <Button variant="ghost" size="sm" @click="$emit('edit', category)">
          <Edit class="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" @click="$emit('view-details', category)">
          <Eye class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkOrderCategory } from '@/types/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Eye, Folder } from 'lucide-vue-next';

interface Props {
  category: WorkOrderCategory;
  isSelected: boolean;
}

defineProps<Props>();

defineEmits<{
  edit: [category: WorkOrderCategory];
  delete: [category: WorkOrderCategory];
  'toggle-status': [category: WorkOrderCategory];
  select: [categoryId: string];
  'view-details': [category: WorkOrderCategory];
}>();
</script>