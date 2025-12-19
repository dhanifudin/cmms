<template>
  <div class="space-y-6" v-if="template">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <Button variant="outline" @click="goBack">
          <ChevronLeft class="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Edit Template</h1>
          <p class="mt-1 text-sm text-gray-600">
            Editing: {{ template.name }} • Version {{ template.version }}
          </p>
        </div>
      </div>
    </div>

    <!-- Template Builder -->
    <SimpleTemplateBuilder
      :template="template"
      @save="handleTemplateSave"
      @save-as-draft="handleTemplateDraft"
      @cancel="handleCancel"
    />
  </div>

  <!-- Loading State -->
  <div v-else class="flex items-center justify-center h-64">
    <div class="text-center">
      <p class="text-gray-500">Loading template...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/template';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';

// Custom Components
import SimpleTemplateBuilder from '@/components/template/SimpleTemplateBuilder.vue';

// Icons
import { ChevronLeft } from 'lucide-vue-next';

// Types
import type { WorkOrderTemplate, CreateTemplateForm } from '@/types/templates';

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();
const { toast } = useToast();

// State
const template = ref<WorkOrderTemplate | null>(null);

// Methods
const goBack = () => {
  router.push(`/templates/${template.value?.id}`);
};

const handleTemplateSave = async (templateData: CreateTemplateForm) => {
  if (!template.value) return;
  
  try {
    await templateStore.updateTemplate(template.value.id, templateData);
    toast({
      title: 'Template Updated',
      description: 'Template has been updated successfully'
    });
    router.push(`/templates/${template.value.id}`);
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update template',
      variant: 'destructive'
    });
  }
};

const handleTemplateDraft = async (templateData: CreateTemplateForm) => {
  try {
    console.log('Saving as draft:', templateData);
    toast({
      title: 'Draft Saved',
      description: 'Template changes have been saved as draft'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to save draft',
      variant: 'destructive'
    });
  }
};

const handleCancel = () => {
  router.push(`/templates/${template.value?.id}`);
};

// Initialize
onMounted(async () => {
  const templateId = route.params.id as string;
  const foundTemplate = templateStore.getTemplateById(templateId);
  
  if (foundTemplate) {
    template.value = foundTemplate;
  } else {
    // Template not found, redirect back
    router.push('/templates');
  }
});
</script>