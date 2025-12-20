<template>
  <Card class="template-card hover:shadow-md transition-shadow cursor-pointer">
    <CardContent class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="font-semibold text-lg line-clamp-2 mb-2">{{ template.name }}</h3>
          <p class="text-sm text-muted-foreground line-clamp-2 mb-3">
            {{ template.description || 'No description available' }}
          </p>
        </div>
        
        <!-- Actions Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="$emit('edit', template)">
              <Edit class="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('clone', template)">
              <Copy class="h-4 w-4 mr-2" />
              Clone
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('viewAnalytics', template)">
              <BarChart3 class="h-4 w-4 mr-2" />
              Analytics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="$emit('toggleStatus', template)">
              <Power class="h-4 w-4 mr-2" />
              {{ template.isActive ? 'Deactivate' : 'Activate' }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              @click="$emit('delete', template)"
              class="text-destructive focus:text-destructive"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <!-- Template Info -->
      <div class="space-y-3">
        <!-- Status and Type -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <Badge :variant="getStatusVariant(template.status)">
              {{ template.status }}
            </Badge>
            <Badge variant="outline">
              {{ template.type }}
            </Badge>
            <Badge v-if="template.subType" variant="secondary">
              {{ template.subType }}
            </Badge>
          </div>
          <div class="flex items-center space-x-1">
            <div 
              :class="[
                'w-2 h-2 rounded-full',
                template.isActive ? 'bg-green-500' : 'bg-gray-400'
              ]"
            />
            <span class="text-xs text-muted-foreground">
              {{ template.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <!-- Code and Version -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">
            <code class="bg-muted px-1 py-0.5 rounded text-xs">{{ template.code }}</code>
          </span>
          <span class="text-muted-foreground">
            v{{ template.version }}
          </span>
        </div>

        <!-- Checklist and Materials Count -->
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-1 text-muted-foreground">
              <CheckSquare class="h-4 w-4" />
              <span>{{ template.checklist?.length || 0 }} items</span>
            </div>
            <div class="flex items-center space-x-1 text-muted-foreground">
              <Package class="h-4 w-4" />
              <span>{{ template.materials?.length || 0 }} materials</span>
            </div>
          </div>
          <div class="text-muted-foreground">
            {{ template.estimatedDuration }}h
          </div>
        </div>

        <!-- Usage Stats -->
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center space-x-1 text-muted-foreground">
            <TrendingUp class="h-4 w-4" />
            <span>{{ template.usageCount || 0 }} uses</span>
          </div>
          <div class="text-muted-foreground">
            {{ formatDate(template.lastUsedAt) }}
          </div>
        </div>

        <!-- Tags -->
        <div v-if="template.tags && template.tags.length > 0" class="flex flex-wrap gap-1">
          <Badge 
            v-for="tag in template.tags.slice(0, 3)" 
            :key="tag"
            variant="outline"
            class="text-xs"
          >
            {{ tag }}
          </Badge>
          <Badge 
            v-if="template.tags.length > 3"
            variant="outline"
            class="text-xs"
          >
            +{{ template.tags.length - 3 }}
          </Badge>
        </div>

        <!-- Category Path -->
        <div class="text-xs text-muted-foreground border-t pt-2">
          <div class="flex items-center space-x-1">
            <Folder class="h-3 w-3" />
            <span>{{ getCategoryPath() }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
// import { computed } from 'vue';
import { useCategoryStore } from '@/stores/category';
import type { WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  MoreVertical,
  Edit,
  Copy,
  BarChart3,
  Power,
  Trash2,
  CheckSquare,
  Package,
  TrendingUp,
  Folder,
} from 'lucide-vue-next';

interface Props {
  template: WorkOrderTemplate;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [template: WorkOrderTemplate];
  clone: [template: WorkOrderTemplate];
  delete: [template: WorkOrderTemplate];
  toggleStatus: [template: WorkOrderTemplate];
  viewAnalytics: [template: WorkOrderTemplate];
}>();

// Store
const categoryStore = useCategoryStore();

// Methods
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'deprecated':
      return 'destructive';
    case 'archived':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getCategoryPath = () => {
  if (!props.template.categoryId) return 'Uncategorized';
  const category = categoryStore.getCategoryById(props.template.categoryId);
  return category?.path || 'Unknown Category';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.template-card {
  transition: all 0.2s ease;
}

.template-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>