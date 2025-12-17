import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { InventoryItem, StockMovement, MaterialRequirement } from '@/types';
import { useAuthStore } from './auth';

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([]);
  const movements = ref<StockMovement[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Computed getters
  const lowStockItems = computed(() => 
    items.value.filter(item => item.currentStock <= item.minThreshold && item.status === 'active')
  );

  const activeItems = computed(() => 
    items.value.filter(item => item.status === 'active')
  );

  const itemsByCategory = computed(() => {
    const categories: Record<string, InventoryItem[]> = {};
    items.value.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  });

  const totalValue = computed(() => 
    items.value.reduce((total, item) => total + (item.currentStock * item.unitPrice), 0)
  );

  // Actions
  const fetchInventoryItems = async () => {
    if (!authStore.hasPermission('manage_inventory') && !authStore.hasPermission('access_personal_data')) {
      throw new Error('Insufficient permissions');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data will be loaded from mock service
      const mockItems = await import('@/mock/inventory').then(m => m.mockInventoryItems);
      items.value = mockItems;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch inventory items';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchStockMovements = async () => {
    if (!authStore.hasPermission('manage_inventory')) {
      throw new Error('Insufficient permissions');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data will be loaded from mock service
      const mockMovements = await import('@/mock/inventory').then(m => m.mockStockMovements);
      movements.value = mockMovements;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch stock movements';
    } finally {
      isLoading.value = false;
    }
  };

  const createInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    if (!authStore.hasPermission('manage_inventory')) {
      throw new Error('Insufficient permissions');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newItem: InventoryItem = {
        ...itemData,
        id: `item_${Date.now()}`,
        lastUpdated: new Date().toISOString()
      };

      items.value.push(newItem);
      return newItem;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create inventory item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateStock = async (itemId: string, quantity: number, type: 'inbound' | 'outbound' | 'adjustment', reference?: string, notes?: string) => {
    if (!authStore.hasPermission('manage_inventory')) {
      throw new Error('Insufficient permissions');
    }

    const item = items.value.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update stock based on movement type
      if (type === 'inbound' || type === 'adjustment') {
        item.currentStock += quantity;
      } else if (type === 'outbound') {
        if (item.currentStock < quantity) {
          throw new Error('Insufficient stock');
        }
        item.currentStock -= quantity;
      }

      item.lastUpdated = new Date().toISOString();

      // Create stock movement record
      const movement: StockMovement = {
        id: `movement_${Date.now()}`,
        itemId,
        type,
        quantity,
        reference,
        notes,
        createdBy: authStore.currentUser?.id || '',
        createdAt: new Date().toISOString()
      };

      movements.value.push(movement);

      return { item, movement };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update stock';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const consumeMaterials = async (materials: MaterialRequirement[], workOrderId: string) => {
    if (!authStore.currentUser) {
      throw new Error('User not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const results: { item: InventoryItem; movement: StockMovement }[] = [];

      for (const material of materials) {
        if (material.actualQuantity && material.actualQuantity > 0) {
          const result = await updateStock(
            material.itemId,
            material.actualQuantity,
            'outbound',
            workOrderId,
            `Consumed for work order: ${workOrderId}`
          );
          results.push(result);
        }
      }

      return results;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to consume materials';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getItemById = (id: string) => {
    return items.value.find(item => item.id === id);
  };

  const getItemsByCategory = (category: string) => {
    return items.value.filter(item => item.category === category && item.status === 'active');
  };

  const searchItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return items.value.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.code.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getMovementsByItem = (itemId: string) => {
    return movements.value.filter(movement => movement.itemId === itemId);
  };

  const checkLowStock = () => {
    return lowStockItems.value.length > 0 ? lowStockItems.value : null;
  };

  return {
    items,
    movements,
    isLoading,
    error,
    lowStockItems,
    activeItems,
    itemsByCategory,
    totalValue,
    fetchInventoryItems,
    fetchStockMovements,
    createInventoryItem,
    updateStock,
    consumeMaterials,
    getItemById,
    getItemsByCategory,
    searchItems,
    getMovementsByItem,
    checkLowStock
  };
});