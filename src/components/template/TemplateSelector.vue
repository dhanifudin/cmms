<template>
  <div class="template-selector">
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-lg">Select Template</h3>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            @click="showCategorySelector = !showCategorySelector"
          >
            <Filter class="h-4 w-4 mr-2" />
            Filter by Category
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="refreshTemplates"
          >
            <RotateCcw class="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <!-- Category Filter -->
      <div v-if="showCategorySelector" class="p-4 bg-muted/30 rounded-lg">
        <Label class="text-sm font-medium mb-2 block">Filter by Category</Label>
        <CategorySelector
          v-model="selectedCategoryId"
          placeholder="All categories"
          :clearable="true"
          @category-select="handleCategoryFilter"
        />
      </div>

      <!-- Search and Filters -->
      <div class="space-y-3">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="Search templates..."
              class="w-full"
            >
              <template #prefix>
                <Search class="h-4 w-4 text-muted-foreground" />
              </template>
            </Input>
          </div>
        </div>
        
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="activeOnly"
              v-model:checked="showActiveOnly"
            />
            <Label for="activeOnly" class="text-sm">Active only</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox
              id="approvedOnly"
              v-model:checked="showApprovedOnly"
            />
            <Label for="approvedOnly" class="text-sm">Approved only</Label>
          </div>
          <Select v-model="typeFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All Types</SelectItem>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Templates Grid -->
      <div class="grid gap-4">
        <div v-if="filteredTemplates.length === 0" class="text-center py-8 text-muted-foreground">
          <FileText class="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No templates found</p>
          <p class="text-xs">Try adjusting your filters</p>
        </div>
        
        <div
          v-for="template in paginatedTemplates"
          :key="template.id"
          class="template-card p-4 border border-border rounded-lg cursor-pointer transition-all duration-200"
          :class="{
            'border-ring bg-accent': selectedTemplateId === template.id,
            'hover:border-ring/50 hover:shadow-sm': selectedTemplateId !== template.id
          }"
          @click="selectTemplate(template)"
        >
          <div class="space-y-3">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center space-x-2">
                  <h4 class="font-medium text-sm truncate">{{ template.name }}</h4>
                  <Badge 
                    :variant="template.isActive ? 'default' : 'secondary'"
                    class="text-xs"
                  >
                    v{{ template.version }}
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground line-clamp-2">
                  {{ template.description }}
                </p>
              </div>
              <div class="flex items-center space-x-1 ml-4">
                <Badge 
                  v-if="template.approvedBy" 
                  variant="outline" 
                  class="text-xs text-green-600 border-green-200"
                >
                  <CheckCircle class="h-3 w-3 mr-1" />
                  Approved
                </Badge>
                <Badge 
                  :variant="getTypeVariant(template.type)"
                  class="text-xs"
                >
                  {{ template.type }}
                </Badge>
              </div>
            </div>

            <!-- Category Path -->
            <div class="flex items-center space-x-2 text-xs text-muted-foreground">
              <Folder class="h-3 w-3" />
              <span>{{ getCategoryPath(template.categoryId) }}</span>
            </div>

            <!-- Stats -->
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <div class="flex items-center space-x-4">
                <span>{{ template.checklist?.length || 0 }} checklist items</span>
                <span>{{ template.sopSteps?.length || 0 }} SOP steps</span>
                <span>{{ template.materials?.length || 0 }} materials</span>
              </div>
              <div class="flex items-center space-x-1">
                <Activity class="h-3 w-3" />
                <span>Used {{ template.usageCount }} times</span>
              </div>
            </div>

            <!-- Priority & Duration -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-xs text-muted-foreground">Default Priority:</span>
                <Badge 
                  :variant="getPriorityVariant(template.defaultPriority)"
                  class="text-xs"
                >
                  {{ template.defaultPriority }}
                </Badge>
              </div>
              <div class="flex items-center space-x-1">
                <Clock class="h-3 w-3 text-muted-foreground" />
                <span class="text-xs text-muted-foreground">
                  ~{{ template.estimatedDuration }}h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Showing {{ ((currentPage - 1) * pageSize) + 1 }}-{{ Math.min(currentPage * pageSize, filteredTemplates.length) }} 
          of {{ filteredTemplates.length }} templates
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            Previous
          </Button>
          <div class="flex items-center space-x-1">
            <Button
              v-for="page in visiblePages"
              :key="page"
              :variant="page === currentPage ? 'default' : 'outline'"
              size="sm"
              class="w-8 h-8 p-0"
              @click="currentPage = Number(page)"
            >
              {{ page }}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useTemplateStore } from '@/stores/template';
import type { WorkOrderTemplate, WorkOrderCategory } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Components
import CategorySelector from '../category/CategorySelector.vue';

// Icons
import { 
  Search, Filter, RotateCcw, FileText, Folder, CheckCircle,
  Activity, Clock
} from 'lucide-vue-next';

interface Props {
  modelValue?: string;
  categoryId?: string;
  allowMultiple?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [templateId: string | undefined];
  'template-select': [template: WorkOrderTemplate];
}>();

// Stores
const categoryStore = useCategoryStore();
const templateStore = useTemplateStore();

// State
const searchQuery = ref('');
const selectedCategoryId = ref(props.categoryId || '');
const selectedTemplateId = ref(props.modelValue || '');
const showActiveOnly = ref(true);
const showApprovedOnly = ref(false);
const typeFilter = ref('');
const showCategorySelector = ref(false);
const currentPage = ref(1);
const pageSize = ref(12);

// Computed
const filteredTemplates = computed(() => {
  let templates = templateStore.templates;

  // Filter by category
  if (selectedCategoryId.value) {
    templates = templates.filter(t => t.categoryId === selectedCategoryId.value);
  }

  // Filter by active status
  if (showActiveOnly.value) {
    templates = templates.filter(t => t.isActive);
  }

  // Filter by approved status
  if (showApprovedOnly.value) {
    templates = templates.filter(t => t.approvedBy);
  }

  // Filter by type
  if (typeFilter.value && typeFilter.value !== '__ALL__') {
    templates = templates.filter(t => t.type === typeFilter.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    templates = templates.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  }

  return templates.sort((a, b) => {
    // Sort by usage count (most used first), then by name
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount;
    }
    return a.name.localeCompare(b.name);
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredTemplates.value.length / pageSize.value);
});

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTemplates.value.slice(start, end);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total);
  } else {
    rangeWithDots.push(total);
  }

  return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index && item !== 1 || index === 0);
});

// Methods
const getCategoryPath = (categoryId: string): string => {
  return categoryStore.getCategoryPathString(categoryId);
};

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'preventive': return 'default';
    case 'corrective': return 'destructive';
    default: return 'secondary';
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': 
    case 'urgent': 
      return 'destructive';
    case 'medium': 
    case 'normal': 
      return 'default';
    case 'low': 
      return 'secondary';
    default: 
      return 'outline';
  }
};

const selectTemplate = (template: WorkOrderTemplate) => {
  selectedTemplateId.value = template.id;
  emit('update:modelValue', template.id);
  emit('template-select', template);
};

const handleCategoryFilter = (category: WorkOrderCategory | null) => {
  selectedCategoryId.value = category?.id || '';
  currentPage.value = 1; // Reset to first page
};

const refreshTemplates = async () => {
  // In a real app, this would refetch templates from the API
  // For now, just trigger a reactivity update
  templateStore.$patch({ loading: true });
  setTimeout(() => {
    templateStore.$patch({ loading: false });
  }, 100);
};

// Reset page when filters change
watch([searchQuery, showActiveOnly, showApprovedOnly, typeFilter, selectedCategoryId], () => {
  currentPage.value = 1;
});

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  selectedTemplateId.value = newValue || '';
});

watch(() => props.categoryId, (newValue) => {
  selectedCategoryId.value = newValue || '';
});
</script>

<style scoped>
.template-card {
  transition: all 0.2s ease;
}

.template-card:hover {
  transform: translateY(-1px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>