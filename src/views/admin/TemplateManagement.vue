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

    <!-- Template Selector -->
    <Card>
      <CardContent class="p-6">
        <TemplateSelector 
          v-model="selectedTemplateId"
          @template-select="handleTemplateSelect"
        />
      </CardContent>
    </Card>

    <!-- Template Builder Modal -->
    <Dialog v-if="showTemplateBuilder" :open="true" @update:open="closeTemplateBuilder">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <SimpleTemplateBuilder
          :template="selectedTemplateForEdit"
          @save="handleTemplateSave"
          @save-as-draft="handleTemplateDraft"
          @cancel="closeTemplateBuilder"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
// import { useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/template';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Custom Components
import TemplateSelector from '@/components/template/TemplateSelector.vue';
import SimpleTemplateBuilder from '@/components/template/SimpleTemplateBuilder.vue';

// Icons
import { Plus, RotateCcw, File, CheckCircle, Clock, Activity } from 'lucide-vue-next';

// Types
import type { WorkOrderTemplate, CreateTemplateForm } from '@/types/templates';

// const router = useRouter();
const templateStore = useTemplateStore();
const { toast } = useToast();

// State
const selectedTemplateId = ref<string>('');
const showTemplateBuilder = ref(false);
const selectedTemplateForEdit = ref<WorkOrderTemplate | null>(null);

// Computed
const templateStats = computed(() => templateStore.templateStats);

// Methods
const handleTemplateSelect = (template: WorkOrderTemplate) => {
  selectedTemplateId.value = template.id;
};

const createTemplate = () => {
  selectedTemplateForEdit.value = null;
  showTemplateBuilder.value = true;
};

// const editTemplate = (template: WorkOrderTemplate) => {
//   selectedTemplateForEdit.value = template;
//   showTemplateBuilder.value = true;
// };

const closeTemplateBuilder = () => {
  showTemplateBuilder.value = false;
  selectedTemplateForEdit.value = null;
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

const handleTemplateDraft = async (templateData: CreateTemplateForm) => {
  try {
    // Save as draft logic
    console.log('Saving as draft:', templateData);
    toast({
      title: 'Draft Saved',
      description: 'Template draft has been saved'
    });
    closeTemplateBuilder();
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to save draft',
      variant: 'destructive'
    });
  }
};

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

// Initialize
onMounted(async () => {
  await templateStore.fetchTemplates();
});
</script>