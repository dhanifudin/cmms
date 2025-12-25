<template>
  <div class="h-[90vh] max-h-[90vh] flex bg-gray-50 mx-auto my-4 rounded-lg shadow-lg overflow-hidden">
    <!-- Sidebar - Status Filters -->
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex-shrink-0">
        <h1 class="text-base font-semibold text-gray-900">Memo</h1>
        <p class="text-xs text-gray-500 mt-1">Create and track work order requests</p>
      </div>

      <!-- Create Button -->
      <div class="p-3 border-b border-gray-200">
        <button
          @click="showCreateForm"
          class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      <!-- Status Filters -->
      <div class="flex-1 overflow-y-auto min-h-0 p-2">
        <button
          v-for="status in statusFilters"
          :key="status.id"
          @click="selectStatusFilter(status.id)"
          class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors mb-1"
          :class="{
            'bg-blue-100 text-blue-700': selectedStatus === status.id && !isCreating,
            'text-gray-700': selectedStatus !== status.id || isCreating
          }"
        >
          <component
            :is="getStatusIcon(status.id)"
            class="h-4 w-4 mr-2 flex-shrink-0"
          />
          <span class="flex-1 text-left truncate">{{ status.name }}</span>
          <span
            v-if="status.count > 0"
            class="ml-1 px-2 py-0.5 text-xs rounded-full flex-shrink-0"
            :class="{
              'bg-blue-200 text-blue-700': selectedStatus === status.id && !isCreating,
              'bg-gray-100 text-gray-600': selectedStatus !== status.id || isCreating
            }"
          >
            {{ status.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex h-full min-h-0">
      <!-- Memo List -->
      <div class="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
        <div class="p-3 border-b border-gray-200 flex-shrink-0">
          <!-- Search -->
          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search requests..."
              class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <div v-if="isLoading" class="p-4 text-center text-gray-500">
            Loading requests...
          </div>

          <div v-else-if="filteredMemos.length === 0" class="p-6 text-center text-gray-500">
            <FileTextIcon class="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p class="font-medium">No requests found</p>
            <p class="text-sm mt-1">Click "New Request" to create one</p>
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="memo in filteredMemos"
              :key="memo.id"
              @click="selectMemo(memo)"
              class="p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors"
              :class="{
                'border-l-blue-500 bg-blue-50': selectedMemo?.id === memo.id && !isCreating,
                'border-l-transparent': selectedMemo?.id !== memo.id || isCreating
              }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ memo.memoData?.workOrderSpecs.title }}
                    </p>
                  </div>

                  <div class="mt-1 flex items-center space-x-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusColor(memo.memoData?.status || 'pending')"
                    >
                      {{ getStatusLabel(memo.memoData?.status || 'pending') }}
                    </span>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs"
                      :class="getUrgencyColor(memo.memoData?.urgencyLevel || 'routine')"
                    >
                      {{ memo.memoData?.urgencyLevel }}
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-2">
                    {{ formatTime(memo.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail / Create Form Panel -->
      <div class="flex-1 flex flex-col h-full">
        <!-- Create Form -->
        <div v-if="isCreating" class="flex-1 flex flex-col bg-white h-full min-h-0">
          <!-- Form Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-medium text-gray-900">Create Work Order Request</h2>
                <p class="text-sm text-gray-500 mt-1">Submit a request for work order creation to admin</p>
              </div>
              <button
                @click="cancelCreate"
                class="text-gray-400 hover:text-gray-600"
              >
                <XIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Form Content -->
          <div class="flex-1 px-6 py-4 overflow-y-auto min-h-0">
            <form @submit.prevent="handleSubmit" class="space-y-6">
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

                <!-- Assigned Worker (Mandatory) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Worker <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.workOrderSpecs.suggestedWorkerId"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="!formData.workOrderSpecs.terminalId"
                    :class="{ 'bg-gray-100': !formData.workOrderSpecs.terminalId }"
                  >
                    <option value="">Select a worker</option>
                    <option v-for="worker in availableWorkers" :key="worker.id" :value="worker.id">
                      {{ worker.name }} - {{ worker.expertise }}
                    </option>
                  </select>
                  <p v-if="!formData.workOrderSpecs.terminalId" class="mt-1 text-xs text-gray-500">
                    Select a terminal first to see available workers.
                  </p>
                  <p v-else-if="availableWorkers.length === 0" class="mt-1 text-xs text-orange-500">
                    No workers available at this terminal.
                  </p>
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

                <!-- Required Materials -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Required Materials <span class="text-gray-400 font-normal">(Optional)</span>
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
                    Special Instructions <span class="text-gray-400 font-normal">(Optional)</span>
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
              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="cancelCreate"
                  class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting || !isFormValid"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- No Selection State -->
        <div v-else-if="!selectedMemo" class="flex-1 flex items-center justify-center bg-gray-50 h-full">
          <div class="text-center">
            <FileTextIcon class="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No request selected</h3>
            <p class="text-gray-500">Choose a request from the list to view details</p>
          </div>
        </div>

        <!-- Memo Detail View -->
        <div v-else class="flex-1 flex flex-col bg-white h-full min-h-0">
          <!-- Memo Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-lg font-medium text-gray-900">
                  {{ selectedMemo.memoData?.workOrderSpecs.title }}
                </h2>

                <div class="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span><strong>Category:</strong> {{ selectedMemo.memoData?.workOrderSpecs.category }}</span>
                  <span><strong>Priority:</strong> {{ selectedMemo.memoData?.workOrderSpecs.priority }}</span>
                </div>

                <p class="text-sm text-gray-500 mt-1">
                  Submitted {{ formatDateTime(selectedMemo.createdAt) }}
                </p>
              </div>

              <div class="ml-4">
                <span
                  class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
                  :class="getStatusColor(selectedMemo.memoData?.status || 'pending')"
                >
                  <component :is="getStatusIcon(selectedMemo.memoData?.status || 'pending')" class="h-4 w-4 mr-1.5" />
                  {{ getStatusLabel(selectedMemo.memoData?.status || 'pending') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Memo Content -->
          <div class="flex-1 px-6 py-4 overflow-y-auto min-h-0">
            <div v-if="selectedMemo.memoData" class="space-y-6">
              <!-- Work Order Specifications -->
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-3">Work Order Specifications</h4>
                <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm font-medium text-gray-700">Terminal:</span>
                      <p class="text-sm text-gray-900">{{ getTerminalName(selectedMemo.memoData.workOrderSpecs.terminalId) }}</p>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-700">Estimated Duration:</span>
                      <p class="text-sm text-gray-900">{{ selectedMemo.memoData.workOrderSpecs.estimatedDuration }} hours</p>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-700">Urgency Level:</span>
                      <p class="text-sm text-gray-900 capitalize">{{ selectedMemo.memoData.urgencyLevel }}</p>
                    </div>
                  </div>

                  <div>
                    <span class="text-sm font-medium text-gray-700">Description:</span>
                    <p class="text-sm text-gray-900 mt-1">{{ selectedMemo.memoData.workOrderSpecs.description }}</p>
                  </div>

                  <div v-if="selectedMemo.memoData.workOrderSpecs.suggestedWorkerId">
                    <span class="text-sm font-medium text-gray-700">Assigned Worker:</span>
                    <p class="text-sm text-gray-900">{{ getWorkerName(selectedMemo.memoData.workOrderSpecs.suggestedWorkerId) }}</p>
                  </div>

                  <div v-if="selectedMemo.memoData.workOrderSpecs.requiredMaterials?.length">
                    <span class="text-sm font-medium text-gray-700">Required Materials:</span>
                    <ul class="text-sm text-gray-900 mt-1 list-disc list-inside">
                      <li v-for="material in selectedMemo.memoData.workOrderSpecs.requiredMaterials" :key="material">
                        {{ material }}
                      </li>
                    </ul>
                  </div>

                  <div v-if="selectedMemo.memoData.workOrderSpecs.specialInstructions">
                    <span class="text-sm font-medium text-gray-700">Special Instructions:</span>
                    <p class="text-sm text-gray-900 mt-1">{{ selectedMemo.memoData.workOrderSpecs.specialInstructions }}</p>
                  </div>
                </div>
              </div>

              <!-- Justification -->
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-3">Business Justification</h4>
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p class="text-sm text-gray-900">{{ selectedMemo.memoData.justification }}</p>
                </div>
              </div>

              <!-- Conversion Status -->
              <div v-if="selectedMemo.memoData.status === 'converted' && selectedMemo.memoData.convertedToWorkOrderId">
                <h4 class="text-md font-medium text-gray-900 mb-3">Work Order Created</h4>
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-900">
                      Your request has been converted to a work order.
                    </p>
                    <router-link
                      :to="`/work-orders/${selectedMemo.memoData.convertedToWorkOrderId}`"
                      class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <ExternalLinkIcon class="h-4 w-4 mr-1.5" />
                      View Work Order
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Pending Status Info -->
              <div v-if="selectedMemo.memoData.status === 'pending'">
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div class="flex items-start">
                    <ClockIcon class="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p class="text-sm text-blue-800">
                      Your request is pending review by the terminal admin. You will be notified once it has been processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import type { Message, MemoData, Priority } from '@/types';
import {
  Plus as PlusIcon,
  Search as SearchIcon,
  FileText as FileTextIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  Inbox as InboxIcon,
  ExternalLink as ExternalLinkIcon,
  X as XIcon
} from 'lucide-vue-next';

const messageStore = useMessageStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const templateStore = useTemplateStore();

const searchQuery = ref('');
const selectedStatus = ref('all');
const selectedMemo = ref<Message | null>(null);
const isCreating = ref(false);
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

const isLoading = computed(() => messageStore.isLoading);

// Form validation
const isFormValid = computed(() => {
  const specs = formData.value.workOrderSpecs;
  return (
    specs.title.trim() !== '' &&
    specs.category !== '' &&
    specs.priority !== undefined &&
    specs.terminalId !== '' &&
    specs.suggestedWorkerId !== undefined && specs.suggestedWorkerId !== '' &&
    specs.estimatedDuration > 0 &&
    specs.description.trim() !== '' &&
    formData.value.justification.trim() !== ''
  );
});

// Terminal data filtered by supervisor's terminal/region scope
const availableTerminals = computed(() => {
  if (!authStore.currentUser) return [];

  // If supervisor has a specific terminalId, only allow that terminal
  if (authStore.currentUser?.terminalId) {
    return mockTerminals
      .filter(terminal => terminal.id === authStore.currentUser?.terminalId && terminal.active)
      .map(terminal => ({
        id: terminal.id,
        name: `${terminal.name} (${terminal.code})`
      }));
  }

  // If supervisor has regionId only, filter terminals by that region
  if (authStore.currentUser?.regionId) {
    return mockTerminals
      .filter(terminal => terminal.regionId === authStore.currentUser?.regionId && terminal.active)
      .map(terminal => ({
        id: terminal.id,
        name: `${terminal.name} (${terminal.code})`
      }));
  }

  // Fallback: if no region/terminal specified, show all active terminals
  return mockTerminals
    .filter(terminal => terminal.active)
    .map(terminal => ({
      id: terminal.id,
      name: `${terminal.name} (${terminal.code})`
    }));
});

// Workers filtered by selected terminal
const availableWorkers = computed(() => {
  const selectedTerminalId = formData.value.workOrderSpecs.terminalId;
  if (!selectedTerminalId) return [];

  return userStore.users
    .filter(user => user.role === 'worker' && user.terminalId === selectedTerminalId && user.status === 'active')
    .map(worker => ({
      id: worker.id,
      name: worker.name,
      expertise: worker.department || 'General Maintenance'
    }));
});

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

// Watch for terminal change to reset worker
watch(() => formData.value.workOrderSpecs.terminalId, () => {
  formData.value.workOrderSpecs.suggestedWorkerId = undefined;
});

// Watch for template selection and auto-fill form
watch(selectedTemplateId, (templateId) => {
  if (!templateId) return;

  const template = templateStore.getTemplateById(templateId);
  if (template) {
    formData.value.workOrderSpecs.title = template.name;
    formData.value.workOrderSpecs.description = template.description || '';
    formData.value.workOrderSpecs.category = template.type === 'preventive' ? 'Preventive Maintenance' : 'Corrective Maintenance';
    formData.value.workOrderSpecs.priority = template.defaultPriority || 'medium';
    formData.value.workOrderSpecs.estimatedDuration = template.estimatedDuration || 1;
    formData.value.workOrderSpecs.specialInstructions = template.safetyRequirements?.join('\n') || '';

    if (template.materials && template.materials.length > 0) {
      formData.value.workOrderSpecs.requiredMaterials = template.materials.map(m => m.itemName || m.itemId);
    }

    formData.value.templateId = templateId;
  }
});

// Status filters - only pending and converted (no rejected)
const statusFilters = computed(() => {
  return [
    { id: 'all', name: 'All Requests', count: myMemos.value.length },
    { id: 'pending', name: 'Pending', count: myMemos.value.filter(m => m.memoData?.status === 'pending').length },
    { id: 'converted', name: 'Converted', count: myMemos.value.filter(m => m.memoData?.status === 'converted').length }
  ];
});

// Get supervisor's own memos
const myMemos = computed(() => {
  return messageStore.messages.filter(message => {
    if (message.type !== 'supervisor_memo' || !message.memoData) return false;
    return message.senderId === authStore.currentUser?.id;
  });
});

const filteredMemos = computed(() => {
  let memos = myMemos.value;

  // Filter by status
  if (selectedStatus.value !== 'all') {
    memos = memos.filter(memo => memo.memoData?.status === selectedStatus.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    memos = memos.filter(memo =>
      memo.memoData?.workOrderSpecs.title.toLowerCase().includes(query) ||
      memo.memoData?.workOrderSpecs.description.toLowerCase().includes(query) ||
      memo.memoData?.workOrderSpecs.category.toLowerCase().includes(query)
    );
  }

  return memos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// Get admin users to send memo to
const adminUsers = computed(() => {
  return userStore.users.filter(user => user.role === 'admin' &&
    user.terminalId === formData.value.workOrderSpecs.terminalId);
});

onMounted(async () => {
  await Promise.all([
    messageStore.initializeInbox(),
    templateStore.fetchTemplates(),
    userStore.fetchUsers()
  ]);

  // Set default terminal if user has one
  if (authStore.currentUser?.terminalId) {
    formData.value.workOrderSpecs.terminalId = authStore.currentUser.terminalId;
  } else if (authStore.isSupervisor && availableTerminals.value.length === 1) {
    formData.value.workOrderSpecs.terminalId = availableTerminals.value[0]?.id || '';
  }
});

const showCreateForm = () => {
  isCreating.value = true;
  selectedMemo.value = null;
  resetForm();
};

const cancelCreate = () => {
  isCreating.value = false;
  resetForm();
};

const selectStatusFilter = (statusId: string) => {
  selectedStatus.value = statusId;
  isCreating.value = false;
};

const selectMemo = (memo: Message) => {
  selectedMemo.value = memo;
  isCreating.value = false;
};

const resetForm = () => {
  selectedTemplateId.value = '';
  formData.value = {
    workOrderSpecs: {
      title: '',
      description: '',
      category: '',
      priority: 'medium' as Priority,
      terminalId: authStore.currentUser?.terminalId || (availableTerminals.value.length === 1 ? availableTerminals.value[0]?.id : '') || '',
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
  if (!authStore.currentUser || !isFormValid.value) return;

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

    isCreating.value = false;
    resetForm();
    await messageStore.initializeInbox();

  } catch (error) {
    console.error('Failed to create memo:', error);
    alert('Failed to create memo. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    converted: 'bg-green-100 text-green-700'
  };
  return colors[status] || colors.pending;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending Review',
    converted: 'Converted to WO'
  };
  return labels[status] || status;
};

const getUrgencyColor = (urgency: string) => {
  const colors: Record<string, string> = {
    routine: 'bg-gray-100 text-gray-600',
    urgent: 'bg-orange-100 text-orange-600',
    emergency: 'bg-red-100 text-red-600'
  };
  return colors[urgency] || colors.routine;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, typeof InboxIcon> = {
    all: InboxIcon,
    pending: ClockIcon,
    converted: CheckCircleIcon
  };
  return icons[status] || ClockIcon;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getTerminalName = (terminalId: string) => {
  const terminal = mockTerminals.find(t => t.id === terminalId);
  return terminal ? `${terminal.name} (${terminal.code})` : terminalId;
};

const getWorkerName = (workerId: string) => {
  const worker = userStore.users.find(u => u.id === workerId);
  return worker ? worker.name : workerId;
};
</script>
