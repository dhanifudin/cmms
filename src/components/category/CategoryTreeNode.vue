<template>
  <div class="tree-node">
    <!-- Category Node -->
    <div 
      class="flex items-center space-x-2 py-2 px-3 rounded-lg cursor-pointer tree-node-content"
      :class="{
        'selected': selectedId === category.id,
        'bg-muted/50': selectedId === category.id
      }"
      @click="handleCategoryClick"
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
    </div>
    
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
      <CategoryTreeNode
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :expanded-nodes="expandedNodes"
        :selected-id="selectedId"
        :show-templates="showTemplates"
        :search-query="searchQuery"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
        @template-select="$emit('templateSelect', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateStore } from '@/stores/template';
import type { WorkOrderCategory, WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { ChevronRight, Folder, FileText } from 'lucide-vue-next';

interface Props {
  category: WorkOrderCategory;
  expandedNodes: Set<string>;
  selectedId?: string;
  showTemplates?: boolean;
  searchQuery?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [categoryId: string];
  select: [categoryId: string];
  templateSelect: [template: WorkOrderTemplate];
}>();

// Store
const templateStore = useTemplateStore();

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
}

.tree-node-content:hover {
  background-color: var(--muted);
}

.tree-node-content.selected {
  background-color: var(--accent);
  border: 1px solid var(--ring);
}

.tree-node :deep(mark) {
  background-color: var(--yellow-200);
  padding: 0 2px;
  border-radius: 2px;
}
</style>