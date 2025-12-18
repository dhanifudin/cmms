<template>
  <Dialog :open="show" @update:open="(val) => emit('update:show', val)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Update Invoice Status</DialogTitle>
        <DialogDescription>
          Change the status of invoice {{ invoice.invoiceNumber }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label>Current Status</Label>
          <Badge :variant="getStatusVariant(invoice.status)">
            {{ formatStatus(invoice.status) }}
          </Badge>
        </div>

        <div class="space-y-2">
          <Label>New Status</Label>
          <Select v-model="newStatus">
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="status in availableStatuses"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Payment Date for paid status -->
        <div v-if="newStatus === 'paid'" class="space-y-4">
          <div class="space-y-2">
            <Label>Payment Date</Label>
            <Input
              v-model="paymentDate"
              type="date"
            />
          </div>

          <div class="space-y-2">
            <Label>Payment Amount</Label>
            <Input
              v-model="paymentAmount"
              type="number"
              :placeholder="formatCurrency(invoice.summary.total)"
            />
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            v-model="notes"
            rows="3"
            placeholder="Add any additional notes..."
          />
        </div>

        <!-- Confirmation -->
        <Card v-if="newStatus" class="bg-blue-50 border-blue-200">
          <CardContent class="p-4">
            <h4 class="text-sm font-medium text-blue-900 mb-2">Confirm Status Change</h4>
            <p class="text-sm text-blue-700">
              Invoice {{ invoice.invoiceNumber }} will be updated from
              <strong>{{ formatStatus(invoice.status) }}</strong> to
              <strong>{{ formatStatus(newStatus) }}</strong>
            </p>
            <p v-if="newStatus === 'paid'" class="text-sm text-blue-700 mt-1">
              Payment of {{ formatCurrency(typeof paymentAmount === 'string' ? parseFloat(paymentAmount) || invoice.summary.total : paymentAmount || invoice.summary.total) }}
              will be recorded on {{ formatDate(paymentDate) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">
          Cancel
        </Button>
        <Button
          @click="updateStatus"
          :disabled="!newStatus || isUpdating"
        >
          {{ isUpdating ? 'Updating...' : 'Update Status' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useInvoiceStore } from '@/stores/invoice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const newStatus = ref<Invoice['status'] | ''>('');
const paymentDate = ref(new Date().toISOString().split('T')[0]);
const paymentAmount = ref<string | number>('');
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
  const validTransitions: Record<Invoice['status'], (Invoice['status'])[]> = {
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
  paymentAmount.value = '';
  notes.value = '';
};

const formatStatus = (status: string) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
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

const updateStatus = async () => {
  if (!newStatus.value) return;

  isUpdating.value = true;
  
  try {
    await invoiceStore.updateInvoiceStatus(props.invoice.id, newStatus.value);
    
    // Additional handling for paid status
    if (newStatus.value === 'paid') {
      // In real implementation, would update payment details
      const amount = typeof paymentAmount.value === 'string'
        ? parseFloat(paymentAmount.value) || props.invoice.summary.total
        : paymentAmount.value || props.invoice.summary.total;
      console.log('Payment recorded:', {
        amount,
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