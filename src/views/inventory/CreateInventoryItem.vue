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
      <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-6">Item Details</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Gas Pipeline Gasket - High Pressure"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Item Code</label>
            <input
              v-model="form.code"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. GPG-HP-001"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              v-model="form.category"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              <option value="Pipeline Components">Pipeline Components</option>
              <option value="Pump & Compressor Parts">Pump & Compressor Parts</option>
              <option value="Safety & Emergency Equipment">Safety & Emergency Equipment</option>
              <option value="Filtration Systems">Filtration Systems</option>
              <option value="Instrumentation">Instrumentation</option>
              <option value="Electrical & Control">Electrical & Control</option>
              <option value="Consumables">Consumables</option>
              <option value="Tools & Maintenance">Tools & Maintenance</option>
            </select>
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed description of the item..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label>
            <select
              v-model="form.unitOfMeasure"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Unit</option>
              <option value="pieces">Pieces</option>
              <option value="liters">Liters</option>
              <option value="kilograms">Kilograms</option>
              <option value="meters">Meters</option>
              <option value="kits">Kits</option>
              <option value="containers">Containers</option>
              <option value="bottles">Bottles</option>
              <option value="rolls">Rolls</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
            <input
              v-model.number="form.currentStock"
              type="number"
              min="0"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Threshold</label>
            <input
              v-model.number="form.minThreshold"
              type="number"
              min="0"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Unit Price ($)</label>
            <input
              v-model.number="form.unitPrice"
              type="number"
              min="0"
              step="0.01"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Storage Location</label>
            <input
              v-model="form.storageLocation"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Warehouse A - Shelf 1A"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <input
              v-model="form.supplier"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Industrial Sealing Solutions"
            />
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-4">
        <router-link
          to="/inventory"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </router-link>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="isSubmitting">Adding...</span>
          <span v-else>Add Item</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '@/stores/inventory';

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