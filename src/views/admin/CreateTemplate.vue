<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Create Template</h1>
        <p class="mt-1 text-sm text-gray-600">
          Create a new work order template with SOPs and checklists
        </p>
      </div>
    </div>

    <!-- Template Builder -->
    <SimpleTemplateBuilder
      @save="handleTemplateSave"
      @save-as-draft="handleTemplateDraft"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/template';
import { useToast } from '@/hooks/use-toast';

// Custom Components
import SimpleTemplateBuilder from '@/components/template/SimpleTemplateBuilder.vue';

// Types
import type { CreateTemplateForm } from '@/types/templates';

const router = useRouter();
const templateStore = useTemplateStore();
const { toast } = useToast();

// Methods
const handleTemplateSave = async (templateData: CreateTemplateForm) => {
  try {
    const newTemplate = await templateStore.createTemplate(templateData);
    toast({
      title: 'Template Created',
      description: 'New template has been created successfully'
    });
    router.push(`/templates/${newTemplate.id}`);
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to create template',
      variant: 'destructive'
    });
  }
};

const handleTemplateDraft = async (templateData: CreateTemplateForm) => {
  try {
    console.log('Saving as draft:', templateData);
    toast({
      title: 'Draft Saved',
      description: 'Template draft has been saved'
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
  router.push('/templates');
};
</script>