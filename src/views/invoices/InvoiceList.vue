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
        <Button
          v-if="hasPermission('generate_invoices')"
          @click="showGenerateModal = true"
        >
          <Plus class="w-4 h-4 mr-2" />
          Generate Invoice
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Recipient Type</Label>
            <Select v-model="filters.recipientType">
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terminal">Terminal</SelectItem>
                <SelectItem value="region">Region</SelectItem>
                <SelectItem value="external_client">External Client</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Date Range</Label>
            <Select v-model="filters.dateRange">
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Search</Label>
            <div class="relative">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="filters.search"
                type="text"
                placeholder="Invoice number or recipient..."
                class="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText class="w-5 h-5 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Total Invoices</p>
              <p class="text-2xl font-semibold">{{ totalInvoices }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle class="w-5 h-5 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Paid</p>
              <p class="text-2xl font-semibold">{{ paidInvoices }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock class="w-5 h-5 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Pending</p>
              <p class="text-2xl font-semibold">{{ pendingInvoices }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle class="w-5 h-5 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Overdue</p>
              <p class="text-2xl font-semibold">{{ overdueInvoices }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Invoice Table -->
    <Card>
      <CardContent class="p-0">
        <div v-if="filteredInvoices.length === 0" class="text-center py-12">
          <FileText class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-lg font-medium mb-2">No invoices found</h3>
          <p class="text-muted-foreground">Try adjusting your filters or generate a new invoice.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
              >
                <TableCell>
                  <div>
                    <div class="text-sm font-medium">
                      {{ invoice.invoiceNumber }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ formatDate(invoice.generatedAt) }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="text-sm font-medium">
                      {{ invoice.recipientDetails.name }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ formatRecipientType(invoice.recipientType) }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm font-medium">
                    {{ formatCurrency(invoice.summary.total) }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{ invoice.workOrderIds.length }} work order{{ invoice.workOrderIds.length > 1 ? 's' : '' }}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(invoice.status)">
                    {{ formatStatus(invoice.status) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-sm">
                  {{ formatDate(invoice.dueDate) }}
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Button variant="link" size="sm" as-child>
                      <router-link :to="`/invoices/${invoice.id}`">
                        View
                      </router-link>
                    </Button>
                    <Button
                      v-if="hasPermission('manage_invoices')"
                      variant="ghost"
                      size="sm"
                      @click="downloadInvoice(invoice.id)"
                    >
                      Download
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

const getStatusVariant = (status: Invoice['status']): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variants: Record<Invoice['status'], 'default' | 'destructive' | 'outline' | 'secondary'> = {
    draft: 'secondary',
    pending: 'outline',
    sent: 'default',
    paid: 'default',
    overdue: 'destructive',
    cancelled: 'secondary'
  };
  return variants[status] || 'secondary';
};

const downloadInvoice = async (invoiceId: string) => {
  // Mock download functionality
  const invoice = invoiceStore.getInvoiceById(invoiceId);
  if (invoice) {
    console.log('Downloading invoice:', invoice.invoiceNumber);
    // In real implementation, would generate PDF and download
  }
};

const onInvoiceGenerated = (_invoice: Invoice) => {
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