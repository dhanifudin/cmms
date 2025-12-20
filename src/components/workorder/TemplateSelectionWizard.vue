<template>
  <div class="template-selection-wizard space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold">Select Template</h2>
        <p class="text-sm text-muted-foreground">
          Browse categories and choose a template to start your work order
        </p>
      </div>
      
      <div class="flex items-center space-x-2">
        <Button v-if="selectedCategory || selectedTemplate" variant="outline" size="sm" @click="reset">
          <RotateCcw class="h-4 w-4 mr-2" />
          Reset Selection
        </Button>
      </div>
    </div>

    <!-- Progress Indicator -->
    <div class="flex items-center space-x-2 text-sm">
      <div 
        class="flex items-center space-x-1"
        :class="currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'"
      >
        <div 
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
            currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          ]"
        >
          1
        </div>
        <span>Choose Category</span>
      </div>
      
      <ChevronRight class="h-4 w-4 text-muted-foreground" />
      
      <div 
        class="flex items-center space-x-1"
        :class="currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'"
      >
        <div 
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
            currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          ]"
        >
          2
        </div>
        <span>Select Template</span>
      </div>
      
      <ChevronRight class="h-4 w-4 text-muted-foreground" />
      
      <div 
        class="flex items-center space-x-1"
        :class="currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'"
      >
        <div 
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
            currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          ]"
        >
          3
        </div>
        <span>Preview & Confirm</span>
      </div>
    </div>

    <!-- Step 1: Category Selection -->
    <div v-if="currentStep === 1" key="category-step">
      <CategoryBrowser
        :categories="categories"
        :selected-category="selectedCategory"
        :maintenance-type="maintenanceType"
        @category-selected="handleCategorySelected"
        @view-templates="handleViewTemplates"
      />
    </div>

    <!-- Step 2: Template Selection -->
    <div v-else-if="currentStep === 2" key="template-step">
      <div class="space-y-4">
        <!-- Category Breadcrumb -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 text-sm">
            <Badge variant="outline">
              {{ selectedCategory?.name }}
            </Badge>
            <span class="text-muted-foreground">•</span>
            <span class="text-muted-foreground">
              {{ categoryTemplates.length }} template{{ categoryTemplates.length !== 1 ? 's' : '' }}
            </span>
          </div>
          
          <Button variant="outline" size="sm" @click="backToCategories">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>

        <TemplateGrid
          :templates="categoryTemplates"
          :category-name="selectedCategory?.name"
          :maintenance-type="maintenanceType"
          @template-selected="handleTemplateSelected"
          @template-preview="handleTemplatePreview"
          @back="backToCategories"
        />
      </div>
    </div>

    <!-- Step 3: Template Preview -->
    <div v-else-if="currentStep === 3" key="preview-step">
      <div class="space-y-4">
        <!-- Navigation -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 text-sm">
            <Badge variant="outline">{{ selectedCategory?.name }}</Badge>
            <ChevronRight class="h-3 w-3 text-muted-foreground" />
            <Badge>{{ selectedTemplate?.name }}</Badge>
          </div>
          
          <Button variant="outline" size="sm" @click="backToTemplates">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>

        <!-- Template Preview -->
        <TemplatePreviewCard
          v-if="selectedTemplate"
          :template="selectedTemplate"
          @use-template="confirmTemplateSelection"
          @close="backToTemplates"
        />
      </div>
    </div>

    <!-- Quick Template Search (Alternative Path) -->
    <div v-if="currentStep === 1" class="border-t pt-6">
      <div class="text-center">
        <h3 class="font-medium mb-2">Know what you're looking for?</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Search for templates directly by name or code
        </p>
        
        <!-- Search Input -->
        <div class="max-w-md mx-auto mb-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Search templates..."
              class="pl-10"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="max-w-2xl mx-auto">
          <h4 class="font-medium mb-3 text-left">Search Results ({{ searchResults.length }})</h4>
          <div class="space-y-2">
            <Card
              v-for="template in searchResults.slice(0, 5)"
              :key="template.id"
              class="cursor-pointer text-left transition-all hover:shadow-md hover:border-ring"
              @click="handleTemplateSelected(template)"
            >
              <CardContent class="p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="font-medium">{{ template.name }}</span>
                      <Badge :variant="getTypeVariant(template.type)" class="text-xs">
                        {{ template.type }}
                      </Badge>
                    </div>
                    <p class="text-sm text-muted-foreground">{{ template.description }}</p>
                    <div class="flex items-center space-x-3 text-xs text-muted-foreground mt-2">
                      <span>{{ getCategoryName(template.categoryId) }}</span>
                      <span>•</span>
                      <span>{{ template.estimatedDuration }}h</span>
                      <span>•</span>
                      <span>{{ template.checklist?.length || 0 }} checklist items</span>
                    </div>
                  </div>
                  <Button size="sm">
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div v-if="searchResults.length > 5" class="text-sm text-muted-foreground mt-3">
            +{{ searchResults.length - 5 }} more results
          </div>
        </div>
        
        <div v-else-if="searchQuery && searchQuery.length > 2" class="text-sm text-muted-foreground">
          No templates found for "{{ searchQuery }}"
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { WorkOrderCategory, WorkOrderTemplate } from '@/types/templates';

// Custom Components
import CategoryBrowser from './CategoryBrowser.vue';
import TemplateGrid from './TemplateGrid.vue';
import TemplatePreviewCard from './TemplatePreviewCard.vue';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Icons
import {
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  Search,
} from 'lucide-vue-next';

interface Props {
  categories: WorkOrderCategory[];
  templates: WorkOrderTemplate[];
  maintenanceType?: 'preventive' | 'corrective';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  templateSelected: [template: WorkOrderTemplate];
  categorySelected: [category: WorkOrderCategory | null];
}>();

// State
const currentStep = ref(1);
const selectedCategory = ref<WorkOrderCategory | null>(null);
const selectedTemplate = ref<WorkOrderTemplate | null>(null);
const searchQuery = ref('');

// Computed
const categoryTemplates = computed(() => {
  if (!selectedCategory.value) return [];
  
  return props.templates.filter(template => {
    // Check if template belongs to selected category or its children
    const categoryMatch = template.categoryId === selectedCategory.value!.id;
    const typeMatch = !props.maintenanceType || template.type === props.maintenanceType;
    
    return categoryMatch && typeMatch;
  });
});

const searchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 3) return [];
  
  const query = searchQuery.value.toLowerCase();
  return props.templates.filter(template => 
    template.name.toLowerCase().includes(query) ||
    template.description.toLowerCase().includes(query) ||
    template.code.toLowerCase().includes(query) ||
    template.tags?.some(tag => tag.toLowerCase().includes(query))
  );
});

// Methods
const handleCategorySelected = (category: WorkOrderCategory | null) => {
  selectedCategory.value = category;
  emit('categorySelected', category);
  
  if (category) {
    currentStep.value = 1; // Stay on category step for navigation
  }
};

const handleViewTemplates = (category: WorkOrderCategory) => {
  selectedCategory.value = category;
  currentStep.value = 2;
  emit('categorySelected', category);
};

const handleTemplateSelected = (template: WorkOrderTemplate) => {
  selectedTemplate.value = template;
  currentStep.value = 3;
  
  // Also ensure the category is selected
  if (!selectedCategory.value) {
    const category = findCategoryById(template.categoryId);
    if (category) {
      selectedCategory.value = category;
      emit('categorySelected', category);
    }
  }
};

const handleTemplatePreview = (template: WorkOrderTemplate) => {
  selectedTemplate.value = template;
  currentStep.value = 3;
};

const confirmTemplateSelection = () => {
  if (selectedTemplate.value) {
    emit('templateSelected', selectedTemplate.value);
  }
};

const backToCategories = () => {
  currentStep.value = 1;
  selectedCategory.value = null;
  emit('categorySelected', null);
};

const backToTemplates = () => {
  currentStep.value = 2;
  selectedTemplate.value = null;
};

const reset = () => {
  currentStep.value = 1;
  selectedCategory.value = null;
  selectedTemplate.value = null;
  selectedTemplate.value = null;
  searchQuery.value = '';
  emit('categorySelected', null);
};

const handleSearch = () => {
  // Search is reactive through computed property
};

const findCategoryById = (categoryId: string): WorkOrderCategory | undefined => {
  const findInArray = (categories: WorkOrderCategory[]): WorkOrderCategory | undefined => {
    for (const category of categories) {
      if (category.id === categoryId) return category;
      if (category.children) {
        const found = findInArray(category.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  return findInArray(props.categories);
};

const getCategoryName = (categoryId: string): string => {
  const category = findCategoryById(categoryId);
  return category?.name || 'Unknown Category';
};

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'preventive': return 'default';
    case 'corrective': return 'destructive';
    default: return 'secondary';
  }
};

// Watch for direct template selection (like from search)
watch(() => selectedTemplate.value, (template) => {
  if (template && currentStep.value === 1) {
    // If template is selected from search, jump to preview
    currentStep.value = 3;
  }
});
</script>