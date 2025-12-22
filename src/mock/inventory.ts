import type { InventoryItem, StockMovement } from '@/types';

// Terminal-based inventory distribution
// Each terminal has its own inventory with realistic stock levels
// Some items are common across all terminals, others are specialized per region

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

// Base inventory templates that are common across terminals
const baseInventoryTemplate = [
  {
    name: 'Gas Pipeline Gasket - High Pressure',
    code: 'GPG-HP-001',
    category: 'Pipeline Components',
    description: 'High-pressure rated gasket for gas pipeline connections, suitable for pressures up to 150 PSI',
    unitOfMeasure: 'pieces',
    baseStock: 25,
    minThreshold: 10,
    unitPrice: 900000,
    supplier: 'Industrial Sealing Solutions',
    status: 'active' as const
  },
  {
    name: 'Gas Detector Sensor - Methane',
    code: 'GDS-CH4-002',
    category: 'Safety & Emergency Equipment',
    description: 'Methane gas detection sensor with digital output, operating range 0-100% LEL',
    unitOfMeasure: 'pieces',
    baseStock: 8,
    minThreshold: 12,
    unitPrice: 4800000,
    supplier: 'SafeTech Instruments',
    status: 'active' as const
  },
  {
    name: 'Compressor Oil - Synthetic Grade',
    code: 'CO-SG-003',
    category: 'Consumables',
    description: 'High-performance synthetic compressor oil for gas compression systems, 5L container',
    unitOfMeasure: 'liters',
    baseStock: 45,
    minThreshold: 20,
    unitPrice: 540000,
    supplier: 'PetroLube Industries',
    status: 'active' as const
  },
  {
    name: 'Industrial Valve - Manual Control',
    code: 'IV-MC-004',
    category: 'Valves & Controls',
    description: 'Manual ball valve for gas flow control, 2-inch diameter with stainless steel construction',
    unitOfMeasure: 'pieces',
    baseStock: 12,
    minThreshold: 5,
    unitPrice: 3200000,
    supplier: 'FlowControl Systems',
    status: 'active' as const
  },
  {
    name: 'Precision Pressure Gauge',
    code: 'PPG-005',
    category: 'Measurement & Testing',
    description: 'Digital pressure gauge with 0.1% accuracy, range 0-200 PSI',
    unitOfMeasure: 'pieces',
    baseStock: 15,
    minThreshold: 8,
    unitPrice: 1200000,
    supplier: 'MetricTech Solutions',
    status: 'active' as const
  },
  {
    name: 'Electrical Cable - Armored',
    code: 'EC-ARM-006',
    category: 'Electrical Components',
    description: 'Armored electrical cable for hazardous environments, 4-core 2.5mm²',
    unitOfMeasure: 'meters',
    baseStock: 200,
    minThreshold: 50,
    unitPrice: 125000,
    supplier: 'PowerLine Industries',
    status: 'active' as const
  },
  {
    name: 'Oil Filter - Heavy Duty',
    code: 'OF-HD-007',
    category: 'Filters',
    description: 'Heavy-duty oil filter for compressor systems, 10-micron filtration',
    unitOfMeasure: 'pieces',
    baseStock: 30,
    minThreshold: 15,
    unitPrice: 380000,
    supplier: 'FilterMax Corporation',
    status: 'active' as const
  },
  {
    name: 'Safety Helmet - Gas Industry',
    code: 'SH-GI-008',
    category: 'Personal Protective Equipment',
    description: 'Anti-static safety helmet with chin strap, suitable for gas industry',
    unitOfMeasure: 'pieces',
    baseStock: 20,
    minThreshold: 10,
    unitPrice: 280000,
    supplier: 'SafeGuard Equipment',
    status: 'active' as const
  },
  {
    name: 'Pump Seal Kit - Complete',
    code: 'PSK-C-009',
    category: 'Seals & Gaskets',
    description: 'Complete seal kit for centrifugal pumps, includes O-rings and gaskets',
    unitOfMeasure: 'kits',
    baseStock: 18,
    minThreshold: 8,
    unitPrice: 950000,
    supplier: 'Seal Solutions Ltd',
    status: 'active' as const
  },
  {
    name: 'Calibration Kit - Gas Sensors',
    code: 'CK-GS-010',
    category: 'Measurement & Testing',
    description: 'Calibration kit for gas detection sensors, includes test gases and adapters',
    unitOfMeasure: 'kits',
    baseStock: 5,
    minThreshold: 3,
    unitPrice: 7500000,
    supplier: 'CalibTech Systems',
    status: 'active' as const
  }
];

// Regional specialization items (different per region)
const regionalSpecializationItems = {
  region1: [ // Jakarta & Surrounding - Marine environment
    {
      name: 'Marine-Grade Coating',
      code: 'MGC-JKT-011',
      category: 'Coatings & Paints',
      description: 'Anti-corrosion coating for marine environments',
      unitOfMeasure: 'liters',
      baseStock: 30,
      minThreshold: 10,
      unitPrice: 850000,
      supplier: 'Marine Coatings Inc',
      status: 'active' as const
    }
  ],
  region2: [ // West Java - Highland operations
    {
      name: 'Cold Weather Lubricant',
      code: 'CWL-WJ-011',
      category: 'Consumables',
      description: 'Specialized lubricant for high-altitude operations',
      unitOfMeasure: 'liters',
      baseStock: 25,
      minThreshold: 8,
      unitPrice: 720000,
      supplier: 'Alpine Fluids',
      status: 'active' as const
    }
  ],
  region3: [ // Central Java - High temperature
    {
      name: 'Heat-Resistant Gasket',
      code: 'HRG-CJ-011',
      category: 'Pipeline Components',
      description: 'Heat-resistant gasket for high-temperature applications',
      unitOfMeasure: 'pieces',
      baseStock: 15,
      minThreshold: 6,
      unitPrice: 1200000,
      supplier: 'ThermalSeal Solutions',
      status: 'active' as const
    }
  ],
  region4: [ // East Java - Industrial grade
    {
      name: 'Industrial Degreaser',
      code: 'ID-EJ-011',
      category: 'Cleaning Supplies',
      description: 'Industrial-grade degreaser for heavy equipment',
      unitOfMeasure: 'liters',
      baseStock: 40,
      minThreshold: 15,
      unitPrice: 180000,
      supplier: 'CleanTech Industries',
      status: 'active' as const
    }
  ],
  region5: [ // Sumatra - Tropical conditions
    {
      name: 'Tropical Climate Filter',
      code: 'TCF-SUM-011',
      category: 'Filters',
      description: 'Air filter designed for high humidity tropical climates',
      unitOfMeasure: 'pieces',
      baseStock: 20,
      minThreshold: 8,
      unitPrice: 450000,
      supplier: 'TropicFilter Corp',
      status: 'active' as const
    }
  ],
  region6: [ // Kalimantan - Mining environment
    {
      name: 'Heavy Duty Hose',
      code: 'HDH-KAL-011',
      category: 'Hoses & Fittings',
      description: 'Reinforced hose for mining and heavy-duty applications',
      unitOfMeasure: 'meters',
      baseStock: 100,
      minThreshold: 25,
      unitPrice: 95000,
      supplier: 'MiningTech Supplies',
      status: 'active' as const
    }
  ],
  region7: [ // Sulawesi - Remote operations
    {
      name: 'Remote Monitoring Device',
      code: 'RMD-SUL-011',
      category: 'Monitoring & Control',
      description: 'Satellite-enabled monitoring device for remote operations',
      unitOfMeasure: 'pieces',
      baseStock: 3,
      minThreshold: 1,
      unitPrice: 15000000,
      supplier: 'RemoteTech Systems',
      status: 'active' as const
    }
  ],
  region8: [ // Eastern Indonesia - Island logistics
    {
      name: 'Corrosion Inhibitor',
      code: 'CI-EI-011',
      category: 'Chemicals',
      description: 'Corrosion inhibitor for island salt-air environments',
      unitOfMeasure: 'liters',
      baseStock: 35,
      minThreshold: 12,
      unitPrice: 560000,
      supplier: 'Island Protection Co',
      status: 'active' as const
    }
  ]
};

// Generate terminal-specific inventory
function generateTerminalInventory(): InventoryItem[] {
  const allItems: InventoryItem[] = [];
  
  for (let terminalNum = 1; terminalNum <= 116; terminalNum++) {
    const terminalId = `terminal${terminalNum}`;
    const regionId = getRegionIdFromTerminal(terminalNum);
    
    // Add base inventory items for each terminal
    baseInventoryTemplate.forEach((template, index) => {
      const stockVariation = Math.floor(Math.random() * 20) - 10; // ±10 variation
      const currentStock = Math.max(0, template.baseStock + stockVariation);
      
      // Generate storage location based on terminal
      const storageLocation = generateStorageLocation(terminalNum, template.category);
      
      allItems.push({
        id: `item_t${terminalNum}_${(index + 1).toString().padStart(3, '0')}`,
        name: template.name,
        code: `${template.code}_T${terminalNum.toString().padStart(3, '0')}`,
        category: template.category,
        description: template.description,
        unitOfMeasure: template.unitOfMeasure,
        currentStock,
        minThreshold: template.minThreshold,
        unitPrice: template.unitPrice,
        storageLocation,
        supplier: template.supplier,
        terminalId,
        regionId,
        lastUpdated: generateRecentDateTime(),
        status: currentStock < template.minThreshold ? 'low_stock' : template.status
      });
    });
    
    // Add regional specialization items
    const specialItems = (regionalSpecializationItems as any)[regionId] || [];
    specialItems.forEach((template: any, index: number) => {
      const stockVariation = Math.floor(Math.random() * 10) - 5; // ±5 variation
      const currentStock = Math.max(0, template.baseStock + stockVariation);
      const storageLocation = generateStorageLocation(terminalNum, template.category);
      
      allItems.push({
        id: `item_t${terminalNum}_spec_${(index + 1).toString().padStart(2, '0')}`,
        name: template.name,
        code: `${template.code}_T${terminalNum.toString().padStart(3, '0')}`,
        category: template.category,
        description: template.description,
        unitOfMeasure: template.unitOfMeasure,
        currentStock,
        minThreshold: template.minThreshold,
        unitPrice: template.unitPrice,
        storageLocation,
        supplier: template.supplier,
        terminalId,
        regionId,
        lastUpdated: generateRecentDateTime(),
        status: currentStock < template.minThreshold ? 'low_stock' : template.status
      });
    });
  }
  
  return allItems;
}

function generateStorageLocation(terminalNum: number, category: string): string {
  const warehouseNum = ((terminalNum - 1) % 3) + 1; // Terminals have 1-3 warehouses
  
  const locationMappings: Record<string, string> = {
    'Pipeline Components': 'Section A',
    'Safety & Emergency Equipment': 'Safety Cabinet',
    'Consumables': 'Fluids Section',
    'Valves & Controls': 'Section B',
    'Measurement & Testing': 'Equipment Room',
    'Electrical Components': 'Electrical Room',
    'Filters': 'Maintenance Area',
    'Personal Protective Equipment': 'PPE Storage',
    'Seals & Gaskets': 'Section A',
    'Coatings & Paints': 'Chemical Storage',
    'Cleaning Supplies': 'Chemical Storage',
    'Hoses & Fittings': 'Section B',
    'Monitoring & Control': 'Equipment Room',
    'Chemicals': 'Chemical Storage'
  };
  
  const section = locationMappings[category] || 'General Storage';
  return `Terminal ${terminalNum} - Warehouse ${warehouseNum} - ${section}`;
}

function generateRecentDateTime(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
  const hoursAgo = Math.floor(Math.random() * 24);
  
  const recentDate = new Date(now);
  recentDate.setDate(recentDate.getDate() - daysAgo);
  recentDate.setHours(recentDate.getHours() - hoursAgo);
  
  return recentDate.toISOString();
}

// Generate mock stock movements for terminal inventory
function generateStockMovements(): StockMovement[] {
  const movements: StockMovement[] = [];
  
  // Generate some sample movements for the first few terminals
  for (let terminalNum = 1; terminalNum <= 10; terminalNum++) {
    for (let i = 1; i <= 3; i++) {
      const itemId = `item_t${terminalNum}_${i.toString().padStart(3, '0')}`;
      
      movements.push({
        id: `mov_${terminalNum}_${i}_in`,
        itemId,
        type: 'in',
        quantity: Math.floor(Math.random() * 50) + 10,
        reason: 'Purchase Order Received',
        performedBy: `admin${terminalNum}_1`,
        timestamp: generateRecentDateTime(),
        notes: 'Routine stock replenishment',
        referenceNumber: `PO-2024-${terminalNum.toString().padStart(3, '0')}-${i}`
      });
      
      movements.push({
        id: `mov_${terminalNum}_${i}_out`,
        itemId,
        type: 'out',
        quantity: Math.floor(Math.random() * 20) + 5,
        reason: 'Work Order Consumption',
        performedBy: `worker${terminalNum}_1`,
        timestamp: generateRecentDateTime(),
        notes: 'Used for maintenance work order',
        referenceNumber: `wo${terminalNum.toString().padStart(3, '0')}`
      });
    }
  }
  
  return movements;
}

// Generate all terminal inventory
export const mockInventoryItems: InventoryItem[] = generateTerminalInventory();

// Generate mock stock movements
export const mockStockMovements: StockMovement[] = generateStockMovements();

// Helper functions for terminal-based inventory operations
export const getInventoryByTerminal = (terminalId: string): InventoryItem[] => {
  return mockInventoryItems.filter(item => item.terminalId === terminalId);
};

export const getInventoryByRegion = (regionId: string): InventoryItem[] => {
  return mockInventoryItems.filter(item => item.regionId === regionId);
};

export const getLowStockItems = (terminalId?: string): InventoryItem[] => {
  let items = mockInventoryItems;
  if (terminalId) {
    items = items.filter(item => item.terminalId === terminalId);
  }
  return items.filter(item => item.currentStock < item.minThreshold);
};

export const getItemsByCategory = (category: string, terminalId?: string): InventoryItem[] => {
  let items = mockInventoryItems;
  if (terminalId) {
    items = items.filter(item => item.terminalId === terminalId);
  }
  return items.filter(item => item.category === category);
};

export const getStockMovementsByTerminal = (terminalId: string): StockMovement[] => {
  const terminalItems = getInventoryByTerminal(terminalId).map(item => item.id);
  return mockStockMovements.filter(movement => 
    terminalItems.includes(movement.itemId)
  );
};

// Inventory statistics
export const getInventoryStatistics = (terminalId?: string) => {
  let items = mockInventoryItems;
  if (terminalId) {
    items = items.filter(item => item.terminalId === terminalId);
  }
  
  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
    lowStockCount: items.filter(item => item.currentStock < item.minThreshold).length,
    categoryCounts: {} as Record<string, number>,
    statusCounts: {
      active: items.filter(item => item.status === 'active').length,
      low_stock: items.filter(item => item.status === 'low_stock').length,
      inactive: items.filter(item => item.status === 'inactive').length
    }
  };
  
  // Count by category
  items.forEach(item => {
    stats.categoryCounts[item.category] = (stats.categoryCounts[item.category] || 0) + 1;
  });
  
  return stats;
};