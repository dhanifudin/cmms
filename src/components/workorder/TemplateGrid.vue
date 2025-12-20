<template>
  <div class="template-grid">
    <!-- Header with Filters -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="font-semibold text-lg">Available Templates</h3>
        <p class="text-sm text-muted-foreground">
          Choose a template to start with predefined procedures and checklists
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- Maintenance Type Filter -->
        <Select v-model="selectedMaintenanceType">
          <SelectTrigger class="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="preventive">Preventive</SelectItem>
            <SelectItem value="corrective">Corrective</SelectItem>
          </SelectContent>
        </Select>
        
        <!-- Sort Options -->
        <Select v-model="sortBy">
          <SelectTrigger class="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="usage">Most Used</SelectItem>
            <SelectItem value="recent">Recently Used</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>
        
        <!-- View Toggle -->
        <div class="flex items-center border rounded">
          <Button 
            variant="ghost" 
            size="sm"
            :class="{ 'bg-muted': viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid class="h-4 w-4" />
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

    <!-- Template Count -->
    <div class="flex items-center justify-between mb-4">
      <div class="text-sm text-muted-foreground">
        {{ filteredTemplates.length }} template{{ filteredTemplates.length !== 1 ? 's' : '' }} found
        <span v-if="categoryName"> in {{ categoryName }}</span>
      </div>
      
      <!-- Quick Stats -->
      <div class="flex items-center space-x-4 text-xs text-muted-foreground">
        <div class="flex items-center space-x-1">
          <Badge variant="outline" class="text-xs">
            {{ preventiveCount }} Preventive
          </Badge>
        </div>
        <div class="flex items-center space-x-1">
          <Badge variant="outline" class="text-xs">
            {{ correctiveCount }} Corrective
          </Badge>
        </div>
      </div>
    </div>

    <!-- Templates Grid View -->
    <div 
      v-if="viewMode === 'grid'" 
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <Card
        v-for="template in filteredTemplates"
        :key="template.id"
        class="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-ring group"
        @click="selectTemplate(template)"
      >
        <CardContent class="p-6">
          <!-- Template Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <Badge :variant="getTypeVariant(template.type)" class="text-xs">
                  {{ template.type }}
                </Badge>
                <Badge v-if="template.subType" variant="outline" class="text-xs">
                  {{ template.subType }}
                </Badge>
              </div>
              <h4 class="font-semibold text-base group-hover:text-primary transition-colors">
                {{ template.name }}
              </h4>
              <p class="text-sm text-muted-foreground line-clamp-2">
                {{ template.description }}
              </p>
            </div>
          </div>

          <!-- Template Stats -->
          <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div class="flex items-center space-x-2">
              <Clock class="h-4 w-4 text-blue-500" />
              <span>{{ template.estimatedDuration }}h</span>
            </div>
            <div class="flex items-center space-x-2">
              <Star class="h-4 w-4 text-yellow-500" />
              <span>{{ template.defaultPriority }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <CheckSquare class="h-4 w-4 text-green-500" />
              <span>{{ template.checklist?.length || 0 }} items</span>
            </div>
            <div class="flex items-center space-x-2">
              <Package class="h-4 w-4 text-orange-500" />
              <span>{{ template.materials?.length || 0 }} materials</span>
            </div>
          </div>

          <!-- Usage Stats -->
          <div class="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div class="flex items-center space-x-2">
              <TrendingUp class="h-3 w-3" />
              <span>Used {{ template.usageCount || 0 }} times</span>
            </div>
            <div v-if="template.lastUsedAt">
              Last used {{ formatRelativeDate(template.lastUsedAt) }}
            </div>
          </div>

          <!-- Template Tags -->
          <div v-if="template.tags && template.tags.length > 0" class="flex flex-wrap gap-1 mb-4">
            <Badge 
              v-for="tag in template.tags.slice(0, 3)" 
              :key="tag"
              variant="outline" 
              class="text-xs"
            >
              {{ tag }}
            </Badge>
            <Badge v-if="template.tags.length > 3" variant="outline" class="text-xs">
              +{{ template.tags.length - 3 }}
            </Badge>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2">
            <Button size="sm" class="flex-1" @click.stop="selectTemplate(template)">
              <FileText class="h-4 w-4 mr-2" />
              Use Template
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              @click.stop="previewTemplate(template)"
            >
              <Eye class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Templates List View -->
    <div v-else class="space-y-3">
      <Card
        v-for="template in filteredTemplates"
        :key="template.id"
        class="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-ring"
        @click="selectTemplate(template)"
      >
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 flex-1">
              <!-- Template Info -->
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <h4 class="font-medium">{{ template.name }}</h4>
                  <Badge :variant="getTypeVariant(template.type)" class="text-xs">
                    {{ template.type }}
                  </Badge>
                  <Badge v-if="template.subType" variant="outline" class="text-xs">
                    {{ template.subType }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground line-clamp-1">
                  {{ template.description }}
                </p>
              </div>

              <!-- Stats -->
              <div class="flex items-center space-x-6 text-sm text-muted-foreground">
                <div class="flex items-center space-x-1">
                  <Clock class="h-4 w-4" />
                  <span>{{ template.estimatedDuration }}h</span>
                </div>
                <div class="flex items-center space-x-1">
                  <CheckSquare class="h-4 w-4" />
                  <span>{{ template.checklist?.length || 0 }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <Package class="h-4 w-4" />
                  <span>{{ template.materials?.length || 0 }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <TrendingUp class="h-4 w-4" />
                  <span>{{ template.usageCount || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                @click.stop="previewTemplate(template)"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button size="sm" @click.stop="selectTemplate(template)">
                <FileText class="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-if="filteredTemplates.length === 0" class="text-center py-12">
      <CardContent>
        <FileText class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="font-medium text-lg mb-2">No templates found</h3>
        <p class="text-muted-foreground mb-6">
          {{ templates.length === 0 
            ? 'This category doesn\'t have any templates yet.' 
            : 'No templates match your current filters.' 
          }}
        </p>
        <div class="flex items-center justify-center space-x-3">
          <Button v-if="selectedMaintenanceType || sortBy" variant="outline" @click="clearFilters">
            Clear Filters
          </Button>
          <Button @click="$emit('back')">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  Clock,
  Star,
  CheckSquare,
  Package,
  TrendingUp,
  FileText,
  Eye,
  ArrowLeft,
  LayoutGrid,
  List,
} from 'lucide-vue-next';

interface Props {
  templates: WorkOrderTemplate[];
  categoryName?: string;
  maintenanceType?: 'preventive' | 'corrective';
}

const props = withDefaults(defineProps<Props>(), {
  maintenanceType: undefined
});

const emit = defineEmits<{
  templateSelected: [template: WorkOrderTemplate];
  templatePreview: [template: WorkOrderTemplate];
  back: [];
}>();

// State
const selectedMaintenanceType = ref<string>(props.maintenanceType || '');
const sortBy = ref<string>('name');
const viewMode = ref<'grid' | 'list'>('grid');

// Computed
const filteredTemplates = computed(() => {
  let filtered = [...props.templates];

  // Filter by maintenance type
  if (selectedMaintenanceType.value) {
    filtered = filtered.filter(template => 
      template.type === selectedMaintenanceType.value
    );
  }

  // Sort templates
  switch (sortBy.value) {
    case 'usage':
      filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
      break;
    case 'recent':
      filtered.sort((a, b) => {
        const dateA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
        const dateB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
        return dateB - dateA;
      });
      break;
    case 'duration':
      filtered.sort((a, b) => a.estimatedDuration - b.estimatedDuration);
      break;
    case 'name':
    default:
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return filtered;
});

const preventiveCount = computed(() => 
  props.templates.filter(t => t.type === 'preventive').length
);

const correctiveCount = computed(() => 
  props.templates.filter(t => t.type === 'corrective').length
);

// Methods
const selectTemplate = (template: WorkOrderTemplate) => {
  emit('templateSelected', template);
};

const previewTemplate = (template: WorkOrderTemplate) => {
  emit('templatePreview', template);
};

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'preventive': return 'default';
    case 'corrective': return 'destructive';
    default: return 'secondary';
  }
};

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

const clearFilters = () => {
  selectedMaintenanceType.value = '';
  sortBy.value = 'name';
};
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>