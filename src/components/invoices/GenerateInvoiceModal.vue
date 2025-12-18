<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-6" id="modal-title">
                Generate Invoice
              </h3>

              <!-- Generation Type -->
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Type
                  </label>
                  <select
                    v-model="form.type"
                    @change="onTypeChange"
                    class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="single_work_order">Single Work Order</option>
                    <option value="multiple_work_orders">Multiple Work Orders</option>
                    <option value="terminal_monthly">Terminal Monthly Report</option>
                    <option value="region_monthly">Region Monthly Report</option>
                    <option value="custom_range">Custom Date Range</option>
                  </select>
                </div>

                <!-- Work Order Selection -->
                <div v-if="showWorkOrderSelection">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Select Work Orders
                  </label>
                  <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                    <div
                      v-for="workOrder in availableWorkOrders"
                      :key="workOrder.id"
                      class="flex items-center p-3 hover:bg-gray-50"
                    >
                      <input
                        :id="workOrder.id"
                        v-model="form.workOrderIds"
                        :value="workOrder.id"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      >
                      <label :for="workOrder.id" class="ml-3 flex-1 cursor-pointer">
                        <div class="text-sm font-medium text-gray-900">{{ workOrder.title }}</div>
                        <div class="text-sm text-gray-500">
                          {{ formatWorkOrderType(workOrder.type) }} • 
                          Terminal {{ workOrder.terminalId?.slice(-1) }} •
                          {{ formatStatus(workOrder.status) }}
                        </div>
                      </label>
                    </div>
                  </div>
                  <p v-if="availableWorkOrders.length === 0" class="text-sm text-gray-500 mt-2">
                    No completed work orders available for invoicing.
                  </p>
                </div>

                <!-- Terminal Selection -->
                <div v-if="showTerminalSelection">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Terminal
                  </label>
                  <select
                    v-model="form.terminalId"
                    class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Terminal</option>
                    <option
                      v-for="terminal in availableTerminals"
                      :key="terminal.id"
                      :value="terminal.id"
                    >
                      {{ terminal.name }}
                    </option>
                  </select>
                </div>

                <!-- Region Selection -->
                <div v-if="showRegionSelection">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    v-model="form.regionId"
                    class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Region</option>
                    <option
                      v-for="region in availableRegions"
                      :key="region.id"
                      :value="region.id"
                    >
                      {{ region.name }}
                    </option>
                  </select>
                </div>

                <!-- Date Range -->
                <div v-if="showDateRange" class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      v-model="form.startDate"
                      type="date"
                      class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      v-model="form.endDate"
                      type="date"
                      class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <!-- Recipient Information -->
                <div class="space-y-4">
                  <h4 class="text-md font-medium text-gray-900">Recipient Information</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Type
                    </label>
                    <select
                      v-model="form.recipientType"
                      class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="terminal">Terminal</option>
                      <option value="region">Region</option>
                      <option value="external_client">External Client</option>
                      <option value="contractor">Contractor</option>
                    </select>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        v-model="form.recipientDetails.name"
                        type="text"
                        required
                        class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Recipient name"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        v-model="form.recipientDetails.email"
                        type="email"
                        required
                        class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="recipient@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      v-model="form.recipientDetails.company"
                      type="text"
                      class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      v-model="form.recipientDetails.address"
                      rows="3"
                      class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Complete address"
                    ></textarea>
                  </div>
                </div>

                <!-- Preview Section -->
                <div v-if="previewData" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-md font-medium text-gray-900 mb-3">Invoice Preview</h4>
                  <div class="text-sm space-y-2">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Work Orders</span>
                      <span class="font-medium">{{ previewData.workOrderCount }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Labor Cost</span>
                      <span class="font-medium">{{ formatCurrency(previewData.laborCost) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Material Cost</span>
                      <span class="font-medium">{{ formatCurrency(previewData.materialCost) }}</span>
                    </div>
                    <div v-if="previewData.penalties > 0" class="flex justify-between text-red-600">
                      <span>Penalties</span>
                      <span class="font-medium">{{ formatCurrency(previewData.penalties) }}</span>
                    </div>
                    <div class="flex justify-between border-t pt-2 text-lg font-semibold">
                      <span>Estimated Total</span>
                      <span>{{ formatCurrency(previewData.total) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="generateInvoice"
            :disabled="!canGenerate || isGenerating"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isGenerating ? 'Generating...' : 'Generate Invoice' }}
          </button>
          <button
            @click="close"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useWorkOrderStore } from '@/stores/workorder';
import { useInvoiceStore } from '@/stores/invoice';
import { useInventoryStore } from '@/stores/inventory';
import type { Invoice, WorkOrder } from '@/types';
import type { InvoiceGeneration } from '@/stores/invoice';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'generated', invoice: Invoice): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const workOrderStore = useWorkOrderStore();
const invoiceStore = useInvoiceStore();
const inventoryStore = useInventoryStore();

const isGenerating = ref(false);

const form = ref<InvoiceGeneration & { workOrderIds: string[] }>({
  type: 'single_work_order',
  workOrderIds: [],
  recipientType: 'terminal',
  recipientDetails: {
    name: '',
    email: '',
    address: '',
    company: ''
  }
});

const previewData = ref<{
  workOrderCount: number;
  laborCost: number;
  materialCost: number;
  penalties: number;
  total: number;
} | null>(null);

// Mock data for terminals and regions
const availableTerminals = ref([
  { id: 'terminal1', name: 'Terminal Tanjung Priok' },
  { id: 'terminal2', name: 'Terminal Cilacap' },
  { id: 'terminal3', name: 'Terminal Dumai' }
]);

const availableRegions = ref([
  { id: 'region1', name: 'Jakarta & Jawa Barat' },
  { id: 'region2', name: 'Sumatra' },
  { id: 'region3', name: 'Kalimantan' }
]);

// Computed properties
const availableWorkOrders = computed(() => 
  workOrderStore.workOrders.filter(wo => wo.status === 'completed')
);

const showWorkOrderSelection = computed(() => 
  ['single_work_order', 'multiple_work_orders'].includes(form.value.type)
);

const showTerminalSelection = computed(() =>
  form.value.type === 'terminal_monthly'
);

const showRegionSelection = computed(() =>
  form.value.type === 'region_monthly'
);

const showDateRange = computed(() =>
  ['terminal_monthly', 'region_monthly', 'custom_range'].includes(form.value.type)
);

const canGenerate = computed(() => {
  if (!form.value.recipientDetails.name || !form.value.recipientDetails.email) {
    return false;
  }

  if (showWorkOrderSelection.value && form.value.workOrderIds.length === 0) {
    return false;
  }

  if (showTerminalSelection.value && !form.value.terminalId) {
    return false;
  }

  if (showRegionSelection.value && !form.value.regionId) {
    return false;
  }

  if (showDateRange.value && (!form.value.startDate || !form.value.endDate)) {
    return false;
  }

  return true;
});

// Methods
const close = () => {
  emit('update:show', false);
  resetForm();
};

const resetForm = () => {
  form.value = {
    type: 'single_work_order',
    workOrderIds: [],
    recipientType: 'terminal',
    recipientDetails: {
      name: '',
      email: '',
      address: '',
      company: ''
    }
  };
  previewData.value = null;
};

const onTypeChange = () => {
  form.value.workOrderIds = [];
  form.value.terminalId = '';
  form.value.regionId = '';
  form.value.startDate = '';
  form.value.endDate = '';
  previewData.value = null;
};

const formatWorkOrderType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const calculatePreview = () => {
  if (!canGenerate.value) {
    previewData.value = null;
    return;
  }

  let selectedWorkOrders: WorkOrder[] = [];

  if (showWorkOrderSelection.value) {
    selectedWorkOrders = workOrderStore.workOrders.filter(wo => 
      form.value.workOrderIds.includes(wo.id)
    );
  } else {
    // For other types, get work orders based on criteria
    selectedWorkOrders = workOrderStore.workOrders.filter(wo => {
      if (wo.status !== 'completed') return false;
      
      if (form.value.terminalId && wo.terminalId !== form.value.terminalId) return false;
      if (form.value.regionId && wo.regionId !== form.value.regionId) return false;
      
      if (form.value.startDate && form.value.endDate) {
        const completedAt = new Date(wo.completedAt || wo.updatedAt);
        const startDate = new Date(form.value.startDate);
        const endDate = new Date(form.value.endDate);
        if (completedAt < startDate || completedAt > endDate) return false;
      }
      
      return true;
    });
  }

  if (selectedWorkOrders.length === 0) {
    previewData.value = null;
    return;
  }

  // Mock calculation - in real implementation, would use invoice store methods
  const laborCost = selectedWorkOrders.length * 500000; // Mock calculation
  const materialCost = selectedWorkOrders.length * 300000; // Mock calculation
  const penalties = selectedWorkOrders.filter(wo => 
    new Date(wo.completedAt || '') > new Date(wo.dueDate)
  ).length * 100000; // Mock penalty

  previewData.value = {
    workOrderCount: selectedWorkOrders.length,
    laborCost,
    materialCost,
    penalties,
    total: laborCost + materialCost + penalties
  };
};

const generateInvoice = async () => {
  if (!canGenerate.value) return;

  isGenerating.value = true;
  
  try {
    let selectedWorkOrders: WorkOrder[] = [];
    
    if (showWorkOrderSelection.value) {
      selectedWorkOrders = workOrderStore.workOrders.filter(wo => 
        form.value.workOrderIds.includes(wo.id)
      );
    } else {
      // Get work orders based on criteria for other types
      selectedWorkOrders = workOrderStore.workOrders.filter(wo => {
        if (wo.status !== 'completed') return false;
        
        if (form.value.terminalId && wo.terminalId !== form.value.terminalId) return false;
        if (form.value.regionId && wo.regionId !== form.value.regionId) return false;
        
        if (form.value.startDate && form.value.endDate) {
          const completedAt = new Date(wo.completedAt || wo.updatedAt);
          const startDate = new Date(form.value.startDate);
          const endDate = new Date(form.value.endDate);
          if (completedAt < startDate || completedAt > endDate) return false;
        }
        
        return true;
      });
    }

    const config: InvoiceGeneration = {
      type: form.value.type,
      workOrderIds: selectedWorkOrders.map(wo => wo.id),
      terminalId: form.value.terminalId,
      regionId: form.value.regionId,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      recipientType: form.value.recipientType,
      recipientDetails: form.value.recipientDetails
    };

    // Mock users for invoice calculation
    const mockUsers = [
      { id: 'user1', name: 'Worker 1', email: 'worker1@example.com', role: 'worker' as const, status: 'active' as const }
    ];

    const invoice = await invoiceStore.generateInvoice(
      config, 
      selectedWorkOrders, 
      inventoryStore.items, 
      mockUsers
    );

    emit('generated', invoice);
    close();
  } catch (error) {
    console.error('Failed to generate invoice:', error);
  } finally {
    isGenerating.value = false;
  }
};

// Watchers
watch([
  () => form.value.workOrderIds,
  () => form.value.terminalId,
  () => form.value.regionId,
  () => form.value.startDate,
  () => form.value.endDate
], calculatePreview, { deep: true });

onMounted(async () => {
  await Promise.all([
    workOrderStore.fetchWorkOrders(),
    inventoryStore.fetchInventoryItems()
  ]);
});
</script>