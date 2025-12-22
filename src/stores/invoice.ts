import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { Invoice, InvoiceItem, WorkOrder, InventoryItem, User } from '@/types';
import type { PaginationState } from '@/types/pagination';
import type { InvoicePaginationSizes } from '@/types/pagination';
import { getPaginationConfig } from '@/config/pagination';
import { useAuthStore } from './auth';

export interface PricingRule {
  id: string;
  name: string;
  type: 'labor' | 'material' | 'penalty';
  category?: string;
  terminalId?: string;
  regionId?: string;
  userRole?: string;
  baseRate: number;
  value?: number; // Additional property for mock data compatibility
  unit: 'hour' | 'item' | 'day' | 'percentage' | 'multiplier';
  description: string;
  isActive: boolean;
  active?: boolean; // Additional property for mock data compatibility
  createdAt?: string; // Additional property for mock data compatibility
}

export interface PenaltyRule {
  id: string;
  name: string;
  type?: string; // Additional property for mock data compatibility
  workOrderType?: 'preventive' | 'corrective';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  calculationType?: 'fixed' | 'percentage';
  amount?: number;
  value?: number; // Additional property for mock data compatibility
  unit?: string; // Additional property for mock data compatibility
  baseType?: 'labor_cost' | 'total_cost' | 'fixed_amount';
  description: string;
  category?: string; // Additional property for mock data compatibility
  terminalId?: string;
  regionId?: string;
  isActive?: boolean;
  active?: boolean; // Additional property for mock data compatibility
  createdAt?: string; // Additional property for mock data compatibility
  maxPenalty?: number; // Additional property for mock data compatibility
  gracePeriod?: number; // Additional property for mock data compatibility
}

export interface InvoiceGeneration {
  type: 'single_work_order' | 'multiple_work_orders' | 'terminal_monthly' | 'region_monthly' | 'custom_range';
  workOrderIds?: string[];
  terminalId?: string;
  regionId?: string;
  startDate?: string;
  endDate?: string;
  recipientType: 'terminal' | 'region' | 'external_client' | 'contractor';
  recipientDetails: {
    name: string;
    email: string;
    address?: string;
    company?: string;
  };
}

export const useInvoiceStore = defineStore('invoice', () => {
  // State
  const invoices = ref<Invoice[]>([]);
  const pricingRules = ref<PricingRule[]>([]);
  const penaltyRules = ref<PenaltyRule[]>([]);
  const isLoading = ref(false);

  const authStore = useAuthStore();

  // Pagination state
  const paginationConfig = getPaginationConfig('invoices');
  const paginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Search and filter state
  const searchQuery = ref('');
  const statusFilter = ref<'all' | 'draft' | 'pending' | 'sent' | 'paid' | 'overdue'>('all');
  const terminalFilter = ref<string>('');
  const regionFilter = ref<string>('');
  const sortBy = ref<'invoiceNumber' | 'total' | 'generatedAt' | 'dueDate' | 'status'>('generatedAt');
  const sortOrder = ref<'asc' | 'desc'>('desc');

  // Terminal-based filtering helper
  const getFilteredInvoices = computed(() => {
    if (!authStore.currentUser) return [];

    // Workers: No access to invoices
    if (authStore.isWorker) {
      return [];
    }

    // Admins: Only see invoices from their terminal
    if (authStore.isAdmin && authStore.currentUser.terminalId) {
      return invoices.value.filter(invoice => 
        invoice.terminalId === authStore.currentUser?.terminalId
      );
    }

    // Supervisors: See invoices from all terminals in their region
    if (authStore.isSupervisor && authStore.currentUser?.regionId) {
      return invoices.value.filter(invoice => 
        invoice.regionId === authStore.currentUser?.regionId
      );
    }

    // Leaders: Regional access (TBD scope - for now same as supervisor)
    if (authStore.isLeader && authStore.currentUser?.regionId) {
      return invoices.value.filter(invoice => 
        invoice.regionId === authStore.currentUser?.regionId
      );
    }

    // Fallback: no access
    return [];
  });

  // Getters based on filtered data
  const getInvoiceById = computed(() => (id: string) => 
    getFilteredInvoices.value.find(invoice => invoice.id === id)
  );

  const getInvoicesByTerminal = computed(() => (terminalId: string) =>
    getFilteredInvoices.value.filter(invoice => invoice.terminalId === terminalId)
  );

  const getInvoicesByRegion = computed(() => (regionId: string) =>
    getFilteredInvoices.value.filter(invoice => invoice.regionId === regionId)
  );

  const pendingInvoices = computed(() =>
    getFilteredInvoices.value.filter(invoice => invoice.status === 'draft' || invoice.status === 'pending')
  );

  // Search and filter computed properties
  const filteredAndSearchedInvoices = computed(() => {
    let items = getFilteredInvoices.value;

    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim().toLowerCase();
      items = items.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.recipientDetails.name.toLowerCase().includes(query) ||
        invoice.recipientDetails.company?.toLowerCase().includes(query) ||
        (invoice.terminalId && invoice.terminalId.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter.value !== 'all') {
      items = items.filter(invoice => invoice.status === statusFilter.value);
    }

    // Apply terminal filter
    if (terminalFilter.value) {
      items = items.filter(invoice => invoice.terminalId === terminalFilter.value);
    }

    // Apply region filter
    if (regionFilter.value) {
      items = items.filter(invoice => invoice.regionId === regionFilter.value);
    }

    // Apply sorting
    items.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy.value) {
        case 'invoiceNumber':
          aValue = a.invoiceNumber.toLowerCase();
          bValue = b.invoiceNumber.toLowerCase();
          break;
        case 'total':
          aValue = a.summary.total;
          bValue = b.summary.total;
          break;
        case 'generatedAt':
          aValue = new Date(a.generatedAt).getTime();
          bValue = new Date(b.generatedAt).getTime();
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'status':
          // Custom status order: draft, pending, sent, paid, overdue
          const statusOrder = { draft: 0, pending: 1, sent: 2, paid: 3, overdue: 4 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 5;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 5;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });

    // Update pagination total
    paginationState.value.totalItems = items.length;
    paginationState.value.totalPages = Math.ceil(items.length / paginationState.value.pageSize);
    
    // Ensure current page is valid
    if (paginationState.value.currentPage > paginationState.value.totalPages && paginationState.value.totalPages > 0) {
      paginationState.value.currentPage = paginationState.value.totalPages;
    }

    return items;
  });

  // Paginated invoices
  const paginatedInvoices = computed(() => {
    const startIndex = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    const endIndex = startIndex + paginationState.value.pageSize;
    return filteredAndSearchedInvoices.value.slice(startIndex, endIndex);
  });

  // Available filter options
  const availableTerminals = computed(() => {
    const terminals = new Set<string>();
    getFilteredInvoices.value.forEach(invoice => {
      if (invoice.terminalId) terminals.add(invoice.terminalId);
    });
    return Array.from(terminals).sort();
  });

  const availableRegions = computed(() => {
    const regions = new Set<string>();
    getFilteredInvoices.value.forEach(invoice => {
      if (invoice.regionId) regions.add(invoice.regionId);
    });
    return Array.from(regions).sort();
  });

  const getActivePricingRules = computed(() => (type: 'labor' | 'material' | 'penalty') =>
    pricingRules.value.filter(rule => rule.type === type && rule.isActive)
  );

  const getActivePenaltyRules = computed(() =>
    penaltyRules.value.filter(rule => rule.isActive)
  );

  // Actions
  const fetchInvoices = async (): Promise<void> => {
    isLoading.value = true;
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { mockInvoices } = await import('@/mock/invoices');
      invoices.value = mockInvoices;
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPricingRules = async (): Promise<void> => {
    try {
      const { mockPricingRules, mockPenaltyRules } = await import('@/mock/invoices');
      pricingRules.value = mockPricingRules;
      penaltyRules.value = mockPenaltyRules;
    } catch (error) {
      console.error('Failed to fetch pricing rules:', error);
    }
  };

  const calculateLaborCost = (workOrder: WorkOrder, user: User): number => {
    const laborRules = getActivePricingRules.value('labor');
    
    // Find most specific rule based on user role, terminal, region
    let applicableRule = laborRules.find(rule => 
      rule.userRole === user.role && 
      rule.terminalId === user.terminalId
    );
    
    if (!applicableRule) {
      applicableRule = laborRules.find(rule => 
        rule.userRole === user.role && 
        rule.regionId === user.regionId
      );
    }
    
    if (!applicableRule) {
      applicableRule = laborRules.find(rule => rule.userRole === user.role);
    }
    
    if (!applicableRule) {
      applicableRule = laborRules.find(rule => !rule.userRole); // Default rule
    }

    if (!applicableRule) return 0;

    // Calculate based on estimated duration (convert to hours)
    const estimatedHours = workOrder.estimatedDuration || 4; // Default 4 hours
    return estimatedHours * applicableRule.baseRate;
  };

  const calculateMaterialCost = (workOrder: WorkOrder, inventory: InventoryItem[]): number => {
    if (!workOrder.materials) return 0;

    return workOrder.materials.reduce((total: number, material) => {
      const item = inventory.find(i => i.id === material.itemId);
      if (!item) return total;

      const materialRules = getActivePricingRules.value('material');
      let applicableRule = materialRules.find(rule => 
        rule.category === item.category
      );
      
      if (!applicableRule) {
        applicableRule = materialRules.find(rule => !rule.category); // Default rule
      }

      const basePrice = applicableRule ? applicableRule.baseRate : item.unitPrice;
      return total + (material.plannedQuantity * basePrice);
    }, 0);
  };

  const calculatePenalties = (workOrder: WorkOrder, laborCost: number, materialCost: number): number => {
    if (!workOrder.dueDate || workOrder.status !== 'completed') return 0;

    const dueDate = new Date(workOrder.dueDate);
    const completedDate = new Date(workOrder.completedAt || new Date());
    
    if (completedDate <= dueDate) return 0; // No penalty if completed on time

    const daysOverdue = Math.ceil((completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const applicableRules = getActivePenaltyRules.value.filter(rule =>
      (!rule.workOrderType || rule.workOrderType === workOrder.type) &&
      (!rule.priority || rule.priority === workOrder.priority)
    );

    if (applicableRules.length === 0) return 0;

    // Use the first applicable rule (in real system, might need priority logic)
    const rule = applicableRules[0];
    
    if (!rule) return 0;
    
    if (rule.calculationType === 'fixed') {
      return (rule.amount || 0) * daysOverdue;
    } else if (rule.baseType && rule.amount) {
      const baseAmount = rule.baseType === 'labor_cost' ? laborCost :
                       rule.baseType === 'total_cost' ? laborCost + materialCost :
                       rule.amount;
      return (baseAmount * rule.amount / 100) * daysOverdue;
    }
    return 0;
  };

  const generateInvoice = async (config: InvoiceGeneration, workOrders: WorkOrder[], inventory: InventoryItem[], users: User[]): Promise<Invoice> => {
    isLoading.value = true;
    
    try {
      const invoiceItems: InvoiceItem[] = [];
      let totalLaborCost = 0;
      let totalMaterialCost = 0;
      let totalPenalties = 0;

      for (const workOrder of workOrders) {
        const worker = users.find(u => u.id === workOrder.assignedWorkerId);
        if (!worker) continue;

        const laborCost = calculateLaborCost(workOrder, worker);
        const materialCost = calculateMaterialCost(workOrder, inventory);
        const penalties = calculatePenalties(workOrder, laborCost, materialCost);

        // Labor item
        if (laborCost > 0) {
          invoiceItems.push({
            id: `${workOrder.id}-labor`,
            workOrderId: workOrder.id,
            type: 'labor',
            description: `Labor - ${workOrder.title}`,
            quantity: workOrder.estimatedDuration || 4,
            unit: 'hours',
            unitPrice: laborCost / (workOrder.estimatedDuration || 4),
            totalPrice: laborCost,
            category: workOrder.type
          });
          totalLaborCost += laborCost;
        }

        // Material items
        if (workOrder.materials && materialCost > 0) {
          workOrder.materials.forEach(material => {
            const item = inventory.find(i => i.id === material.itemId);
            if (item) {
              const itemCost = material.plannedQuantity * item.unitPrice;
              invoiceItems.push({
                id: `${workOrder.id}-${material.itemId}`,
                workOrderId: workOrder.id,
                type: 'material',
                description: `Material - ${item.name}`,
                quantity: material.plannedQuantity,
                unit: item.unitOfMeasure,
                unitPrice: item.unitPrice,
                totalPrice: itemCost,
                category: item.category
              });
            }
          });
          totalMaterialCost += materialCost;
        }

        // Penalty item
        if (penalties > 0) {
          invoiceItems.push({
            id: `${workOrder.id}-penalty`,
            workOrderId: workOrder.id,
            type: 'penalty',
            description: `Penalty - ${workOrder.title} (Overdue)`,
            quantity: 1,
            unit: 'item',
            unitPrice: penalties,
            totalPrice: penalties,
            category: 'penalty'
          });
          totalPenalties += penalties;
        }
      }

      const invoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.value.length + 1).padStart(4, '0')}`,
        workOrderIds: workOrders.map(wo => wo.id),
        terminalId: config.terminalId || workOrders[0]?.terminalId,
        regionId: config.regionId,
        recipientType: config.recipientType,
        recipientDetails: config.recipientDetails,
        items: invoiceItems,
        summary: {
          laborCost: totalLaborCost,
          materialCost: totalMaterialCost,
          penalties: totalPenalties,
          penaltyCost: totalPenalties, // Added for type compatibility
          subtotal: totalLaborCost + totalMaterialCost,
          tax: 0, // Added for type compatibility - no tax in current implementation
          total: totalLaborCost + totalMaterialCost + totalPenalties
        },
        status: 'pending',
        generatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        generatedBy: 'current-user-id' // Should get from auth store
      };

      invoices.value.push(invoice);
      return invoice;
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']): Promise<void> => {
    const invoice = invoices.value.find(inv => inv.id === invoiceId);
    if (invoice) {
      invoice.status = status;
      if (status === 'sent') {
        invoice.sentAt = new Date().toISOString();
      } else if (status === 'paid') {
        invoice.paidAt = new Date().toISOString();
      }
    }
  };

  const createPricingRule = async (rule: Omit<PricingRule, 'id'>): Promise<PricingRule> => {
    const newRule: PricingRule = {
      ...rule,
      id: `pr-${Date.now()}`
    };
    pricingRules.value.push(newRule);
    return newRule;
  };

  const updatePricingRule = async (ruleId: string, updates: Partial<PricingRule>): Promise<void> => {
    const ruleIndex = pricingRules.value.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      pricingRules.value[ruleIndex] = { ...pricingRules.value[ruleIndex], ...updates } as PricingRule;
    }
  };

  const createPenaltyRule = async (rule: Omit<PenaltyRule, 'id'>): Promise<PenaltyRule> => {
    const newRule: PenaltyRule = {
      ...rule,
      id: `pen-${Date.now()}`
    };
    penaltyRules.value.push(newRule);
    return newRule;
  };

  const updatePenaltyRule = async (ruleId: string, updates: Partial<PenaltyRule>): Promise<void> => {
    const ruleIndex = penaltyRules.value.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      penaltyRules.value[ruleIndex] = { ...penaltyRules.value[ruleIndex], ...updates } as PenaltyRule;
    }
  };

  // Pagination methods
  const setPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, paginationState.value.totalPages));
    paginationState.value.currentPage = newPage;
  };

  const setPageSize = (pageSize: InvoicePaginationSizes) => {
    // Calculate current first item index
    const currentFirstItem = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    
    // Update page size
    paginationState.value.pageSize = pageSize;
    
    // Calculate new page to keep roughly the same position
    const newPage = Math.floor(currentFirstItem / pageSize) + 1;
    setPage(newPage);
  };

  const nextPage = () => {
    if (paginationState.value.currentPage < paginationState.value.totalPages) {
      setPage(paginationState.value.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (paginationState.value.currentPage > 1) {
      setPage(paginationState.value.currentPage - 1);
    }
  };

  const firstPage = () => {
    setPage(1);
  };

  const lastPage = () => {
    setPage(paginationState.value.totalPages);
  };

  const resetPagination = () => {
    paginationState.value.currentPage = 1;
  };

  // Search and filter methods
  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    resetPagination(); // Reset to first page when search changes
  };

  const setStatusFilter = (status: 'all' | 'draft' | 'pending' | 'sent' | 'paid' | 'overdue') => {
    statusFilter.value = status;
    resetPagination();
  };

  const setTerminalFilter = (terminalId: string) => {
    terminalFilter.value = terminalId;
    resetPagination();
  };

  const setRegionFilter = (regionId: string) => {
    regionFilter.value = regionId;
    resetPagination();
  };

  const setSorting = (by: 'invoiceNumber' | 'total' | 'generatedAt' | 'dueDate' | 'status', order: 'asc' | 'desc') => {
    sortBy.value = by;
    sortOrder.value = order;
    resetPagination();
  };

  const clearFilters = () => {
    searchQuery.value = '';
    statusFilter.value = 'all';
    terminalFilter.value = '';
    regionFilter.value = '';
    sortBy.value = 'generatedAt';
    sortOrder.value = 'desc';
    resetPagination();
  };

  return {
    // Original state
    invoices,
    pricingRules,
    penaltyRules,
    isLoading,
    
    // Original getters
    getInvoiceById,
    getInvoicesByTerminal,
    getInvoicesByRegion,
    pendingInvoices,
    getActivePricingRules,
    getActivePenaltyRules,
    
    // New pagination and filtering properties
    paginationState: readonly(paginationState),
    paginatedInvoices,
    filteredAndSearchedInvoices,
    availableTerminals,
    availableRegions,
    searchQuery: readonly(searchQuery),
    statusFilter: readonly(statusFilter),
    terminalFilter: readonly(terminalFilter),
    regionFilter: readonly(regionFilter),
    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),
    
    // Original actions
    fetchInvoices,
    fetchPricingRules,
    generateInvoice,
    updateInvoiceStatus,
    calculateLaborCost,
    calculateMaterialCost,
    calculatePenalties,
    createPricingRule,
    updatePricingRule,
    createPenaltyRule,
    updatePenaltyRule,
    
    // New pagination actions
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    resetPagination,
    
    // New filter actions
    setSearchQuery,
    setStatusFilter,
    setTerminalFilter,
    setRegionFilter,
    setSorting,
    clearFilters
  };
});
