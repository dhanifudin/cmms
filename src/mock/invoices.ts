import type { Invoice } from '@/types';
import type { PricingRule, PenaltyRule } from '@/stores/invoice';
import { getWorkOrdersByTerminal } from './workorders';
import { mockTerminals } from './terminals';

// Terminal-based invoice distribution
// Each terminal generates invoices based on their completed work orders
// Invoices are terminal-specific and contain only work orders from that terminal

// Helper function to get region from terminal number
function getRegionIdFromTerminal(terminalNum: number): string {
  if (terminalNum <= 15) return 'region1';
  if (terminalNum <= 30) return 'region2';
  if (terminalNum <= 45) return 'region3';
  if (terminalNum <= 60) return 'region4';
  if (terminalNum <= 75) return 'region5';
  if (terminalNum <= 90) return 'region6';
  if (terminalNum <= 105) return 'region7';
  return 'region8';
}

// Get terminal information
function getTerminalInfo(terminalId: string) {
  const terminal = mockTerminals.find(t => t.id === terminalId);
  return terminal || {
    id: terminalId,
    name: `Terminal ${terminalId.replace('terminal', '')}`,
    location: 'Unknown Location',
    type: 'depot' as const
  };
}

// Generate recipient details for terminal
function generateRecipientDetails(terminalNum: number, terminalInfo: any) {
  return {
    name: `${terminalInfo.name} - Operations Manager`,
    email: `manager@terminal${terminalNum}.pertamc.com`,
    address: terminalInfo.location || `Terminal ${terminalNum} Operations Center`,
    company: `PT Pertamina Terminal ${terminalNum}`
  };
}

// Calculate labor costs based on work order
function calculateLaborCost(workOrder: any): number {
  const baseHourlyRate = 75000; // Base rate per hour
  
  // Rate varies by priority and type
  let rateMultiplier = 1.0;
  
  if (workOrder.priority === 'critical') rateMultiplier = 2.0;
  else if (workOrder.priority === 'high') rateMultiplier = 1.5;
  else if (workOrder.priority === 'normal') rateMultiplier = 1.0;
  else if (workOrder.priority === 'low') rateMultiplier = 0.8;
  
  // Corrective maintenance has higher rates
  if (workOrder.type === 'corrective') rateMultiplier *= 1.3;
  
  const hourlyRate = Math.round(baseHourlyRate * rateMultiplier);
  return hourlyRate * workOrder.estimatedDuration;
}

// Calculate material costs from work order materials
function calculateMaterialCost(workOrder: any): { totalCost: number; materials: any[] } {
  const materialPrices: Record<string, number> = {
    'item001': 900000, // Pipeline gasket
    'item002': 4800000, // Gas detector sensor
    'item003': 540000, // Compressor oil
    'item004': 3200000, // Industrial valve
    'item005': 1200000, // Pressure gauge
    'item006': 125000, // Electrical cable
    'item007': 380000, // Oil filter
    'item008': 280000, // Safety helmet
    'item009': 950000, // Pump seal kit
    'item010': 7500000 // Calibration kit
  };
  
  let totalCost = 0;
  const materials: any[] = [];
  
  if (workOrder.materials && workOrder.materials.length > 0) {
    workOrder.materials.forEach((material: any) => {
      const unitPrice = materialPrices[material.itemId] || 100000; // Default price
      const itemCost = unitPrice * material.plannedQuantity;
      totalCost += itemCost;
      
      materials.push({
        itemId: material.itemId,
        description: `Material - Item ${material.itemId}`,
        quantity: material.plannedQuantity,
        unitPrice,
        totalPrice: itemCost
      });
    });
  }
  
  return { totalCost, materials };
}

// Calculate penalties for overdue work orders
function calculatePenalty(workOrder: any): number {
  if (workOrder.status !== 'completed') return 0;
  
  const dueDate = new Date(workOrder.dueDate);
  const completedDate = new Date(workOrder.updatedAt || workOrder.createdAt);
  
  if (completedDate <= dueDate) return 0; // No penalty if completed on time
  
  const daysOverdue = Math.ceil((completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Penalty calculation: 5% of total work order value per day overdue
  const laborCost = calculateLaborCost(workOrder);
  const { totalCost: materialCost } = calculateMaterialCost(workOrder);
  const totalWorkOrderValue = laborCost + materialCost;
  
  const penaltyRate = 0.05; // 5% per day
  return Math.round(totalWorkOrderValue * penaltyRate * daysOverdue);
}

// Generate invoice items from work order
function generateInvoiceItems(workOrder: any): any[] {
  const items: any[] = [];
  let itemId = 1;
  
  // Add labor item
  const laborCost = calculateLaborCost(workOrder);
  items.push({
    id: `labor_${workOrder.id}_${itemId++}`,
    workOrderId: workOrder.id,
    type: 'labor',
    description: `Labor - ${workOrder.title}`,
    quantity: workOrder.estimatedDuration,
    unit: 'hours',
    unitPrice: Math.round(laborCost / workOrder.estimatedDuration),
    totalPrice: laborCost,
    category: workOrder.type
  });
  
  // Add material items
  const { materials } = calculateMaterialCost(workOrder);
  materials.forEach(material => {
    items.push({
      id: `material_${workOrder.id}_${itemId++}`,
      workOrderId: workOrder.id,
      type: 'material',
      description: material.description,
      quantity: material.quantity,
      unit: 'pcs',
      unitPrice: material.unitPrice,
      totalPrice: material.totalPrice,
      category: 'materials'
    });
  });
  
  // Add penalty if applicable
  const penalty = calculatePenalty(workOrder);
  if (penalty > 0) {
    const dueDate = new Date(workOrder.dueDate);
    const completedDate = new Date(workOrder.updatedAt || workOrder.createdAt);
    const daysOverdue = Math.ceil((completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    items.push({
      id: `penalty_${workOrder.id}_${itemId++}`,
      workOrderId: workOrder.id,
      type: 'penalty',
      description: `Penalty - Late completion (${daysOverdue} days overdue)`,
      quantity: daysOverdue,
      unit: 'days',
      unitPrice: Math.round(penalty / daysOverdue),
      totalPrice: penalty,
      category: 'penalties'
    });
  }
  
  return items;
}

// Generate terminal-based invoices
function generateTerminalInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  let invoiceNumber = 1;
  
  // Generate invoices for terminals that have completed work orders
  for (let terminalNum = 1; terminalNum <= 116; terminalNum++) {
    const terminalId = `terminal${terminalNum}`;
    const regionId = getRegionIdFromTerminal(terminalNum);
    const terminalWorkOrders = getWorkOrdersByTerminal(terminalId);
    
    // Only generate invoices for terminals with completed work orders
    const completedWorkOrders = terminalWorkOrders.filter(wo => wo.status === 'completed');
    
    if (completedWorkOrders.length > 0) {
      // Group work orders by month for separate invoices
      const workOrdersByMonth: Record<string, any[]> = {};
      
      completedWorkOrders.forEach(wo => {
        const completedDate = new Date(wo.updatedAt || wo.createdAt);
        const monthKey = `${completedDate.getFullYear()}-${(completedDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!workOrdersByMonth[monthKey]) {
          workOrdersByMonth[monthKey] = [];
        }
        workOrdersByMonth[monthKey].push(wo);
      });
      
      // Generate invoice for each month
      Object.keys(workOrdersByMonth).forEach(monthKey => {
        const monthWorkOrders = workOrdersByMonth[monthKey];
        if (!monthWorkOrders) return;
        
        const terminalInfo = getTerminalInfo(terminalId);
        
        // Generate all invoice items
        const allItems: any[] = [];
        monthWorkOrders.forEach(wo => {
          allItems.push(...generateInvoiceItems(wo));
        });
        
        // Calculate totals
        const laborTotal = allItems.filter(item => item.type === 'labor').reduce((sum, item) => sum + item.totalPrice, 0);
        const materialTotal = allItems.filter(item => item.type === 'material').reduce((sum, item) => sum + item.totalPrice, 0);
        const penaltyTotal = allItems.filter(item => item.type === 'penalty').reduce((sum, item) => sum + item.totalPrice, 0);
        const total = laborTotal + materialTotal + penaltyTotal;
        
        // Generate invoice
        const invoice: Invoice = {
          id: `inv_t${terminalNum}_${monthKey}`,
          invoiceNumber: `INV-2024-${invoiceNumber.toString().padStart(4, '0')}`,
          workOrderIds: monthWorkOrders.map(wo => wo.id),
          terminalId,
          regionId,
          recipientType: 'terminal',
          recipientDetails: generateRecipientDetails(terminalNum, terminalInfo),
          items: allItems,
          summary: {
            laborCost: laborTotal,
            materialCost: materialTotal,
            penalties: penaltyTotal,
            penaltyCost: penaltyTotal,
            subtotal: total,
            tax: Math.round(total * 0.11), // 11% VAT
            total: Math.round(total * 1.11)
          },
          status: Math.random() > 0.3 ? 'sent' : 'draft', // 70% sent, 30% draft
          generatedBy: `admin${terminalNum}_1`,
          generatedAt: new Date().toISOString(),
          sentAt: Math.random() > 0.3 ? new Date().toISOString() : undefined,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          period: {
            startDate: `${monthKey}-01T00:00:00Z`,
            endDate: `${monthKey}-${new Date(parseInt(monthKey.split('-')[0] || '2024'), parseInt(monthKey.split('-')[1] || '1'), 0).getDate()}T23:59:59Z`
          },
          notes: `Monthly invoice for terminal maintenance services - ${monthKey}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        invoices.push(invoice);
        invoiceNumber++;
      });
    }
  }
  
  return invoices;
}

// Generate the terminal-based invoices
export const mockInvoices: Invoice[] = generateTerminalInvoices();

// Helper functions for terminal-based invoice operations
export const getInvoicesByTerminal = (terminalId: string): Invoice[] => {
  return mockInvoices.filter(invoice => invoice.terminalId === terminalId);
};

export const getInvoicesByRegion = (regionId: string): Invoice[] => {
  return mockInvoices.filter(invoice => invoice.regionId === regionId);
};

export const getInvoicesByStatus = (status: string): Invoice[] => {
  return mockInvoices.filter(invoice => invoice.status === status);
};

export const getInvoicesForPeriod = (startDate: string, endDate: string, terminalId?: string): Invoice[] => {
  let filteredInvoices = mockInvoices;
  
  if (terminalId) {
    filteredInvoices = filteredInvoices.filter(inv => inv.terminalId === terminalId);
  }
  
  return filteredInvoices.filter(invoice => {
    const invoiceDate = new Date(invoice.generatedAt);
    return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
  });
};

// Invoice statistics
export const getInvoiceStatistics = (terminalId?: string) => {
  let invoices = mockInvoices;
  if (terminalId) {
    invoices = invoices.filter(inv => inv.terminalId === terminalId);
  }
  
  const stats = {
    totalInvoices: invoices.length,
    totalValue: invoices.reduce((sum, inv) => sum + (inv.summary?.total || 0), 0),
    totalLaborCost: invoices.reduce((sum, inv) => sum + (inv.summary?.laborCost || 0), 0),
    totalMaterialCost: invoices.reduce((sum, inv) => sum + (inv.summary?.materialCost || 0), 0),
    totalPenalties: invoices.reduce((sum, inv) => sum + (inv.summary?.penaltyCost || 0), 0),
    statusCounts: {
      draft: invoices.filter(inv => inv.status === 'draft').length,
      sent: invoices.filter(inv => inv.status === 'sent').length,
      paid: invoices.filter(inv => inv.status === 'paid').length
    },
    averageInvoiceValue: 0,
    byTerminal: {} as Record<string, number>,
    byRegion: {} as Record<string, number>
  };
  
  // Calculate average
  stats.averageInvoiceValue = stats.totalInvoices > 0 ? Math.round(stats.totalValue / stats.totalInvoices) : 0;
  
  // Count by terminal
  invoices.forEach(inv => {
    if (inv.terminalId) {
      stats.byTerminal[inv.terminalId] = (stats.byTerminal[inv.terminalId] || 0) + 1;
    }
    if (inv.regionId) {
      stats.byRegion[inv.regionId] = (stats.byRegion[inv.regionId] || 0) + 1;
    }
  });
  
  return stats;
};

// Mock pricing and penalty rules for terminal-based system
export const mockPricingRules: PricingRule[] = [
  {
    id: 'labor_base',
    name: 'Base Labor Rate',
    type: 'labor',
    category: 'general',
    value: 75000,
    baseRate: 75000,
    unit: 'hour',
    description: 'Standard hourly rate for maintenance work',
    terminalId: undefined, // Global rule
    regionId: undefined,
    active: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labor_high_priority',
    name: 'High Priority Labor Rate',
    type: 'labor',
    category: 'high_priority',
    value: 112500, // 1.5x base rate
    baseRate: 112500,
    unit: 'hour',
    description: 'Hourly rate for high priority maintenance work',
    terminalId: undefined,
    regionId: undefined,
    active: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labor_critical_priority',
    name: 'Critical Priority Labor Rate',
    type: 'labor',
    category: 'critical_priority',
    value: 150000, // 2x base rate
    baseRate: 150000,
    unit: 'hour',
    description: 'Hourly rate for critical priority maintenance work',
    terminalId: undefined,
    regionId: undefined,
    active: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'corrective_multiplier',
    name: 'Corrective Maintenance Multiplier',
    type: 'labor',
    category: 'corrective',
    value: 1.3,
    baseRate: 1.3,
    unit: 'multiplier',
    description: 'Multiplier for corrective maintenance labor costs',
    terminalId: undefined,
    regionId: undefined,
    active: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockPenaltyRules: PenaltyRule[] = [
  {
    id: 'overdue_percentage',
    name: 'Overdue Work Order Penalty',
    type: 'percentage',
    value: 5,
    unit: 'percent_per_day',
    description: '5% of work order value per day overdue',
    terminalId: undefined, // Global rule
    regionId: undefined,
    active: true,
    maxPenalty: 50, // Maximum 50% penalty
    gracePeriod: 0, // No grace period
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'critical_overdue',
    name: 'Critical Priority Overdue Penalty',
    type: 'percentage',
    value: 10,
    unit: 'percent_per_day',
    description: '10% of work order value per day overdue for critical priority items',
    category: 'critical_priority',
    terminalId: undefined,
    regionId: undefined,
    active: true,
    maxPenalty: 100, // Maximum 100% penalty for critical items
    gracePeriod: 0,
    createdAt: '2024-01-01T00:00:00Z'
  }
];