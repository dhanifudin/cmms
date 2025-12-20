<template>
  <div class="category-browser">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold text-lg">Browse Categories</h3>
        <p class="text-sm text-muted-foreground">
          Select a maintenance category to view available templates
        </p>
      </div>
      <Button v-if="selectedCategory" variant="outline" size="sm" @click="clearSelection">
        <X class="h-4 w-4 mr-2" />
        Clear Selection
      </Button>
    </div>

    <!-- Breadcrumb -->
    <div v-if="selectedPath.length > 0" class="mb-4">
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2">
          <li>
            <Button variant="ghost" size="sm" @click="selectCategory(null)" class="h-auto p-1">
              <Home class="h-4 w-4" />
            </Button>
          </li>
          <li v-for="category in selectedPath" :key="category.id" class="flex items-center">
            <ChevronRight class="h-4 w-4 text-muted-foreground mx-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              class="h-auto p-1 font-medium"
              @click="selectCategory(category)"
            >
              {{ category.name }}
            </Button>
          </li>
        </ol>
      </nav>
    </div>

    <!-- Category Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card
        v-for="category in currentLevelCategories"
        :key="category.id"
        class="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-ring"
        :class="{ 'ring-2 ring-ring': selectedCategory?.id === category.id }"
        @click="selectCategory(category)"
      >
        <CardContent class="p-4">
          <div class="flex items-start space-x-3">
            <!-- Category Icon -->
            <div 
              :class="[
                'flex-none w-10 h-10 rounded-lg flex items-center justify-center',
                category.color ? `bg-${category.color}-100` : 'bg-muted'
              ]"
            >
              <component 
                :is="getCategoryIcon(category.iconName)" 
                :class="[
                  'h-5 w-5',
                  category.color ? `text-${category.color}-600` : 'text-muted-foreground'
                ]"
              />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-sm leading-tight">{{ category.name }}</h4>
                  <p v-if="category.description" class="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {{ category.description }}
                  </p>
                </div>
                <ChevronRight v-if="category.children && category.children.length > 0" class="h-4 w-4 text-muted-foreground ml-2 flex-none" />
              </div>
              
              <!-- Category Stats -->
              <div class="flex items-center space-x-3 mt-3 text-xs text-muted-foreground">
                <div class="flex items-center space-x-1">
                  <FileText class="h-3 w-3" />
                  <span>{{ category.templateCount || 0 }} templates</span>
                </div>
                <div v-if="category.children && category.children.length > 0" class="flex items-center space-x-1">
                  <Folder class="h-3 w-3" />
                  <span>{{ category.children.length }} subcategories</span>
                </div>
              </div>

              <!-- Maintenance Types -->
              <div v-if="category.maintenanceTypes.length > 0" class="flex flex-wrap gap-1 mt-2">
                <Badge 
                  v-for="type in category.maintenanceTypes" 
                  :key="type"
                  variant="outline" 
                  class="text-xs"
                >
                  {{ type }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Selected Category Details -->
    <Card v-if="selectedCategory" class="border-ring">
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <component 
            :is="getCategoryIcon(selectedCategory.iconName)" 
            :class="[
              'h-5 w-5',
              selectedCategory.color ? `text-${selectedCategory.color}-600` : 'text-muted-foreground'
            ]"
          />
          <span>{{ selectedCategory.name }}</span>
        </CardTitle>
        <p v-if="selectedCategory.description" class="text-sm text-muted-foreground">
          {{ selectedCategory.description }}
        </p>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Category Path -->
        <div>
          <Label class="text-sm font-medium">Full Path</Label>
          <p class="text-sm text-muted-foreground">{{ selectedCategory.path }}</p>
        </div>

        <!-- Category Properties -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label class="text-sm font-medium">Default Priority</Label>
            <Badge :variant="getPriorityVariant(selectedCategory.defaultPriority)">
              {{ selectedCategory.defaultPriority }}
            </Badge>
          </div>
          <div>
            <Label class="text-sm font-medium">Est. Duration</Label>
            <span class="font-mono">{{ selectedCategory.defaultEstimatedDuration }}h</span>
          </div>
        </div>

        <!-- Template Count -->
        <div>
          <Label class="text-sm font-medium">Available Templates</Label>
          <div class="flex items-center space-x-2 mt-1">
            <FileText class="h-4 w-4 text-blue-500" />
            <span class="font-medium">{{ selectedCategory.templateCount || 0 }}</span>
            <span class="text-muted-foreground">templates in this category</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-2">
          <Button @click="viewTemplates" :disabled="!selectedCategory.templateCount">
            <FileText class="h-4 w-4 mr-2" />
            View Templates
            <ArrowRight class="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <Card v-if="currentLevelCategories.length === 0" class="text-center py-8">
      <CardContent>
        <Folder class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="font-medium mb-2">No categories found</h3>
        <p class="text-sm text-muted-foreground">
          This level doesn't have any categories yet.
        </p>
        <Button v-if="selectedPath.length > 0" variant="outline" class="mt-4" @click="goBack">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { WorkOrderCategory } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Icons
import {
  Home,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Folder,
  Settings,
  Wrench,
  Gauge,
  Zap,
  Shield,
  Droplets,
  Wind,
  Flame,
  Activity,
  Cog,
} from 'lucide-vue-next';

interface Props {
  categories: WorkOrderCategory[];
  selectedCategory?: WorkOrderCategory | null;
  maintenanceType?: 'preventive' | 'corrective';
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategory: null
});

const emit = defineEmits<{
  categorySelected: [category: WorkOrderCategory | null];
  viewTemplates: [category: WorkOrderCategory];
}>();

// State
const currentCategory = ref<WorkOrderCategory | null>(props.selectedCategory);

// Computed
const selectedPath = computed(() => {
  if (!currentCategory.value) return [];
  
  const path: WorkOrderCategory[] = [];
  let category: WorkOrderCategory | undefined = currentCategory.value;
  
  while (category) {
    path.unshift(category);
    // Find parent category
    category = findCategoryById(category.parentId);
  }
  
  return path.slice(0, -1); // Exclude current category from path
});

const currentLevelCategories = computed(() => {
  if (!currentCategory.value) {
    // Show root level categories
    return props.categories.filter(cat => !cat.parentId);
  }
  
  // Show children of current category
  return currentCategory.value.children || [];
});

const selectedCategory = computed(() => currentCategory.value);

// Methods
const findCategoryById = (categoryId?: string): WorkOrderCategory | undefined => {
  if (!categoryId) return undefined;
  
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

const selectCategory = (category: WorkOrderCategory | null) => {
  currentCategory.value = category;
  emit('categorySelected', category);
};

const clearSelection = () => {
  currentCategory.value = null;
  emit('categorySelected', null);
};

const goBack = () => {
  if (selectedPath.value.length > 0) {
    const parentCategory = selectedPath.value[selectedPath.value.length - 1];
    selectCategory(parentCategory || null);
  } else {
    clearSelection();
  }
};

const viewTemplates = () => {
  if (selectedCategory.value) {
    emit('viewTemplates', selectedCategory.value);
  }
};

const getCategoryIcon = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    settings: Settings,
    wrench: Wrench,
    gauge: Gauge,
    zap: Zap,
    shield: Shield,
    droplets: Droplets,
    wind: Wind,
    flame: Flame,
    activity: Activity,
    tool: Cog,
    cog: Cog,
  };
  
  return iconMap[iconName || 'settings'] || Settings;
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'low': return 'outline';
    case 'normal': return 'secondary';
    case 'high': return 'default';
    case 'urgent': return 'destructive';
    default: return 'secondary';
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>