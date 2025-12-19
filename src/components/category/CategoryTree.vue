<template>
  <div class="category-tree">
    <!-- Search and Filter Header -->
    <div class="space-y-4 mb-6">
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Search categories..."
            class="w-full"
          >
            <template #prefix>
              <Search class="h-4 w-4 text-muted-foreground" />
            </template>
          </Input>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="toggleExpandAll"
        >
          {{ allExpanded ? 'Collapse All' : 'Expand All' }}
        </Button>
      </div>
      
      <!-- Filter Options -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <Checkbox
            id="activeOnly"
            v-model:checked="showActiveOnly"
          />
          <Label for="activeOnly" class="text-sm">Active categories only</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox
            id="withTemplates"
            v-model:checked="showWithTemplatesOnly"
          />
          <Label for="withTemplates" class="text-sm">Categories with templates</Label>
        </div>
      </div>
    </div>

    <!-- Tree Structure -->
    <div class="tree-container border rounded-lg p-4">
      <div v-if="filteredTree.length === 0" class="text-center py-8 text-muted-foreground">
        <FolderOpen class="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No categories found</p>
        <p class="text-xs">Try adjusting your filters</p>
      </div>
      
      <div v-else class="space-y-1">
        <CategoryTreeNode
          v-for="category in filteredTree"
          :key="category.id"
          :category="category"
          :expanded-nodes="expandedNodes"
          :selected-id="selectedCategoryId"
          :show-templates="showTemplates"
          :search-query="searchQuery"
          @toggle="toggleNode"
          @select="selectCategory"
          @template-select="selectTemplate"
        />
      </div>
    </div>
    
    <!-- Selected Category Info -->
    <div v-if="selectedCategory" class="mt-4 p-4 bg-muted/30 rounded-lg">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-2">
            <div 
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: selectedCategory.color || '#6B7280' }"
            />
            <h4 class="font-medium">{{ selectedCategory.name }}</h4>
            <Badge v-if="!selectedCategory.isActive" variant="secondary" class="text-xs">
              Inactive
            </Badge>
          </div>
          <p v-if="selectedCategory.description" class="text-sm text-muted-foreground mb-2">
            {{ selectedCategory.description }}
          </p>
          <div class="text-xs text-muted-foreground">
            Level {{ selectedCategory.level }} • {{ templateCount }} template{{ templateCount !== 1 ? 's' : '' }}
          </div>
        </div>
        <Button
          v-if="allowSelection"
          variant="outline"
          size="sm"
          @click="confirmSelection"
          :disabled="!canSelectCategory"
        >
          Select Category
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useTemplateStore } from '@/stores/template';
import type { WorkOrderCategory, WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Components
import CategoryTreeNode from './CategoryTreeNode.vue';

// Icons
import { Search, FolderOpen } from 'lucide-vue-next';

interface Props {
  allowSelection?: boolean;
  showTemplates?: boolean;
  initialSelectedId?: string;
  selectionMode?: 'category' | 'template' | 'both';
}

const props = withDefaults(defineProps<Props>(), {
  allowSelection: false,
  showTemplates: false,
  selectionMode: 'category'
});

const emit = defineEmits<{
  categorySelect: [category: WorkOrderCategory];
  templateSelect: [template: WorkOrderTemplate, category: WorkOrderCategory];
}>();

// Stores
const categoryStore = useCategoryStore();
const templateStore = useTemplateStore();

// State
const searchQuery = ref('');
const showActiveOnly = ref(true);
const showWithTemplatesOnly = ref(false);
const expandedNodes = ref<Set<string>>(new Set());
const selectedCategoryId = ref<string>(props.initialSelectedId || '');

// Computed
const filteredTree = computed(() => {
  let categories = categoryStore.categoryTree;

  if (showActiveOnly.value) {
    categories = filterActiveCategories(categories);
  }

  if (showWithTemplatesOnly.value) {
    categories = filterCategoriesWithTemplates(categories);
  }

  if (searchQuery.value.trim()) {
    categories = filterCategoriesBySearch(categories, searchQuery.value.trim().toLowerCase());
  }

  return categories;
});

const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null;
  return categoryStore.getCategoryById(selectedCategoryId.value);
});

const templateCount = computed(() => {
  if (!selectedCategory.value) return 0;
  return templateStore.getTemplatesByCategoryId(selectedCategory.value.id).length;
});

const canSelectCategory = computed(() => {
  return selectedCategory.value && (
    props.selectionMode === 'category' || 
    props.selectionMode === 'both'
  );
});

const allExpanded = computed(() => {
  const allCategoryIds = getAllCategoryIds(filteredTree.value);
  return allCategoryIds.length > 0 && allCategoryIds.every(id => expandedNodes.value.has(id));
});

// Methods
const filterActiveCategories = (categories: WorkOrderCategory[]): WorkOrderCategory[] => {
  return categories
    .filter(cat => cat.isActive)
    .map(cat => ({
      ...cat,
      children: cat.children ? filterActiveCategories(cat.children) : undefined
    }));
};

const filterCategoriesWithTemplates = (categories: WorkOrderCategory[]): WorkOrderCategory[] => {
  return categories
    .filter(cat => {
      const hasTemplates = templateStore.getTemplatesByCategoryId(cat.id).length > 0;
      const hasChildrenWithTemplates = cat.children && 
        filterCategoriesWithTemplates(cat.children).length > 0;
      return hasTemplates || hasChildrenWithTemplates;
    })
    .map(cat => ({
      ...cat,
      children: cat.children ? filterCategoriesWithTemplates(cat.children) : undefined
    }));
};

const filterCategoriesBySearch = (categories: WorkOrderCategory[], query: string): WorkOrderCategory[] => {
  return categories
    .filter(cat => {
      const nameMatch = cat.name.toLowerCase().includes(query);
      const descriptionMatch = cat.description?.toLowerCase().includes(query) || false;
      const hasMatchingChildren = cat.children && 
        filterCategoriesBySearch(cat.children, query).length > 0;
      return nameMatch || descriptionMatch || hasMatchingChildren;
    })
    .map(cat => ({
      ...cat,
      children: cat.children ? filterCategoriesBySearch(cat.children, query) : undefined
    }));
};

const getAllCategoryIds = (categories: WorkOrderCategory[]): string[] => {
  const ids: string[] = [];
  for (const cat of categories) {
    ids.push(cat.id);
    if (cat.children) {
      ids.push(...getAllCategoryIds(cat.children));
    }
  }
  return ids;
};

const toggleNode = (categoryId: string) => {
  if (expandedNodes.value.has(categoryId)) {
    expandedNodes.value.delete(categoryId);
  } else {
    expandedNodes.value.add(categoryId);
  }
};

const toggleExpandAll = () => {
  if (allExpanded.value) {
    expandedNodes.value.clear();
  } else {
    const allIds = getAllCategoryIds(filteredTree.value);
    expandedNodes.value = new Set(allIds);
  }
};

const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId;
};

const selectTemplate = (template: WorkOrderTemplate) => {
  const category = categoryStore.getCategoryById(template.categoryId);
  if (category) {
    emit('templateSelect', template, category);
  }
};

const confirmSelection = () => {
  if (selectedCategory.value) {
    emit('categorySelect', selectedCategory.value);
  }
};

// Auto-expand search results
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    // Expand all nodes when searching
    const allIds = getAllCategoryIds(filteredTree.value);
    expandedNodes.value = new Set(allIds);
  }
});

// Initialize with some nodes expanded
const initializeExpanded = () => {
  // Expand root level categories by default
  const rootCategories = filteredTree.value.map(cat => cat.id);
  expandedNodes.value = new Set(rootCategories);
};

// Initialize on mount
initializeExpanded();
</script>

<style scoped>
.tree-container {
  max-height: 60vh;
  overflow-y: auto;
}

.category-tree :deep(.tree-node) {
  transition: all 0.2s ease;
}

.category-tree :deep(.tree-node:hover) {
  background-color: var(--muted);
}

.category-tree :deep(.tree-node.selected) {
  background-color: var(--accent);
}
</style>