import type { WorkOrder, ChecklistItem, Photo } from '@/types';
import { getUsersByTerminal, getUsersByRole } from './users';
import { mockCategories } from './categories';

// Terminal-based work order distribution: 100 work orders total across 116 terminals
// Distribution strategy: 0-2 work orders per terminal
// Regional distribution per PRD:
// Region 1: 15 work orders (terminals 1-15)
// Region 2: 13 work orders (terminals 16-30)
// Region 3: 12 work orders (terminals 31-45)
// Region 4: 14 work orders (terminals 46-60)
// Region 5: 13 work orders (terminals 61-75)
// Region 6: 11 work orders (terminals 76-90)
// Region 7: 12 work orders (terminals 91-105)
// Region 8: 10 work orders (terminals 106-116)

// Reusable checklist templates
const pipelineChecklistItems: ChecklistItem[] = [
  {
    id: 'pressure_test',
    label: 'Pipeline Pressure (PSI)',
    type: 'number',
    required: true,
    unit: 'PSI',
    minValue: 0,
    maxValue: 100
  },
  {
    id: 'leak_detection',
    label: 'Gas Leak Detection',
    type: 'yes_no',
    required: true
  },
  {
    id: 'valve_condition',
    label: 'Valve Condition',
    type: 'dropdown',
    required: true,
    options: ['Good', 'Fair', 'Poor', 'Needs Replacement']
  },
  {
    id: 'safety_check',
    label: 'Safety Systems Operational',
    type: 'yes_no',
    required: true
  }
];

const compressorChecklistItems: ChecklistItem[] = [
  {
    id: 'suction_pressure',
    label: 'Suction Pressure (PSI)',
    type: 'number',
    required: true,
    unit: 'PSI',
    minValue: 0,
    maxValue: 50
  },
  {
    id: 'discharge_pressure',
    label: 'Discharge Pressure (PSI)',
    type: 'number',
    required: true,
    unit: 'PSI',
    minValue: 0,
    maxValue: 100
  },
  {
    id: 'oil_level',
    label: 'Oil Level',
    type: 'dropdown',
    required: true,
    options: ['Low', 'Normal', 'High']
  },
  {
    id: 'vibration_level',
    label: 'Vibration Level',
    type: 'dropdown',
    required: true,
    options: ['Normal', 'Slightly High', 'High', 'Critical']
  },
  {
    id: 'temperature',
    label: 'Operating Temperature (°C)',
    type: 'number',
    required: true,
    unit: '°C',
    minValue: 0,
    maxValue: 150
  }
];

const safetyChecklistItems: ChecklistItem[] = [
  {
    id: 'gas_detector_status',
    label: 'Gas Detector Status',
    type: 'dropdown',
    required: true,
    options: ['Operational', 'Needs Calibration', 'Faulty', 'Offline']
  },
  {
    id: 'emergency_valve_test',
    label: 'Emergency Valve Test',
    type: 'yes_no',
    required: true
  },
  {
    id: 'fire_suppression',
    label: 'Fire Suppression System',
    type: 'dropdown',
    required: true,
    options: ['Operational', 'Needs Service', 'Faulty']
  },
  {
    id: 'safety_barriers',
    label: 'Physical Safety Barriers',
    type: 'dropdown',
    required: true,
    options: ['Good', 'Needs Repair', 'Missing']
  }
];

const electricalChecklistItems: ChecklistItem[] = [
  {
    id: 'voltage_reading',
    label: 'Voltage Reading (V)',
    type: 'number',
    required: true,
    unit: 'V',
    minValue: 0,
    maxValue: 500
  },
  {
    id: 'insulation_test',
    label: 'Insulation Test',
    type: 'dropdown',
    required: true,
    options: ['Pass', 'Fail', 'Marginal']
  },
  {
    id: 'grounding_check',
    label: 'Grounding System Check',
    type: 'yes_no',
    required: true
  }
];

// Helper functions
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

function getWorkerForTerminal(terminalId: string): string {
  const terminalUsers = getUsersByTerminal(terminalId);
  const workers = terminalUsers.filter(user => user.role === 'worker');
  
  // For Terminal 1, prioritize Candra Wijaya (worker1_1)
  if (terminalId === 'terminal1') {
    const candraWijaya = workers.find(worker => worker.id === 'worker1_1');
    if (candraWijaya) {
      return candraWijaya.id;
    }
  }
  
  return workers.length > 0 ? (workers[0]?.id || 'worker1_1') : 'worker1_1'; // Fallback
}

function getAdminForTerminal(terminalId: string): string {
  const terminalUsers = getUsersByTerminal(terminalId);
  const admins = terminalUsers.filter(user => user.role === 'admin');
  return admins.length > 0 ? (admins[0]?.id || 'admin1_1') : 'admin1_1'; // Fallback
}

function getSupervisorForRegion(regionId: string): string {
  const supervisors = getUsersByRole('supervisor').filter(user => user.regionId === regionId);
  return supervisors.length > 0 ? (supervisors[0]?.id || 'supervisor1_1') : 'supervisor1_1'; // Fallback
}

function generateWorkOrderTitle(terminalNum: number, index: number): string {
  const titles = [
    'Gas Pipeline Pressure Test - Main Line',
    'Compressor Monthly Inspection - Unit',
    'Fire & Gas Detection System Calibration',
    'Safety System Maintenance Check',
    'Electrical System Inspection',
    'Emergency Valve Test & Maintenance',
    'Pipeline Leak Detection Survey',
    'Gas Meter Calibration',
    'Pressure Relief Valve Test',
    'Instrumentation Maintenance'
  ];
  
  const baseTitle = titles[index % titles.length];
  const terminalCode = `T${terminalNum.toString().padStart(3, '0')}`;
  return `${baseTitle} - ${terminalCode}`;
}

function generateWorkOrderDescription(title: string, type: 'preventive' | 'corrective'): string {
  if (type === 'preventive') {
    return `Scheduled preventive maintenance for ${title.toLowerCase()} to ensure optimal performance, safety compliance, and operational reliability.`;
  } else {
    return `Corrective maintenance required for ${title.toLowerCase()} due to operational issues or equipment failure detected during routine monitoring.`;
  }
}

function getChecklistForWorkOrder(index: number): ChecklistItem[] {
  const checklists = [
    pipelineChecklistItems,
    compressorChecklistItems,
    safetyChecklistItems,
    electricalChecklistItems
  ];
  return checklists[index % checklists.length] || [];
}

function generateWorkOrderDates(): { startDate: string; dueDate: string } {
  const now = new Date();
  const startDaysOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days from now
  const durationDays = Math.floor(Math.random() * 5) + 1; // 1-5 days duration
  
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() + startDaysOffset);
  
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + durationDays);
  
  return {
    startDate: startDate.toISOString(),
    dueDate: dueDate.toISOString()
  };
}

function getWorkOrderStatus(index: number): 'draft' | 'pending_approval' | 'assigned' | 'in_progress' | 'submitted_for_review' | 'completed' | 'rejected' {
  // Distribute statuses for realistic scenarios
  const statuses = [
    'assigned', 'assigned', 'assigned', // Most common - 30%
    'in_progress', 'in_progress', // 20%
    'completed', 'completed', 'completed', // 30%
    'pending_approval', // 10%
    'submitted_for_review' // 10%
  ];
  return statuses[index % statuses.length] as any;
}

function getPriority(index: number): 'low' | 'normal' | 'high' | 'critical' {
  const priorities = [
    'normal', 'normal', 'normal', // 60%
    'high', 'high', // 30%
    'low', // 5%
    'critical' // 5%
  ];
  return priorities[index % priorities.length] as any;
}

function getMaintenanceType(index: number): 'preventive' | 'corrective' {
  // 70% preventive, 30% corrective
  return index % 10 < 7 ? 'preventive' : 'corrective';
}

// Generate work orders for specific terminals based on regional distribution
function generateTerminalWorkOrders(): WorkOrder[] {
  const workOrders: WorkOrder[] = [];
  
  // Regional work order distribution pattern
  const regionalDistribution = [
    { regionNum: 1, terminalStart: 1, terminalEnd: 15, workOrderCount: 15 },
    { regionNum: 2, terminalStart: 16, terminalEnd: 30, workOrderCount: 13 },
    { regionNum: 3, terminalStart: 31, terminalEnd: 45, workOrderCount: 12 },
    { regionNum: 4, terminalStart: 46, terminalEnd: 60, workOrderCount: 14 },
    { regionNum: 5, terminalStart: 61, terminalEnd: 75, workOrderCount: 13 },
    { regionNum: 6, terminalStart: 76, terminalEnd: 90, workOrderCount: 11 },
    { regionNum: 7, terminalStart: 91, terminalEnd: 105, workOrderCount: 12 },
    { regionNum: 8, terminalStart: 106, terminalEnd: 116, workOrderCount: 10 }
  ];
  
  let workOrderIndex = 1;
  
  regionalDistribution.forEach(region => {
    // Distribute work orders across terminals in this region
    let remainingWorkOrders = region.workOrderCount;
    
    for (let terminalNum = region.terminalStart; terminalNum <= region.terminalEnd && remainingWorkOrders > 0; terminalNum++) {
      // Each terminal gets 0-2 work orders (some get none for realistic distribution)
      // Ensure terminal 1 (demo terminal) gets 2 work orders
      const terminalWorkOrders = terminalNum === 1 ? Math.min(2, remainingWorkOrders) : // Terminal 1 gets priority
                                 terminalNum % 3 === 0 ? 0 : // Every 3rd terminal gets 0
                                 terminalNum % 2 === 0 ? 1 : // Even terminals get 1
                                 Math.min(2, remainingWorkOrders); // Odd terminals get 2 or remaining
      
      for (let woIndex = 0; woIndex < terminalWorkOrders && remainingWorkOrders > 0; woIndex++) {
        const terminalId = `terminal${terminalNum}`;
        const regionId = getRegionIdFromTerminal(terminalNum);
        const workerId = getWorkerForTerminal(terminalId);
        const adminId = getAdminForTerminal(terminalId);
        const supervisorId = getSupervisorForRegion(regionId);
        
        const title = generateWorkOrderTitle(terminalNum, workOrderIndex);
        const type = getMaintenanceType(workOrderIndex);
        const description = generateWorkOrderDescription(title, type);
        const dates = generateWorkOrderDates();
        const status = getWorkOrderStatus(workOrderIndex);
        const priority = getPriority(workOrderIndex);
        const checklist = getChecklistForWorkOrder(workOrderIndex);
        const categoryId = getCategoryForWorkOrder(workOrderIndex);
        
        workOrders.push({
          id: `wo${workOrderIndex.toString().padStart(3, '0')}`,
          title,
          description,
          type,
          status,
          priority,
          categoryId,
          terminalId,
          regionId,
          assignedWorkerId: workerId,
          createdBy: adminId,
          approvedBy: status !== 'draft' && status !== 'pending_approval' ? supervisorId : undefined,
          startDate: dates.startDate,
          dueDate: dates.dueDate,
          estimatedDuration: Math.floor(Math.random() * 6) + 2, // 2-8 hours
          
          // Template integration fields
          inheritedFromTemplate: false,
          customizations: [],
          checklistLocked: false,
          
          checklist: checklist.map(item => ({
            ...item,
            // Add some before values for in-progress/completed work orders
            beforeValue: (status === 'in_progress' || status === 'completed' || status === 'submitted_for_review') ? 
              generateMockBeforeValue(item) : undefined,
            afterValue: status === 'completed' ? generateMockAfterValue(item) : undefined
          })),
          
          beforePhotos: generateMockPhotos('before', status, workOrderIndex),
          afterPhotos: generateMockPhotos('after', status, workOrderIndex),
          beforeNotes: status !== 'draft' && status !== 'pending_approval' ? 
            generateMockNotes('before', workOrderIndex) : '',
          afterNotes: status === 'completed' ? generateMockNotes('after', workOrderIndex) : '',
          
          materials: generateMockMaterials(workOrderIndex),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        workOrderIndex++;
        remainingWorkOrders--;
      }
    }
  });
  
  // Ensure Candra Wijaya (worker1_1) at Terminal 1 has ongoing work orders
  workOrders.forEach(wo => {
    if (wo.assignedWorkerId === 'worker1_1' && wo.terminalId === 'terminal1') {
      // Give Candra ongoing work orders with various active statuses
      const activeStatuses = ['assigned', 'in_progress', 'submitted_for_review'];
      wo.status = activeStatuses[Math.floor(Math.random() * activeStatuses.length)] as any;
    }
  });
  
  return workOrders;
}

function generateMockBeforeValue(item: ChecklistItem): any {
  switch (item.type) {
    case 'number':
      if (item.minValue !== undefined && item.maxValue !== undefined) {
        return Math.floor(Math.random() * (item.maxValue - item.minValue)) + item.minValue;
      }
      return Math.floor(Math.random() * 100);
    case 'yes_no':
      return Math.random() > 0.5;
    case 'dropdown':
      if (item.options && item.options.length > 0) {
        return item.options[Math.floor(Math.random() * item.options.length)];
      }
      return '';
    default:
      return '';
  }
}

function generateMockAfterValue(item: ChecklistItem): any {
  // After values are typically improved versions of before values
  switch (item.type) {
    case 'number':
      const beforeValue = generateMockBeforeValue(item);
      // Slightly improve the value for maintenance results
      return typeof beforeValue === 'number' ? Math.min(beforeValue + Math.floor(Math.random() * 10), item.maxValue || 100) : beforeValue;
    case 'yes_no':
      return true; // Most maintenance results in positive outcomes
    case 'dropdown':
      if (item.options && item.options.length > 0) {
        // Prefer better options (first options are typically better)
        return item.options[Math.floor(Math.random() * Math.min(2, item.options.length))];
      }
      return '';
    default:
      return '';
  }
}

function generateMockNotes(type: 'before' | 'after', index: number): string {
  const beforeNotes = [
    'Equipment inspection reveals normal wear patterns. All safety systems operational.',
    'Initial assessment shows minor maintenance required. System functioning within parameters.',
    'Routine inspection indicates good overall condition. Minor adjustments needed.',
    'Pre-maintenance check complete. Equipment ready for scheduled service.',
    'System assessment shows optimal performance. Preventive maintenance proceeding as planned.'
  ];
  
  const afterNotes = [
    'Maintenance completed successfully. All systems tested and operational.',
    'Service completed according to schedule. Equipment performance optimized.',
    'Maintenance tasks finished. System returned to normal operation.',
    'All maintenance activities completed. Equipment certified for continued operation.',
    'Scheduled maintenance concluded. System performance verified and documented.'
  ];
  
  const notes = type === 'before' ? beforeNotes : afterNotes;
  return notes[index % notes.length] || 'Default maintenance note.';
}

function generateMockMaterials(index: number): Array<{ itemId: string; plannedQuantity: number; actualQuantity?: number }> {
  const materials = [
    [{ itemId: 'item001', plannedQuantity: 2 }], // Pipeline gaskets
    [{ itemId: 'item003', plannedQuantity: 5 }, { itemId: 'item007', plannedQuantity: 1 }], // Oil and filter
    [{ itemId: 'item010', plannedQuantity: 1 }], // Calibration kit
    [{ itemId: 'item002', plannedQuantity: 3 }], // Electrical components
    [{ itemId: 'item005', plannedQuantity: 1 }, { itemId: 'item009', plannedQuantity: 2 }], // Gauge and seals
  ];
  
  return materials[index % materials.length] || [];
}

function getCategoryForWorkOrder(index: number): string {
  // Map work orders to categories based on their titles/types
  const categoryIds = [
    'cat-pipeline', 'cat-compressor', 'cat-safety', 'cat-electrical',
    'cat-instrumentation', 'cat-mechanical', 'cat-pipeline', 'cat-compressor',
    'cat-safety', 'cat-electrical'
  ];
  return categoryIds[index % categoryIds.length] || 'cat-pipeline';
}

function generateMockPhotos(type: 'before' | 'after', status: string, index: number): Photo[] {
  // Only add photos for work orders that should have documentation
  const shouldHaveBeforePhotos = status !== 'draft' && status !== 'pending_approval';
  const shouldHaveAfterPhotos = status === 'completed' || status === 'submitted_for_review';

  if (type === 'before' && !shouldHaveBeforePhotos) return [];
  if (type === 'after' && !shouldHaveAfterPhotos) return [];

  const photoCount = Math.floor(Math.random() * 3) + 1; // 1-3 photos
  const photos = [];
  const workOrderId = `wo${index.toString().padStart(3, '0')}`;

  for (let i = 0; i < photoCount; i++) {
    const photoId = `${type}_photo_${index}_${i + 1}`;
    const equipmentTypes = ['pipeline', 'compressor', 'valve', 'gauge', 'panel'];
    const equipment = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    
    photos.push({
      id: photoId,
      url: `/demo-photos/${type}-${equipment}-${(i + 1)}.jpg`,
      caption: type === 'before' 
        ? `${equipment} condition before maintenance - Photo ${i + 1}`
        : `${equipment} condition after maintenance completed - Photo ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      workOrderId,
      type
    });
  }

  return photos;
}

// Generate the work orders lazily to ensure all dependencies are loaded
let _mockWorkOrders: WorkOrder[] | null = null;

export const mockWorkOrders: WorkOrder[] = new Proxy([], {
  get(_target, prop) {
    // Initialize work orders on first access
    if (_mockWorkOrders === null) {
      console.log('Initializing work orders...');
      _mockWorkOrders = generateTerminalWorkOrders();
    }
    
    // Proxy all array access to the initialized array
    return Reflect.get(_mockWorkOrders, prop);
  },
  
  has(_target, prop) {
    if (_mockWorkOrders === null) {
      _mockWorkOrders = generateTerminalWorkOrders();
    }
    return Reflect.has(_mockWorkOrders, prop);
  },
  
  ownKeys(_target) {
    if (_mockWorkOrders === null) {
      _mockWorkOrders = generateTerminalWorkOrders();
    }
    return Reflect.ownKeys(_mockWorkOrders);
  },
  
  getOwnPropertyDescriptor(_target, prop) {
    if (_mockWorkOrders === null) {
      _mockWorkOrders = generateTerminalWorkOrders();
    }
    return Reflect.getOwnPropertyDescriptor(_mockWorkOrders, prop);
  }
});

// Export helper functions for terminal operations
export const getWorkOrdersByTerminal = (terminalId: string): WorkOrder[] => {
  return mockWorkOrders.filter(wo => wo.terminalId === terminalId);
};

export const getWorkOrdersByRegion = (regionId: string): WorkOrder[] => {
  return mockWorkOrders.filter(wo => wo.regionId === regionId);
};

export const getWorkOrdersByWorker = (workerId: string): WorkOrder[] => {
  return mockWorkOrders.filter(wo => wo.assignedWorkerId === workerId);
};

export const getOverdueWorkOrders = (): WorkOrder[] => {
  const now = new Date();
  return mockWorkOrders.filter(wo => 
    new Date(wo.dueDate) < now && !['completed', 'rejected'].includes(wo.status)
  );
};

// Statistics
export const getWorkOrderStatistics = () => {
  const stats = {
    totalWorkOrders: mockWorkOrders.length,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    byRegion: {} as Record<string, number>,
    byTerminal: {} as Record<string, number>,
    overdueCount: 0
  };
  
  mockWorkOrders.forEach(wo => {
    // Count by status
    stats.byStatus[wo.status] = (stats.byStatus[wo.status] || 0) + 1;
    
    // Count by type
    stats.byType[wo.type] = (stats.byType[wo.type] || 0) + 1;
    
    // Count by priority
    stats.byPriority[wo.priority] = (stats.byPriority[wo.priority] || 0) + 1;
    
    // Count by region
    if (wo.regionId) {
      stats.byRegion[wo.regionId] = (stats.byRegion[wo.regionId] || 0) + 1;
    }
    
    // Count by terminal
    stats.byTerminal[wo.terminalId] = (stats.byTerminal[wo.terminalId] || 0) + 1;
  });
  
  stats.overdueCount = getOverdueWorkOrders().length;
  
  return stats;
};