<template>
  <Card class="work-order-customization">
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center space-x-2">
            <FileEdit class="h-5 w-5" />
            <span>Customize Work Order</span>
          </CardTitle>
          <p class="text-sm text-muted-foreground mt-1">
            Modify the template to fit your specific requirements
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Badge variant="outline" class="text-xs">
            Based on: {{ template.name }}
          </Badge>
          <Button variant="outline" size="sm" @click="resetToTemplate">
            <RotateCcw class="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent class="space-y-6">
      <!-- Basic Information -->
      <div class="space-y-4">
        <h4 class="font-semibold flex items-center">
          <Info class="h-4 w-4 mr-2" />
          Basic Information
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label for="title" class="text-sm font-medium">Title *</Label>
            <Input
              id="title"
              v-model="workOrder.title"
              placeholder="Work order title"
              :class="{ 'border-destructive': errors.title }"
            />
            <p v-if="errors.title" class="text-xs text-destructive mt-1">{{ errors.title }}</p>
          </div>
          
          <div>
            <Label for="priority" class="text-sm font-medium">Priority</Label>
            <Select v-model="workOrder.priority">
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
          
          <div>
            <Label for="estimatedDuration" class="text-sm font-medium">Estimated Duration (hours)</Label>
            <Input
              id="estimatedDuration"
              v-model.number="workOrder.estimatedDuration"
              type="number"
              min="0.5"
              step="0.5"
            />
          </div>
          
          <div>
            <Label for="type" class="text-sm font-medium">Maintenance Type</Label>
            <Select v-model="workOrder.type" :disabled="!allowTypeChange">
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
          <Label for="description" class="text-sm font-medium">Description</Label>
          <Textarea
            id="description"
            v-model="workOrder.description"
            placeholder="Detailed description of the work to be performed"
            rows="3"
          />
        </div>
      </div>

      <!-- Checklist Customization -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold flex items-center">
            <CheckSquare class="h-4 w-4 mr-2" />
            Checklist Items
          </h4>
          <Button variant="outline" size="sm" @click="addChecklistItem">
            <Plus class="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div class="space-y-3">
          <div
            v-for="(item, index) in workOrder.checklist"
            :key="item.id"
            class="flex items-start space-x-3 p-3 border rounded-lg"
            :class="{ 'bg-muted/30': item.isCustom }"
          >
            <div class="flex-1 space-y-2">
              <div class="flex items-center space-x-2">
                <Input
                  v-model="item.label"
                  placeholder="Checklist item label"
                  class="flex-1"
                  :class="{ 'border-destructive': errors[`checklist.${index}.label`] }"
                />
                <Badge v-if="item.isCustom" variant="secondary" class="text-xs">Custom</Badge>
                <Badge v-if="item.required" variant="destructive" class="text-xs">Required</Badge>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Select v-model="item.type">
                  <SelectTrigger class="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">Yes/No/NA</SelectItem>
                    <SelectItem value="number">Numeric Value</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                    <SelectItem value="rating">Rating Scale</SelectItem>
                  </SelectContent>
                </Select>
                
                <div class="flex items-center space-x-2">
                  <Checkbox
                    :id="`required-${index}`"
                    v-model:checked="item.required"
                  />
                  <Label :for="`required-${index}`" class="text-sm">Required</Label>
                </div>
              </div>
              
              <Input
                v-if="item.description !== undefined"
                v-model="item.description"
                placeholder="Optional description"
                class="text-sm"
              />
              
              <!-- Type-specific options -->
              <div v-if="item.type === 'number'" class="grid grid-cols-3 gap-2">
                <Input
                  v-model.number="item.minValue"
                  type="number"
                  placeholder="Min"
                  class="h-8"
                />
                <Input
                  v-model.number="item.maxValue"
                  type="number"
                  placeholder="Max"
                  class="h-8"
                />
                <Input
                  v-model="item.unit"
                  placeholder="Unit"
                  class="h-8"
                />
              </div>
              
              <div v-if="item.type === 'dropdown'" class="space-y-1">
                <Label class="text-xs">Options (one per line):</Label>
                <Textarea
                  :model-value="(item.options || []).join('\n')"
                  @update:model-value="item.options = String($event).split('\n').filter((o: string) => o.trim())"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows="2"
                  class="text-sm"
                />
              </div>
              
              <div v-if="item.type === 'rating'" class="grid grid-cols-2 gap-2">
                <Input
                  v-model.number="item.ratingMin"
                  type="number"
                  placeholder="Min (1)"
                  class="h-8"
                />
                <Input
                  v-model.number="item.ratingMax"
                  type="number"
                  placeholder="Max (5)"
                  class="h-8"
                />
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex flex-col space-y-1">
              <Button
                variant="ghost"
                size="sm"
                @click="moveChecklistItem(index, -1)"
                :disabled="index === 0"
              >
                <ChevronUp class="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="moveChecklistItem(index, 1)"
                :disabled="index === workOrder.checklist.length - 1"
              >
                <ChevronDown class="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="removeChecklistItem(index)"
                class="text-destructive hover:text-destructive"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div v-if="workOrder.checklist.length === 0" class="text-center py-6 text-muted-foreground">
            <CheckSquare class="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No checklist items yet. Add some items to get started.</p>
          </div>
        </div>
      </div>

      <!-- Materials Customization -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold flex items-center">
            <Package class="h-4 w-4 mr-2" />
            Required Materials
          </h4>
          <Button variant="outline" size="sm" @click="addMaterial">
            <Plus class="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
        
        <div class="space-y-3">
          <div
            v-for="(material, index) in workOrder.materials"
            :key="material.id"
            class="flex items-center space-x-3 p-3 border rounded-lg"
            :class="{ 'bg-muted/30': material.isCustom }"
          >
            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label class="text-xs text-muted-foreground">Item Name</Label>
                <Input
                  v-model="material.itemName"
                  placeholder="Material name"
                />
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Quantity</Label>
                <Input
                  v-model.number="material.plannedQuantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                />
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Notes</Label>
                <Input
                  v-model="material.notes"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox
                :id="`optional-${index}`"
                v-model:checked="material.isOptional"
              />
              <Label :for="`optional-${index}`" class="text-xs whitespace-nowrap">Optional</Label>
            </div>
            
            <Badge v-if="material.isCustom" variant="secondary" class="text-xs">Custom</Badge>
            
            <Button
              variant="ghost"
              size="sm"
              @click="removeMaterial(index)"
              class="text-destructive hover:text-destructive"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
          
          <div v-if="workOrder.materials.length === 0" class="text-center py-6 text-muted-foreground">
            <Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No materials required yet. Add materials if needed.</p>
          </div>
        </div>
      </div>

      <!-- Additional Instructions -->
      <div class="space-y-4">
        <h4 class="font-semibold flex items-center">
          <FileText class="h-4 w-4 mr-2" />
          Instructions & Notes
        </h4>
        
        <div class="space-y-3">
          <div>
            <Label for="instructions" class="text-sm font-medium">Work Instructions</Label>
            <Textarea
              id="instructions"
              v-model="workOrder.instructions"
              placeholder="Detailed step-by-step instructions for completing this work order"
              rows="4"
            />
          </div>
          
          <div>
            <Label for="safetyNotes" class="text-sm font-medium flex items-center text-red-600">
              <Shield class="h-4 w-4 mr-1" />
              Safety Notes
            </Label>
            <Textarea
              id="safetyNotes"
              v-model="workOrder.safetyNotes"
              placeholder="Important safety considerations and warnings"
              rows="2"
              class="border-red-200 focus:border-red-500"
            />
          </div>
        </div>
      </div>

      <!-- Customization Summary -->
      <div v-if="hasCustomizations" class="border-t pt-4">
        <h4 class="font-semibold flex items-center mb-3">
          <Edit class="h-4 w-4 mr-2" />
          Customizations Summary
        </h4>
        
        <div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label class="text-xs text-blue-700 dark:text-blue-300">Checklist</Label>
              <p class="flex items-center space-x-1">
                <span class="font-medium">{{ customizationStats.checklist.added }}</span>
                <span class="text-muted-foreground">added,</span>
                <span class="font-medium">{{ customizationStats.checklist.modified }}</span>
                <span class="text-muted-foreground">modified</span>
              </p>
            </div>
            <div>
              <Label class="text-xs text-blue-700 dark:text-blue-300">Materials</Label>
              <p class="flex items-center space-x-1">
                <span class="font-medium">{{ customizationStats.materials.added }}</span>
                <span class="text-muted-foreground">added,</span>
                <span class="font-medium">{{ customizationStats.materials.modified }}</span>
                <span class="text-muted-foreground">modified</span>
              </p>
            </div>
            <div>
              <Label class="text-xs text-blue-700 dark:text-blue-300">Basic Info</Label>
              <p class="text-muted-foreground">
                {{ customizationStats.basicInfo }} field{{ customizationStats.basicInfo !== 1 ? 's' : '' }} changed
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>

    <!-- Actions -->
    <div class="flex items-center justify-between p-6 bg-muted/30 border-t">
      <div class="text-sm text-muted-foreground">
        <span v-if="hasCustomizations" class="flex items-center">
          <AlertCircle class="h-4 w-4 mr-1 text-orange-500" />
          This work order has been customized from the original template
        </span>
        <span v-else>Work order matches the original template</span>
      </div>
      
      <div class="flex items-center space-x-3">
        <Button variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button @click="validateAndEmitSave" :disabled="!isValid">
          <Save class="h-4 w-4 mr-2" />
          Save Work Order
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { WorkOrderTemplate, ChecklistItemTemplate, MaterialRequirementTemplate } from '@/types/templates';
import type { CreateWorkOrderForm, ChecklistItem } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  FileEdit,
  RotateCcw,
  Info,
  CheckSquare,
  Package,
  FileText,
  Shield,
  Edit,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Save,
  AlertCircle,
} from 'lucide-vue-next';

interface Props {
  template: WorkOrderTemplate;
  initialData?: Partial<CreateWorkOrderForm>;
  allowTypeChange?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  allowTypeChange: true
});

const emit = defineEmits<{
  save: [workOrder: CreateWorkOrderForm & { customizations: any }];
  cancel: [];
}>();

// State
const workOrder = reactive<CreateWorkOrderForm & { 
  checklist: ChecklistItem[];
  materials: MaterialRequirementTemplate[];
}>({
  title: props.template.name,
  description: props.template.description,
  type: props.template.type,
  priority: props.template.defaultPriority,
  estimatedDuration: props.template.estimatedDuration,
  terminalId: props.initialData?.terminalId || '',
  startDate: props.initialData?.startDate || '',
  dueDate: props.initialData?.dueDate || '',
  instructions: props.template.instructions || '',
  safetyNotes: props.template.safetyNotes || '',
  checklist: (props.template.checklist || []).map(item => ({
    id: item.id,
    label: item.label,
    type: item.type as any, // Cast to allow all template types
    required: item.required,
    unit: item.unit,
    options: item.options,
    minValue: item.minValue,
    maxValue: item.maxValue,
    ratingMin: item.ratingMin,
    ratingMax: item.ratingMax,
    description: item.description,
    isCustom: item.isCustom
  })),
  materials: (props.template.materials || []).map(material => ({
    ...material,
    id: material.id || `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }))
});

const errors = reactive<Record<string, string>>({});

// Track original template for comparison
const originalTemplate = ref(structuredClone(props.template));

// Computed
const hasCustomizations = computed(() => {
  return JSON.stringify(workOrder) !== JSON.stringify({
    title: originalTemplate.value.name,
    description: originalTemplate.value.description,
    type: originalTemplate.value.type,
    priority: originalTemplate.value.defaultPriority,
    estimatedDuration: originalTemplate.value.estimatedDuration,
    instructions: originalTemplate.value.instructions || '',
    safetyNotes: originalTemplate.value.safetyNotes || '',
    checklist: originalTemplate.value.checklist || [],
    materials: originalTemplate.value.materials || []
  });
});

const customizationStats = computed(() => {
  const stats = {
    checklist: { added: 0, modified: 0 },
    materials: { added: 0, modified: 0 },
    basicInfo: 0
  };

  // Count checklist changes
  const originalChecklist = originalTemplate.value.checklist || [];
  const customChecklist = workOrder.checklist.filter((item: ChecklistItem) => item.isCustom);
  const modifiedChecklist = workOrder.checklist.filter((item: ChecklistItem) => 
    !item.isCustom && originalChecklist.find(orig => orig.id === item.id)
  );
  
  stats.checklist.added = customChecklist.length;
  stats.checklist.modified = modifiedChecklist.filter((item: ChecklistItem) => {
    const original = originalChecklist.find(orig => orig.id === item.id);
    return original && JSON.stringify(original) !== JSON.stringify({...item, isCustom: undefined});
  }).length;

  // Count material changes
  const originalMaterials = originalTemplate.value.materials || [];
  const customMaterials = workOrder.materials.filter(material => material.isCustom);
  const modifiedMaterials = workOrder.materials.filter(material => 
    !material.isCustom && originalMaterials.find(orig => orig.itemId === material.itemId)
  );
  
  stats.materials.added = customMaterials.length;
  stats.materials.modified = modifiedMaterials.filter(material => {
    const original = originalMaterials.find(orig => orig.itemId === material.itemId);
    return original && JSON.stringify(original) !== JSON.stringify({...material, isCustom: undefined});
  }).length;

  // Count basic info changes
  const basicFields = ['title', 'description', 'type', 'priority', 'estimatedDuration', 'instructions', 'safetyNotes'];
  stats.basicInfo = basicFields.reduce((count, field) => {
    const currentValue = workOrder[field as keyof CreateWorkOrderForm];
    const originalValue = field === 'title' ? originalTemplate.value.name : originalTemplate.value[field as keyof WorkOrderTemplate];
    return count + (currentValue !== originalValue ? 1 : 0);
  }, 0);

  return stats;
});

const isValid = computed(() => {
  return workOrder.title.trim().length > 0 && 
         workOrder.description.trim().length > 0 &&
         Object.keys(errors).length === 0;
});

// Methods
const resetToTemplate = () => {
  Object.assign(workOrder, {
    title: originalTemplate.value.name,
    description: originalTemplate.value.description,
    type: originalTemplate.value.type,
    priority: originalTemplate.value.defaultPriority,
    estimatedDuration: originalTemplate.value.estimatedDuration,
    instructions: originalTemplate.value.instructions || '',
    safetyNotes: originalTemplate.value.safetyNotes || '',
    checklist: structuredClone(originalTemplate.value.checklist || []),
    materials: structuredClone(originalTemplate.value.materials || [])
  });
  
  Object.keys(errors).forEach(key => delete errors[key]);
};

const addChecklistItem = () => {
  const newItem: ChecklistItemTemplate = {
    id: `custom-${Date.now()}`,
    templateId: props.template.id,
    label: '',
    type: 'boolean',
    required: false,
    isCustom: true,
    order: workOrder.checklist.length + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  workOrder.checklist.push(newItem);
};

const removeChecklistItem = (index: number) => {
  workOrder.checklist.splice(index, 1);
};

const moveChecklistItem = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < workOrder.checklist.length) {
    const item = workOrder.checklist[index];
    if (item) {
      workOrder.checklist.splice(index, 1);
      workOrder.checklist.splice(newIndex, 0, item);
    }
  }
};

const addMaterial = () => {
  const newMaterial: MaterialRequirementTemplate = {
    id: `custom-${Date.now()}`,
    itemId: `custom-item-${Date.now()}`,
    itemName: '',
    plannedQuantity: 1,
    isOptional: false,
    isCustom: true,
    notes: ''
  };
  
  workOrder.materials.push(newMaterial);
};

const removeMaterial = (index: number) => {
  workOrder.materials.splice(index, 1);
};

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  // Validate basic fields
  if (!workOrder.title.trim()) {
    newErrors.title = 'Title is required';
  }
  
  // Validate checklist items
  workOrder.checklist.forEach((item: ChecklistItem, index: number) => {
    if (!item.label.trim()) {
      newErrors[`checklist.${index}.label`] = 'Label is required';
    }
  });
  
  Object.keys(errors).forEach(key => delete errors[key]);
  Object.assign(errors, newErrors);
  
  return Object.keys(newErrors).length === 0;
};

const validateAndEmitSave = () => {
  if (validateForm()) {
    const customizations = {
      hasCustomizations: hasCustomizations.value,
      stats: customizationStats.value,
      templateId: props.template.id,
      templateVersion: props.template.version
    };
    
    emit('save', { ...workOrder, customizations });
  }
};

// Apply initial data if provided
if (props.initialData) {
  Object.assign(workOrder, props.initialData);
}

// Watch for validation
watch(() => workOrder.title, () => {
  if (errors.title && workOrder.title.trim()) {
    delete errors.title;
  }
});
</script>

<style scoped>
.work-order-customization {
  max-width: none;
}

/* Custom styles for better UX */
.grid > * {
  min-width: 0; /* Prevent grid items from overflowing */
}
</style>