<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Template Management</h1>
        <p class="mt-1 text-sm text-gray-600">
          Manage work order templates and Standard Operating Procedures
        </p>
      </div>
      
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="toggleViewMode">
          <LayoutList v-if="viewMode === 'grid'" class="h-4 w-4 mr-2" />
          <Grid3X3 v-else class="h-4 w-4 mr-2" />
          {{ viewMode === 'grid' ? 'List View' : 'Grid View' }}
        </Button>
        <Button variant="outline" @click="showFilters = !showFilters">
          <Filter class="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline" @click="refreshTemplates">
          <RotateCcw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button @click="createTemplate">
          <Plus class="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <File class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Templates</p>
              <p class="text-2xl font-bold text-gray-900">{{ templateStats.total }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <CheckCircle class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Templates</p>
              <p class="text-2xl font-bold text-gray-900">{{ templateStats.active }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <Clock class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Approval</p>
              <p class="text-2xl font-bold text-gray-900">{{ templateStats.pendingApproval }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <Activity class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Most Used</p>
              <p class="text-lg font-bold text-gray-900 truncate">
                {{ templateStats.mostUsed?.name || 'None' }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters Panel -->
    <Card v-if="showFilters" class="mb-6">
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label class="text-sm font-medium">Category</Label>
            <CategorySelector 
              v-model="filters.categoryId"
              placeholder="All categories"
              allow-clear
            />
          </div>
          <div>
            <Label class="text-sm font-medium">Status</Label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="text-sm font-medium">Type</Label>
            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="text-sm font-medium">Search</Label>
            <Input 
              v-model="filters.search"
              placeholder="Search templates..."
              class="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Templates List/Grid -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="text-sm text-muted-foreground">Loading templates...</p>
      </div>
    </div>

    <div v-else-if="filteredTemplates.length === 0" class="text-center py-12">
      <FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 class="font-medium text-muted-foreground mb-2">No templates found</h3>
      <p class="text-sm text-muted-foreground mb-4">
        {{ hasActiveFilters ? 'Try adjusting your filters' : 'Create your first template to get started' }}
      </p>
      <Button v-if="!hasActiveFilters" @click="createTemplate">
        <Plus class="h-4 w-4 mr-2" />
        Create Template
      </Button>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TemplateCard
        v-for="template in filteredTemplates"
        :key="template.id"
        :template="template"
        @edit="editTemplate"
        @clone="cloneTemplate"
        @delete="deleteTemplate"
        @toggle-status="toggleTemplateStatus"
        @view-analytics="viewTemplateAnalytics"
      />
    </div>

    <!-- List View -->
    <Card v-else>
      <CardContent class="p-0">
        <TemplateTable
          :templates="filteredTemplates"
          :selected-templates="selectedTemplateIds"
          @edit="editTemplate"
          @clone="cloneTemplate"
          @delete="deleteTemplate"
          @toggle-status="toggleTemplateStatus"
          @view-analytics="viewTemplateAnalytics"
          @select="handleTemplateSelection"
          @bulk-action="handleBulkAction"
        />
      </CardContent>
    </Card>

    <!-- Visual Template Editor Modal -->
    <Dialog v-if="showTemplateBuilder" :open="true" @update:open="closeTemplateBuilder">
      <DialogContent class="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {{ selectedTemplateForEdit ? 'Edit Template' : 'Create New Template' }}
          </DialogTitle>
        </DialogHeader>
        <div class="flex-1 overflow-hidden">
          <VisualTemplateEditor
            :template-data="selectedTemplateForEdit"
            @save="handleTemplateSave"
            @cancel="closeTemplateBuilder"
          />
        </div>
      </DialogContent>
    </Dialog>

    <!-- Template Analytics Modal -->
    <Dialog v-if="showAnalytics" :open="true" @update:open="closeAnalytics">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Template Analytics</DialogTitle>
        </DialogHeader>
        <TemplateAnalytics 
          v-if="selectedAnalyticsTemplate"
          :template="selectedAnalyticsTemplate"
        />
      </DialogContent>
    </Dialog>

    <!-- Clone Template Modal -->
    <Dialog v-if="showCloneDialog" :open="true" @update:open="closeCloneDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Clone Template</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label>New Template Name</Label>
            <Input 
              v-model="cloneName"
              placeholder="Enter template name"
            />
          </div>
          <div>
            <Label>New Template Code</Label>
            <Input 
              v-model="cloneCode"
              placeholder="Enter template code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="closeCloneDialog">
            Cancel
          </Button>
          <Button @click="confirmClone" :disabled="!cloneName || !cloneCode">
            Clone Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTemplateStore } from '@/stores/template';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Custom Components
import CategorySelector from '@/components/category/CategorySelector.vue';
import VisualTemplateEditor from '@/components/template/VisualTemplateEditor.vue';
import TemplateCard from '@/components/template/TemplateCard.vue';
import TemplateTable from '@/components/template/TemplateTable.vue';
import TemplateAnalytics from '@/components/template/TemplateAnalytics.vue';

// Icons
import { 
  Plus, RotateCcw, File, CheckCircle, Clock, Activity,
  LayoutList, Grid3X3, Filter, FileText
} from 'lucide-vue-next';

// Types
import type { WorkOrderTemplate, CreateTemplateForm } from '@/types/templates';

// const router = useRouter();
const templateStore = useTemplateStore();
const { toast } = useToast();

// State
const selectedTemplateIds = ref<string[]>([]);
const showTemplateBuilder = ref(false);
const selectedTemplateForEdit = ref<WorkOrderTemplate | null>(null);
const showAnalytics = ref(false);
const selectedAnalyticsTemplate = ref<WorkOrderTemplate | null>(null);
const showCloneDialog = ref(false);
const templateToClone = ref<WorkOrderTemplate | null>(null);
const cloneName = ref('');
const cloneCode = ref('');
const viewMode = ref<'grid' | 'list'>('grid');
const showFilters = ref(false);

// Filter state
const filters = ref({
  categoryId: '',
  status: '' as '' | 'draft' | 'active' | 'deprecated' | 'archived',
  type: '' as '' | 'preventive' | 'corrective',
  search: '',
  isRecurring: undefined as boolean | undefined,
  tags: [] as string[]
});

// Computed
const templateStats = computed(() => templateStore.templateStats);
const loading = computed(() => templateStore.loading);
// const templates = computed(() => templateStore.templates);

const filteredTemplates = computed(() => {
  const cleanFilters = {
    ...filters.value,
    categoryId: filters.value.categoryId || undefined,
    status: filters.value.status || undefined,
    type: filters.value.type || undefined,
    search: filters.value.search || undefined
  };
  return templateStore.getFilteredTemplates(cleanFilters);
});

const hasActiveFilters = computed(() => {
  return filters.value.categoryId || 
         filters.value.status || 
         filters.value.type || 
         filters.value.search ||
         filters.value.isRecurring !== undefined ||
         filters.value.tags.length > 0;
});

// Methods
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};

const handleTemplateSelection = (templateIds: string[]) => {
  selectedTemplateIds.value = templateIds;
};

const handleBulkAction = async (action: string) => {
  try {
    switch (action) {
      case 'activate':
        await Promise.all(
          selectedTemplateIds.value.map(id => 
            templateStore.toggleTemplateStatus(id, true)
          )
        );
        break;
      case 'deactivate':
        await Promise.all(
          selectedTemplateIds.value.map(id => 
            templateStore.toggleTemplateStatus(id, false)
          )
        );
        break;
      case 'delete':
        if (confirm(`Delete ${selectedTemplateIds.value.length} templates?`)) {
          await Promise.all(
            selectedTemplateIds.value.map(id => templateStore.deleteTemplate(id))
          );
        }
        break;
    }
    selectedTemplateIds.value = [];
    toast({
      title: 'Success',
      description: `Bulk action completed successfully`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to complete bulk action',
      variant: 'destructive'
    });
  }
};

const createTemplate = () => {
  selectedTemplateForEdit.value = null;
  showTemplateBuilder.value = true;
};

const editTemplate = (template: WorkOrderTemplate) => {
  selectedTemplateForEdit.value = template;
  showTemplateBuilder.value = true;
};

const cloneTemplate = (template: WorkOrderTemplate) => {
  templateToClone.value = template;
  cloneName.value = `${template.name} (Copy)`;
  cloneCode.value = `${template.code}_COPY`;
  showCloneDialog.value = true;
};

const deleteTemplate = async (template: WorkOrderTemplate) => {
  if (confirm(`Delete template "${template.name}"?`)) {
    try {
      await templateStore.deleteTemplate(template.id);
      toast({
        title: 'Template Deleted',
        description: 'Template has been deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      });
    }
  }
};

const toggleTemplateStatus = async (template: WorkOrderTemplate) => {
  try {
    await templateStore.toggleTemplateStatus(template.id, !template.isActive);
    toast({
      title: 'Status Updated',
      description: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update template status',
      variant: 'destructive'
    });
  }
};

const viewTemplateAnalytics = (template: WorkOrderTemplate) => {
  selectedAnalyticsTemplate.value = template;
  showAnalytics.value = true;
};

const closeTemplateBuilder = () => {
  showTemplateBuilder.value = false;
  selectedTemplateForEdit.value = null;
};

const closeAnalytics = () => {
  showAnalytics.value = false;
  selectedAnalyticsTemplate.value = null;
};

const closeCloneDialog = () => {
  showCloneDialog.value = false;
  templateToClone.value = null;
  cloneName.value = '';
  cloneCode.value = '';
};

const confirmClone = async () => {
  if (!templateToClone.value || !cloneName.value || !cloneCode.value) return;
  
  try {
    await templateStore.cloneTemplate(templateToClone.value.id, cloneName.value);
    toast({
      title: 'Template Cloned',
      description: 'Template has been cloned successfully'
    });
    closeCloneDialog();
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to clone template',
      variant: 'destructive'
    });
  }
};

const handleTemplateSave = async (templateData: CreateTemplateForm) => {
  try {
    if (selectedTemplateForEdit.value) {
      await templateStore.updateTemplate(selectedTemplateForEdit.value.id, templateData);
      toast({
        title: 'Template Updated',
        description: 'Template has been updated successfully'
      });
    } else {
      await templateStore.createTemplate(templateData);
      toast({
        title: 'Template Created',
        description: 'New template has been created successfully'
      });
    }
    closeTemplateBuilder();
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to save template',
      variant: 'destructive'
    });
  }
};

// const clearFilters = () => {
//   filters.value = {
//     categoryId: '',
//     status: '' as '' | 'draft' | 'active' | 'deprecated' | 'archived',
//     type: '' as '' | 'preventive' | 'corrective',
//     search: '',
//     isRecurring: undefined,
//     tags: []
//   };
// };

const refreshTemplates = async () => {
  try {
    await templateStore.fetchTemplates();
    toast({
      title: 'Templates Refreshed',
      description: 'Template list has been updated'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to refresh templates',
      variant: 'destructive'
    });
  }
};

// Watchers
watch(
  () => filters.value,
  () => {
    // Auto-refresh when filters change
    templateStore.applyFilters(filters.value);
  },
  { deep: true }
);

// Initialize
onMounted(async () => {
  await templateStore.fetchTemplates();
});
</script>