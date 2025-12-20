<template>
  <div class="template-preview">
    <!-- Template Header -->
    <div class="template-header mb-6 p-4 bg-muted/30 rounded-lg">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold">{{ template.name || 'Template Name' }}</h2>
          <p v-if="template.description" class="text-muted-foreground mt-1">
            {{ template.description }}
          </p>
          <div class="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
            <div class="flex items-center space-x-1">
              <Badge variant="outline">{{ template.type }}</Badge>
              <Badge v-if="template.subType" variant="outline">{{ template.subType }}</Badge>
            </div>
            <div>Priority: {{ template.defaultPriority }}</div>
            <div>Duration: {{ template.estimatedDuration }}h</div>
          </div>
        </div>
        
        <div class="text-right">
          <Badge :variant="template.status === 'active' ? 'default' : 'secondary'">
            {{ template.status }}
          </Badge>
          <div class="text-sm text-muted-foreground mt-1">
            v{{ template.version }}
          </div>
        </div>
      </div>
    </div>

    <!-- Mode Selection -->
    <div v-if="!mode" class="mode-selection mb-6">
      <div class="grid grid-cols-3 gap-4">
        <Card 
          class="cursor-pointer hover:shadow-md transition-shadow"
          @click="selectedMode = 'admin'"
        >
          <CardContent class="p-4 text-center">
            <Shield class="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 class="font-medium">Admin View</h3>
            <p class="text-sm text-muted-foreground">Configuration perspective</p>
          </CardContent>
        </Card>
        
        <Card 
          class="cursor-pointer hover:shadow-md transition-shadow"
          @click="selectedMode = 'supervisor'"
        >
          <CardContent class="p-4 text-center">
            <Eye class="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 class="font-medium">Supervisor View</h3>
            <p class="text-sm text-muted-foreground">Review perspective</p>
          </CardContent>
        </Card>
        
        <Card 
          class="cursor-pointer hover:shadow-md transition-shadow"
          @click="selectedMode = 'worker'"
        >
          <CardContent class="p-4 text-center">
            <User class="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 class="font-medium">Worker View</h3>
            <p class="text-sm text-muted-foreground">Execution perspective</p>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Preview Content -->
    <div v-if="selectedMode" class="preview-content">
      <!-- Admin View -->
      <div v-if="selectedMode === 'admin'" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Settings class="h-5 w-5" />
              <span>Template Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Code:</strong> {{ template.code }}</div>
              <div><strong>Category:</strong> {{ getCategoryName() }}</div>
              <div><strong>Tags:</strong> {{ template.tags?.join(', ') || 'None' }}</div>
              <div><strong>Active:</strong> {{ template.isActive ? 'Yes' : 'No' }}</div>
            </div>
            
            <div v-if="template.checklist.length > 0">
              <h4 class="font-medium mb-2">Checklist Items ({{ template.checklist.length }})</h4>
              <div class="space-y-2">
                <div
                  v-for="item in groupedChecklist"
                  :key="item.label"
                  class="p-2 bg-muted/30 rounded text-sm"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ item.label }}</span>
                    <div class="flex items-center space-x-2">
                      <Badge variant="outline" class="text-xs">{{ item.type }}</Badge>
                      <Badge v-if="item.required" variant="default" class="text-xs">Required</Badge>
                      <Badge v-if="item.section" variant="secondary" class="text-xs">{{ item.section }}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Supervisor View -->
      <div v-if="selectedMode === 'supervisor'" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Eye class="h-5 w-5" />
              <span>Review Checklist</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-if="sectionsExist" class="space-y-6">
                <div v-for="section in sections" :key="section" class="space-y-3">
                  <h4 class="font-medium text-lg border-b border-border pb-1">
                    {{ section || 'General' }}
                  </h4>
                  <div class="space-y-3 ml-4">
                    <ChecklistItemPreview
                      v-for="item in getItemsForSection(section)"
                      :key="item.label"
                      :item="item"
                    />
                  </div>
                </div>
              </div>
              
              <div v-else class="space-y-3">
                <ChecklistItemPreview
                  v-for="item in template.checklist"
                  :key="item.label"
                  :item="item"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Worker View -->
      <div v-if="selectedMode === 'worker'" class="space-y-6">
        <!-- Before Documentation -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Camera class="h-5 w-5" />
              <span>Before Work - Documentation</span>
            </CardTitle>
            <p class="text-sm text-muted-foreground">
              Complete this checklist before starting work
            </p>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded">
                <div>
                  <Label class="text-sm font-medium">Photos Required</Label>
                  <div class="border-2 border-dashed border-blue-200 rounded p-4 text-center">
                    <Camera class="h-6 w-6 mx-auto text-blue-400 mb-1" />
                    <p class="text-xs text-blue-600">Take before photos</p>
                  </div>
                </div>
                <div>
                  <Label class="text-sm font-medium">Notes</Label>
                  <Textarea 
                    placeholder="Document initial conditions..."
                    disabled
                    rows="3"
                    class="text-sm"
                  />
                </div>
              </div>
              
              <div class="space-y-3">
                <h4 class="font-medium">Initial Inspection Checklist</h4>
                <div class="space-y-3">
                  <ChecklistItemPreview
                    v-for="item in template.checklist"
                    :key="item.label"
                    :item="item"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Work Instructions -->
        <Card v-if="template.sopSteps && template.sopSteps.length > 0">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <FileText class="h-5 w-5" />
              <span>Work Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="(step, index) in template.sopSteps"
                :key="index"
                class="flex space-x-3 p-3 border border-border rounded"
              >
                <Badge variant="outline" class="flex-none">{{ index + 1 }}</Badge>
                <div>
                  <h5 class="font-medium">{{ step.title }}</h5>
                  <p class="text-sm text-muted-foreground">{{ step.description }}</p>
                  <div v-if="step.estimatedDuration" class="text-xs text-muted-foreground mt-1">
                    Est. time: {{ step.estimatedDuration }} min
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- After Documentation -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <CheckCircle class="h-5 w-5" />
              <span>After Work - Completion</span>
            </CardTitle>
            <p class="text-sm text-muted-foreground">
              Complete this checklist after finishing work
            </p>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4 p-3 bg-green-50 rounded">
                <div>
                  <Label class="text-sm font-medium">Completion Photos</Label>
                  <div class="border-2 border-dashed border-green-200 rounded p-4 text-center">
                    <Camera class="h-6 w-6 mx-auto text-green-400 mb-1" />
                    <p class="text-xs text-green-600">Take after photos</p>
                  </div>
                </div>
                <div>
                  <Label class="text-sm font-medium">Work Summary</Label>
                  <Textarea 
                    placeholder="Describe work completed..."
                    disabled
                    rows="3"
                    class="text-sm"
                  />
                </div>
              </div>
              
              <div class="space-y-3">
                <h4 class="font-medium">Final Verification Checklist</h4>
                <div class="space-y-3">
                  <ChecklistItemPreview
                    v-for="item in template.checklist"
                    :key="item.label + '_after'"
                    :item="item"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCategoryStore } from '@/stores/category';
import type { CreateTemplateForm, WorkOrderTemplate } from '@/types/templates';

// Components
import ChecklistItemPreview from './ChecklistItemPreview.vue';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Icons
import {
  Shield,
  Eye,
  User,
  Settings,
  Camera,
  FileText,
  CheckCircle,
} from 'lucide-vue-next';

interface Props {
  template: CreateTemplateForm | WorkOrderTemplate;
  mode?: 'admin' | 'supervisor' | 'worker';
}

const props = defineProps<Props>();

// Store
const categoryStore = useCategoryStore();

// State
const selectedMode = ref(props.mode || '');

// Computed
const sectionsExist = computed(() => {
  return props.template.checklist.some(item => !!item.section);
});

const sections = computed(() => {
  const sectionSet = new Set<string>();
  props.template.checklist.forEach(item => {
    sectionSet.add(item.section || '');
  });
  return Array.from(sectionSet).sort();
});

const groupedChecklist = computed(() => {
  return [...props.template.checklist].sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Methods
const getCategoryName = () => {
  const category = categoryStore.getCategoryById(props.template.categoryId);
  return category?.name || 'Unknown Category';
};

const getItemsForSection = (section: string) => {
  return props.template.checklist.filter(item => (item.section || '') === section);
};
</script>

<style scoped>
.template-preview {
  max-width: 100%;
  font-family: system-ui, -apple-system, sans-serif;
}

.mode-selection .card {
  transition: all 0.2s ease;
}

.mode-selection .card:hover {
  transform: translateY(-2px);
}
</style>