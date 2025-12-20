<template>
  <div 
    class="tree-node relative"
    :draggable="isDraggable"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    <!-- Drop zones -->
    <div 
      v-if="showDropZones"
      class="drop-zone drop-zone-before"
      :class="{ 'drop-zone-active': dropPosition === 'before' }"
      @dragover.prevent="setDropPosition('before')"
      @drop="handleDrop"
    />
    
    <!-- Category Node -->
    <div 
      class="flex items-center space-x-2 py-2 px-3 rounded-lg cursor-pointer tree-node-content"
      :class="{
        'selected': selectedId === category.id,
        'bg-muted/50': selectedId === category.id,
        'drag-over': isDragOver && dropPosition === 'inside',
        'dragging': isDragging,
        'drop-disabled': !canDrop
      }"
      @click="handleCategoryClick"
      @contextmenu.prevent="$emit('contextMenu', category, $event)"
    >
      <!-- Expand/Collapse Button -->
      <Button
        v-if="hasChildren"
        variant="ghost"
        size="sm"
        class="h-6 w-6 p-0"
        @click.stop="$emit('toggle', category.id)"
      >
        <ChevronRight 
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
        />
      </Button>
      <div v-else class="w-6" />
      
      <!-- Drag Handle -->
      <div 
        v-if="allowReorder"
        class="drag-handle cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100"
        @mousedown.prevent="startDrag"
      >
        <GripVertical class="h-4 w-4" />
      </div>
      
      <!-- Category Icon -->
      <div 
        class="w-4 h-4 rounded-full flex items-center justify-center"
        :style="{ backgroundColor: category.color || '#6B7280' }"
      >
        <Folder class="h-2.5 w-2.5 text-white" />
      </div>
      
      <!-- Category Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <span 
            class="font-medium text-sm truncate"
            :class="{
              'text-muted-foreground': !category.isActive
            }"
          >
            <mark v-if="highlightedName" v-html="highlightedName" />
            <span v-else>{{ category.name }}</span>
          </span>
          <Badge v-if="!category.isActive" variant="secondary" class="text-xs">
            Inactive
          </Badge>
        </div>
        <p 
          v-if="category.description" 
          class="text-xs text-muted-foreground truncate"
        >
          {{ category.description }}
        </p>
      </div>
      
      <!-- Template Count -->
      <div v-if="templateCount > 0" class="flex items-center space-x-1">
        <FileText class="h-3 w-3 text-muted-foreground" />
        <span class="text-xs text-muted-foreground">{{ templateCount }}</span>
      </div>
      
      <!-- Level Indicator -->
      <div class="text-xs text-muted-foreground opacity-50">
        L{{ category.level }}
      </div>
      
      <!-- Move Indicators -->
      <div v-if="isDragOver" class="move-indicator">
        <div v-if="dropPosition === 'before'" class="move-line move-line-before" />
        <div v-if="dropPosition === 'after'" class="move-line move-line-after" />
        <div v-if="dropPosition === 'inside'" class="move-target">
          <Plus class="h-3 w-3" />
        </div>
      </div>
    </div>
    
    <!-- Drop zone after -->
    <div 
      v-if="showDropZones"
      class="drop-zone drop-zone-after"
      :class="{ 'drop-zone-active': dropPosition === 'after' }"
      @dragover.prevent="setDropPosition('after')"
      @drop="handleDrop"
    />
    
    <!-- Templates (if shown) -->
    <div 
      v-if="showTemplates && isExpanded && templates.length > 0" 
      class="ml-8 mt-1 space-y-1"
    >
      <div
        v-for="template in templates"
        :key="template.id"
        class="flex items-center space-x-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-muted/30"
        @click="$emit('templateSelect', template)"
      >
        <div class="w-4 h-4 flex items-center justify-center">
          <FileText class="h-3 w-3 text-blue-500" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium truncate">{{ template.name }}</span>
            <Badge 
              :variant="template.isActive ? 'default' : 'secondary'" 
              class="text-xs"
            >
              v{{ template.version }}
            </Badge>
            <Badge 
              v-if="template.approvedBy" 
              variant="outline" 
              class="text-xs text-green-600"
            >
              Approved
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground truncate">
            {{ template.description }}
          </p>
          <div class="flex items-center space-x-4 mt-1">
            <span class="text-xs text-muted-foreground">
              {{ template.type }} {{ template.subType ? `• ${template.subType}` : '' }}
            </span>
            <span class="text-xs text-muted-foreground">
              Used {{ template.usageCount }} times
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Children Categories -->
    <div v-if="hasChildren && isExpanded" class="ml-6 mt-1 space-y-1">
      <DragDropCategoryTreeNode
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :expanded-nodes="expandedNodes"
        :selected-id="selectedId"
        :show-templates="showTemplates"
        :search-query="searchQuery"
        :allow-reorder="allowReorder"
        :dragging-category="draggingCategory"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
        @template-select="$emit('templateSelect', $event)"
        @move="$emit('move', $event)"
        @context-menu="(category, event) => $emit('contextMenu', category, event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTemplateStore } from '@/stores/template';
import type { WorkOrderCategory, WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { ChevronRight, Folder, FileText, GripVertical, Plus } from 'lucide-vue-next';

interface Props {
  category: WorkOrderCategory;
  expandedNodes: Set<string>;
  selectedId?: string;
  showTemplates?: boolean;
  searchQuery?: string;
  allowReorder?: boolean;
  draggingCategory?: WorkOrderCategory | null;
}

interface MoveEvent {
  sourceId: string;
  targetId: string;
  position: 'before' | 'after' | 'inside';
}

const props = withDefaults(defineProps<Props>(), {
  allowReorder: false,
  draggingCategory: null
});

const emit = defineEmits<{
  toggle: [categoryId: string];
  select: [categoryId: string];
  templateSelect: [template: WorkOrderTemplate];
  move: [event: MoveEvent];
  contextMenu: [category: WorkOrderCategory, event: MouseEvent];
}>();

// Store
const templateStore = useTemplateStore();

// Drag and Drop State
const isDragging = ref(false);
const isDragOver = ref(false);
const dropPosition = ref<'before' | 'after' | 'inside'>('inside');

// Computed
const hasChildren = computed(() => {
  return props.category.children && props.category.children.length > 0;
});

const isExpanded = computed(() => {
  return props.expandedNodes.has(props.category.id);
});

const templates = computed(() => {
  return templateStore.getTemplatesByCategoryId(props.category.id)
    .filter(template => template.isActive);
});

const templateCount = computed(() => {
  return templates.value.length;
});

const highlightedName = computed(() => {
  if (!props.searchQuery?.trim()) return null;
  
  const query = props.searchQuery.trim();
  const name = props.category.name;
  const regex = new RegExp(`(${query})`, 'gi');
  
  if (regex.test(name)) {
    return name.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }
  
  return null;
});

const isDraggable = computed(() => {
  return props.allowReorder;
});

const showDropZones = computed(() => {
  return props.allowReorder && props.draggingCategory && 
         props.draggingCategory.id !== props.category.id;
});

const canDrop = computed(() => {
  if (!props.draggingCategory) return false;
  
  // Can't drop on itself or its descendants
  if (props.draggingCategory.id === props.category.id) return false;
  
  // Check if target is a descendant of the dragging category
  const isDescendant = (category: WorkOrderCategory, targetId: string): boolean => {
    if (!category.children) return false;
    
    for (const child of category.children) {
      if (child.id === targetId) return true;
      if (isDescendant(child, targetId)) return true;
    }
    return false;
  };
  
  return !isDescendant(props.draggingCategory, props.category.id);
});

// Drag and Drop Methods
const startDrag = () => {
  if (!props.allowReorder) return;
  isDragging.value = true;
};

const handleDragStart = (event: DragEvent) => {
  if (!props.allowReorder) return;
  
  isDragging.value = true;
  event.dataTransfer!.effectAllowed = 'move';
  event.dataTransfer!.setData('text/plain', props.category.id);
  
  // Set custom drag image
  const dragImage = event.target as HTMLElement;
  event.dataTransfer!.setDragImage(dragImage, 20, 20);
};

const handleDragOver = (event: DragEvent) => {
  if (!canDrop.value) {
    event.dataTransfer!.dropEffect = 'none';
    return;
  }
  
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
  
  // Calculate drop position based on mouse position
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const y = event.clientY - rect.top;
  const height = rect.height;
  
  if (y < height * 0.25) {
    dropPosition.value = 'before';
  } else if (y > height * 0.75) {
    dropPosition.value = 'after';
  } else {
    dropPosition.value = 'inside';
  }
};

const handleDragEnter = (_: DragEvent) => {
  if (canDrop.value) {
    isDragOver.value = true;
  }
};

const handleDragLeave = (event: DragEvent) => {
  // Only hide drop zone if leaving the entire node
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false;
  }
};

const handleDrop = (event: DragEvent) => {
  if (!canDrop.value) return;
  
  event.preventDefault();
  isDragOver.value = false;
  
  const sourceId = event.dataTransfer!.getData('text/plain');
  if (sourceId && sourceId !== props.category.id) {
    emit('move', {
      sourceId,
      targetId: props.category.id,
      position: dropPosition.value
    });
  }
};

const handleDragEnd = () => {
  isDragging.value = false;
  isDragOver.value = false;
};

const setDropPosition = (position: 'before' | 'after' | 'inside') => {
  dropPosition.value = position;
};

// Methods
const handleCategoryClick = () => {
  emit('select', props.category.id);
  
  // Auto-expand if has children and not expanded
  if (hasChildren.value && !isExpanded.value) {
    emit('toggle', props.category.id);
  }
};
</script>

<style scoped>
.tree-node-content {
  transition: all 0.2s ease;
  position: relative;
}

.tree-node-content:hover {
  background-color: var(--muted);
}

.tree-node-content.selected {
  background-color: var(--accent);
  border: 1px solid var(--ring);
}

.tree-node-content.drag-over {
  background-color: var(--primary);
  background-opacity: 0.1;
  border: 2px dashed var(--primary);
}

.tree-node-content.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.tree-node-content.drop-disabled {
  cursor: not-allowed;
}

.drag-handle {
  transition: opacity 0.2s ease;
}

.drop-zone {
  height: 2px;
  margin: 1px 0;
  transition: all 0.2s ease;
}

.drop-zone-active {
  height: 8px;
  background-color: var(--primary);
  border-radius: 4px;
  margin: 4px 0;
}

.drop-zone-before {
  margin-top: -1px;
}

.drop-zone-after {
  margin-bottom: -1px;
}

.move-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.move-line {
  width: 20px;
  height: 2px;
  background-color: var(--primary);
  position: relative;
}

.move-line::before {
  content: '';
  position: absolute;
  right: -4px;
  top: -2px;
  width: 0;
  height: 0;
  border-left: 4px solid var(--primary);
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
}

.move-line-before {
  transform: translateY(-100%);
}

.move-line-after {
  transform: translateY(100%);
}

.move-target {
  width: 20px;
  height: 20px;
  border: 2px dashed var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background);
}

.tree-node :deep(mark) {
  background-color: var(--yellow-200);
  padding: 0 2px;
  border-radius: 2px;
}

/* Drag feedback */
.tree-node[draggable="true"]:hover .drag-handle {
  opacity: 1;
}

.tree-node.dragging * {
  pointer-events: none;
}
</style>