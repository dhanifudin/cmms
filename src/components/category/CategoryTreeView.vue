<template>
  <div class="category-tree-view">
    <!-- Header with Controls -->
    <div class="space-y-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 flex-1">
          <div v-if="showSearchField" class="flex-1 max-w-md">
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
          
          <Button
            v-if="allowReorder"
            variant="outline"
            size="sm"
            @click="toggleReorderMode"
            :class="{ 'bg-primary text-primary-foreground': reorderMode }"
          >
            <GripVertical class="h-4 w-4 mr-2" />
            {{ reorderMode ? 'Exit Reorder' : 'Reorder' }}
          </Button>
        </div>
        
        <div class="flex items-center space-x-2">
          <Button
            v-if="allowCreate"
            variant="outline"
            size="sm"
            @click="$emit('createCategory')"
          >
            <Plus class="h-4 w-4 mr-2" />
            Add Category
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm">
                <MoreVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="exportCategories">
                <Download class="h-4 w-4 mr-2" />
                Export Categories
              </DropdownMenuItem>
              <DropdownMenuItem @click="$emit('importCategories')">
                <Upload class="h-4 w-4 mr-2" />
                Import Categories
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="refreshCategories">
                <RefreshCw class="h-4 w-4 mr-2" />
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <!-- Filter Options -->
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2">
          <Checkbox
            id="activeOnly"
            v-model:checked="showActiveOnly"
          />
          <Label for="activeOnly" class="text-sm font-medium">Active only</Label>
        </div>
        
        <div class="flex items-center space-x-2">
          <Checkbox
            id="withTemplates"
            v-model:checked="showWithTemplatesOnly"
          />
          <Label for="withTemplates" class="text-sm font-medium">With templates</Label>
        </div>
        
        <div class="flex items-center space-x-2">
          <Checkbox
            id="showTemplates"
            v-model:checked="showTemplates"
          />
          <Label for="showTemplates" class="text-sm font-medium">Show templates</Label>
        </div>
        
        <Separator orientation="vertical" class="h-4" />
        
        <div class="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>{{ filteredCount }} of {{ totalCount }} categories</span>
        </div>
      </div>
      
      <!-- Reorder Mode Info -->
      <div v-if="reorderMode" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center space-x-2 text-blue-800">
          <Info class="h-4 w-4" />
          <span class="text-sm font-medium">Reorder Mode Active</span>
        </div>
        <p class="text-xs text-blue-600 mt-1">
          Drag categories to reorder them. Drop on another category to move inside, or use the drop zones to position before/after.
        </p>
      </div>
    </div>

    <!-- Tree Structure -->
    <div class="tree-container border rounded-lg">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center space-x-2">
          <RefreshCw class="h-4 w-4 animate-spin" />
          <span class="text-sm text-muted-foreground">Loading categories...</span>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle class="h-8 w-8 text-destructive mb-3" />
        <h3 class="font-medium text-destructive mb-1">Failed to load categories</h3>
        <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
        <Button variant="outline" size="sm" @click="refreshCategories">
          <RefreshCw class="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
      
      
      <!-- Empty State -->
      <div v-else-if="filteredTree.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen class="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 class="font-medium text-muted-foreground mb-2">
          {{ effectiveSearchQuery || showWithTemplatesOnly ? 'No categories found' : 'No categories yet' }}
        </h3>
        <p class="text-sm text-muted-foreground mb-4">
          {{ effectiveSearchQuery 
              ? 'Try adjusting your search or filters' 
              : showWithTemplatesOnly 
              ? 'No categories have templates yet'
              : 'Create your first category to get started' 
          }}
        </p>
        <Button 
          v-if="allowCreate && !effectiveSearchQuery && !showWithTemplatesOnly"
          variant="outline" 
          size="sm" 
          @click="$emit('createCategory')"
        >
          <Plus class="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>
      
      <!-- Tree Nodes -->
      <div v-else class="p-4 space-y-1">
        
        <component
          :is="reorderMode ? DragDropCategoryTreeNode : CategoryTreeNode"
          v-for="category in filteredTree"
          :key="category.id"
          :category="category"
          :expanded-nodes="expandedNodes"
          :selected-id="selectedCategoryId"
          :show-templates="showTemplates"
          :search-query="effectiveSearchQuery"
          :allow-reorder="reorderMode"
          :dragging-category="draggingCategory"
          @toggle="toggleNode"
          @select="selectCategory"
          @template-select="selectTemplate"
          @move="handleMove"
          @context-menu="handleContextMenu"
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
            <h4 class="font-semibold">{{ selectedCategory.name }}</h4>
            <Badge v-if="!selectedCategory.isActive" variant="secondary" class="text-xs">
              Inactive
            </Badge>
            <Badge variant="outline" class="text-xs">
              {{ selectedCategory.code }}
            </Badge>
          </div>
          <p v-if="selectedCategory.description" class="text-sm text-muted-foreground mb-3">
            {{ selectedCategory.description }}
          </p>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-muted-foreground">Level:</span>
              <span class="font-medium ml-1">{{ selectedCategory.level }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Templates:</span>
              <span class="font-medium ml-1">{{ templateCount }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Path:</span>
              <span class="font-mono text-xs ml-1">{{ selectedCategory.path }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Sort Order:</span>
              <span class="font-medium ml-1">{{ selectedCategory.sortOrder }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col space-y-2">
          <Button
            v-if="allowSelection"
            variant="default"
            size="sm"
            @click="confirmSelection"
            :disabled="!canSelectCategory"
          >
            Select Category
          </Button>
          <Button
            v-if="allowEdit"
            variant="outline"
            size="sm"
            @click="$emit('editCategory', selectedCategory)"
          >
            <Edit class="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div 
      v-if="contextMenu.show"
      ref="contextMenuRef"
      class="fixed z-50 bg-popover border rounded-md shadow-lg py-1 min-w-[180px]"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
    >
      <div 
        v-for="item in contextMenuItems" 
        :key="item.id"
        class="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center"
        :class="{ 
          'text-destructive': item.variant === 'destructive',
          'opacity-50 cursor-not-allowed': item.disabled 
        }"
        @click="!item.disabled && handleContextMenuItem(item.id)"
      >
        <component :is="item.icon" class="h-4 w-4 mr-2" />
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useTemplateStore } from '@/stores/template';
import type { WorkOrderCategory, WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Components
// Used conditionally via :is="reorderMode ? 'DragDropCategoryTreeNode' : 'CategoryTreeNode'"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DragDropCategoryTreeNode from './DragDropCategoryTreeNode.vue';
import CategoryTreeNode from './CategoryTreeNode.vue';

// Icons
import { 
  Search, FolderOpen, Plus, MoreVertical, Download, Upload, RefreshCw,
  GripVertical, Info, AlertCircle, Edit
} from 'lucide-vue-next';

interface Props {
  allowSelection?: boolean;
  allowEdit?: boolean;
  allowCreate?: boolean;
  allowReorder?: boolean;
  showTemplates?: boolean;
  initialSelectedId?: string;
  selectionMode?: 'category' | 'template' | 'both';
  showSearchField?: boolean;
  externalSearchQuery?: string;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon: any;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface MoveEvent {
  sourceId: string;
  targetId: string;
  position: 'before' | 'after' | 'inside';
}

const props = withDefaults(defineProps<Props>(), {
  allowSelection: false,
  allowEdit: false,
  allowCreate: false,
  allowReorder: false,
  showTemplates: false,
  selectionMode: 'category',
  showSearchField: true,
  externalSearchQuery: ''
});

const emit = defineEmits<{
  categorySelect: [category: WorkOrderCategory];
  templateSelect: [template: WorkOrderTemplate, category: WorkOrderCategory];
  editCategory: [category: WorkOrderCategory];
  createCategory: [];
  importCategories: [];
}>();

// Stores
const categoryStore = useCategoryStore();
const templateStore = useTemplateStore();

// State
const searchQuery = ref('');
const showActiveOnly = ref(false);
const showWithTemplatesOnly = ref(false);
const showTemplates = ref(props.showTemplates);
const expandedNodes = ref<Set<string>>(new Set());
const selectedCategoryId = ref<string>(props.initialSelectedId || '');
const reorderMode = ref(false);
const draggingCategory = ref<WorkOrderCategory | null>(null);

// Computed search query that prioritizes external search
const effectiveSearchQuery = computed(() => {
  return props.externalSearchQuery || searchQuery.value;
});

// Context Menu
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  category: null as WorkOrderCategory | null
});
const contextMenuRef = ref<HTMLElement>();

// Suppress unused import warning - components used dynamically via :is directive
void DragDropCategoryTreeNode;
void CategoryTreeNode;

// Computed
const loading = computed(() => categoryStore.loading);
const error = computed(() => categoryStore.error);

const filteredTree = computed(() => {
  let categories = categoryStore.categoryTree;

  if (showActiveOnly.value) {
    categories = filterActiveCategories(categories);
  }

  if (showWithTemplatesOnly.value) {
    categories = filterCategoriesWithTemplates(categories);
  }

  if (effectiveSearchQuery.value.trim()) {
    categories = filterCategoriesBySearch(categories, effectiveSearchQuery.value.trim().toLowerCase());
  }

  return categories;
});

const totalCount = computed(() => {
  return countCategories(categoryStore.categoryTree);
});

const filteredCount = computed(() => {
  return countCategories(filteredTree.value);
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

const contextMenuItems = computed((): ContextMenuItem[] => {
  if (!contextMenu.value.category) return [];
  
  const category = contextMenu.value.category;
  const items: ContextMenuItem[] = [
    {
      id: 'edit',
      label: 'Edit Category',
      icon: Edit,
      disabled: !props.allowEdit
    },
    {
      id: 'addChild',
      label: 'Add Child Category',
      icon: Plus,
      disabled: !props.allowCreate
    },
    {
      id: 'duplicate',
      label: 'Duplicate Category',
      icon: Plus,
      disabled: !props.allowCreate
    },
    {
      id: 'move',
      label: 'Move Category',
      icon: GripVertical,
      disabled: !props.allowReorder
    },
    {
      id: 'toggleStatus',
      label: category.isActive ? 'Deactivate' : 'Activate',
      icon: category.isActive ? AlertCircle : RefreshCw
    },
    {
      id: 'delete',
      label: 'Delete Category',
      icon: AlertCircle,
      variant: 'destructive'
    }
  ];
  
  return items;
});

// Filter Methods
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
      const codeMatch = cat.code?.toLowerCase().includes(query) || false;
      const hasMatchingChildren = cat.children && 
        filterCategoriesBySearch(cat.children, query).length > 0;
      return nameMatch || descriptionMatch || codeMatch || hasMatchingChildren;
    })
    .map(cat => ({
      ...cat,
      children: cat.children ? filterCategoriesBySearch(cat.children, query) : undefined
    }));
};

const countCategories = (categories: WorkOrderCategory[]): number => {
  let count = categories.length;
  for (const cat of categories) {
    if (cat.children) {
      count += countCategories(cat.children);
    }
  }
  return count;
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

// Event Handlers
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

const toggleReorderMode = () => {
  reorderMode.value = !reorderMode.value;
  if (!reorderMode.value) {
    draggingCategory.value = null;
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

const handleMove = async (event: MoveEvent) => {
  try {
    // Show loading state for the dragged category
    draggingCategory.value = categoryStore.getCategoryById(event.sourceId) || null;
    
    // Determine new parent based on position
    let newParentId: string | null = null;
    
    if (event.position === 'inside') {
      newParentId = event.targetId;
    } else {
      // For before/after, use the same parent as target
      const targetCategory = categoryStore.getCategoryById(event.targetId);
      newParentId = targetCategory?.parentId || null;
    }
    
    await categoryStore.moveCategory(event.sourceId, newParentId);
    
    // Optionally show success toast
    console.log('Category moved successfully');
    
  } catch (error) {
    console.error('Failed to move category:', error);
    // Optionally show error toast
  } finally {
    draggingCategory.value = null;
  }
};

const handleContextMenu = (category: WorkOrderCategory, event: MouseEvent) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    category
  };
  
  nextTick(() => {
    if (contextMenuRef.value) {
      const rect = contextMenuRef.value.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Adjust position if menu would go off screen
      if (rect.right > windowWidth) {
        contextMenu.value.x = windowWidth - rect.width - 10;
      }
      if (rect.bottom > windowHeight) {
        contextMenu.value.y = windowHeight - rect.height - 10;
      }
    }
  });
};

const handleContextMenuItem = (itemId: string) => {
  const category = contextMenu.value.category;
  if (!category) return;
  
  contextMenu.value.show = false;
  
  switch (itemId) {
    case 'edit':
      emit('editCategory', category);
      break;
    case 'addChild':
      // Emit create with parent category
      emit('createCategory');
      break;
    case 'duplicate':
      duplicateCategory(category);
      break;
    case 'move':
      // Enter reorder mode and select category
      reorderMode.value = true;
      selectedCategoryId.value = category.id;
      break;
    case 'toggleStatus':
      toggleCategoryStatus(category);
      break;
    case 'delete':
      deleteCategory(category);
      break;
  }
};

const duplicateCategory = async (category: WorkOrderCategory) => {
  try {
    await categoryStore.duplicateCategory(category.id);
    console.log('Category duplicated successfully');
  } catch (error) {
    console.error('Failed to duplicate category:', error);
  }
};

const toggleCategoryStatus = async (category: WorkOrderCategory) => {
  try {
    await categoryStore.toggleCategoryStatus(category.id);
    console.log(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
  } catch (error) {
    console.error('Failed to toggle category status:', error);
  }
};

const deleteCategory = async (category: WorkOrderCategory) => {
  if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    await categoryStore.deleteCategory(category.id);
    console.log('Category deleted successfully');
    
    // Clear selection if deleted category was selected
    if (selectedCategoryId.value === category.id) {
      selectedCategoryId.value = '';
    }
  } catch (error) {
    console.error('Failed to delete category:', error);
  }
};

const exportCategories = async () => {
  try {
    const data = await categoryStore.exportCategories();
    
    // Create and trigger download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('Categories exported successfully');
  } catch (error) {
    console.error('Failed to export categories:', error);
  }
};

const refreshCategories = async () => {
  try {
    await categoryStore.fetchCategories();
    console.log('Categories refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh categories:', error);
  }
};

// Close context menu on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (contextMenuRef.value && !contextMenuRef.value.contains(event.target as Node)) {
    contextMenu.value.show = false;
  }
};

// Auto-expand search results
watch(effectiveSearchQuery, (newQuery) => {
  if (newQuery.trim()) {
    // Expand all nodes when searching
    const allIds = getAllCategoryIds(filteredTree.value);
    expandedNodes.value = new Set(allIds);
  }
});

// Initialize
const initializeExpanded = () => {
  // Expand root level categories by default
  const rootCategories = filteredTree.value.map(cat => cat.id);
  expandedNodes.value = new Set(rootCategories);
};

// Lifecycle
onMounted(() => {
  initializeExpanded();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.tree-container {
  max-height: 70vh;
  overflow-y: auto;
  background: var(--background);
}

.category-tree-view :deep(.tree-node) {
  transition: all 0.2s ease;
}

.category-tree-view :deep(.tree-node:hover) {
  background-color: var(--muted);
}

.category-tree-view :deep(.tree-node.selected) {
  background-color: var(--accent);
}

/* Custom scrollbar */
.tree-container::-webkit-scrollbar {
  width: 6px;
}

.tree-container::-webkit-scrollbar-track {
  background: var(--muted);
}

.tree-container::-webkit-scrollbar-thumb {
  background: var(--muted-foreground);
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: var(--foreground);
}
</style>