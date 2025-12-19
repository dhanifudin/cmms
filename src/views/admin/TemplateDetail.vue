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
          <h1 class="text-2xl font-bold text-gray-900">{{ template.name }}</h1>
          <p class="mt-1 text-sm text-gray-600">
            Template Details • Version {{ template.version }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <Badge :variant="template.isActive ? 'default' : 'secondary'">
          {{ template.isActive ? 'Active' : 'Inactive' }}
        </Badge>
        <Badge v-if="template.approvedBy" variant="outline" class="text-green-600">
          Approved
        </Badge>
        <Button variant="outline" @click="editTemplate">
          <Edit class="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>

    <!-- Template Info -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Description -->
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-gray-700">{{ template.description }}</p>
          </CardContent>
        </Card>

        <!-- SOP Steps -->
        <Card v-if="template.sopSteps && template.sopSteps.length > 0">
          <CardHeader>
            <CardTitle>SOP Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="step in template.sopSteps"
                :key="step.id"
                class="border border-border rounded-lg p-4"
              >
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-medium">Step {{ step.stepNumber }}: {{ step.title }}</h4>
                  <Badge v-if="step.isRequired" variant="outline">Required</Badge>
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ step.description }}</p>
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span v-if="step.estimatedDuration">{{ step.estimatedDuration }} min</span>
                  <span v-if="step.requiredTools && step.requiredTools.length">
                    Tools: {{ step.requiredTools.join(', ') }}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Checklist -->
        <Card v-if="template.checklist && template.checklist.length > 0">
          <CardHeader>
            <CardTitle>Checklist Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="item in template.checklist"
                :key="item.id"
                class="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div>
                  <p class="font-medium">{{ item.label }}</p>
                  <p class="text-sm text-gray-600">{{ item.helpText }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <Badge variant="outline">{{ item.type }}</Badge>
                  <Badge v-if="item.required" variant="secondary">Required</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Template Details -->
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <p class="text-sm text-gray-500">Type</p>
              <p class="font-medium capitalize">{{ template.type }}</p>
            </div>
            <div v-if="template.subType">
              <p class="text-sm text-gray-500">Sub-type</p>
              <p class="font-medium capitalize">{{ template.subType }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Default Priority</p>
              <Badge :variant="getPriorityVariant(template.defaultPriority)">
                {{ template.defaultPriority }}
              </Badge>
            </div>
            <div>
              <p class="text-sm text-gray-500">Estimated Duration</p>
              <p class="font-medium">{{ template.estimatedDuration }}h</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Usage Count</p>
              <p class="font-medium">{{ template.usageCount }} times</p>
            </div>
          </CardContent>
        </Card>

        <!-- Safety Requirements -->
        <Card v-if="template.safetyRequirements && template.safetyRequirements.length > 0">
          <CardHeader>
            <CardTitle>Safety Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="space-y-2">
              <li 
                v-for="requirement in template.safetyRequirements"
                :key="requirement"
                class="flex items-start space-x-2 text-sm"
              >
                <ShieldCheck class="h-4 w-4 text-red-500 mt-0.5" />
                <span>{{ requirement }}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <!-- Materials -->
        <Card v-if="template.materials && template.materials.length > 0">
          <CardHeader>
            <CardTitle>Required Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div
                v-for="material in template.materials"
                :key="material.itemId"
                class="flex items-center justify-between text-sm"
              >
                <span>{{ material.itemName || material.itemId }}</span>
                <span class="text-gray-500">{{ material.plannedQuantity }}x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Icons
import { ChevronLeft, Edit, ShieldCheck } from 'lucide-vue-next';

// Types
import type { WorkOrderTemplate } from '@/types/templates';

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();

// State
const template = ref<WorkOrderTemplate | null>(null);

// Methods
const goBack = () => {
  router.push('/templates');
};

const editTemplate = () => {
  router.push(`/templates/${template.value?.id}/edit`);
};

const getPriorityVariant = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent':
    case 'high':
      return 'destructive';
    case 'normal':
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
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