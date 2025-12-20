<template>
  <div class="advanced-template-builder space-y-6">
    <!-- Header -->
    <div class="border-b pb-4">
      <h3 class="text-lg font-semibold">Advanced Template Builder</h3>
      <p class="text-sm text-muted-foreground">
        Create templates with conditional logic, dynamic fields, and advanced features
      </p>
    </div>

    <!-- Builder Tabs -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="basic">
          <FileText class="h-4 w-4 mr-2" />
          Basic Info
        </TabsTrigger>
        <TabsTrigger value="checklist">
          <CheckSquare class="h-4 w-4 mr-2" />
          Checklist Builder
        </TabsTrigger>
        <TabsTrigger value="conditional">
          <GitBranch class="h-4 w-4 mr-2" />
          Conditional Logic
        </TabsTrigger>
        <TabsTrigger value="dynamic">
          <Zap class="h-4 w-4 mr-2" />
          Dynamic Fields
        </TabsTrigger>
      </TabsList>

      <!-- Basic Info Tab -->
      <TabsContent value="basic">
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="name">Template Name</Label>
                <Input
                  id="name"
                  v-model="templateData.name"
                  placeholder="Enter template name..."
                />
              </div>
              <div>
                <Label for="code">Template Code</Label>
                <Input
                  id="code"
                  v-model="templateData.code"
                  placeholder="AUTO_GENERATED"
                  disabled
                />
              </div>
              <div>
                <Label for="category">Category</Label>
                <Select v-model="templateData.categoryId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="category in categories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label for="type">Template Type</Label>
                <Select v-model="templateData.type">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                    <SelectItem value="corrective">Corrective Maintenance</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="templateData.description"
                placeholder="Describe the template purpose and usage..."
                rows="3"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label for="duration">Estimated Duration (hours)</Label>
                <Input
                  id="duration"
                  v-model.number="templateData.estimatedDuration"
                  type="number"
                  min="0.5"
                  step="0.5"
                />
              </div>
              <div>
                <Label for="priority">Priority</Label>
                <Select v-model="templateData.priority">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label for="skillLevel">Required Skill Level</Label>
                <Select v-model="templateData.skillLevel">
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Tags -->
            <div>
              <Label>Tags</Label>
              <div class="flex flex-wrap gap-2 mt-2">
                <Badge
                  v-for="tag in templateData.tags"
                  :key="tag"
                  variant="secondary"
                  class="cursor-pointer"
                  @click="removeTag(tag)"
                >
                  {{ tag }}
                  <X class="h-3 w-3 ml-1" />
                </Badge>
              </div>
              <div class="flex mt-2">
                <Input
                  v-model="newTag"
                  placeholder="Add tag..."
                  @keyup.enter="addTag"
                  class="flex-1"
                />
                <Button @click="addTag" variant="outline" class="ml-2">
                  Add Tag
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Checklist Builder Tab -->
      <TabsContent value="checklist">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <span>Checklist Items</span>
              <Button @click="addChecklistItem" size="sm">
                <Plus class="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="templateData.checklist.length === 0" class="text-center py-8 text-muted-foreground">
              <CheckSquare class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No checklist items yet</p>
              <p class="text-xs">Add items to create a comprehensive checklist</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(item, index) in templateData.checklist"
                :key="item.id"
                class="border rounded-lg p-4 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-muted-foreground">#{{ index + 1 }}</span>
                    <Badge :variant="getItemTypeVariant(item.type)">
                      {{ item.type.replace('_', ' ') }}
                    </Badge>
                    <Badge v-if="item.required" variant="destructive" class="text-xs">
                      Required
                    </Badge>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Button
                      @click="toggleItemConditional(item)"
                      variant="ghost"
                      size="sm"
                      :class="{ 'text-blue-600': item.conditional }"
                    >
                      <GitBranch class="h-4 w-4" />
                    </Button>
                    <Button
                      @click="removeChecklistItem(index)"
                      variant="ghost"
                      size="sm"
                      class="text-destructive"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Item Text</Label>
                    <Input
                      v-model="item.label"
                      placeholder="Enter checklist item..."
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select v-model="item.type">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkbox">Yes/No/NA</SelectItem>
                        <SelectItem value="numeric">Numeric Value</SelectItem>
                        <SelectItem value="text">Text Input</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="rating">Rating Scale</SelectItem>
                        <SelectItem value="file_upload">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <!-- Conditional Logic Section -->
                <div v-if="item.conditional && item.conditionalLogic && item.conditionalLogic.length > 0" class="border-t pt-3 bg-blue-50 rounded-lg p-3">
                  <div class="text-sm font-medium text-blue-800 mb-2">Conditional Logic</div>
                  <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Select v-model="item.conditionalLogic![0]!.dependsOn">
                        <SelectTrigger>
                          <SelectValue placeholder="Depends on item..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="(depItem, depIndex) in templateData.checklist"
                            :key="depItem.id"
                            :value="depItem.id"
                            :disabled="depIndex >= index"
                          >
                            #{{ depIndex + 1 }} - {{ depItem.label || 'Untitled' }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Select v-model="item.conditionalLogic![0]!.condition">
                        <SelectTrigger>
                          <SelectValue placeholder="Condition..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-model="item.conditionalLogic![0]!.value"
                        placeholder="Value..."
                      />
                    </div>
                    <div class="text-xs text-blue-600">
                      This item will only show when the condition is met
                    </div>
                  </div>
                </div>

                <!-- Type-specific Options -->
                <div v-if="item.type === 'dropdown'" class="space-y-2">
                  <Label>Dropdown Options</Label>
                  <div class="space-y-1">
                    <div
                      v-for="(_, optIndex) in item.options || []"
                      :key="optIndex"
                      class="flex items-center space-x-2"
                    >
                      <Input
                        v-model="item.options![optIndex]"
                        placeholder="Option text..."
                        class="flex-1"
                      />
                      <Button
                        @click="removeOption(item, optIndex)"
                        variant="ghost"
                        size="sm"
                        class="text-destructive"
                      >
                        <X class="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button @click="addOption(item)" variant="outline" size="sm">
                    <Plus class="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div v-if="item.type === 'rating'" class="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Min Rating</Label>
                    <Input
                      v-model.number="item.ratingMin"
                      type="number"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label>Max Rating</Label>
                    <Input
                      v-model.number="item.ratingMax"
                      type="number"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <Checkbox v-model:checked="item.required" />
                    <Label class="text-sm">Required</Label>
                  </div>
                  <div v-if="item.description" class="flex-1">
                    <Input
                      v-model="item.description"
                      placeholder="Additional instructions..."
                      class="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Conditional Logic Tab -->
      <TabsContent value="conditional">
        <Card>
          <CardHeader>
            <CardTitle>Conditional Logic Rules</CardTitle>
            <CardDescription>
              Define rules that control when checklist items are shown or hidden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <!-- Global Rules -->
              <div class="border rounded-lg p-4">
                <h4 class="font-medium mb-3">Global Template Rules</h4>
                
                <div class="space-y-3">
                  <div class="flex items-center space-x-2">
                    <Checkbox v-model:checked="templateData.requirePhotos" />
                    <Label>Require before/after photos</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox v-model:checked="templateData.requireSignature" />
                    <Label>Require supervisor signature</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox v-model:checked="templateData.allowPartialCompletion" />
                    <Label>Allow partial completion and save</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox v-model:checked="templateData.autoAssignMaterials" />
                    <Label>Auto-assign materials based on checklist answers</Label>
                  </div>
                </div>
              </div>

              <!-- Conditional Items Summary -->
              <div class="border rounded-lg p-4">
                <h4 class="font-medium mb-3">Conditional Items Summary</h4>
                <div v-if="conditionalItems.length === 0" class="text-center py-4 text-muted-foreground">
                  <GitBranch class="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">No conditional items defined</p>
                  <p class="text-xs">Add conditional logic to checklist items to see them here</p>
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="item in conditionalItems"
                    :key="item.id"
                    class="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div>
                      <div class="font-medium text-sm">{{ item.label || 'Untitled Item' }}</div>
                      <div class="text-xs text-muted-foreground">
                        <span v-if="item.conditionalLogic && item.conditionalLogic.length > 0 && item.conditionalLogic[0]">
                          Shows when {{ getDependentItemLabel(item.conditionalLogic[0].dependsOn) }}
                          {{ item.conditionalLogic[0].condition }} "{{ item.conditionalLogic[0].value }}"
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" class="text-xs">
                      Conditional
                    </Badge>
                  </div>
                </div>
              </div>

              <!-- Logic Flow Visualization -->
              <div class="border rounded-lg p-4">
                <h4 class="font-medium mb-3">Logic Flow</h4>
                <div class="text-center py-8 text-muted-foreground">
                  <Network class="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">Logic flow visualization</p>
                  <p class="text-xs">Visual representation of conditional dependencies</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Dynamic Fields Tab -->
      <TabsContent value="dynamic">
        <Card>
          <CardHeader>
            <CardTitle>Dynamic Fields</CardTitle>
            <CardDescription>
              Create fields that adapt based on user input and context
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-6">
              <!-- Dynamic Field Types -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="border rounded-lg p-4">
                  <h4 class="font-medium mb-3">Equipment-Based Fields</h4>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-2">
                      <Checkbox v-model:checked="templateData.dynamicFields.equipmentSpecific" />
                      <Label class="text-sm">Include equipment-specific fields</Label>
                    </div>
                    <div v-if="templateData.dynamicFields.equipmentSpecific" class="ml-6 space-y-2">
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.dynamicFields.equipmentModel" />
                        <Label class="text-sm">Equipment model fields</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.dynamicFields.equipmentSpecs" />
                        <Label class="text-sm">Technical specifications</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border rounded-lg p-4">
                  <h4 class="font-medium mb-3">Location-Based Fields</h4>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-2">
                      <Checkbox v-model:checked="templateData.dynamicFields.locationSpecific" />
                      <Label class="text-sm">Include location-specific fields</Label>
                    </div>
                    <div v-if="templateData.dynamicFields.locationSpecific" class="ml-6 space-y-2">
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.dynamicFields.environmentalConditions" />
                        <Label class="text-sm">Environmental conditions</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.dynamicFields.safetyRequirements" />
                        <Label class="text-sm">Location safety requirements</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border rounded-lg p-4">
                  <h4 class="font-medium mb-3">Time-Based Fields</h4>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-2">
                      <Checkbox v-model:checked="templateData.dynamicFields.timeSpecific" />
                      <Label class="text-sm">Include time-based fields</Label>
                    </div>
                    <div v-if="templateData.dynamicFields.timeSpecific" class="ml-6 space-y-2">
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.dynamicFields.shiftInformation" />
                        <Label class="text-sm">Shift-specific information</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.dynamicFields.weatherConditions" />
                        <Label class="text-sm">Weather conditions</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border rounded-lg p-4">
                  <h4 class="font-medium mb-3">User-Based Fields</h4>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-2">
                      <Checkbox v-model:checked="templateData.dynamicFields.userSpecific" />
                      <Label class="text-sm">Include user-based fields</Label>
                    </div>
                    <div v-if="templateData.dynamicFields.userSpecific" class="ml-6 space-y-2">
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.dynamicFields.skillLevelAdjustments" />
                        <Label class="text-sm">Skill level adjustments</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.dynamicFields.certificationChecks" />
                        <Label class="text-sm">Certification requirements</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Field Generation Rules -->
              <div class="border rounded-lg p-4">
                <h4 class="font-medium mb-3">Field Generation Rules</h4>
                <div class="space-y-4">
                  <div>
                    <Label>Auto-generate fields when:</Label>
                    <div class="mt-2 space-y-2">
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.autoGenerateFields.newEquipment" />
                        <Label class="text-sm">New equipment is selected</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.autoGenerateFields.locationChange" />
                        <Label class="text-sm">Location is changed</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Checkbox v-model:checked="templateData.autoGenerateFields.priorityLevel" />
                        <Label class="text-sm">Priority level is high or critical</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview -->
              <div class="border rounded-lg p-4">
                <h4 class="font-medium mb-3">Dynamic Fields Preview</h4>
                <div class="text-center py-8 text-muted-foreground">
                  <Eye class="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">Dynamic fields preview</p>
                  <p class="text-xs">Shows how fields will appear based on current settings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- Action Buttons -->
    <div class="flex items-center justify-between border-t pt-4">
      <div class="flex items-center space-x-2">
        <Button @click="previewTemplate" variant="outline">
          <Eye class="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button @click="validateTemplate" variant="outline">
          <CheckCircle class="h-4 w-4 mr-2" />
          Validate
        </Button>
      </div>
      
      <div class="flex items-center space-x-2">
        <Button @click="saveDraft" variant="outline">
          <Save class="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button @click="saveTemplate">
          <Check class="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderTemplate, ChecklistItemTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Icons
import {
  FileText, CheckSquare, GitBranch, Zap, Plus, X, Trash2, Eye, CheckCircle, Save, Check,
  Network
} from 'lucide-vue-next';

interface Props {
  template?: WorkOrderTemplate;
  mode?: 'create' | 'edit';
}

interface AdvancedTemplateData {
  id?: string;
  name: string;
  code: string;
  description: string;
  categoryId: string;
  type: string;
  estimatedDuration: number;
  priority: string;
  skillLevel: string;
  tags: string[];
  checklist: ChecklistItemTemplate[];
  requirePhotos: boolean;
  requireSignature: boolean;
  allowPartialCompletion: boolean;
  autoAssignMaterials: boolean;
  dynamicFields: {
    equipmentSpecific: boolean;
    equipmentModel: boolean;
    equipmentSpecs: boolean;
    locationSpecific: boolean;
    environmentalConditions: boolean;
    safetyRequirements: boolean;
    timeSpecific: boolean;
    shiftInformation: boolean;
    weatherConditions: boolean;
    userSpecific: boolean;
    skillLevelAdjustments: boolean;
    certificationChecks: boolean;
  };
  autoGenerateFields: {
    newEquipment: boolean;
    locationChange: boolean;
    priorityLevel: boolean;
  };
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
});

const emit = defineEmits<{
  save: [template: AdvancedTemplateData];
  cancel: [];
}>();

// Stores
const categoryStore = useCategoryStore();
const { toast } = useToast();

// State
const activeTab = ref('basic');
const newTag = ref('');

const templateData = ref<AdvancedTemplateData>({
  name: '',
  code: '',
  description: '',
  categoryId: '',
  type: '',
  estimatedDuration: 2,
  priority: 'medium',
  skillLevel: 'intermediate',
  tags: [],
  checklist: [],
  requirePhotos: true,
  requireSignature: false,
  allowPartialCompletion: true,
  autoAssignMaterials: true,
  dynamicFields: {
    equipmentSpecific: false,
    equipmentModel: false,
    equipmentSpecs: false,
    locationSpecific: false,
    environmentalConditions: false,
    safetyRequirements: false,
    timeSpecific: false,
    shiftInformation: false,
    weatherConditions: false,
    userSpecific: false,
    skillLevelAdjustments: false,
    certificationChecks: false,
  },
  autoGenerateFields: {
    newEquipment: false,
    locationChange: false,
    priorityLevel: false,
  },
});

// Computed
const categories = computed(() => {
  return categoryStore.categories;
});

const conditionalItems = computed(() => {
  return templateData.value.checklist.filter(item => item.conditional);
});

// Methods
const generateTemplateCode = () => {
  if (templateData.value.name) {
    const baseName = templateData.value.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 10);
    templateData.value.code = `${baseName}_${Date.now().toString().slice(-6)}`;
  }
};

const addTag = () => {
  if (newTag.value.trim() && !templateData.value.tags.includes(newTag.value.trim())) {
    templateData.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (tag: string) => {
  templateData.value.tags = templateData.value.tags.filter(t => t !== tag);
};

const addChecklistItem = () => {
  const newItem: ChecklistItemTemplate = {
    id: `item-${Date.now()}`,
    label: '',
    type: 'checkbox',
    required: false,
    conditional: false,
    conditionalLogic: [],
    options: [],
    ratingMin: 1,
    ratingMax: 5,
    description: '',
  };
  templateData.value.checklist.push(newItem);
};

const removeChecklistItem = (index: number) => {
  templateData.value.checklist.splice(index, 1);
};

const toggleItemConditional = (item: ChecklistItemTemplate) => {
  item.conditional = !item.conditional;
  if (!item.conditional) {
    // Reset conditional logic when disabled
    item.conditionalLogic = [];
  } else {
    // Initialize with first rule if enabling conditional
    if (!item.conditionalLogic || item.conditionalLogic.length === 0) {
      item.conditionalLogic = [{
        dependsOn: '',
        condition: 'equals',
        value: '',
        action: 'show',
      }];
    }
  }
};

const addOption = (item: ChecklistItemTemplate) => {
  if (!item.options) item.options = [];
  item.options.push('');
};

const removeOption = (item: ChecklistItemTemplate, index: number) => {
  if (item.options) {
    item.options.splice(index, 1);
  }
};

const getItemTypeVariant = (type: string): "default" | "secondary" | "outline" | "destructive" => {
  const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    checkbox: 'default',
    numeric: 'secondary',
    text: 'outline',
    dropdown: 'secondary',
    rating: 'outline',
    file_upload: 'secondary',
  };
  return variants[type] || 'outline';
};

const getDependentItemLabel = (itemId: string) => {
  const item = templateData.value.checklist.find(i => i.id === itemId);
  return item ? item.label || 'Untitled Item' : 'Unknown Item';
};

const previewTemplate = () => {
  // Show preview modal/dialog
  toast({
    title: 'Template Preview',
    description: 'Opening template preview...',
  });
};

const validateTemplate = () => {
  const errors = [];
  
  if (!templateData.value.name) errors.push('Template name is required');
  if (!templateData.value.categoryId) errors.push('Category is required');
  if (!templateData.value.type) errors.push('Template type is required');
  if (templateData.value.checklist.length === 0) errors.push('At least one checklist item is required');
  
  // Validate conditional logic
  templateData.value.checklist.forEach((item, index) => {
    if (item.conditional && item.conditionalLogic && item.conditionalLogic.length > 0) {
      const logic = item.conditionalLogic[0];
      if (logic && !logic.dependsOn) {
        errors.push(`Item #${index + 1}: Conditional logic dependency is required`);
      }
      if (logic && !logic.condition) {
        errors.push(`Item #${index + 1}: Conditional logic condition is required`);
      }
      if (logic && !logic.value) {
        errors.push(`Item #${index + 1}: Conditional logic value is required`);
      }
    }
    
    if (item.type === 'dropdown' && (!item.options || item.options.length === 0)) {
      errors.push(`Item #${index + 1}: Dropdown options are required`);
    }
  });
  
  if (errors.length === 0) {
    toast({
      title: 'Validation Successful',
      description: 'Template passes all validation checks',
    });
  } else {
    toast({
      title: 'Validation Failed',
      description: `${errors.length} error(s) found`,
      variant: 'destructive',
    });
  }
  
  return errors.length === 0;
};

const saveDraft = () => {
  templateData.value.code = templateData.value.code || 'DRAFT_' + Date.now();
  emit('save', { ...templateData.value });
  toast({
    title: 'Draft Saved',
    description: 'Template saved as draft',
  });
};

const saveTemplate = () => {
  if (validateTemplate()) {
    generateTemplateCode();
    emit('save', { ...templateData.value });
    toast({
      title: 'Template Saved',
      description: 'Advanced template saved successfully',
    });
  }
};

// Watchers
watch(() => templateData.value.name, generateTemplateCode);

// Lifecycle
onMounted(() => {
  if (props.template && props.mode === 'edit') {
    // Load existing template data
    Object.assign(templateData.value, props.template);
  }
});
</script>

<style scoped>
.advanced-template-builder {
  max-width: 100%;
}

/* Animation for conditional logic sections */
.conditional-section {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 200px;
    transform: translateY(0);
  }
}

/* Highlight for conditional items */
.conditional-item {
  border-left: 4px solid #3b82f6;
}
</style>