<template>
  <div class="visual-template-editor h-full flex flex-col">
    <!-- Header -->
    <div class="flex-none border-b border-border">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">
              {{ isEditing ? 'Edit Template' : 'Create Template' }}
            </h1>
            <p class="text-muted-foreground mt-1">
              {{ isEditing ? 'Modify template configuration and checklist' : 'Design a comprehensive work order template with interactive checklist' }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <Button variant="outline" @click="previewTemplate">
              <Eye class="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" @click="$emit('cancel')">
              Cancel
            </Button>
            <Button @click="saveTemplate" :disabled="!canSave">
              <Save class="h-4 w-4 mr-2" />
              {{ isEditing ? 'Update' : 'Create' }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex min-h-0">
      <!-- Left Panel: Template Configuration -->
      <div class="w-1/3 border-r border-border p-6 overflow-y-auto">
        <div class="space-y-6">
          <!-- Basic Information -->
          <section class="space-y-4">
            <h3 class="text-lg font-semibold">Basic Information</h3>
            
            <div class="space-y-4">
              <div>
                <Label for="name">Template Name*</Label>
                <Input
                  id="name"
                  v-model="template.name"
                  placeholder="Enter template name"
                  @input="generateCodeFromName"
                />
              </div>
              
              <div>
                <Label for="code">Template Code*</Label>
                <Input
                  id="code"
                  v-model="template.code"
                  placeholder="AUTO_GENERATED"
                  class="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label for="category">Category*</Label>
                <CategorySelector
                  v-model="template.categoryId"
                  placeholder="Select category"
                  :allow-creation="false"
                />
              </div>
              
              <div>
                <Label for="description">Description*</Label>
                <Textarea
                  id="description"
                  v-model="template.description"
                  rows="3"
                  placeholder="Describe the purpose and scope of this template"
                />
              </div>
            </div>
          </section>

          <!-- Configuration -->
          <section class="space-y-4">
            <h3 class="text-lg font-semibold">Configuration</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="type">Maintenance Type*</Label>
                <Select v-model="template.type">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div v-if="template.type === 'corrective'">
                <Label for="subType">Sub Type</Label>
                <Select v-model="template.subType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="incidental">Incidental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="priority">Default Priority</Label>
                <Select v-model="template.defaultPriority">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label for="duration">Estimated Duration (hours)</Label>
                <Input
                  id="duration"
                  v-model.number="template.estimatedDuration"
                  type="number"
                  min="1"
                  placeholder="2"
                />
              </div>
            </div>
          </section>

          <!-- Versioning -->
          <section class="space-y-4">
            <h3 class="text-lg font-semibold">Versioning</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="version">Version</Label>
                <Input
                  id="version"
                  v-model="template.version"
                  placeholder="1.0"
                  class="font-mono"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select v-model="template.status">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                v-model:checked="template.isActive"
              />
              <Label for="isActive">Template is active</Label>
            </div>
          </section>

          <!-- Tags -->
          <section class="space-y-4">
            <h3 class="text-lg font-semibold">Tags</h3>
            
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="tag in template.tags"
                  :key="tag"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ tag }}
                  <button
                    @click="removeTag(tag)"
                    class="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </Badge>
              </div>
              
              <div class="flex space-x-2">
                <Input
                  v-model="newTag"
                  placeholder="Add tag"
                  @keydown.enter.prevent="addTag"
                  class="flex-1"
                />
                <Button variant="outline" size="sm" @click="addTag">
                  Add
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Right Panel: Visual Checklist Builder -->
      <div class="flex-1 p-6 overflow-y-auto">
        <div class="space-y-6">
          <!-- Checklist Header -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Checklist Items</h3>
              <p class="text-sm text-muted-foreground">
                Design the checklist that workers will complete
              </p>
            </div>
            <Button @click="addChecklistItem">
              <Plus class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <!-- Checklist Builder -->
          <div class="space-y-4">
            <div 
              v-if="template.checklist.length === 0" 
              class="text-center py-12 border-2 border-dashed border-border rounded-lg"
            >
              <Files class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 class="font-medium text-muted-foreground mb-2">No checklist items yet</h4>
              <p class="text-sm text-muted-foreground mb-4">
                Start building your checklist by adding the first item
              </p>
              <Button variant="outline" @click="addChecklistItem">
                <Plus class="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
            
            <draggable
              v-else
              v-model="template.checklist"
              item-key="id"
              handle=".drag-handle"
              @change="updateChecklistOrder"
              class="space-y-3"
            >
              <template #item="{ index }">
                <ChecklistItemEditor
                  v-if="template.checklist[index]"
                  v-model="template.checklist[index]"
                  :index="index"
                  @remove="removeChecklistItem"
                  @duplicate="duplicateChecklistItem"
                  @move-up="moveChecklistItem(index, -1)"
                  @move-down="moveChecklistItem(index, 1)"
                  :can-move-up="index > 0"
                  :can-move-down="index < template.checklist.length - 1"
                />
              </template>
            </draggable>
          </div>

          <!-- Checklist Sections -->
          <section class="space-y-4 border-t border-border pt-6">
            <h4 class="font-medium">Organize by Sections</h4>
            
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="useSections"
                  v-model:checked="useSections"
                />
                <Label for="useSections">Group items into sections</Label>
              </div>
              
              <div v-if="useSections" class="ml-6 space-y-2">
                <div
                  v-for="section in checklistSections"
                  :key="section"
                  class="flex items-center justify-between p-2 bg-muted/30 rounded"
                >
                  <span class="font-medium">{{ section }}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="removeSection(section)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
                
                <div class="flex space-x-2">
                  <Input
                    v-model="newSection"
                    placeholder="Section name"
                    @keydown.enter.prevent="addSection"
                    class="flex-1"
                  />
                  <Button variant="outline" size="sm" @click="addSection">
                    Add Section
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Template Preview Modal -->
    <Dialog v-model:open="showPreview">
      <DialogContent class="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
        </DialogHeader>
        
        <div class="overflow-y-auto max-h-[70vh]">
          <TemplatePreview
            :template="template"
            mode="worker"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showPreview = false">
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
// import { useTemplateStore } from '@/stores/template';
import draggable from 'vuedraggable';
import type { WorkOrderTemplate, ChecklistItemTemplate, CreateTemplateForm } from '@/types/templates';

// Components
import CategorySelector from '@/components/category/CategorySelector.vue';
import ChecklistItemEditor from './ChecklistItemEditor.vue';
import TemplatePreview from './TemplatePreview.vue';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import { 
  Save, Eye, Plus, X, Files, Trash2
} from 'lucide-vue-next';

interface Props {
  templateData?: WorkOrderTemplate | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [template: CreateTemplateForm];
  cancel: [];
}>();

// Store (for future template operations)
// const templateStore = useTemplateStore();

// State
const template = ref<CreateTemplateForm>({
  name: '',
  description: '',
  code: '',
  version: '1.0',
  categoryId: '',
  type: 'preventive',
  defaultPriority: 'normal',
  estimatedDuration: 2,
  sopSteps: [],
  safetyRequirements: [],
  prerequisites: [],
  checklist: [],
  materials: [],
  requiredSkills: [],
  requiredCertifications: [],
  isRecurring: false,
  tags: [],
  status: 'draft',
  isActive: true
});

const newTag = ref('');
const newSection = ref('');
const useSections = ref(false);
const showPreview = ref(false);

// Computed
const isEditing = computed(() => !!props.templateData);

const canSave = computed(() => {
  return template.value.name.trim() && 
         template.value.description.trim() && 
         template.value.code.trim() && 
         template.value.categoryId;
});

const checklistSections = computed(() => {
  const sections = new Set<string>();
  template.value.checklist.forEach(item => {
    if (item.section) {
      sections.add(item.section);
    }
  });
  return Array.from(sections).sort();
});

// Methods
const generateCodeFromName = () => {
  if (!isEditing.value && template.value.name) {
    const code = template.value.name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
    
    template.value.code = code;
  }
};

const addTag = () => {
  if (newTag.value.trim() && !template.value.tags.includes(newTag.value.trim())) {
    template.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (tag: string) => {
  const index = template.value.tags.indexOf(tag);
  if (index > -1) {
    template.value.tags.splice(index, 1);
  }
};

const addSection = () => {
  if (newSection.value.trim()) {
    newSection.value = '';
  }
};

const removeSection = (section: string) => {
  // Remove section from all checklist items
  template.value.checklist.forEach(item => {
    if (item.section === section) {
      item.section = undefined;
    }
  });
};

const addChecklistItem = () => {
  const newItem: Omit<ChecklistItemTemplate, 'id' | 'templateId'> = {
    label: 'New Checklist Item',
    description: '',
    type: 'yes_no',
    required: true,
    order: template.value.checklist.length + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  template.value.checklist.push(newItem);
};

const removeChecklistItem = (index: number) => {
  template.value.checklist.splice(index, 1);
  updateChecklistOrder();
};

const duplicateChecklistItem = (index: number) => {
  const original = template.value.checklist[index];
  if (!original) return;
  
  const duplicate = {
    ...original,
    label: `${original.label} (Copy)`,
    order: template.value.checklist.length + 1
  };
  
  template.value.checklist.splice(index + 1, 0, duplicate);
  updateChecklistOrder();
};

const moveChecklistItem = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < template.value.checklist.length) {
    const item = template.value.checklist.splice(index, 1)[0];
    if (item) {
      template.value.checklist.splice(newIndex, 0, item);
      updateChecklistOrder();
    }
  }
};

const updateChecklistOrder = () => {
  template.value.checklist.forEach((item, index) => {
    item.order = index + 1;
  });
};

const previewTemplate = () => {
  showPreview.value = true;
};

const saveTemplate = () => {
  if (!canSave.value) return;
  
  emit('save', template.value);
};

// Initialize
onMounted(() => {
  if (props.templateData) {
    // Load existing template for editing
    template.value = {
      name: props.templateData.name,
      description: props.templateData.description,
      code: props.templateData.code,
      version: props.templateData.version,
      categoryId: props.templateData.categoryId,
      type: props.templateData.type,
      subType: props.templateData.subType,
      defaultPriority: props.templateData.defaultPriority,
      estimatedDuration: props.templateData.estimatedDuration,
      sopSteps: props.templateData.sopSteps || [],
      safetyRequirements: props.templateData.safetyRequirements || [],
      prerequisites: props.templateData.prerequisites || [],
      checklist: props.templateData.checklist.map(item => ({
        label: item.label,
        description: item.description,
        type: item.type,
        required: item.required,
        unit: item.unit,
        options: item.options,
        minValue: item.minValue,
        maxValue: item.maxValue,
        pattern: item.pattern,
        defaultValue: item.defaultValue,
        order: item.order,
        section: item.section,
        conditionalLogic: item.conditionalLogic,
        helpText: item.helpText,
        warningThreshold: item.warningThreshold,
        criticalThreshold: item.criticalThreshold,
        validationRules: item.validationRules,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: new Date().toISOString()
      })),
      materials: props.templateData.materials || [],
      requiredSkills: props.templateData.requiredSkills || [],
      requiredCertifications: props.templateData.requiredCertifications || [],
      isRecurring: props.templateData.isRecurring,
      recurrencePattern: props.templateData.recurrencePattern,
      tags: props.templateData.tags || []
    };
    
    // Check if using sections
    useSections.value = template.value.checklist.some(item => !!item.section);
  }
});
</script>

<style scoped>
.visual-template-editor {
  height: calc(100vh - 4rem);
}

/* Scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--muted);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--muted-foreground);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--foreground);
}
</style>