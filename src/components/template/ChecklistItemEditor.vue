<template>
  <Card class="checklist-item-editor">
    <CardContent class="p-4">
      <div class="flex items-start space-x-3">
        <!-- Drag Handle -->
        <div class="drag-handle cursor-grab active:cursor-grabbing mt-1">
          <GripVertical class="h-4 w-4 text-muted-foreground" />
        </div>
        
        <!-- Order Number -->
        <div class="flex-none">
          <Badge variant="outline" class="text-xs font-mono">
            {{ item.order }}
          </Badge>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 space-y-4">
          <!-- Item Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Input
                v-model="item.label"
                placeholder="Checklist item label"
                class="text-sm font-medium min-w-0 flex-1"
              />
              <Checkbox
                v-model:checked="item.required"
                class="flex-none"
              />
              <Label class="text-xs text-muted-foreground flex-none">Required</Label>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                @click="$emit('moveUp')"
                :disabled="!canMoveUp"
              >
                <ChevronUp class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="$emit('moveDown')"
                :disabled="!canMoveDown"
              >
                <ChevronDown class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="$emit('duplicate', index)"
              >
                <Copy class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="showAdvanced = !showAdvanced"
                :class="{ 'bg-muted': showAdvanced }"
              >
                <Settings class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="$emit('remove', index)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Item Type Selection -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-xs">Input Type</Label>
              <Select v-model="item.type" @update:model-value="(value) => handleTypeChange(String(value))">
                <SelectTrigger class="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Yes/No</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="signature">Signature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div v-if="item.description !== undefined">
              <Label class="text-xs">Description</Label>
              <Input
                v-model="item.description"
                placeholder="Optional description"
                class="h-8 text-sm"
              />
            </div>
          </div>

          <!-- Type-Specific Configuration -->
          <div class="type-specific-config">
            <!-- Number Type -->
            <div v-if="item.type === 'number'" class="grid grid-cols-3 gap-2">
              <div>
                <Label class="text-xs">Unit</Label>
                <Input
                  v-model="item.unit"
                  placeholder="e.g., PSI, °C"
                  class="h-8 text-sm"
                />
              </div>
              <div>
                <Label class="text-xs">Min Value</Label>
                <Input
                  v-model.number="item.minValue"
                  type="number"
                  placeholder="0"
                  class="h-8 text-sm"
                />
              </div>
              <div>
                <Label class="text-xs">Max Value</Label>
                <Input
                  v-model.number="item.maxValue"
                  type="number"
                  placeholder="100"
                  class="h-8 text-sm"
                />
              </div>
            </div>

            <!-- Text Type -->
            <div v-if="item.type === 'text'" class="grid grid-cols-2 gap-2">
              <div>
                <Label class="text-xs">Pattern (Regex)</Label>
                <Input
                  v-model="item.pattern"
                  placeholder="Optional validation pattern"
                  class="h-8 text-sm font-mono"
                />
              </div>
              <div>
                <Label class="text-xs">Default Value</Label>
                <Input
                  v-model="item.defaultValue"
                  placeholder="Default text"
                  class="h-8 text-sm"
                />
              </div>
            </div>

            <!-- Dropdown Type -->
            <div v-if="item.type === 'dropdown'" class="space-y-2">
              <Label class="text-xs">Options</Label>
              <div class="space-y-1">
                <div
                  v-for="(_, optionIndex) in item.options"
                  :key="optionIndex"
                  class="flex items-center space-x-2"
                >
                  <Input
                    v-model="item.options![optionIndex]"
                    placeholder="Option text"
                    class="h-8 text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="removeOption(optionIndex)"
                  >
                    <X class="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  @click="addOption"
                  class="w-full"
                >
                  <Plus class="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>

            <!-- Rating Type -->
            <div v-if="item.type === 'rating'" class="grid grid-cols-2 gap-2">
              <div>
                <Label class="text-xs">Scale (1 to...)</Label>
                <Select v-model="item.maxValue">
                  <SelectTrigger class="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="5">5 (1-5)</SelectItem>
                    <SelectItem :value="10">10 (1-10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label class="text-xs">Default Rating</Label>
                <Input
                  v-model.number="item.defaultValue"
                  type="number"
                  :min="1"
                  :max="item.maxValue || 5"
                  class="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Advanced Configuration -->
          <Collapsible v-model:open="showAdvanced">
            <CollapsibleContent class="space-y-3 pt-2 border-t border-border">
              <!-- Section Assignment -->
              <div>
                <Label class="text-xs">Section</Label>
                <Input
                  v-model="item.section"
                  placeholder="Optional section name"
                  class="h-8 text-sm"
                />
              </div>

              <!-- Help Text -->
              <div>
                <Label class="text-xs">Help Text</Label>
                <Textarea
                  v-model="item.helpText"
                  placeholder="Additional instructions for workers"
                  rows="2"
                  class="text-sm resize-none"
                />
              </div>

              <!-- Thresholds (for number type) -->
              <div v-if="item.type === 'number'" class="grid grid-cols-2 gap-2">
                <div>
                  <Label class="text-xs">Warning Threshold</Label>
                  <Input
                    v-model.number="item.warningThreshold"
                    type="number"
                    placeholder="Warning value"
                    class="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label class="text-xs">Critical Threshold</Label>
                  <Input
                    v-model.number="item.criticalThreshold"
                    type="number"
                    placeholder="Critical value"
                    class="h-8 text-sm"
                  />
                </div>
              </div>

              <!-- Conditional Logic -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label class="text-xs">Conditional Logic</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="addCondition"
                  >
                    <Plus class="h-3 w-3 mr-1" />
                    Add Condition
                  </Button>
                </div>
                
                <div
                  v-if="item.conditionalLogic"
                  class="space-y-1"
                >
                  <div
                    v-for="(condition, conditionIndex) in item.conditionalLogic"
                    :key="conditionIndex"
                    class="flex items-center space-x-2 p-2 bg-muted/30 rounded text-sm"
                  >
                    <span>Show if:</span>
                    <Input
                      v-model="condition.dependsOn"
                      placeholder="Item ID"
                      class="h-7 text-xs flex-1"
                    />
                    <Select v-model="condition.condition">
                      <SelectTrigger class="h-7 w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="greater_than">greater</SelectItem>
                        <SelectItem value="less_than">less</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      v-model="condition.value"
                      placeholder="Value"
                      class="h-7 text-xs flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="removeCondition(Number(conditionIndex))"
                    >
                      <X class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Status Toggle -->
              <div class="flex items-center space-x-2">
                <Checkbox
                  v-model:checked="item.isActive"
                />
                <Label class="text-xs">Item is active</Label>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <!-- Preview -->
          <div class="preview-section bg-muted/20 p-3 rounded border">
            <Label class="text-xs text-muted-foreground">Preview</Label>
            <ChecklistItemPreview :item="item" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ChecklistItemTemplate } from '@/types/templates';

// Components
import ChecklistItemPreview from './ChecklistItemPreview.vue';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';

// Icons
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Settings,
  Trash2,
  Plus,
  X,
} from 'lucide-vue-next';

interface Props {
  modelValue: Omit<ChecklistItemTemplate, 'id' | 'templateId'>;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: Omit<ChecklistItemTemplate, 'id' | 'templateId'>];
  remove: [index: number];
  duplicate: [index: number];
  moveUp: [];
  moveDown: [];
}>();

// Local state
const item = ref({ ...props.modelValue });
const showAdvanced = ref(false);

// Watch for changes and emit updates
watch(item, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  item.value = { ...newValue };
}, { deep: true });

// Type-specific handlers
const handleTypeChange = (newType: string) => {
  // Reset type-specific properties when type changes
  switch (newType) {
    case 'yes_no':
      item.value.unit = undefined;
      item.value.options = undefined;
      item.value.minValue = undefined;
      item.value.maxValue = undefined;
      item.value.pattern = undefined;
      break;
    case 'number':
      item.value.options = undefined;
      item.value.pattern = undefined;
      item.value.defaultValue = undefined;
      break;
    case 'text':
      item.value.unit = undefined;
      item.value.options = undefined;
      item.value.minValue = undefined;
      item.value.maxValue = undefined;
      break;
    case 'dropdown':
      item.value.unit = undefined;
      item.value.minValue = undefined;
      item.value.maxValue = undefined;
      item.value.pattern = undefined;
      item.value.defaultValue = undefined;
      if (!item.value.options) {
        item.value.options = ['Option 1', 'Option 2'];
      }
      break;
    case 'rating':
      item.value.unit = undefined;
      item.value.options = undefined;
      item.value.pattern = undefined;
      item.value.minValue = 1;
      item.value.maxValue = 5;
      break;
    case 'photo':
    case 'signature':
      item.value.unit = undefined;
      item.value.options = undefined;
      item.value.minValue = undefined;
      item.value.maxValue = undefined;
      item.value.pattern = undefined;
      item.value.defaultValue = undefined;
      break;
  }
};

// Options management
const addOption = () => {
  if (!item.value.options) {
    item.value.options = [];
  }
  item.value.options.push(`Option ${item.value.options.length + 1}`);
};

const removeOption = (index: number) => {
  if (item.value.options && item.value.options.length > 1) {
    item.value.options.splice(index, 1);
  }
};

// Conditional logic management
const addCondition = () => {
  if (!item.value.conditionalLogic) {
    item.value.conditionalLogic = [];
  }
  item.value.conditionalLogic.push({
    dependsOn: '',
    condition: 'equals',
    value: '',
    action: 'show'
  });
};

const removeCondition = (index: number) => {
  if (item.value.conditionalLogic) {
    item.value.conditionalLogic.splice(index, 1);
  }
};
</script>

<style scoped>
.checklist-item-editor {
  transition: all 0.2s ease;
}

.checklist-item-editor:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.drag-handle {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.checklist-item-editor:hover .drag-handle {
  opacity: 1;
}

.type-specific-config {
  min-height: 2rem;
}

.preview-section {
  background: var(--muted);
  background-opacity: 0.3;
}
</style>