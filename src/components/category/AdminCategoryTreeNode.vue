<template>
  <div 
    class="admin-category-node"
    :class="{ 
      'is-dragging': isDragging,
      'is-inactive': !category.isActive,
      'is-selected': isSelected
    }"
    :style="{ paddingLeft: `${level * 20}px` }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="handleDrop"
  >
    <!-- Node Content -->
    <div class="node-content group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors">
      <div class="flex items-center space-x-3 flex-1 min-w-0">
        <!-- Selection Checkbox -->
        <Checkbox
          :checked="isSelected"
          @update:checked="$emit('select', category.id)"
          class="flex-shrink-0"
        />
        
        <!-- Expand/Collapse Button -->
        <Button
          v-if="hasChildren"
          variant="ghost"
          size="sm"
          class="p-1 h-6 w-6 flex-shrink-0"
          @click.stop="toggleExpand"
        >
          <ChevronRight 
            class="h-4 w-4 transition-transform"
            :class="{ 'rotate-90': isExpanded }" 
          />
        </Button>
        <div v-else class="w-6 flex-shrink-0"></div>
        
        <!-- Category Indicator -->
        <div 
          class="category-indicator w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: category.color || '#6B7280' }"
        >
          <component 
            :is="getCategoryIcon(category.iconName)" 
            class="h-2.5 w-2.5 text-white"
          />
        </div>
        
        <!-- Category Info -->
        <div class="flex-1 min-w-0" @click="$emit('view-details', category)">
          <div class="flex items-center space-x-2">
            <span class="category-name font-medium text-foreground truncate">
              {{ category.name }}
            </span>
            <div class="flex items-center space-x-1 flex-shrink-0">
              <Badge v-if="!category.isActive" variant="secondary" class="text-xs">
                Inactive
              </Badge>
              <Badge variant="outline" class="text-xs">
                L{{ category.level }}
              </Badge>
              <Badge variant="outline" class="text-xs">
                {{ templateCount }} templates
              </Badge>
            </div>
          </div>
          
          <p v-if="category.description" class="text-sm text-muted-foreground truncate mt-1">
            {{ category.description }}
          </p>
        </div>
      </div>
      
      <!-- Action Menu -->
      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <!-- Quick Actions -->
        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          @click="$emit('add-child', category)"
          title="Add Sub-category"
        >
          <Plus class="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          @click="$emit('edit', category)"
          title="Edit Category"
        >
          <Edit class="h-4 w-4" />
        </Button>
        
        <!-- More Actions Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="$emit('view-details', category)">
              <Eye class="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            
            <DropdownMenuItem @click="$emit('edit', category)">
              <Edit class="h-4 w-4 mr-2" />
              Edit Category
            </DropdownMenuItem>
            
            <DropdownMenuItem @click="$emit('add-child', category)">
              <Plus class="h-4 w-4 mr-2" />
              Add Sub-category
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem @click="$emit('toggle-status', category)">
              <Power class="h-4 w-4 mr-2" />
              {{ category.isActive ? 'Deactivate' : 'Activate' }}
            </DropdownMenuItem>
            
            <DropdownMenuItem @click="duplicateCategory">
              <Copy class="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            
            <DropdownMenuItem @click="showMoveDialog = true">
              <ArrowUpDown class="h-4 w-4 mr-2" />
              Move Category
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              @click="$emit('delete', category)"
              :disabled="!canDelete"
              class="text-destructive focus:text-destructive"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    
    <!-- Children -->
    <div v-if="isExpanded && hasChildren" class="node-children mt-2 space-y-1">
      <AdminCategoryTreeNode
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :level="level + 1"
        :selected-categories="selectedCategories"
        :can-edit="canEdit"
        :can-delete="canDeleteChild(child)"
        :can-reorder="canReorder"
        v-bind="$attrs"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
        @toggle-status="$emit('toggle-status', $event)"
        @select="$emit('select', $event)"
        @view-details="$emit('view-details', $event)"
      />
    </div>

    <!-- Move Category Dialog -->
    <MoveCategoryDialog
      v-if="showMoveDialog"
      :category="category"
      @move="handleMove"
      @cancel="showMoveDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useTemplateStore } from '@/stores/template';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderCategory } from '@/types/templates';

// Components
import MoveCategoryDialog from './MoveCategoryDialog.vue';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  ChevronRight, Plus, Edit, MoreHorizontal, Eye, Power, Copy, Trash2, ArrowUpDown,
  Folder, Settings, Shield, Zap, Wrench, Package
} from 'lucide-vue-next';

interface Props {
  category: WorkOrderCategory;
  level?: number;
  selectedCategories: string[];
  canEdit?: boolean;
  canDelete?: boolean;
  canReorder?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  canEdit: true,
  canDelete: true,
  canReorder: true
});

defineEmits<{
  edit: [category: WorkOrderCategory];
  delete: [category: WorkOrderCategory];
  'add-child': [category: WorkOrderCategory];
  'toggle-status': [category: WorkOrderCategory];
  select: [categoryId: string];
  'view-details': [category: WorkOrderCategory];
}>();

// Stores and composables
const categoryStore = useCategoryStore();
const templateStore = useTemplateStore();
const { toast } = useToast();

// Local state
const isExpanded = ref(true);
const isDragging = ref(false);
const showMoveDialog = ref(false);

// Computed
const isSelected = computed(() => 
  props.selectedCategories.includes(props.category.id)
);

const hasChildren = computed(() => 
  props.category.children && props.category.children.length > 0
);

const templateCount = computed(() => {
  const templates = templateStore.getTemplatesByCategoryId(props.category.id);
  return templates.length;
});

const canDelete = computed(() => {
  return props.canDelete && !hasChildren.value && templateCount.value === 0;
});

// Methods
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const canDeleteChild = (child: WorkOrderCategory): boolean => {
  const childTemplateCount = templateStore.getTemplatesByCategoryId(child.id).length;
  const hasGrandChildren = child.children && child.children.length > 0;
  return !hasGrandChildren && childTemplateCount === 0;
};

const duplicateCategory = async () => {
  try {
    await categoryStore.duplicateCategory(props.category.id);
    toast({
      title: 'Success',
      description: 'Category duplicated successfully'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to duplicate category',
      variant: 'destructive'
    });
  }
};

const handleMove = async (newParentId: string | null) => {
  try {
    await categoryStore.moveCategory(props.category.id, newParentId);
    toast({
      title: 'Success',
      description: 'Category moved successfully'
    });
    showMoveDialog.value = false;
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to move category',
      variant: 'destructive'
    });
  }
};

// Drag and drop handlers
const handleDragStart = (event: DragEvent) => {
  if (!props.canReorder) return;
  
  isDragging.value = true;
  event.dataTransfer!.setData('text/plain', props.category.id);
  event.dataTransfer!.effectAllowed = 'move';
};

const handleDrop = (event: DragEvent) => {
  if (!props.canReorder) return;
  
  event.preventDefault();
  const draggedCategoryId = event.dataTransfer!.getData('text/plain');
  
  if (draggedCategoryId !== props.category.id) {
    // Move the dragged category to be a child of this category
    handleMove(props.category.id);
  }
  
  isDragging.value = false;
};

// Icon mapping
const getCategoryIcon = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    'PipeIcon': Wrench,
    'GearIcon': Settings,
    'ShieldIcon': Shield,
    'TankIcon': Package,
    'ZapIcon': Zap,
    'FolderIcon': Folder,
  };
  
  return iconMap[iconName || 'FolderIcon'] || Folder;
};
</script>

<style scoped>
.admin-category-node {
  transition: all 0.2s ease;
}

.admin-category-node.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.admin-category-node.is-inactive {
  opacity: 0.6;
}

.admin-category-node.is-selected {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
}

.category-indicator {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.node-children {
  position: relative;
}

.node-children::before {
  content: '';
  position: absolute;
  left: 1.5rem;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: hsl(var(--border));
  opacity: 0.5;
}

.category-name {
  cursor: pointer;
}

.category-name:hover {
  color: hsl(var(--primary));
}

/* Drag and drop visual feedback */
.admin-category-node[draggable="true"]:hover {
  cursor: move;
}

.admin-category-node.drag-over {
  background-color: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
}

/* Animation for expand/collapse */
.node-children {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>