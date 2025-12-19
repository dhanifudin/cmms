<template>
  <Dialog :open="true" @update:open="$emit('cancel')">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Move Categories</DialogTitle>
      </DialogHeader>
      
      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">
          Move {{ selectedCategories.length }} selected categor{{ selectedCategories.length === 1 ? 'y' : 'ies' }} to:
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
                v-for="category in availableCategories"
                :key="category.id"
                :value="category.id"
              >
                {{ '—'.repeat(category.level - 1) }} {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div v-if="selectedCategories.length <= 5" class="space-y-2">
          <Label class="text-sm text-muted-foreground">Categories to move:</Label>
          <div 
            v-for="categoryId in selectedCategories"
            :key="categoryId"
            class="text-sm p-2 bg-muted/30 rounded"
          >
            {{ getCategoryName(categoryId) }}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button 
          type="button"
          @click="handleMove"
          :disabled="!canMove"
        >
          Move Categories
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCategoryStore } from '@/stores/category';

// UI Components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  selectedCategories: string[];
}

const props = defineProps<Props>();

const categoryStore = useCategoryStore();
const targetParentId = ref<string>('');

const availableCategories = computed(() => {
  // Filter out selected categories and their descendants
  return categoryStore.categories.filter(cat => 
    !props.selectedCategories.includes(cat.id) &&
    cat.isActive
  );
});

const canMove = computed(() => {
  // Can always move to root level (empty string)
  return true;
});

const getCategoryName = (categoryId: string): string => {
  const category = categoryStore.getCategoryById(categoryId);
  return category ? category.name : 'Unknown';
};

const emit = defineEmits<{
  move: [targetParentId: string | null];
  cancel: [];
}>();

const handleMove = () => {
  const targetId = targetParentId.value === '__ROOT__' ? null : targetParentId.value || null;
  emit('move', targetId);
};
</script>