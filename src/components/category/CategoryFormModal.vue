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
                @input="generateCodeFromName"
              />
            </div>
            <div>
              <Label for="code">Category Code*</Label>
              <Input
                id="code"
                v-model="form.code"
                required
                placeholder="AUTO_GENERATED"
                class="font-mono text-sm"
              />
            </div>
          </div>
          
          <div>
            <Label for="parent">Parent Category</Label>
            <Select v-model="form.parentId">
              <SelectTrigger>
                <SelectValue placeholder="Select parent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ROOT__">None (Root Category)</SelectItem>
                <SelectItem 
                  v-for="category in availableParentCategories" 
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.path }} (Level {{ category.level }})
                </SelectItem>
              </SelectContent>
            </Select>
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

        <!-- Configuration -->
        <div class="space-y-4">
          <h4 class="font-medium">Configuration</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="defaultPriority">Default Priority</Label>
              <Select v-model="form.defaultPriority">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="defaultEstimatedDuration">Default Duration (hours)</Label>
              <Input
                id="defaultEstimatedDuration"
                v-model.number="form.defaultEstimatedDuration"
                type="number"
                min="1"
                placeholder="2"
              />
            </div>
          </div>
          
          <div>
            <Label>Maintenance Types</Label>
            <div class="flex items-center space-x-4 mt-2">
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="preventive"
                  :checked="form.maintenanceTypes.includes('preventive')"
                  @update:checked="toggleMaintenanceType('preventive')"
                />
                <Label for="preventive" class="font-normal">Preventive</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="corrective"
                  :checked="form.maintenanceTypes.includes('corrective')"
                  @update:checked="toggleMaintenanceType('corrective')"
                />
                <Label for="corrective" class="font-normal">Corrective</Label>
              </div>
            </div>
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
import { useCategoryStore } from '@/stores/category';
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

// Store
const categoryStore = useCategoryStore();

const form = ref<CreateCategoryForm>({
  name: '',
  description: '',
  code: '',
  parentId: undefined,
  maintenanceTypes: ['preventive', 'corrective'],
  requiredPermissions: [],
  defaultPriority: 'normal',
  defaultEstimatedDuration: 2,
  iconName: undefined,
  color: '#3B82F6',
  isActive: true,
  sortOrder: 0
});

const isEditing = computed(() => !!props.category);

const availableParentCategories = computed(() => {
  const allCategories = categoryStore.activeCategories;
  
  // Filter out the current category and its descendants when editing
  if (isEditing.value && props.category) {
    return allCategories.filter(cat => {
      if (cat.id === props.category!.id) return false;
      // Check if it's a descendant
      return !isDescendantOf(cat.id, props.category!.id);
    });
  }
  
  return allCategories;
});

const isDescendantOf = (categoryId: string, ancestorId: string): boolean => {
  const category = categoryStore.getCategoryById(categoryId);
  if (!category || !category.parentId) return false;
  
  if (category.parentId === ancestorId) return true;
  return isDescendantOf(category.parentId, ancestorId);
};

const generateCodeFromName = () => {
  if (!isEditing.value && form.value.name) {
    // Generate code from name
    const code = form.value.name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
    
    form.value.code = code;
  }
};

const toggleMaintenanceType = (type: 'preventive' | 'corrective') => {
  const index = form.value.maintenanceTypes.indexOf(type);
  if (index > -1) {
    if (form.value.maintenanceTypes.length > 1) {
      form.value.maintenanceTypes.splice(index, 1);
    }
  } else {
    form.value.maintenanceTypes.push(type);
  }
};

const handleSubmit = () => {
  if (!form.value.name.trim() || !form.value.code.trim()) return;
  
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
      code: props.category.code,
      parentId: props.category.parentId,
      maintenanceTypes: props.category.maintenanceTypes,
      requiredPermissions: props.category.requiredPermissions,
      defaultPriority: props.category.defaultPriority,
      defaultEstimatedDuration: props.category.defaultEstimatedDuration,
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