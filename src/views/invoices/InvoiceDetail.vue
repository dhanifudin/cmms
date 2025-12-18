<template>
  <div v-if="invoice" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          @click="$router.back()"
        >
          <ArrowLeft class="w-5 h-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold">{{ invoice.invoiceNumber }}</h1>
          <p class="text-sm text-muted-foreground">
            Generated {{ formatDate(invoice.generatedAt) }} • Due {{ formatDate(invoice.dueDate) }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Badge :variant="getStatusVariant(invoice.status)">
          {{ formatStatus(invoice.status) }}
        </Badge>
        <div class="flex gap-2">
          <Button
            v-if="hasPermission('manage_invoices')"
            variant="outline"
            @click="downloadPDF"
          >
            <Download class="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            v-if="invoice.status === 'pending' && hasPermission('manage_invoices')"
            @click="sendInvoice"
          >
            <Send class="w-4 h-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>
    </div>

    <!-- Invoice Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recipient Information -->
      <Card>
        <CardHeader>
          <CardTitle>Recipient Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <p class="text-sm text-muted-foreground">Name</p>
            <p class="font-medium">{{ invoice.recipientDetails.name }}</p>
          </div>
          <div v-if="invoice.recipientDetails.company">
            <p class="text-sm text-muted-foreground">Company</p>
            <p class="font-medium">{{ invoice.recipientDetails.company }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Email</p>
            <p class="font-medium">{{ invoice.recipientDetails.email }}</p>
          </div>
          <div v-if="invoice.recipientDetails.address">
            <p class="text-sm text-muted-foreground">Address</p>
            <p class="font-medium">{{ invoice.recipientDetails.address }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Type</p>
            <p class="font-medium">{{ formatRecipientType(invoice.recipientType) }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Invoice Summary -->
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Labor Cost</span>
            <span class="font-medium">{{ formatCurrency(invoice.summary.laborCost) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Material Cost</span>
            <span class="font-medium">{{ formatCurrency(invoice.summary.materialCost) }}</span>
          </div>
          <Separator />
          <div class="flex justify-between">
            <span class="text-muted-foreground">Subtotal</span>
            <span class="font-medium">{{ formatCurrency(invoice.summary.subtotal) }}</span>
          </div>
          <div v-if="invoice.summary.penalties > 0" class="flex justify-between text-red-600">
            <span>Penalties</span>
            <span class="font-medium">{{ formatCurrency(invoice.summary.penalties) }}</span>
          </div>
          <Separator />
          <div class="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{{ formatCurrency(invoice.summary.total) }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Payment Information -->
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <p class="text-sm text-muted-foreground">Status</p>
            <p class="font-medium" :class="getStatusTextColor(invoice.status)">
              {{ formatStatus(invoice.status) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Due Date</p>
            <p class="font-medium">{{ formatDate(invoice.dueDate) }}</p>
          </div>
          <div v-if="invoice.sentAt">
            <p class="text-sm text-muted-foreground">Sent Date</p>
            <p class="font-medium">{{ formatDate(invoice.sentAt) }}</p>
          </div>
          <div v-if="invoice.paidAt">
            <p class="text-sm text-muted-foreground">Paid Date</p>
            <p class="font-medium text-green-600">{{ formatDate(invoice.paidAt) }}</p>
          </div>
          <Card v-if="invoice.status === 'overdue'" class="mt-4 bg-red-50 border-red-200">
            <CardContent class="p-3">
              <div class="flex items-center">
                <AlertTriangle class="w-5 h-5 text-red-500 mr-2" />
                <p class="text-sm text-red-700 font-medium">Payment Overdue</p>
              </div>
              <p class="text-sm text-red-600 mt-1">
                Payment is {{ getDaysOverdue(invoice.dueDate) }} days past due
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>

    <!-- Work Orders -->
    <Card>
      <CardHeader>
        <CardTitle>Related Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="workOrderId in invoice.workOrderIds"
            :key="workOrderId"
            class="hover:border-primary transition-colors cursor-pointer"
          >
            <CardContent class="p-4">
              <router-link
                :to="`/work-orders/${workOrderId}`"
                class="block"
              >
                <div class="text-sm font-medium text-primary hover:underline">
                  Work Order #{{ workOrderId.slice(-6).toUpperCase() }}
                </div>
                <div class="text-sm text-muted-foreground mt-1">
                  View Details →
                </div>
              </router-link>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Invoice Items -->
    <Card>
      <CardHeader>
        <CardTitle>Invoice Items</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in invoice.items" :key="item.id">
                <TableCell>
                  <div class="text-sm font-medium">
                    {{ item.description }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{ item.category }}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getTypeVariant(item.type)">
                    {{ formatType(item.type) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  {{ item.quantity }} {{ item.unit }}
                </TableCell>
                <TableCell>
                  {{ formatCurrency(item.unitPrice) }}
                </TableCell>
                <TableCell class="font-medium">
                  {{ formatCurrency(item.totalPrice) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Notes -->
    <Card v-if="invoice.notes">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground">{{ invoice.notes }}</p>
      </CardContent>
    </Card>

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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

const getTypeVariant = (type: InvoiceItem['type']): 'default' | 'secondary' | 'destructive' => {
  const variants: Record<InvoiceItem['type'], 'default' | 'secondary' | 'destructive'> = {
    labor: 'default',
    material: 'secondary',
    penalty: 'destructive'
  };
  return variants[type];
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