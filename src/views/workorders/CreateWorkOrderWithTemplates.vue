<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Create Work Order</h1>
      <p class="mt-1 text-sm text-gray-600">
        Create from template or build a custom work order
      </p>
    </div>

    <!-- Memo Source Banner -->
    <Alert v-if="memoMessage" class="bg-blue-50 border-blue-200">
      <FileText class="h-4 w-4 text-blue-600" />
      <AlertTitle class="text-blue-900">Creating from Work Order Request</AlertTitle>
      <AlertDescription class="text-blue-700">
        This work order is being created from a memo request by
        <span class="font-medium">{{ memoMessage.memoData?.workOrderSpecs?.title }}</span>.
        The form has been pre-filled with the requested details.
      </AlertDescription>
    </Alert>

    <!-- Creation Method Selection -->
    <Card v-if="!selectedTemplate && creationMethod === null">
      <CardHeader>
        <CardTitle>How would you like to create this work order?</CardTitle>
        <p class="text-sm text-muted-foreground">
          Choose to start from a template for standardized maintenance or create a custom work order
        </p>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            class="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-ring"
            @click="setCreationMethod('template')"
          >
            <CardContent class="p-6 text-center">
              <FileText class="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 class="font-medium mb-2">From Template</h3>
              <p class="text-sm text-muted-foreground">
                Start with a predefined template with SOPs, checklists, and material lists
              </p>
              <div class="mt-4">
                <Badge variant="outline" class="text-xs">
                  {{ templateStore.templates.length }} templates available
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            class="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-ring"
            @click="setCreationMethod('custom')"
          >
            <CardContent class="p-6 text-center">
              <Plus class="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 class="font-medium mb-2">Custom Work Order</h3>
              <p class="text-sm text-muted-foreground">
                Create a new work order from scratch with manual configuration
              </p>
              <div class="mt-4">
                <Badge variant="outline" class="text-xs">
                  Full flexibility
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Enhanced Template Selection -->
    <Card v-if="creationMethod === 'template' && !selectedTemplate && !showCustomization">
      <CardHeader>
        <CardTitle>Select Template</CardTitle>
        <p class="text-sm text-muted-foreground">
          Browse categories and choose a template to pre-populate the work order
        </p>
      </CardHeader>
      <CardContent>
        <TemplateSelectionWizard
          :categories="categoryStore.categoryTree"
          :templates="templateStore.templates"
          :maintenance-type="form.type"
          @template-selected="handleTemplateSelect"
          @category-selected="handleCategorySelected"
        />
        <div class="flex items-center justify-between mt-6">
          <Button variant="outline" @click="setCreationMethod(null)">
            <ChevronLeft class="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Template Customization Interface -->
    <div v-if="selectedTemplate && showCustomization">
      <WorkOrderCustomizationInterface
        :template="selectedTemplate"
        :initial-data="customizationData"
        @save="handleCustomizationSave"
        @cancel="handleCustomizationCancel"
      />
    </div>

    <!-- Template Preview (Only shown if not in customization mode) -->
    <Card v-if="selectedTemplate && !showCustomization">
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle class="flex items-center space-x-2">
            <FileText class="h-5 w-5 text-blue-500" />
            <span>Using Template: {{ selectedTemplate.name }}</span>
          </CardTitle>
          <p class="text-sm text-muted-foreground mt-1">
            {{ selectedTemplate.description }}
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Badge :variant="getTypeVariant(selectedTemplate.type)" class="text-xs">
            {{ selectedTemplate.type }}
          </Badge>
          <Button variant="outline" size="sm" @click="startCustomization">
            <Edit class="h-4 w-4 mr-2" />
            Customize
          </Button>
          <Button variant="outline" size="sm" @click="clearTemplate">
            <X class="h-4 w-4 mr-2" />
            Remove Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="text-center p-3 bg-muted/30 rounded-lg">
            <div class="font-medium text-green-600">{{ selectedTemplate.checklist?.length || 0 }}</div>
            <div class="text-muted-foreground">Checklist Items</div>
          </div>
          <div class="text-center p-3 bg-muted/30 rounded-lg">
            <div class="font-medium text-orange-600">{{ selectedTemplate.materials?.length || 0 }}</div>
            <div class="text-muted-foreground">Materials</div>
          </div>
          <div class="text-center p-3 bg-muted/30 rounded-lg">
            <div class="font-medium text-purple-600">{{ selectedTemplate.estimatedDuration }}h</div>
            <div class="text-muted-foreground">Est. Duration</div>
          </div>
          <div class="text-center p-3 bg-muted/30 rounded-lg">
            <div class="font-medium text-blue-600">{{ selectedTemplate.defaultPriority }}</div>
            <div class="text-muted-foreground">Priority</div>
          </div>
        </div>
        
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            Template will be applied with all default settings
          </div>
          <Button @click="startCustomization">
            <Edit class="h-4 w-4 mr-2" />
            Customize Template
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Work Order Form -->
    <div v-if="creationMethod !== null && !showCustomization">
      <!-- Customization Summary -->
      <Card v-if="hasTemplateCustomizations" class="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Edit class="h-4 w-4 text-blue-600" />
              <span class="font-medium text-blue-900 dark:text-blue-100">Template Customized</span>
            </div>
            <div class="flex items-center space-x-2">
              <Badge variant="outline" class="text-xs">
                {{ customizationData?.stats?.checklist?.added || 0 }} checklist items added
              </Badge>
              <Badge variant="outline" class="text-xs">
                {{ customizationData?.stats?.materials?.added || 0 }} materials added
              </Badge>
              <Button variant="outline" size="sm" @click="startCustomization">
                <Edit class="h-4 w-4 mr-2" />
                Edit Customization
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Details -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Work Order Details</CardTitle>
              <div v-if="selectedTemplate && !hasTemplateCustomizations">
                <Button variant="outline" size="sm" @click="startCustomization">
                  <Edit class="h-4 w-4 mr-2" />
                  Customize Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2 space-y-2">
                <Label for="title">Title</Label>
                <Input
                  id="title"
                  v-model="form.title"
                  type="text"
                  required
                  placeholder="e.g. Gas Pipeline Pressure Test - Main Line A"
                />
              </div>

              <div class="md:col-span-2 space-y-2">
                <Label for="description">Description</Label>
                <Textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  required
                  placeholder="Detailed description of the maintenance work required..."
                />
              </div>
            
              <!-- Category Selection (Enhanced) -->
              <div class="md:col-span-2 space-y-2">
                <Label for="category">Category</Label>
                <CategorySelector
                  v-model="selectedCategoryId"
                  placeholder="Select maintenance category"
                  @category-select="handleCategorySelect"
                />
                <p v-if="selectedCategory" class="text-xs text-muted-foreground">
                  Path: {{ categoryStore.getCategoryPathString(selectedCategory.id) }}
                </p>
              </div>
            
              <div class="space-y-2">
                <Label for="type">Type</Label>
                <Select v-model="form.type" required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                    <SelectItem value="corrective">Corrective Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div v-if="form.type === 'corrective'" class="space-y-2">
                <Label for="subType">Sub Type</Label>
                <Select v-model="form.subType">
                  <SelectTrigger id="subType">
                    <SelectValue placeholder="Select Sub Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="incidental">Incidental</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="priority">Priority</Label>
                <Select v-model="form.priority" required>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="terminal">Terminal</Label>
                <Select v-model="form.terminalId" required>
                  <SelectTrigger id="terminal">
                    <SelectValue placeholder="Select Terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terminal1">Terminal 1 - Jakarta</SelectItem>
                    <SelectItem value="terminal2">Terminal 2 - Surabaya</SelectItem>
                    <SelectItem value="terminal3">Terminal 3 - Medan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label for="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  v-model="form.startDate"
                  type="datetime-local"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  v-model="form.dueDate"
                  type="datetime-local"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="estimatedDuration">Estimated Duration (hours)</Label>
                <Input
                  id="estimatedDuration"
                  v-model.number="form.estimatedDuration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                />
              </div>

              <div v-if="hasPermission('assign_workers')" class="space-y-2">
                <Label for="assignedWorker">Assigned Worker</Label>
                <Select v-model="form.assignedWorkerId">
                  <SelectTrigger id="assignedWorker">
                    <SelectValue placeholder="Assign Later" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worker1">Candra Wijaya</SelectItem>
                    <SelectItem value="worker2">Eko Pratama</SelectItem>
                    <SelectItem value="worker3">Farid Rahman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Template-based sections -->
        <div v-if="selectedTemplate">
          <!-- Safety Requirements from Template -->
          <Card v-if="selectedTemplate.safetyRequirements && selectedTemplate.safetyRequirements.length > 0">
            <CardHeader>
              <CardTitle class="flex items-center space-x-2">
                <ShieldCheck class="h-5 w-5 text-red-500" />
                <span>Safety Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2">
                <li 
                  v-for="requirement in selectedTemplate.safetyRequirements"
                  :key="requirement"
                  class="flex items-center space-x-2"
                >
                  <AlertTriangle class="h-4 w-4 text-yellow-500" />
                  <span class="text-sm">{{ requirement }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <!-- Prerequisites from Template -->
          <Card v-if="selectedTemplate.prerequisites && selectedTemplate.prerequisites.length > 0">
            <CardHeader>
              <CardTitle class="flex items-center space-x-2">
                <CheckCircle class="h-5 w-5 text-blue-500" />
                <span>Prerequisites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2">
                <li 
                  v-for="prerequisite in selectedTemplate.prerequisites"
                  :key="prerequisite"
                  class="flex items-center space-x-2"
                >
                  <Circle class="h-4 w-4 text-blue-400" />
                  <span class="text-sm">{{ prerequisite }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <!-- Materials Section (Simplified for Templates) -->
        <Card v-if="!selectedTemplate || (selectedTemplate && form.materials.length > 0)">
          <CardHeader class="flex flex-row items-center justify-between space-y-0">
            <CardTitle class="flex items-center space-x-2">
              <Package class="h-5 w-5" />
              <span>Required Materials</span>
              <Badge v-if="selectedTemplate" variant="outline" class="text-xs ml-2">
                {{ hasTemplateCustomizations ? 'Customized' : 'From Template' }}
              </Badge>
            </CardTitle>
            <Button
              v-if="!selectedTemplate"
              type="button"
              variant="outline"
              size="sm"
              @click="addMaterial"
            >
              <Plus class="w-4 h-4 mr-2" />
              Add Material
            </Button>
            <Button
              v-else-if="selectedTemplate && !hasTemplateCustomizations"
              type="button"
              variant="outline"
              size="sm"
              @click="startCustomization"
            >
              <Edit class="w-4 h-4 mr-2" />
              Customize Materials
            </Button>
          </CardHeader>
          <CardContent>
            <div v-if="selectedTemplate && !hasTemplateCustomizations">
              <div class="text-center py-6">
                <Package class="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 class="font-medium mb-1">Template Materials</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  This template includes {{ selectedTemplate.materials?.length || 0 }} predefined materials
                </p>
                <Button variant="outline" @click="startCustomization">
                  <Edit class="h-4 w-4 mr-2" />
                  View and Customize Materials
                </Button>
              </div>
            </div>
            
            <Alert v-else-if="!selectedTemplate && form.materials.length === 0">
              <Package class="h-4 w-4" />
              <AlertTitle>No materials added</AlertTitle>
              <AlertDescription>
                Click "Add Material" to include required materials for this work order.
              </AlertDescription>
            </Alert>

            <div v-else-if="form.materials.length > 0" class="space-y-3">
              <div class="text-sm text-muted-foreground mb-3">
                {{ form.materials.length }} material{{ form.materials.length !== 1 ? 's' : '' }} configured
                <span v-if="hasTemplateCustomizations"> (includes customizations)</span>
              </div>
              
              <!-- Simple material summary for template-based work orders -->
              <div v-if="selectedTemplate" class="space-y-2">
                <div
                  v-for="(material, index) in form.materials.slice(0, 3)"
                  :key="index"
                  class="flex items-center justify-between p-2 bg-muted/30 rounded"
                >
                  <span class="text-sm font-medium">{{ material.itemName || 'Material ' + (index + 1) }}</span>
                  <Badge variant="outline" class="text-xs">
                    {{ material.plannedQuantity }}
                  </Badge>
                </div>
                <div v-if="form.materials.length > 3" class="text-xs text-muted-foreground text-center">
                  +{{ form.materials.length - 3 }} more materials
                </div>
                <div class="pt-2">
                  <Button variant="outline" size="sm" @click="startCustomization" class="w-full">
                    <Edit class="h-4 w-4 mr-2" />
                    View All Materials
                  </Button>
                </div>
              </div>
              
              <!-- Full material editor for custom work orders -->
              <div v-else class="space-y-4">
                <div
                  v-for="(material, index) in form.materials"
                  :key="index"
                  class="flex items-center space-x-4 p-4 border border-border rounded-lg"
                >
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Material</Label>
                      <Select v-model="material.itemId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="item in availableItems"
                            :key="item.id"
                            :value="item.id"
                          >
                            {{ item.name }} ({{ item.code }})
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Planned Quantity</Label>
                      <Input
                        v-model.number="material.plannedQuantity"
                        type="number"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="removeMaterial(index)"
                  >
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Actions -->
        <div class="flex items-center justify-between">
          <Button type="button" variant="outline" @click="goBack">
            Cancel
          </Button>
          
          <div class="flex items-center space-x-2">
            <Button type="button" variant="outline" @click="saveDraft">
              Save as Draft
            </Button>
            <Button type="submit" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
              Create Work Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { useInventoryStore } from '@/stores/inventory';
import { useTemplateStore } from '@/stores/template';
import { useCategoryStore } from '@/stores/category';
import { useMessageStore } from '@/stores/message';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Custom Components
import TemplateSelectionWizard from '@/components/workorder/TemplateSelectionWizard.vue';
import WorkOrderCustomizationInterface from '@/components/workorder/WorkOrderCustomizationInterface.vue';
import CategorySelector from '@/components/category/CategorySelector.vue';

// Icons
import { 
  Plus, Package, Trash2, FileText, X, ChevronLeft, Edit,
  ShieldCheck, AlertTriangle, CheckCircle, Circle, Loader2
} from 'lucide-vue-next';

// Types
import type { CreateWorkOrderForm } from '@/types';
import type { WorkOrderTemplate, WorkOrderCategory } from '@/types/templates';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();
const inventoryStore = useInventoryStore();
const templateStore = useTemplateStore();
const categoryStore = useCategoryStore();
const messageStore = useMessageStore();

// State
const isSubmitting = ref(false);
const memoId = ref<string | null>(null);
const memoMessage = ref<any>(null);
const creationMethod = ref<'template' | 'custom' | null>(null);
const selectedTemplateId = ref<string>('');
const selectedTemplate = ref<WorkOrderTemplate | null>(null);
const selectedCategoryId = ref<string>('');
const showCustomization = ref(false);
const customizationData = ref<any>(null);
const hasTemplateCustomizations = ref(false);

// Enhanced form with template support
const form = ref<CreateWorkOrderForm & { categoryId?: string }>({
  title: '',
  description: '',
  type: 'preventive',
  priority: 'normal',
  terminalId: '',
  startDate: '',
  dueDate: '',
  estimatedDuration: 4,
  materials: [],
  categoryId: ''
});

// Computed
const availableItems = computed(() => inventoryStore.activeItems);

const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null;
  return categoryStore.getCategoryById(selectedCategoryId.value);
});

// Methods
const hasPermission = (permission: string) => authStore.hasPermission(permission);

const setCreationMethod = (method: 'template' | 'custom' | null) => {
  creationMethod.value = method;
  if (method === 'custom') {
    // Reset any template selection
    clearTemplate();
  }
};

const handleTemplateSelect = (template: WorkOrderTemplate) => {
  selectedTemplate.value = template;
  selectedTemplateId.value = template.id;
  
  // Set up basic template data
  selectedCategoryId.value = template.categoryId;
  form.value.categoryId = template.categoryId;
  
  // Initialize customization data with template defaults
  customizationData.value = {
    terminalId: form.value.terminalId,
    startDate: form.value.startDate,
    dueDate: form.value.dueDate,
    assignedWorkerId: form.value.assignedWorkerId
  };
};

const handleCategorySelected = (category: WorkOrderCategory | null) => {
  if (category) {
    selectedCategoryId.value = category.id;
    form.value.categoryId = category.id;
  } else {
    selectedCategoryId.value = '';
    form.value.categoryId = '';
  }
};


const clearTemplate = () => {
  selectedTemplate.value = null;
  selectedTemplateId.value = '';
  showCustomization.value = false;
  customizationData.value = null;
  hasTemplateCustomizations.value = false;
  
  // Reset form to default values but keep manually entered data
  form.value.materials = form.value.materials.filter(m => !m.fromTemplate);
};

const startCustomization = () => {
  showCustomization.value = true;
};

const handleCustomizationSave = (customizedWorkOrder: any) => {
  // Apply the customized work order data to the form
  Object.assign(form.value, customizedWorkOrder);
  
  // Track if there were customizations
  hasTemplateCustomizations.value = customizedWorkOrder.customizations?.hasCustomizations || false;
  
  // Store customization metadata
  customizationData.value = customizedWorkOrder.customizations;
  
  // Exit customization mode and show the work order form
  showCustomization.value = false;
  creationMethod.value = 'template'; // Ensure we stay in template mode
};

const handleCustomizationCancel = () => {
  // Return to template preview without saving changes
  showCustomization.value = false;
};

const handleCategorySelect = (category: WorkOrderCategory) => {
  selectedCategoryId.value = category.id;
  form.value.categoryId = category.id;
};

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'preventive': return 'default';
    case 'corrective': return 'destructive';
    default: return 'secondary';
  }
};

const addMaterial = () => {
  form.value.materials.push({
    itemId: '',
    plannedQuantity: 1,
    fromTemplate: false
  });
};

const removeMaterial = (index: number) => {
  // Prevent removal of template materials when template is active
  const material = form.value.materials[index];
  if (material && material.fromTemplate && selectedTemplate.value) {
    return;
  }
  
  form.value.materials.splice(index, 1);
};

const saveDraft = async () => {
  // Implement draft saving logic
  console.log('Saving as draft...', form.value);
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
    // Set default terminal for admin if not selected
    if (!form.value.terminalId && authStore.currentUser?.terminalId) {
      form.value.terminalId = authStore.currentUser.terminalId;
    }
    
    // Create work order with enhanced data
    const workOrderData = {
      ...form.value,
      templateId: selectedTemplate.value?.id,
      categoryId: selectedCategoryId.value
    };
    
    let workOrder;
    
    if (selectedTemplate.value) {
      // Use template store method to create from template with inheritance tracking
      const templateData = {
        ...workOrderData,
        customizations: customizationData.value
      };
      
      workOrder = await templateStore.createWorkOrderFromTemplate(
        selectedTemplate.value.id,
        templateData
      );
    } else {
      // Create regular work order
      workOrder = await workOrderStore.createWorkOrder(workOrderData);
    }
    
    // Update template usage statistics
    if (selectedTemplate.value) {
      templateStore.incrementUsageCount(selectedTemplate.value.id);
    }
    
    // Auto-submit for approval if user has permission
    if (authStore.hasPermission('create_work_orders')) {
      await workOrderStore.updateWorkOrderStatus(workOrder.id, 'pending_approval');
    }

    // If created from memo, update memo status to 'converted'
    if (memoId.value) {
      messageStore.updateMemoStatus(memoId.value, 'converted', workOrder.id);
    }

    router.push(`/work-orders/${workOrder.id}`);
  } catch (error) {
    console.error('Failed to create work order:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.back();
};

// Initialize
onMounted(async () => {
  // Load necessary data
  await Promise.all([
    inventoryStore.fetchInventoryItems(),
    templateStore.fetchTemplates(),
    categoryStore.fetchCategories()
  ]);

  // Set default dates
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  form.value.startDate = tomorrow.toISOString().slice(0, 16);
  form.value.dueDate = nextWeek.toISOString().slice(0, 16);

  // Set default terminal for terminal admin
  if (authStore.currentUser?.terminalId) {
    form.value.terminalId = authStore.currentUser.terminalId;
  }

  // Check if creating from memo
  if (route.query.memoId) {
    memoId.value = route.query.memoId as string;

    // Find the memo message
    const memo = messageStore.messages.find(m => m.id === memoId.value);
    if (memo?.memoData) {
      memoMessage.value = memo;
      const specs = memo.memoData.workOrderSpecs;

      // Pre-fill form with memo data
      form.value.title = specs.title || '';
      form.value.description = specs.description || '';
      form.value.priority = specs.priority || 'normal';
      form.value.terminalId = specs.terminalId || form.value.terminalId;
      form.value.estimatedDuration = specs.estimatedDuration || 4;
      form.value.assignedWorkerId = specs.suggestedWorkerId || '';

      // Set to custom creation method since memo provides the details
      creationMethod.value = 'custom';
    }
  }
});
</script>

<style scoped>
.grid {
  display: grid;
}
</style>