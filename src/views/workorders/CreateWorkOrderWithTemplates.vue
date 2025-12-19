<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Create Work Order</h1>
      <p class="mt-1 text-sm text-gray-600">
        Create from template or build a custom work order
      </p>
    </div>

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

    <!-- Template Selection -->
    <Card v-if="creationMethod === 'template' && !selectedTemplate">
      <CardHeader>
        <CardTitle>Select Template</CardTitle>
        <p class="text-sm text-muted-foreground">
          Choose a template to pre-populate the work order
        </p>
      </CardHeader>
      <CardContent>
        <TemplateSelector
          v-model="selectedTemplateId"
          @template-select="handleTemplateSelect"
        />
        <div class="flex items-center justify-between mt-6">
          <Button variant="outline" @click="setCreationMethod(null)">
            <ChevronLeft class="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
          <Button 
            :disabled="!selectedTemplateId"
            @click="applyTemplate"
          >
            Use Selected Template
            <ChevronRight class="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Template Preview -->
    <Card v-if="selectedTemplate">
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
          <Button variant="outline" size="sm" @click="clearTemplate">
            <X class="h-4 w-4 mr-2" />
            Remove Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-4 gap-4 text-sm">
          <div class="text-center p-3 bg-muted/30 rounded-lg">
            <div class="font-medium text-blue-600">{{ selectedTemplate.sopSteps?.length || 0 }}</div>
            <div class="text-muted-foreground">SOP Steps</div>
          </div>
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
        </div>
      </CardContent>
    </Card>

    <!-- Work Order Form -->
    <div v-if="creationMethod !== null">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Details -->
        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
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

        <!-- Materials Section (Enhanced) -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0">
            <CardTitle class="flex items-center space-x-2">
              <Package class="h-5 w-5" />
              <span>Required Materials</span>
              <Badge v-if="selectedTemplate" variant="outline" class="text-xs ml-2">
                From Template
              </Badge>
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addMaterial"
            >
              <Plus class="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </CardHeader>
          <CardContent>
            <Alert v-if="form.materials.length === 0">
              <Package class="h-4 w-4" />
              <AlertTitle>No materials added</AlertTitle>
              <AlertDescription>
                {{ selectedTemplate ? 'Template materials will be added automatically.' : 'Click "Add Material" to include required materials for this work order.' }}
              </AlertDescription>
            </Alert>

            <div v-else class="space-y-4">
              <div
                v-for="(material, index) in form.materials"
                :key="index"
                class="flex items-center space-x-4 p-4 border border-border rounded-lg"
                :class="{ 'bg-blue-50 border-blue-200': material.fromTemplate }"
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
                  
                  <div class="flex items-end">
                    <Badge v-if="material.fromTemplate" variant="outline" class="text-xs">
                      Template
                    </Badge>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removeMaterial(index)"
                  :disabled="material.fromTemplate && selectedTemplate"
                >
                  <Trash2 class="w-4 h-4 text-red-500" />
                </Button>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { useInventoryStore } from '@/stores/inventory';
import { useTemplateStore } from '@/stores/template';
import { useCategoryStore } from '@/stores/category';

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
import TemplateSelector from '@/components/template/TemplateSelector.vue';
import CategorySelector from '@/components/category/CategorySelector.vue';

// Icons
import { 
  Plus, Package, Trash2, FileText, X, ChevronLeft, ChevronRight,
  ShieldCheck, AlertTriangle, CheckCircle, Circle, Loader2
} from 'lucide-vue-next';

// Types
import type { CreateWorkOrderForm } from '@/types';
import type { WorkOrderTemplate, WorkOrderCategory } from '@/types/templates';

const router = useRouter();
const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();
const inventoryStore = useInventoryStore();
const templateStore = useTemplateStore();
const categoryStore = useCategoryStore();

// State
const isSubmitting = ref(false);
const creationMethod = ref<'template' | 'custom' | null>(null);
const selectedTemplateId = ref<string>('');
const selectedTemplate = ref<WorkOrderTemplate | null>(null);
const selectedCategoryId = ref<string>('');

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
};

const applyTemplate = () => {
  if (!selectedTemplate.value) return;
  
  const template = selectedTemplate.value;
  
  // Pre-populate form fields from template
  form.value = {
    ...form.value,
    title: template.name,
    description: template.description,
    type: template.type,
    subType: template.subType,
    priority: template.defaultPriority,
    estimatedDuration: template.estimatedDuration,
    categoryId: template.categoryId
  };
  
  selectedCategoryId.value = template.categoryId;
  
  // Add template materials
  if (template.materials && template.materials.length > 0) {
    form.value.materials = template.materials.map(material => ({
      itemId: material.itemId,
      plannedQuantity: material.plannedQuantity,
      fromTemplate: true
    }));
  }
};

const clearTemplate = () => {
  selectedTemplate.value = null;
  selectedTemplateId.value = '';
  
  // Reset form to default values but keep manually entered data
  form.value.materials = form.value.materials.filter(m => !m.fromTemplate);
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
      // Use template store method to create from template
      workOrder = await templateStore.createWorkOrderFromTemplate(
        selectedTemplate.value.id,
        workOrderData
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
});
</script>

<style scoped>
.grid {
  display: grid;
}
</style>