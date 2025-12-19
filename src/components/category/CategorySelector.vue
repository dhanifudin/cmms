<template>
  <div class="category-selector">
    <!-- Selected Category Display -->
    <div 
      class="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer"
      :class="{
        'border-ring': isOpen,
        'hover:border-ring/50': !isOpen
      }"
      @click="toggleSelector"
    >
      <div v-if="selectedCategory" class="flex items-center space-x-3">
        <div 
          class="w-4 h-4 rounded-full"
          :style="{ backgroundColor: selectedCategory.color || '#6B7280' }"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="font-medium text-sm">{{ selectedCategory.name }}</span>
            <Badge v-if="!selectedCategory.isActive" variant="secondary" class="text-xs">
              Inactive
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ categoryPath }}
          </p>
        </div>
      </div>
      
      <div v-else class="flex items-center space-x-2 text-muted-foreground">
        <Folder class="h-4 w-4" />
        <span class="text-sm">{{ placeholder }}</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <Button
          v-if="selectedCategory && clearable"
          variant="ghost"
          size="sm"
          class="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
          @click.stop="clearSelection"
        >
          <X class="h-3 w-3" />
        </Button>
        <ChevronDown 
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </div>
    
    <!-- Dropdown Content -->
    <div 
      v-if="isOpen"
      class="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg"
      style="max-height: 400px; overflow: hidden;"
    >
      <div class="p-4">
        <CategoryTree
          :allow-selection="true"
          :show-templates="showTemplates"
          :initial-selected-id="selectedCategoryId"
          :selection-mode="selectionMode"
          @category-select="handleCategorySelect"
          @template-select="handleTemplateSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useCategoryStore } from '@/stores/category';
import type { WorkOrderCategory, WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Components
import CategoryTree from './CategoryTree.vue';

// Icons
import { ChevronDown, Folder, X } from 'lucide-vue-next';

interface Props {
  modelValue?: string;
  placeholder?: string;
  clearable?: boolean;
  showTemplates?: boolean;
  selectionMode?: 'category' | 'template' | 'both';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select a category...',
  clearable: true,
  showTemplates: false,
  selectionMode: 'category',
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [categoryId: string | undefined];
  'category-select': [category: WorkOrderCategory];
  'template-select': [template: WorkOrderTemplate, category: WorkOrderCategory];
}>();

// Store
const categoryStore = useCategoryStore();

// State
const isOpen = ref(false);
const selectedCategoryId = ref<string>(props.modelValue || '');

// Computed
const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null;
  return categoryStore.getCategoryById(selectedCategoryId.value);
});

const categoryPath = computed(() => {
  if (!selectedCategory.value) return '';
  return categoryStore.getCategoryPathString(selectedCategory.value.id);
});

// Methods
const toggleSelector = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const closeSelector = () => {
  isOpen.value = false;
};

const clearSelection = () => {
  selectedCategoryId.value = '';
  emit('update:modelValue', undefined);
  emit('category-select', null as any);
};

const handleCategorySelect = (category: WorkOrderCategory) => {
  selectedCategoryId.value = category.id;
  emit('update:modelValue', category.id);
  emit('category-select', category);
  closeSelector();
};

const handleTemplateSelect = (template: WorkOrderTemplate, category: WorkOrderCategory) => {
  if (props.selectionMode === 'template' || props.selectionMode === 'both') {
    selectedCategoryId.value = category.id;
    emit('update:modelValue', category.id);
    emit('template-select', template, category);
    closeSelector();
  }
};

// Close on outside click
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const selector = target.closest('.category-selector');
  if (!selector) {
    closeSelector();
  }
};

// Watch for prop changes
const updateSelectedId = () => {
  selectedCategoryId.value = props.modelValue || '';
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  updateSelectedId();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for external model value changes
watch(() => props.modelValue, updateSelectedId);
</script>

<style scoped>
.category-selector {
  position: relative;
  width: 100%;
}
</style>