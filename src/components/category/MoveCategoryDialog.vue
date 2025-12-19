<template>
  <Dialog :open="true" @update:open="$emit('cancel')">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Move Category</DialogTitle>
      </DialogHeader>
      
      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">
          Move "{{ category.name }}" to a new parent category:
        </p>
        
        <div>
          <Label for="parent">Target Parent Category</Label>
          <Select v-model="targetParentId">
            <SelectTrigger>
              <SelectValue placeholder="Select target parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ROOT__">Root Level</SelectItem>
              <SelectItem 
                v-for="cat in availableParents" 
                :key="cat.id" 
                :value="cat.id"
              >
                {{ cat.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div class="flex justify-end space-x-2 mt-6">
        <Button variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button @click="handleMove" :disabled="!targetParentId && targetParentId !== ''">
          Move Category
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCategoryStore } from '@/stores/category';
import type { WorkOrderCategory } from '@/types/templates';

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  category: WorkOrderCategory;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  move: [newParentId: string | null];
  cancel: [];
}>();

const categoryStore = useCategoryStore();

// Local state
const targetParentId = ref<string | null>(null);

// Computed
const availableParents = computed(() => {
  // Return categories that could be parents (excluding self and descendants)
  return categoryStore.categories.filter(cat => 
    cat.id !== props.category.id && 
    !isDescendant(cat, props.category)
  );
});

// Methods
const isDescendant = (potentialDescendant: WorkOrderCategory, ancestor: WorkOrderCategory): boolean => {
  // Simple check - in a real implementation, you'd need to traverse the tree
  return potentialDescendant.parentId === ancestor.id;
};

const handleMove = () => {
  const parentId = targetParentId.value === '__ROOT__' ? null : targetParentId.value;
  emit('move', parentId);
};
</script>