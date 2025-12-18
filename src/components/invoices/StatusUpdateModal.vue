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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-6" id="modal-title">
                Update Invoice Status
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                  </label>
                  <span
                    class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                    :class="getStatusColor(invoice.status)"
                  >
                    {{ formatStatus(invoice.status) }}
                  </span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    v-model="newStatus"
                    class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select new status</option>
                    <option
                      v-for="status in availableStatuses"
                      :key="status.value"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <!-- Payment Date for paid status -->
                <div v-if="newStatus === 'paid'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date
                    </label>
                    <input
                      v-model="paymentDate"
                      type="date"
                      class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount
                    </label>
                    <input
                      v-model.number="paymentAmount"
                      type="number"
                      :placeholder="formatCurrency(invoice.summary.total)"
                      class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    v-model="notes"
                    rows="3"
                    class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>

                <!-- Confirmation -->
                <div v-if="newStatus" class="bg-blue-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-blue-900 mb-2">Confirm Status Change</h4>
                  <p class="text-sm text-blue-700">
                    Invoice {{ invoice.invoiceNumber }} will be updated from 
                    <strong>{{ formatStatus(invoice.status) }}</strong> to 
                    <strong>{{ formatStatus(newStatus) }}</strong>
                  </p>
                  <p v-if="newStatus === 'paid'" class="text-sm text-blue-700 mt-1">
                    Payment of {{ formatCurrency(paymentAmount || invoice.summary.total) }} 
                    will be recorded on {{ formatDate(paymentDate) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="updateStatus"
            :disabled="!newStatus || isUpdating"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isUpdating ? 'Updating...' : 'Update Status' }}
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
import { ref, computed } from 'vue';
import { useInvoiceStore } from '@/stores/invoice';
import type { Invoice } from '@/types';

interface Props {
  show: boolean;
  invoice: Invoice;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'updated'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const invoiceStore = useInvoiceStore();

const newStatus = ref<Invoice['status']>('');
const paymentDate = ref(new Date().toISOString().split('T')[0]);
const paymentAmount = ref<number | null>(null);
const notes = ref('');
const isUpdating = ref(false);

// Computed properties
const availableStatuses = computed(() => {
  const current = props.invoice.status;
  
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ] as const;

  // Define valid transitions
  const validTransitions: Record<Invoice['status'], Invoice['status'][]> = {
    draft: ['pending', 'cancelled'],
    pending: ['sent', 'cancelled'],
    sent: ['paid', 'overdue', 'cancelled'],
    paid: [], // Cannot change from paid
    overdue: ['paid', 'cancelled'],
    cancelled: ['pending'] // Can reactivate
  };

  const validStatuses = validTransitions[current] || [];
  return statusOptions.filter(option => validStatuses.includes(option.value));
});

// Methods
const close = () => {
  emit('update:show', false);
  resetForm();
};

const resetForm = () => {
  newStatus.value = '';
  paymentDate.value = new Date().toISOString().split('T')[0];
  paymentAmount.value = null;
  notes.value = '';
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getStatusColor = (status: Invoice['status']) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const updateStatus = async () => {
  if (!newStatus.value) return;

  isUpdating.value = true;
  
  try {
    await invoiceStore.updateInvoiceStatus(props.invoice.id, newStatus.value);
    
    // Additional handling for paid status
    if (newStatus.value === 'paid') {
      // In real implementation, would update payment details
      console.log('Payment recorded:', {
        amount: paymentAmount.value || props.invoice.summary.total,
        date: paymentDate.value,
        notes: notes.value
      });
    }

    emit('updated');
    close();
  } catch (error) {
    console.error('Failed to update invoice status:', error);
  } finally {
    isUpdating.value = false;
  }
};
</script>