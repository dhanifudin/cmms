<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Invoices</h1>
        <p class="text-sm text-gray-600">
          Manage maintenance billing and cost tracking
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          v-if="hasPermission('generate_invoices')"
          @click="showGenerateModal = true"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus class="w-4 h-4 mr-2" />
          Generate Invoice
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recipient Type</label>
          <select
            v-model="filters.recipientType"
            class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="terminal">Terminal</option>
            <option value="region">Region</option>
            <option value="external_client">External Client</option>
            <option value="contractor">Contractor</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            v-model="filters.dateRange"
            class="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Invoice number or recipient..."
              class="w-full pl-10 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText class="w-5 h-5 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Invoices</p>
            <p class="text-2xl font-semibold text-gray-900">{{ totalInvoices }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Paid</p>
            <p class="text-2xl font-semibold text-gray-900">{{ paidInvoices }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock class="w-5 h-5 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Pending</p>
            <p class="text-2xl font-semibold text-gray-900">{{ pendingInvoices }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Overdue</p>
            <p class="text-2xl font-semibold text-gray-900">{{ overdueInvoices }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipient
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="invoice in filteredInvoices"
              :key="invoice.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ invoice.invoiceNumber }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(invoice.generatedAt) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ invoice.recipientDetails.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatRecipientType(invoice.recipientType) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(invoice.summary.total) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ invoice.workOrderIds.length }} work order{{ invoice.workOrderIds.length > 1 ? 's' : '' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusColor(invoice.status)"
                >
                  {{ formatStatus(invoice.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(invoice.dueDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <router-link
                    :to="`/invoices/${invoice.id}`"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </router-link>
                  <button
                    v-if="hasPermission('manage_invoices')"
                    @click="downloadInvoice(invoice.id)"
                    class="text-gray-600 hover:text-gray-800"
                  >
                    Download
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredInvoices.length === 0" class="text-center py-12">
        <FileText class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
        <p class="text-gray-500">Try adjusting your filters or generate a new invoice.</p>
      </div>
    </div>

    <!-- Generate Invoice Modal -->
    <GenerateInvoiceModal
      v-model:show="showGenerateModal"
      @generated="onInvoiceGenerated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useInvoiceStore } from '@/stores/invoice';
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-vue-next';
import type { Invoice } from '@/types';
import GenerateInvoiceModal from '@/components/invoices/GenerateInvoiceModal.vue';

const authStore = useAuthStore();
const invoiceStore = useInvoiceStore();
const showGenerateModal = ref(false);

const filters = ref({
  status: '',
  recipientType: '',
  dateRange: '',
  search: ''
});

// Computed properties
const hasPermission = (permission: string) => authStore.hasPermission(permission);

const filteredInvoices = computed(() => {
  let filtered = invoiceStore.invoices;
  
  if (filters.value.status) {
    filtered = filtered.filter(inv => inv.status === filters.value.status);
  }
  
  if (filters.value.recipientType) {
    filtered = filtered.filter(inv => inv.recipientType === filters.value.recipientType);
  }
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    filtered = filtered.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(search) ||
      inv.recipientDetails.name.toLowerCase().includes(search) ||
      inv.recipientDetails.company?.toLowerCase().includes(search)
    );
  }
  
  return filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
});

const totalInvoices = computed(() => invoiceStore.invoices.length);
const paidInvoices = computed(() => invoiceStore.invoices.filter(inv => inv.status === 'paid').length);
const pendingInvoices = computed(() => invoiceStore.invoices.filter(inv => inv.status === 'pending').length);
const overdueInvoices = computed(() => invoiceStore.invoices.filter(inv => inv.status === 'overdue').length);

// Methods
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

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
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

const downloadInvoice = async (invoiceId: string) => {
  // Mock download functionality
  const invoice = invoiceStore.getInvoiceById(invoiceId);
  if (invoice) {
    console.log('Downloading invoice:', invoice.invoiceNumber);
    // In real implementation, would generate PDF and download
  }
};

const onInvoiceGenerated = (invoice: Invoice) => {
  showGenerateModal.value = false;
  // Optionally navigate to the new invoice
  // router.push(`/invoices/${invoice.id}`);
};

onMounted(async () => {
  await Promise.all([
    invoiceStore.fetchInvoices(),
    invoiceStore.fetchPricingRules()
  ]);
});
</script>