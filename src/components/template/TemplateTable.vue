<template>
  <div class="template-table">
    <!-- Bulk Actions Bar -->
    <div 
      v-if="selectedTemplates.length > 0"
      class="flex items-center justify-between p-4 bg-primary/5 border-b"
    >
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium">
          {{ selectedTemplates.length }} template{{ selectedTemplates.length > 1 ? 's' : '' }} selected
        </span>
        <Button 
          variant="outline" 
          size="sm"
          @click="$emit('select', [])"
        >
          Clear
        </Button>
      </div>
      
      <div class="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          @click="$emit('bulkAction', 'activate')"
        >
          <Power class="h-4 w-4 mr-2" />
          Activate
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          @click="$emit('bulkAction', 'deactivate')"
        >
          <PowerOff class="h-4 w-4 mr-2" />
          Deactivate
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          @click="$emit('bulkAction', 'delete')"
        >
          <Trash2 class="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>

    <!-- Table -->
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">
            <Checkbox 
              :checked="isAllSelected"
              @update:checked="toggleSelectAll"
            />
          </TableHead>
          <TableHead class="min-w-[200px]">Template</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead class="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow 
          v-for="template in templates" 
          :key="template.id"
          class="hover:bg-muted/50"
        >
          <!-- Selection -->
          <TableCell>
            <Checkbox 
              :checked="selectedTemplates.includes(template.id)"
              @update:checked="(checked: boolean) => toggleSelection(template.id, checked)"
            />
          </TableCell>
          
          <!-- Template Info -->
          <TableCell>
            <div class="space-y-1">
              <div class="font-medium">{{ template.name }}</div>
              <div class="text-sm text-muted-foreground line-clamp-2">
                {{ template.description || 'No description' }}
              </div>
              <div class="flex items-center space-x-2">
                <code class="text-xs bg-muted px-1 py-0.5 rounded">{{ template.code }}</code>
                <Badge variant="outline" class="text-xs">v{{ template.version }}</Badge>
              </div>
            </div>
          </TableCell>
          
          <!-- Category -->
          <TableCell>
            <div class="flex items-center space-x-1">
              <Folder class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm">{{ getCategoryPath(template.categoryId) }}</span>
            </div>
          </TableCell>
          
          <!-- Type -->
          <TableCell>
            <div class="space-y-1">
              <Badge variant="outline">{{ template.type }}</Badge>
              <Badge v-if="template.subType" variant="secondary" class="text-xs">
                {{ template.subType }}
              </Badge>
            </div>
          </TableCell>
          
          <!-- Status -->
          <TableCell>
            <div class="space-y-1">
              <Badge :variant="getStatusVariant(template.status)">
                {{ template.status }}
              </Badge>
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
          </TableCell>
          
          <!-- Items Count -->
          <TableCell>
            <div class="space-y-1 text-sm">
              <div class="flex items-center space-x-1">
                <CheckSquare class="h-3 w-3 text-muted-foreground" />
                <span>{{ template.checklist?.length || 0 }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <Package class="h-3 w-3 text-muted-foreground" />
                <span>{{ template.materials?.length || 0 }}</span>
              </div>
            </div>
          </TableCell>
          
          <!-- Usage Stats -->
          <TableCell>
            <div class="space-y-1 text-sm">
              <div class="flex items-center space-x-1">
                <TrendingUp class="h-3 w-3 text-muted-foreground" />
                <span>{{ template.usageCount || 0 }} uses</span>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ template.estimatedDuration }}h duration
              </div>
            </div>
          </TableCell>
          
          <!-- Last Used -->
          <TableCell>
            <div class="text-sm text-muted-foreground">
              {{ formatDate(template.lastUsedAt) }}
            </div>
          </TableCell>
          
          <!-- Actions -->
          <TableCell>
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
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCategoryStore } from '@/stores/category';
import type { WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  PowerOff,
  Trash2,
  CheckSquare,
  Package,
  TrendingUp,
  Folder,
} from 'lucide-vue-next';

interface Props {
  templates: WorkOrderTemplate[];
  selectedTemplates: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [template: WorkOrderTemplate];
  clone: [template: WorkOrderTemplate];
  delete: [template: WorkOrderTemplate];
  toggleStatus: [template: WorkOrderTemplate];
  viewAnalytics: [template: WorkOrderTemplate];
  select: [templateIds: string[]];
  bulkAction: [action: string];
}>();

// Store
const categoryStore = useCategoryStore();

// Computed
const isAllSelected = computed(() => {
  return props.templates.length > 0 && 
         props.selectedTemplates.length === props.templates.length;
});

// Methods
const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    emit('select', props.templates.map(t => t.id));
  } else {
    emit('select', []);
  }
};

const toggleSelection = (templateId: string, checked: boolean) => {
  const newSelection = checked 
    ? [...props.selectedTemplates, templateId]
    : props.selectedTemplates.filter(id => id !== templateId);
  
  emit('select', newSelection);
};

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

const getCategoryPath = (categoryId?: string) => {
  if (!categoryId) return 'Uncategorized';
  const category = categoryStore.getCategoryById(categoryId);
  return category?.path || 'Unknown Category';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.template-table {
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>