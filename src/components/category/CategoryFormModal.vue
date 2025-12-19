<template>
  <Dialog :open="true" @update:open="$emit('cancel')">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? 'Edit Category' : 'Create Category' }}
        </DialogTitle>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="name">Category Name*</Label>
              <Input
                id="name"
                v-model="form.name"
                required
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label for="parent">Parent Category</Label>
              <Select v-model="form.parentId">
                <SelectTrigger>
                  <SelectValue placeholder="Select parent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ROOT__">None (Root Category)</SelectItem>
                  <!-- TODO: Add actual category options -->
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="form.description"
              rows="3"
              placeholder="Enter category description"
            />
          </div>
        </div>
        
        <!-- Visual Configuration -->
        <div class="space-y-4">
          <h4 class="font-medium">Visual Settings</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="color">Color</Label>
              <Input
                id="color"
                v-model="form.color"
                type="color"
                class="h-10"
              />
            </div>
            <div>
              <Label for="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                v-model.number="form.sortOrder"
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        
        <!-- Advanced Settings -->
        <div class="space-y-4">
          <h4 class="font-medium">Advanced Settings</h4>
          <div class="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              v-model:checked="form.isActive"
            />
            <Label for="isActive">Active</Label>
          </div>
        </div>
        
        <!-- Preview -->
        <div class="category-preview p-3 border border-border rounded-lg bg-muted/30">
          <Label class="text-sm text-muted-foreground">Preview</Label>
          <div class="flex items-center space-x-3 mt-2">
            <div 
              class="w-4 h-4 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: form.color || '#6B7280' }"
            >
              <Folder class="h-2.5 w-2.5 text-white" />
            </div>
            <span class="font-medium">{{ form.name || 'Category Name' }}</span>
            <Badge v-if="!form.isActive" variant="secondary" class="text-xs">
              Inactive
            </Badge>
          </div>
        </div>
      </form>
      
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button 
          type="submit"
          :disabled="!form.name.trim()"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Update' : 'Create' }} Category
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { WorkOrderCategory, CreateCategoryForm } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import { Folder } from 'lucide-vue-next';

interface Props {
  category?: WorkOrderCategory | null;
  parentCategory?: WorkOrderCategory | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [data: CreateCategoryForm];
  cancel: [];
}>();

const form = ref<CreateCategoryForm>({
  name: '',
  description: '',
  parentId: undefined,
  iconName: undefined,
  color: '#3B82F6',
  isActive: true,
  sortOrder: 0
});

const isEditing = computed(() => !!props.category);

const handleSubmit = () => {
  if (!form.value.name.trim()) return;
  
  const submitData: CreateCategoryForm = {
    ...form.value,
    parentId: form.value.parentId || props.parentCategory?.id
  };
  
  emit('save', submitData);
};

onMounted(() => {
  if (props.category) {
    // Editing existing category
    form.value = {
      name: props.category.name,
      description: props.category.description || '',
      parentId: props.category.parentId,
      iconName: props.category.iconName,
      color: props.category.color || '#3B82F6',
      isActive: props.category.isActive,
      sortOrder: props.category.sortOrder
    };
  } else if (props.parentCategory) {
    // Creating child category
    form.value.parentId = props.parentCategory.id;
  }
});
</script>