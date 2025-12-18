import type { Invoice } from '@/types';
import type { PricingRule, PenaltyRule } from '@/stores/invoice';

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-0001',
    workOrderIds: ['wo1', 'wo2'],
    terminalId: 'terminal1',
    regionId: 'region1',
    recipientType: 'terminal',
    recipientDetails: {
      name: 'Terminal Tanjung Priok Manager',
      email: 'manager@terminal-tanjung-priok.com',
      address: 'Jl. Raya Pelabuhan, Tanjung Priok, Jakarta Utara',
      company: 'PT Terminal Petrokimia Tanjung Priok'
    },
    items: [
      {
        id: 'item1',
        workOrderId: 'wo1',
        type: 'labor',
        description: 'Labor - Gas Compressor Unit C2 Monthly Maintenance',
        quantity: 6,
        unit: 'hours',
        unitPrice: 75000,
        totalPrice: 450000,
        category: 'preventive'
      },
      {
        id: 'item2',
        workOrderId: 'wo1',
        type: 'material',
        description: 'Material - Compressor Oil Filter',
        quantity: 2,
        unit: 'pcs',
        unitPrice: 125000,
        totalPrice: 250000,
        category: 'filters'
      },
      {
        id: 'item3',
        workOrderId: 'wo1',
        type: 'material',
        description: 'Material - Hydraulic Oil (High Grade)',
        quantity: 20,
        unit: 'liter',
        unitPrice: 45000,
        totalPrice: 900000,
        category: 'fluids'
      },
      {
        id: 'item4',
        workOrderId: 'wo2',
        type: 'labor',
        description: 'Labor - Pipeline Pressure Test Section A1',
        quantity: 4,
        unit: 'hours',
        unitPrice: 85000,
        totalPrice: 340000,
        category: 'corrective'
      },
      {
        id: 'item5',
        workOrderId: 'wo2',
        type: 'material',
        description: 'Material - Pressure Test Equipment Rental',
        quantity: 1,
        unit: 'day',
        unitPrice: 500000,
        totalPrice: 500000,
        category: 'equipment_rental'
      }
    ],
    summary: {
      laborCost: 790000,
      materialCost: 1650000,
      penalties: 0,
      subtotal: 2440000,
      total: 2440000
    },
    status: 'sent',
    generatedAt: '2024-12-15T10:00:00Z',
    sentAt: '2024-12-15T14:30:00Z',
    dueDate: '2025-01-15T00:00:00Z',
    generatedBy: 'admin1',
    notes: 'Monthly maintenance invoice for December 2024'
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-0002',
    workOrderIds: ['wo3'],
    terminalId: 'terminal2',
    regionId: 'region1',
    recipientType: 'terminal',
    recipientDetails: {
      name: 'Terminal Cilacap Operations Manager',
      email: 'operations@terminal-cilacap.com',
      address: 'Jl. Industri Petrokimia, Cilacap, Jawa Tengah',
      company: 'PT Kilang Pertamina Cilacap'
    },
    items: [
      {
        id: 'item6',
        workOrderId: 'wo3',
        type: 'labor',
        description: 'Labor - Emergency Gas Leak Detection and Repair',
        quantity: 8,
        unit: 'hours',
        unitPrice: 95000,
        totalPrice: 760000,
        category: 'corrective'
      },
      {
        id: 'item7',
        workOrderId: 'wo3',
        type: 'material',
        description: 'Material - Gas Detector Sensors (High Sensitivity)',
        quantity: 4,
        unit: 'pcs',
        unitPrice: 850000,
        totalPrice: 3400000,
        category: 'safety_equipment'
      },
      {
        id: 'item8',
        workOrderId: 'wo3',
        type: 'material',
        description: 'Material - Emergency Response Kit',
        quantity: 1,
        unit: 'set',
        unitPrice: 1250000,
        totalPrice: 1250000,
        category: 'safety_equipment'
      },
      {
        id: 'item9',
        workOrderId: 'wo3',
        type: 'penalty',
        description: 'Penalty - Emergency Response Delay (2 days overdue)',
        quantity: 1,
        unit: 'item',
        unitPrice: 500000,
        totalPrice: 500000,
        category: 'penalty'
      }
    ],
    summary: {
      laborCost: 760000,
      materialCost: 4650000,
      penalties: 500000,
      subtotal: 5410000,
      total: 5910000
    },
    status: 'pending',
    generatedAt: '2024-12-16T08:00:00Z',
    dueDate: '2025-01-16T00:00:00Z',
    generatedBy: 'admin1',
    notes: 'Emergency maintenance - gas leak response with penalty due to delayed completion'
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2024-0003',
    workOrderIds: ['wo4', 'wo5', 'wo6'],
    terminalId: 'terminal3',
    regionId: 'region2',
    recipientType: 'region',
    recipientDetails: {
      name: 'Regional Manager - Sumatra Region',
      email: 'regional.manager@pertamina-sumatra.com',
      address: 'Jl. Regional Office Sumatra, Medan, Sumatera Utara',
      company: 'Pertamina Regional Sumatra'
    },
    items: [
      {
        id: 'item10',
        workOrderId: 'wo4',
        type: 'labor',
        description: 'Labor - Storage Tank Inspection Terminal Dumai',
        quantity: 12,
        unit: 'hours',
        unitPrice: 70000,
        totalPrice: 840000,
        category: 'preventive'
      },
      {
        id: 'item11',
        workOrderId: 'wo5',
        type: 'labor',
        description: 'Labor - Pipeline Valve Replacement Terminal Plaju',
        quantity: 16,
        unit: 'hours',
        unitPrice: 80000,
        totalPrice: 1280000,
        category: 'corrective'
      },
      {
        id: 'item12',
        workOrderId: 'wo6',
        type: 'labor',
        description: 'Labor - Safety System Calibration Terminal Balongan',
        quantity: 8,
        unit: 'hours',
        unitPrice: 90000,
        totalPrice: 720000,
        category: 'preventive'
      },
      {
        id: 'item13',
        workOrderId: 'wo5',
        type: 'material',
        description: 'Material - Industrial Ball Valve 6 inch',
        quantity: 2,
        unit: 'pcs',
        unitPrice: 2500000,
        totalPrice: 5000000,
        category: 'valves'
      },
      {
        id: 'item14',
        workOrderId: 'wo6',
        type: 'material',
        description: 'Material - Calibration Gas Cylinders',
        quantity: 6,
        unit: 'pcs',
        unitPrice: 450000,
        totalPrice: 2700000,
        category: 'calibration_equipment'
      }
    ],
    summary: {
      laborCost: 2840000,
      materialCost: 7700000,
      penalties: 0,
      subtotal: 10540000,
      total: 10540000
    },
    status: 'paid',
    generatedAt: '2024-12-10T09:00:00Z',
    sentAt: '2024-12-10T16:00:00Z',
    paidAt: '2024-12-20T11:30:00Z',
    dueDate: '2025-01-10T00:00:00Z',
    generatedBy: 'admin2',
    notes: 'Regional monthly consolidated invoice - Multiple terminals'
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2024-0004',
    workOrderIds: ['wo7'],
    terminalId: 'terminal1',
    regionId: 'region1',
    recipientType: 'external_client',
    recipientDetails: {
      name: 'PT Contractor Maintenance Specialist',
      email: 'finance@maintenance-specialist.com',
      address: 'Jl. Industri Raya No. 45, Jakarta Selatan',
      company: 'PT Contractor Maintenance Specialist'
    },
    items: [
      {
        id: 'item15',
        workOrderId: 'wo7',
        type: 'labor',
        description: 'Labor - Specialized Turbine Overhaul',
        quantity: 24,
        unit: 'hours',
        unitPrice: 150000,
        totalPrice: 3600000,
        category: 'specialized'
      },
      {
        id: 'item16',
        workOrderId: 'wo7',
        type: 'material',
        description: 'Material - Turbine Blade Set (High Performance)',
        quantity: 1,
        unit: 'set',
        unitPrice: 15000000,
        totalPrice: 15000000,
        category: 'turbine_parts'
      },
      {
        id: 'item17',
        workOrderId: 'wo7',
        type: 'material',
        description: 'Material - Specialized Tools and Equipment',
        quantity: 1,
        unit: 'set',
        unitPrice: 2500000,
        totalPrice: 2500000,
        category: 'specialized_tools'
      }
    ],
    summary: {
      laborCost: 3600000,
      materialCost: 17500000,
      penalties: 0,
      subtotal: 21100000,
      total: 21100000
    },
    status: 'pending',
    generatedAt: '2024-12-17T07:00:00Z',
    dueDate: '2025-01-17T00:00:00Z',
    generatedBy: 'admin1',
    notes: 'Specialized turbine maintenance - External contractor services'
  }
];

export const mockPricingRules: PricingRule[] = [
  {
    id: 'pr1',
    name: 'Standard Worker Hourly Rate - Jakarta',
    type: 'labor',
    category: 'general',
    terminalId: 'terminal1',
    userRole: 'worker',
    baseRate: 75000,
    unit: 'hour',
    description: 'Standard hourly rate for workers at Jakarta terminals',
    isActive: true
  },
  {
    id: 'pr2',
    name: 'Supervisor Hourly Rate - Jakarta',
    type: 'labor',
    category: 'general',
    terminalId: 'terminal1',
    userRole: 'supervisor',
    baseRate: 95000,
    unit: 'hour',
    description: 'Hourly rate for supervisors at Jakarta terminals',
    isActive: true
  },
  {
    id: 'pr3',
    name: 'Regional Worker Rate - Sumatra',
    type: 'labor',
    category: 'general',
    regionId: 'region2',
    userRole: 'worker',
    baseRate: 70000,
    unit: 'hour',
    description: 'Standard hourly rate for workers in Sumatra region',
    isActive: true
  },
  {
    id: 'pr4',
    name: 'Emergency Response Premium',
    type: 'labor',
    category: 'emergency',
    baseRate: 125000,
    unit: 'hour',
    description: 'Premium rate for emergency response work (all terminals)',
    isActive: true
  },
  {
    id: 'pr5',
    name: 'Safety Equipment Premium',
    type: 'material',
    category: 'safety_equipment',
    baseRate: 1.15, // 15% markup
    unit: 'percentage',
    description: '15% markup on safety equipment due to certification requirements',
    isActive: true
  },
  {
    id: 'pr6',
    name: 'Specialized Tools Markup',
    type: 'material',
    category: 'specialized_tools',
    baseRate: 1.25, // 25% markup
    unit: 'percentage',
    description: '25% markup on specialized tools and equipment',
    isActive: true
  },
  {
    id: 'pr7',
    name: 'Standard Materials Base Rate',
    type: 'material',
    baseRate: 1.0, // No markup
    unit: 'percentage',
    description: 'Base material pricing with no markup',
    isActive: true
  }
];

export const mockPenaltyRules: PenaltyRule[] = [
  {
    id: 'pen1',
    name: 'Standard Work Order Penalty',
    workOrderType: 'preventive',
    calculationType: 'fixed',
    amount: 100000,
    description: 'Fixed penalty of Rp 100,000 per day for overdue preventive maintenance',
    isActive: true
  },
  {
    id: 'pen2',
    name: 'Corrective Maintenance Penalty',
    workOrderType: 'corrective',
    calculationType: 'percentage',
    amount: 5,
    baseType: 'labor_cost',
    description: '5% of labor cost per day for overdue corrective maintenance',
    isActive: true
  },
  {
    id: 'pen3',
    name: 'High Priority Work Order Penalty',
    priority: 'high',
    calculationType: 'fixed',
    amount: 250000,
    description: 'Fixed penalty of Rp 250,000 per day for overdue high priority work',
    isActive: true
  },
  {
    id: 'pen4',
    name: 'Urgent Priority Work Order Penalty',
    priority: 'urgent',
    calculationType: 'percentage',
    amount: 10,
    baseType: 'total_cost',
    description: '10% of total cost per day for overdue urgent priority work',
    isActive: true
  },
  {
    id: 'pen5',
    name: 'Safety Critical Terminal Penalty',
    terminalId: 'terminal1',
    calculationType: 'fixed',
    amount: 500000,
    description: 'Enhanced penalty for safety critical terminal (Tanjung Priok)',
    isActive: true
  },
  {
    id: 'pen6',
    name: 'Regional Compliance Penalty - Sumatra',
    regionId: 'region2',
    calculationType: 'percentage',
    amount: 3,
    baseType: 'total_cost',
    description: '3% total cost penalty per day for Sumatra region compliance',
    isActive: true
  }
];