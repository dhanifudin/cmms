<template>
  <div class="admin-category-management h-full flex flex-col">
    <!-- Header with Admin Controls -->
    <div class="admin-header bg-card border-b border-border p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Category Management</h1>
          <p class="text-muted-foreground mt-1">Manage work order categories and hierarchical structure</p>
        </div>
        <div class="flex items-center space-x-3">
          <Button @click="showCreateModal = true" class="bg-primary">
            <Plus class="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button @click="showImportDialog = true" variant="outline">
            <Upload class="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button @click="exportCategories" variant="outline">
            <Download class="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button @click="showAnalyticsModal = true" variant="outline">
            <BarChart3 class="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Search and Filter Bar -->
    <div class="search-filter-bar bg-background border-b border-border p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 flex-1">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchTerm"
              placeholder="Search categories and templates..."
              class="pl-10"
            />
          </div>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            v-if="hasActiveFilters"
            variant="ghost" 
            size="sm" 
            @click="clearFilters"
          >
            <X class="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        </div>
        
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <label class="text-sm text-muted-foreground">Show Templates:</label>
            <Button
              variant="ghost"
              size="sm"
              :class="{ 'bg-muted': showTemplatesInTree }"
              @click="showTemplatesInTree = !showTemplatesInTree"
            >
              <FileText class="h-4 w-4" />
            </Button>
          </div>
          
          <div class="w-px h-4 bg-border" />
          
          <div class="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              :class="{ 'bg-muted': viewMode === 'tree' }"
              @click="viewMode = 'tree'"
            >
              <TreePine class="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              :class="{ 'bg-muted': viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <List class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex">
      <!-- Category Tree/List -->
      <div class="flex-1 p-6 overflow-auto">
        <div v-if="categoryStore.loading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <Loader2 class="h-8 w-8 animate-spin mx-auto mb-2" />
            <p class="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
        
        <div v-else-if="categoryStore.error" class="flex items-center justify-center h-64">
          <Alert variant="destructive" class="max-w-md">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ categoryStore.error }}</AlertDescription>
          </Alert>
        </div>

        <div v-else>
          <!-- Tree View with Enhanced Drag & Drop -->
          <div v-if="viewMode === 'tree'" class="category-tree">
            <CategoryTreeView
              :categories="filteredCategories"
              :allow-edit="true"
              :allow-create="true"
              :allow-reorder="true"
              :show-templates="showTemplatesInTree"
              :show-search-field="false"
              :external-search-query="searchTerm"
              @category-select="viewCategoryDetails"
              @edit-category="editCategory"
              @create-category="() => { parentCategory = null; showCreateModal = true; }"
              @import-categories="showImportDialog = true"
            />
          </div>
          
          <!-- List View -->
          <div v-else class="category-list space-y-4">
            <!-- Results Summary -->
            <div class="flex items-center justify-between">
              <div class="text-sm text-muted-foreground">
                Showing {{ paginatedCategories.length }} of {{ paginationState.totalItems }} categories
                <span v-if="hasActiveFilters">(filtered from {{ totalCategories }})</span>
              </div>
            </div>
            
            <!-- Category List -->
            <div class="grid gap-4">
              <CategoryListItem
                v-for="category in filteredCategoriesList"
                :key="category.id"
                :category="category"
                :is-selected="selectedCategories.includes(category.id)"
                @edit="editCategory"
                @delete="deleteCategory"
                @toggle-status="toggleCategoryStatus"
                @select="toggleCategorySelection"
                @view-details="viewCategoryDetails"
              />
            </div>
            
            <!-- Pagination for List View -->
            <DataPagination
              :current-page="paginationState.currentPage"
              :page-size="paginationState.pageSize"
              :total-items="paginationState.totalItems"
              :total-pages="paginationState.totalPages"
              :loading="categoryStore.loading"
              @page-change="handlePageChange"
              @page-size-change="handlePageSizeChange"
            />
          </div>

          <!-- Empty State -->
          <div v-if="filteredCategories.length === 0" class="text-center py-12">
            <FolderX class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 class="text-lg font-medium text-foreground mb-2">No categories found</h3>
            <p class="text-muted-foreground mb-4">
              {{ searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first category.' }}
            </p>
            <Button v-if="!searchTerm" @click="showCreateModal = true">
              <Plus class="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Category Details Panel -->
      <div 
        v-if="selectedCategory" 
        class="w-80 border-l border-border bg-muted/30 p-6 overflow-auto"
      >
        <CategoryDetailPanel
          :category="selectedCategory"
          @update="updateCategory"
          @close="selectedCategory = null"
        />
      </div>
    </div>
    
    <!-- Bulk Operations Bar -->
    <div 
      v-if="selectedCategories.length > 0" 
      class="bulk-operations bg-primary/10 border-t border-border p-4 flex items-center justify-between"
    >
      <div class="text-sm text-foreground">
        {{ selectedCategories.length }} categor{{ selectedCategories.length === 1 ? 'y' : 'ies' }} selected
      </div>
      <div class="flex items-center space-x-2">
        <Button @click="bulkActivate" variant="outline" size="sm">
          <Power class="h-4 w-4 mr-2" />
          Activate
        </Button>
        <Button @click="bulkDeactivate" variant="outline" size="sm">
          <PowerOff class="h-4 w-4 mr-2" />
          Deactivate
        </Button>
        <Button @click="showBulkMoveDialog = true" variant="outline" size="sm">
          <Move class="h-4 w-4 mr-2" />
          Move
        </Button>
        <Button @click="bulkDelete" variant="destructive" size="sm">
          <Trash2 class="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Button @click="clearSelection" variant="ghost" size="sm">
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Modals -->
    <CategoryFormModal
      v-if="showCreateModal || showEditModal"
      :category="editingCategory"
      :parent-category="parentCategory"
      @save="saveCategory"
      @cancel="closeModals"
    />

    <CategoryImportDialog
      v-if="showImportDialog"
      @import="handleImport"
      @cancel="showImportDialog = false"
    />

    <CategoryAnalyticsModal
      v-if="showAnalyticsModal"
      @close="showAnalyticsModal = false"
    />

    <BulkMoveDialog
      v-if="showBulkMoveDialog"
      :selected-categories="selectedCategories"
      @move="handleBulkMove"
      @cancel="showBulkMoveDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useTemplateStore } from '@/stores/template';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderCategory, CreateCategoryForm } from '@/types/templates';
import type { CategoryPaginationSizes } from '@/types/pagination';

// Pagination Components
import DataPagination from '@/components/ui/pagination/DataPagination.vue';

// Components
// import AdminCategoryTreeNode from '@/components/category/AdminCategoryTreeNode.vue';
import CategoryListItem from '@/components/category/CategoryListItem.vue';
import CategoryDetailPanel from '@/components/category/CategoryDetailPanel.vue';
import CategoryFormModal from '@/components/category/CategoryFormModal.vue';
import CategoryImportDialog from '@/components/category/CategoryImportDialog.vue';
import CategoryAnalyticsModal from '@/components/category/CategoryAnalyticsModal.vue';
import BulkMoveDialog from '@/components/category/BulkMoveDialog.vue';
import CategoryTreeView from '@/components/category/CategoryTreeView.vue';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Icons
import {
  Plus, Upload, Download, BarChart3, Search, TreePine, List, FileText,
  Loader2, AlertCircle, FolderX, Power, PowerOff, Move, Trash2, X
} from 'lucide-vue-next';

// Store and composables
const categoryStore = useCategoryStore();
const templateStore = useTemplateStore();
const { toast } = useToast();

// Reactive state
const searchTerm = ref('');
const statusFilter = ref('all');
const viewMode = ref<'tree' | 'list'>('tree');
const selectedCategories = ref<string[]>([]);
const selectedCategory = ref<WorkOrderCategory | null>(null);
const showTemplatesInTree = ref(false);

// Modal states
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showImportDialog = ref(false);
const showAnalyticsModal = ref(false);
const showBulkMoveDialog = ref(false);

// Form states
const editingCategory = ref<WorkOrderCategory | null>(null);
const parentCategory = ref<WorkOrderCategory | null>(null);

// Computed
const paginationState = computed(() => categoryStore.paginationState);
const paginatedCategories = computed(() => categoryStore.paginatedCategories);
const totalCategories = computed(() => categoryStore.categories.length);

// For tree view, use filtered tree that maintains hierarchy
const filteredCategories = computed(() => {
  return categoryStore.filteredCategoryTree;
});

// For list view, use paginated flat categories
const filteredCategoriesList = computed(() => {
  return viewMode.value === 'list' ? paginatedCategories.value : categoryStore.filteredAndSearchedCategories;
});

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchTerm.value.trim() || statusFilter.value !== 'all';
});

// Methods
// const canDeleteCategory = (category: WorkOrderCategory): boolean => {
//   // TODO: Check if category has templates or work orders
//   return !category.children || category.children.length === 0;
// };

const toggleCategorySelection = (categoryId: string) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(categoryId);
  }
};

const clearSelection = () => {
  selectedCategories.value = [];
};

const editCategory = (category: WorkOrderCategory) => {
  editingCategory.value = category;
  showEditModal.value = true;
};

const deleteCategory = async (category: WorkOrderCategory) => {
  try {
    await categoryStore.deleteCategory(category.id);
    toast({
      title: 'Success',
      description: 'Category deleted successfully'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to delete category',
      variant: 'destructive'
    });
  }
};

// const addChildCategory = (parentCat: WorkOrderCategory) => {
//   parentCategory.value = parentCat;
//   showCreateModal.value = true;
// };

const toggleCategoryStatus = async (category: WorkOrderCategory) => {
  try {
    await categoryStore.toggleCategoryStatus(category.id);
    toast({
      title: 'Success',
      description: `Category ${category.isActive ? 'deactivated' : 'activated'} successfully`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to update category status',
      variant: 'destructive'
    });
  }
};

const viewCategoryDetails = (category: WorkOrderCategory) => {
  selectedCategory.value = category;
};

const saveCategory = async (categoryData: CreateCategoryForm) => {
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, categoryData);
      toast({
        title: 'Success',
        description: 'Category updated successfully'
      });
    } else {
      await categoryStore.createCategory(categoryData);
      toast({
        title: 'Success',
        description: 'Category created successfully'
      });
    }
    closeModals();
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to save category',
      variant: 'destructive'
    });
  }
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingCategory.value = null;
  parentCategory.value = null;
};

const exportCategories = async () => {
  try {
    const exportData = await categoryStore.exportCategories();
    
    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Success',
      description: 'Categories exported successfully'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to export categories',
      variant: 'destructive'
    });
  }
};

// Enterprise pagination event handlers
const handlePageChange = (page: number) => {
  categoryStore.setPage(page);
};

const handlePageSizeChange = (pageSize: number) => {
  categoryStore.setPageSize(pageSize as CategoryPaginationSizes);
};

// Clear filters method
const clearFilters = () => {
  searchTerm.value = '';
  statusFilter.value = 'all';
  categoryStore.clearAllFilters();
};

// Enterprise filter watchers
watch(searchTerm, (newValue) => {
  categoryStore.setSearchQuery(newValue || '');
});

watch(statusFilter, (newValue) => {
  const filterValue = newValue === 'all' ? '' : newValue;
  categoryStore.setStatusFilter(filterValue);
});

const handleImport = async (file: File) => {
  try {
    const content = await file.text();
    const importData = JSON.parse(content);
    
    const result = await categoryStore.importCategories(importData);
    
    toast({
      title: result.success ? 'Success' : 'Partial Success',
      description: `Imported ${result.importedCategories} categories. ${result.skippedItems.length} items skipped.`
    });
    
    showImportDialog.value = false;
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to import categories',
      variant: 'destructive'
    });
  }
};

const updateCategory = async (categoryId: string, updates: Partial<CreateCategoryForm>) => {
  try {
    await categoryStore.updateCategory(categoryId, updates);
    toast({
      title: 'Success',
      description: 'Category updated successfully'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update category',
      variant: 'destructive'
    });
  }
};

// Bulk operations
const bulkActivate = async () => {
  try {
    await categoryStore.bulkOperation({
      type: 'activate',
      categoryIds: selectedCategories.value
    });
    toast({
      title: 'Success',
      description: 'Categories activated successfully'
    });
    clearSelection();
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to activate categories',
      variant: 'destructive'
    });
  }
};

const bulkDeactivate = async () => {
  try {
    await categoryStore.bulkOperation({
      type: 'deactivate',
      categoryIds: selectedCategories.value
    });
    toast({
      title: 'Success',
      description: 'Categories deactivated successfully'
    });
    clearSelection();
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to deactivate categories',
      variant: 'destructive'
    });
  }
};

const bulkDelete = async () => {
  if (!confirm(`Are you sure you want to delete ${selectedCategories.value.length} categories? This action cannot be undone.`)) {
    return;
  }
  
  try {
    await categoryStore.bulkOperation({
      type: 'delete',
      categoryIds: selectedCategories.value
    });
    toast({
      title: 'Success',
      description: 'Categories deleted successfully'
    });
    clearSelection();
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to delete categories',
      variant: 'destructive'
    });
  }
};

const handleBulkMove = async (targetParentId: string | null) => {
  try {
    await categoryStore.bulkOperation({
      type: 'move',
      categoryIds: selectedCategories.value,
      targetParentId: targetParentId ?? undefined
    });
    toast({
      title: 'Success',
      description: 'Categories moved successfully'
    });
    clearSelection();
    showBulkMoveDialog.value = false;
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to move categories',
      variant: 'destructive'
    });
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    templateStore.fetchTemplates()
  ]);
});
</script>

<style scoped>
.admin-category-management {
  height: calc(100vh - 4rem); /* Account for main layout padding */
}

.category-tree {
  max-height: calc(100vh - 16rem);
  overflow-y: auto;
}

.category-list {
  max-height: calc(100vh - 16rem);
  overflow-y: auto;
}

.bulk-operations {
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>