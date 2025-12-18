<template>
  <div v-if="invoice" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="$router.back()"
          class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ invoice.invoiceNumber }}</h1>
          <p class="text-sm text-gray-600">
            Generated {{ formatDate(invoice.generatedAt) }} • Due {{ formatDate(invoice.dueDate) }}
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <span
          class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
          :class="getStatusColor(invoice.status)"
        >
          {{ formatStatus(invoice.status) }}
        </span>
        <div class="flex space-x-2">
          <button
            v-if="hasPermission('manage_invoices')"
            @click="downloadPDF"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download class="w-4 h-4 mr-2 inline" />
            Download PDF
          </button>
          <button
            v-if="invoice.status === 'pending' && hasPermission('manage_invoices')"
            @click="sendInvoice"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Send class="w-4 h-4 mr-2 inline" />
            Send Invoice
          </button>
        </div>
      </div>
    </div>

    <!-- Invoice Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recipient Information -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recipient Details</h3>
        <div class="space-y-3">
          <div>
            <p class="text-sm text-gray-500">Name</p>
            <p class="font-medium text-gray-900">{{ invoice.recipientDetails.name }}</p>
          </div>
          <div v-if="invoice.recipientDetails.company">
            <p class="text-sm text-gray-500">Company</p>
            <p class="font-medium text-gray-900">{{ invoice.recipientDetails.company }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Email</p>
            <p class="font-medium text-gray-900">{{ invoice.recipientDetails.email }}</p>
          </div>
          <div v-if="invoice.recipientDetails.address">
            <p class="text-sm text-gray-500">Address</p>
            <p class="font-medium text-gray-900">{{ invoice.recipientDetails.address }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Type</p>
            <p class="font-medium text-gray-900">{{ formatRecipientType(invoice.recipientType) }}</p>
          </div>
        </div>
      </div>

      <!-- Invoice Summary -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Labor Cost</span>
            <span class="font-medium">{{ formatCurrency(invoice.summary.laborCost) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Material Cost</span>
            <span class="font-medium">{{ formatCurrency(invoice.summary.materialCost) }}</span>
          </div>
          <div class="flex justify-between border-t pt-3">
            <span class="text-gray-600">Subtotal</span>
            <span class="font-medium">{{ formatCurrency(invoice.summary.subtotal) }}</span>
          </div>
          <div v-if="invoice.summary.penalties > 0" class="flex justify-between text-red-600">
            <span>Penalties</span>
            <span class="font-medium">{{ formatCurrency(invoice.summary.penalties) }}</span>
          </div>
          <div class="flex justify-between border-t pt-3 text-lg font-semibold">
            <span>Total</span>
            <span>{{ formatCurrency(invoice.summary.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        <div class="space-y-3">
          <div>
            <p class="text-sm text-gray-500">Status</p>
            <p class="font-medium" :class="getStatusTextColor(invoice.status)">
              {{ formatStatus(invoice.status) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Due Date</p>
            <p class="font-medium text-gray-900">{{ formatDate(invoice.dueDate) }}</p>
          </div>
          <div v-if="invoice.sentAt">
            <p class="text-sm text-gray-500">Sent Date</p>
            <p class="font-medium text-gray-900">{{ formatDate(invoice.sentAt) }}</p>
          </div>
          <div v-if="invoice.paidAt">
            <p class="text-sm text-gray-500">Paid Date</p>
            <p class="font-medium text-green-600">{{ formatDate(invoice.paidAt) }}</p>
          </div>
          <div v-if="invoice.status === 'overdue'" class="mt-4 p-3 bg-red-50 rounded-lg">
            <div class="flex items-center">
              <AlertTriangle class="w-5 h-5 text-red-500 mr-2" />
              <p class="text-sm text-red-700 font-medium">Payment Overdue</p>
            </div>
            <p class="text-sm text-red-600 mt-1">
              Payment is {{ getDaysOverdue(invoice.dueDate) }} days past due
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Orders -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Related Work Orders</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="workOrderId in invoice.workOrderIds"
            :key="workOrderId"
            class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <router-link
              :to="`/work-orders/${workOrderId}`"
              class="block"
            >
              <div class="text-sm font-medium text-blue-600 hover:text-blue-800">
                Work Order #{{ workOrderId.slice(-6).toUpperCase() }}
              </div>
              <div class="text-sm text-gray-500 mt-1">
                View Details →
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Items -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Invoice Items</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="item in invoice.items"
              :key="item.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ item.description }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ item.category }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getTypeColor(item.type)"
                >
                  {{ formatType(item.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.quantity }} {{ item.unit }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(item.unitPrice) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatCurrency(item.totalPrice) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="invoice.notes" class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
      <p class="text-gray-700">{{ invoice.notes }}</p>
    </div>

    <!-- Status Update Modal -->
    <StatusUpdateModal
      v-model:show="showStatusModal"
      :invoice="invoice"
      @updated="onStatusUpdated"
    />
  </div>

  <!-- Loading State -->
  <div v-else class="flex items-center justify-center min-h-96">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-500">Loading invoice...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useInvoiceStore } from '@/stores/invoice';
import {
  ArrowLeft,
  Download,
  Send,
  AlertTriangle
} from 'lucide-vue-next';
import type { Invoice, InvoiceItem } from '@/types';
import StatusUpdateModal from '@/components/invoices/StatusUpdateModal.vue';

const route = useRoute();
const authStore = useAuthStore();
const invoiceStore = useInvoiceStore();
const showStatusModal = ref(false);

const invoiceId = computed(() => route.params.id as string);
const invoice = computed(() => invoiceStore.getInvoiceById(invoiceId.value));

// Methods
const hasPermission = (permission: string) => authStore.hasPermission(permission);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

const formatType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatRecipientType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
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

const getStatusTextColor = (status: Invoice['status']) => {
  const colors = {
    draft: 'text-gray-700',
    pending: 'text-yellow-700',
    sent: 'text-blue-700',
    paid: 'text-green-700',
    overdue: 'text-red-700',
    cancelled: 'text-gray-700'
  };
  return colors[status] || 'text-gray-700';
};

const getTypeColor = (type: InvoiceItem['type']) => {
  const colors = {
    labor: 'bg-blue-100 text-blue-800',
    material: 'bg-green-100 text-green-800',
    penalty: 'bg-red-100 text-red-800'
  };
  return colors[type];
};

const getDaysOverdue = (dueDateString: string) => {
  const dueDate = new Date(dueDateString);
  const today = new Date();
  const diffTime = today.getTime() - dueDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const downloadPDF = () => {
  console.log('Downloading PDF for invoice:', invoice.value?.invoiceNumber);
  // Mock PDF download functionality
};

const sendInvoice = async () => {
  if (!invoice.value) return;
  
  try {
    await invoiceStore.updateInvoiceStatus(invoice.value.id, 'sent');
  } catch (error) {
    console.error('Failed to send invoice:', error);
  }
};

const onStatusUpdated = () => {
  showStatusModal.value = false;
  // Refresh data or show success message
};

onMounted(async () => {
  await invoiceStore.fetchInvoices();
});
</script>