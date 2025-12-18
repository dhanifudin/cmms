<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Add Inventory Item</h1>
      <p class="mt-1 text-sm text-gray-600">
        Add a new petroleum equipment or maintenance material to inventory
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2 space-y-2">
              <Label for="name">Item Name</Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                required
                placeholder="e.g. Gas Pipeline Gasket - High Pressure"
              />
            </div>

            <div class="space-y-2">
              <Label for="code">Item Code</Label>
              <Input
                id="code"
                v-model="form.code"
                type="text"
                required
                placeholder="e.g. GPG-HP-001"
              />
            </div>

            <div class="space-y-2">
              <Label for="category">Category</Label>
              <Select v-model="form.category" required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pipeline Components">Pipeline Components</SelectItem>
                  <SelectItem value="Pump & Compressor Parts">Pump & Compressor Parts</SelectItem>
                  <SelectItem value="Safety & Emergency Equipment">Safety & Emergency Equipment</SelectItem>
                  <SelectItem value="Filtration Systems">Filtration Systems</SelectItem>
                  <SelectItem value="Instrumentation">Instrumentation</SelectItem>
                  <SelectItem value="Electrical & Control">Electrical & Control</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                  <SelectItem value="Tools & Maintenance">Tools & Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="md:col-span-2 space-y-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="form.description"
                rows="3"
                placeholder="Detailed description of the item..."
              />
            </div>
          
          <div class="space-y-2">
            <Label for="unitOfMeasure">Unit of Measure</Label>
            <Select v-model="form.unitOfMeasure" required>
              <SelectTrigger id="unitOfMeasure">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pieces">Pieces</SelectItem>
                <SelectItem value="liters">Liters</SelectItem>
                <SelectItem value="kilograms">Kilograms</SelectItem>
                <SelectItem value="meters">Meters</SelectItem>
                <SelectItem value="kits">Kits</SelectItem>
                <SelectItem value="containers">Containers</SelectItem>
                <SelectItem value="bottles">Bottles</SelectItem>
                <SelectItem value="rolls">Rolls</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="currentStock">Current Stock</Label>
            <Input
              id="currentStock"
              v-model.number="form.currentStock"
              type="number"
              min="0"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="minThreshold">Minimum Threshold</Label>
            <Input
              id="minThreshold"
              v-model.number="form.minThreshold"
              type="number"
              min="0"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="unitPrice">Unit Price ($)</Label>
            <Input
              id="unitPrice"
              v-model.number="form.unitPrice"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="storageLocation">Storage Location</Label>
            <Input
              id="storageLocation"
              v-model="form.storageLocation"
              type="text"
              placeholder="e.g. Warehouse A - Shelf 1A"
            />
          </div>

          <div class="space-y-2">
            <Label for="supplier">Supplier</Label>
            <Input
              id="supplier"
              v-model="form.supplier"
              type="text"
              placeholder="e.g. Industrial Sealing Solutions"
            />
          </div>
          </div>
        </CardContent>
      </Card>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-4">
        <Button variant="outline" as-child>
          <router-link to="/inventory">
            Cancel
          </router-link>
        </Button>
        <Button
          type="submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Adding...' : 'Add Item' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '@/stores/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const router = useRouter();
const inventoryStore = useInventoryStore();

const isSubmitting = ref(false);

const form = ref({
  name: '',
  code: '',
  category: '',
  description: '',
  unitOfMeasure: '',
  currentStock: 0,
  minThreshold: 0,
  unitPrice: 0,
  storageLocation: '',
  supplier: '',
  status: 'active' as const
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
    const item = await inventoryStore.createInventoryItem(form.value);
    router.push(`/inventory/${item.id}`);
  } catch (error) {
    console.error('Failed to create inventory item:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>