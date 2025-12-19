<template>
  <div class="simple-template-builder">
    <Card>
      <CardHeader>
        <CardTitle>{{ isEditing ? 'Edit Template' : 'Create Template' }}</CardTitle>
        <p class="text-sm text-muted-foreground">
          {{ isEditing ? 'Modify existing template' : 'Create a new work order template' }}
        </p>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="font-medium">Basic Information</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="name">Template Name*</Label>
              <Input
                id="name"
                v-model="form.name"
                placeholder="Enter template name"
                required
              />
            </div>
            <div>
              <Label for="type">Type*</Label>
              <Select v-model="form.type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label for="description">Description*</Label>
            <Textarea
              id="description"
              v-model="form.description"
              rows="3"
              placeholder="Describe what this template is for..."
              required
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="category">Category*</Label>
              <CategorySelector
                v-model="form.categoryId"
                placeholder="Select category"
                @category-select="handleCategorySelect"
              />
            </div>
            <div>
              <Label for="priority">Default Priority</Label>
              <Select v-model="form.defaultPriority">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="duration">Estimated Duration (hours)</Label>
              <Input
                id="duration"
                v-model.number="form.estimatedDuration"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="2.5"
              />
            </div>
            <div>
              <Label for="subType">Sub-type</Label>
              <Select v-model="form.subType">
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="incidental">Incidental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Safety Requirements -->
        <div class="space-y-4">
          <h3 class="font-medium">Safety Requirements</h3>
          <div class="space-y-2">
            <div
              v-for="(_, index) in form.safetyRequirements"
              :key="index"
              class="flex items-center space-x-2"
            >
              <Input
                v-model="form.safetyRequirements[index]"
                placeholder="Enter safety requirement"
                class="flex-1"
              />
              <Button
                variant="destructive"
                size="sm"
                @click="removeSafetyRequirement(index)"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="addSafetyRequirement"
            >
              <Plus class="h-4 w-4 mr-2" />
              Add Safety Requirement
            </Button>
          </div>
        </div>

        <!-- Prerequisites -->
        <div class="space-y-4">
          <h3 class="font-medium">Prerequisites</h3>
          <div class="space-y-2">
            <div
              v-for="(_, index) in form.prerequisites"
              :key="index"
              class="flex items-center space-x-2"
            >
              <Input
                v-model="form.prerequisites[index]"
                placeholder="Enter prerequisite"
                class="flex-1"
              />
              <Button
                variant="destructive"
                size="sm"
                @click="removePrerequisite(index)"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="addPrerequisite"
            >
              <Plus class="h-4 w-4 mr-2" />
              Add Prerequisite
            </Button>
          </div>
        </div>

        <!-- Template Settings -->
        <div class="space-y-4">
          <h3 class="font-medium">Template Settings</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                v-model:checked="form.isRecurring"
              />
              <Label for="isRecurring">Recurring Template</Label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-6 border-t">
          <div>
            <Button variant="outline" @click="$emit('cancel')">
              Cancel
            </Button>
          </div>
          <div class="space-x-2">
            <Button variant="outline" @click="saveAsDraft">
              Save as Draft
            </Button>
            <Button @click="saveTemplate" :disabled="!isValid">
              {{ isEditing ? 'Update' : 'Create' }} Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
// import { useTemplateStore } from '@/stores/template';
import type { 
  WorkOrderTemplate, 
  WorkOrderCategory,
  CreateTemplateForm
} from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Components
import CategorySelector from '../category/CategorySelector.vue';

// Icons
import { Plus, X } from 'lucide-vue-next';

interface Props {
  template?: WorkOrderTemplate | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [template: CreateTemplateForm];
  saveAsDraft: [template: CreateTemplateForm];
  cancel: [];
}>();

// Store (for future use)
// const templateStore = useTemplateStore();

// State
const form = ref<CreateTemplateForm>({
  name: '',
  description: '',
  categoryId: '',
  type: 'preventive',
  subType: undefined,
  defaultPriority: 'normal',
  estimatedDuration: 1,
  sopSteps: [],
  checklist: [],
  materials: [],
  safetyRequirements: [],
  prerequisites: [],
  requiredSkills: [],
  requiredCertifications: [],
  isRecurring: false,
  recurrencePattern: undefined,
  tags: []
});

// Computed
const isEditing = computed(() => !!props.template);

const isValid = computed(() => {
  return form.value.name.trim() !== '' &&
         form.value.description.trim() !== '' &&
         form.value.categoryId !== '' &&
         form.value.estimatedDuration > 0;
});

// Methods
const handleCategorySelect = (category: WorkOrderCategory) => {
  form.value.categoryId = category.id;
};

const addSafetyRequirement = () => {
  form.value.safetyRequirements.push('');
};

const removeSafetyRequirement = (index: number) => {
  form.value.safetyRequirements.splice(index, 1);
};

const addPrerequisite = () => {
  form.value.prerequisites.push('');
};

const removePrerequisite = (index: number) => {
  form.value.prerequisites.splice(index, 1);
};

const saveTemplate = () => {
  if (isValid.value) {
    emit('save', { ...form.value });
  }
};

const saveAsDraft = () => {
  emit('saveAsDraft', { ...form.value });
};

// Initialize form if editing
onMounted(() => {
  if (props.template) {
    form.value = {
      name: props.template.name,
      description: props.template.description,
      categoryId: props.template.categoryId,
      type: props.template.type,
      subType: props.template.subType,
      defaultPriority: props.template.defaultPriority,
      estimatedDuration: props.template.estimatedDuration,
      sopSteps: [],
      checklist: [],
      materials: [],
      safetyRequirements: props.template.safetyRequirements ? [...props.template.safetyRequirements] : [],
      prerequisites: props.template.prerequisites ? [...props.template.prerequisites] : [],
      requiredSkills: [],
      requiredCertifications: [],
      isRecurring: props.template.isRecurring,
      recurrencePattern: props.template.recurrencePattern,
      tags: props.template.tags ? [...props.template.tags] : []
    };
  }
});
</script>