<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Create Work Order Request</h3>
        <p class="text-sm text-gray-500 mt-1">Submit a request for work order creation to admin</p>
      </div>
      
      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Template Selection (Optional) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-md font-medium text-gray-900">Template (Optional)</h4>
            <span class="text-xs text-gray-500">Select a template or create custom request</span>
          </div>

          <div>
            <select
              v-model="selectedTemplateId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- No Template (Custom Request) --</option>
              <optgroup v-if="preventiveTemplates.length > 0" label="Preventive Maintenance">
                <option v-for="template in preventiveTemplates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </option>
              </optgroup>
              <optgroup v-if="correctiveTemplates.length > 0" label="Corrective Maintenance">
                <option v-for="template in correctiveTemplates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </option>
              </optgroup>
            </select>
            <p v-if="selectedTemplateId" class="mt-1 text-xs text-blue-600">
              Form auto-filled from template. You can modify values below.
            </p>
          </div>
        </div>

        <!-- Work Order Specifications -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900">Work Order Details</h4>

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Work Order Title <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.workOrderSpecs.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief descriptive title for the work order"
            />
          </div>
          
          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.workOrderSpecs.category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="Preventive Maintenance">Preventive Maintenance</option>
              <option value="Corrective Maintenance">Corrective Maintenance</option>
              <option value="Emergency Repair">Emergency Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Calibration">Calibration</option>
              <option value="Cleaning">Cleaning</option>
            </select>
          </div>
          
          <!-- Priority and Urgency -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Priority <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.workOrderSpecs.priority"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.urgencyLevel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
          
          <!-- Terminal -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Terminal <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.workOrderSpecs.terminalId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select terminal</option>
              <option v-for="terminal in availableTerminals" :key="terminal.id" :value="terminal.id">
                {{ terminal.name }}
              </option>
            </select>
          </div>
          
          <!-- Estimated Duration -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (hours) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="formData.workOrderSpecs.estimatedDuration"
              type="number"
              min="0.5"
              step="0.5"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2.5"
            />
          </div>
          
          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.workOrderSpecs.description"
              required
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the work to be performed"
            ></textarea>
          </div>
          
          <!-- Suggested Worker -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Suggested Worker (Optional)
            </label>
            <select
              v-model="formData.workOrderSpecs.suggestedWorkerId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Let admin choose</option>
              <option v-for="worker in availableWorkers" :key="worker.id" :value="worker.id">
                {{ worker.name }} - {{ worker.expertise }}
              </option>
            </select>
          </div>
          
          <!-- Required Materials -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Required Materials (Optional)
            </label>
            <div class="space-y-2">
              <div v-for="(material, index) in formData.workOrderSpecs.requiredMaterials" :key="index" class="flex gap-2">
                <input
                  v-model="formData.workOrderSpecs.requiredMaterials![index]"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Material name"
                />
                <button
                  type="button"
                  @click="removeMaterial(index)"
                  class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              </div>
              <button
                type="button"
                @click="addMaterial"
                class="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-sm"
              >
                + Add Material
              </button>
            </div>
          </div>
          
          <!-- Special Instructions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              v-model="formData.workOrderSpecs.specialInstructions"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any special instructions or safety considerations"
            ></textarea>
          </div>
        </div>
        
        <!-- Justification -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-3">Request Justification</h4>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Why is this work order needed? <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.justification"
              required
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Business justification, safety concerns, or operational requirements"
            ></textarea>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useMessageStore } from '@/stores/message';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useTemplateStore } from '@/stores/template';
import { mockTerminals } from '@/mock/terminals';
import type { MemoData, Priority } from '@/types';

interface Props {
  show: boolean;
}

interface Emits {
  close: [];
  success: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const messageStore = useMessageStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const templateStore = useTemplateStore();

const isSubmitting = ref(false);
const selectedTemplateId = ref<string>('');

// Form data
const formData = ref<MemoData>({
  workOrderSpecs: {
    title: '',
    description: '',
    category: '',
    priority: 'medium' as Priority,
    terminalId: '',
    estimatedDuration: 1,
    suggestedWorkerId: undefined,
    requiredMaterials: [],
    specialInstructions: ''
  },
  urgencyLevel: 'routine',
  justification: '',
  requestedBy: '',
  status: 'pending'
});

// Terminal data filtered by supervisor's region scope
const availableTerminals = computed(() => {
  if (!authStore.currentUser) return [];
  
  // If user has a specific regionId, filter terminals by that region
  if (authStore.currentUser?.regionId) {
    return mockTerminals
      .filter(terminal => terminal.regionId === authStore.currentUser?.regionId && terminal.active)
      .map(terminal => ({
        id: terminal.id,
        name: `${terminal.name} (${terminal.code})`
      }));
  }
  
  // Fallback: if no region specified, show all active terminals (shouldn't happen for supervisors)
  return mockTerminals
    .filter(terminal => terminal.active)
    .map(terminal => ({
      id: terminal.id,
      name: `${terminal.name} (${terminal.code})`
    }));
});

const availableWorkers = ref([
  { id: 'worker_001', name: 'Ahmad Rahman', expertise: 'Electrical Systems' },
  { id: 'worker_002', name: 'Budi Santoso', expertise: 'Mechanical Maintenance' },
  { id: 'worker_003', name: 'Sari Dewi', expertise: 'HVAC Systems' },
  { id: 'worker_004', name: 'Eko Prabowo', expertise: 'Plumbing & Piping' },
]);

// Available templates for selection grouped by type
const availableTemplates = computed(() => {
  return templateStore.templates.filter(t => t.status === 'active');
});

const preventiveTemplates = computed(() => {
  return availableTemplates.value.filter(t => t.type === 'preventive');
});

const correctiveTemplates = computed(() => {
  return availableTemplates.value.filter(t => t.type === 'corrective');
});

// Watch for template selection and auto-fill form
watch(selectedTemplateId, (templateId) => {
  if (!templateId) return;

  const template = templateStore.getTemplateById(templateId);
  if (template) {
    // Auto-fill form with template data
    formData.value.workOrderSpecs.title = template.name;
    formData.value.workOrderSpecs.description = template.description || '';
    formData.value.workOrderSpecs.category = template.type === 'preventive' ? 'Preventive Maintenance' : 'Corrective Maintenance';
    formData.value.workOrderSpecs.priority = template.defaultPriority || 'medium';
    formData.value.workOrderSpecs.estimatedDuration = template.estimatedDuration || 1;
    formData.value.workOrderSpecs.specialInstructions = template.safetyRequirements?.join('\n') || '';

    // Auto-fill materials from template if available
    if (template.materials && template.materials.length > 0) {
      formData.value.workOrderSpecs.requiredMaterials = template.materials.map(m => m.itemName || m.itemId);
    }

    // Store template ID in form
    formData.value.templateId = templateId;
  }
});

// Get admin users to send memo to
const adminUsers = computed(() => {
  return userStore.users.filter(user => user.role === 'admin' && 
    user.terminalId === formData.value.workOrderSpecs.terminalId);
});

const addMaterial = () => {
  if (!formData.value.workOrderSpecs.requiredMaterials) {
    formData.value.workOrderSpecs.requiredMaterials = [];
  }
  formData.value.workOrderSpecs.requiredMaterials.push('');
};

const removeMaterial = (index: number) => {
  formData.value.workOrderSpecs.requiredMaterials?.splice(index, 1);
};

const handleSubmit = async () => {
  if (!authStore.currentUser) return;
  
  isSubmitting.value = true;
  
  try {
    formData.value.requestedBy = authStore.currentUser.id;
    
    // Get admin IDs for the selected terminal, or fallback to all admins
    const adminIds = adminUsers.value.length > 0 
      ? adminUsers.value.map(admin => admin.id)
      : userStore.users.filter(user => user.role === 'admin').map(admin => admin.id);
    
    if (adminIds.length === 0) {
      throw new Error('No admins found to send memo to');
    }
    
    await messageStore.createSupervisorMemo(formData.value, adminIds);
    
    emit('success');
    emit('close');
    
    // Reset form
    resetForm();
    
  } catch (error) {
    console.error('Failed to create memo:', error);
    alert('Failed to create memo. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  selectedTemplateId.value = '';
  formData.value = {
    workOrderSpecs: {
      title: '',
      description: '',
      category: '',
      priority: 'medium' as Priority,
      terminalId: '',
      estimatedDuration: 1,
      suggestedWorkerId: undefined,
      requiredMaterials: [],
      specialInstructions: ''
    },
    urgencyLevel: 'routine',
    justification: '',
    requestedBy: '',
    status: 'pending',
    templateId: undefined
  };
};

onMounted(async () => {
  // Load templates
  await templateStore.fetchTemplates();

  // Set default terminal if user has one (for admins)
  if (authStore.currentUser?.terminalId) {
    formData.value.workOrderSpecs.terminalId = authStore.currentUser.terminalId;
  }
  // For supervisors, auto-select the first available terminal in their region if only one option
  else if (authStore.isSupervisor && availableTerminals.value.length === 1) {
    formData.value.workOrderSpecs.terminalId = availableTerminals.value[0]?.id || '';
  }
});
</script>