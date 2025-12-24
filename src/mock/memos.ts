import type { Message, MemoData, Priority } from '@/types';

// Mock memo data with proper relationships to users, terminals, regions, and templates
// Supervisors create memos for terminals in their region
// Admins at those terminals receive the memos in their inbox

export interface MockMemo {
  message: Message;
  memoData: MemoData;
}

// Get current date for relative timestamps
const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

// Supervisor memos - Region 1 supervisors creating memos for terminals in their region
export const mockMemos: MockMemo[] = [
  // Memo 1: Supervisor 1_1 (Region 1) creates urgent memo for Terminal 1 - Using template
  {
    message: {
      id: 'memo_001',
      subject: 'Work Order Request: Emergency Generator Repair',
      content: 'Requesting immediate attention for generator malfunction at Terminal 1. The backup generator failed during routine testing and requires urgent repair to ensure operational continuity.',
      type: 'supervisor_memo',
      priority: 'urgent',
      senderId: 'supervisor1_1',
      recipientIds: ['admin1_1', 'admin1_2'],
      threadId: 'memo_thread_001',
      attachments: [],
      relatedEntity: {
        type: 'work_order',
        id: 'pending_wo_001'
      },
      actionButtons: [
        {
          id: 'create_wo_from_memo',
          label: 'Create Work Order',
          type: 'primary',
          actionType: 'function',
          target: 'convertMemoToWO'
        },
        {
          id: 'view_memo_details',
          label: 'View Details',
          type: 'secondary',
          actionType: 'modal',
          target: 'memo-details-modal'
        }
      ],
      status: 'delivered',
      readBy: [],
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2)
    },
    memoData: {
      workOrderSpecs: {
        title: 'Emergency Generator Repair - Terminal 1',
        description: 'Backup generator failed during routine testing. Requires immediate inspection and repair to restore backup power capability. Critical for operational continuity.',
        category: 'Emergency Repair',
        priority: 'high' as Priority,
        terminalId: 'terminal1',
        estimatedDuration: 4,
        suggestedWorkerId: 'worker1_1',
        requiredMaterials: ['Generator Oil Filter', 'Spark Plugs', 'Coolant'],
        specialInstructions: 'Ensure main power is isolated before work begins. Use PPE including hearing protection.'
      },
      urgencyLevel: 'emergency',
      justification: 'Backup generator is critical for terminal operations during power outages. Recent grid instability makes this repair high priority.',
      requestedBy: 'supervisor1_1',
      status: 'pending',
      templateId: 'template_generator_maintenance'
    }
  },

  // Memo 2: Supervisor 1_1 creates routine memo for Terminal 3 - Custom request
  {
    message: {
      id: 'memo_002',
      subject: 'Work Order Request: Monthly Pipeline Inspection',
      content: 'Scheduled monthly pipeline inspection for Terminal 3 main distribution lines. Routine maintenance to ensure system integrity.',
      type: 'supervisor_memo',
      priority: 'normal',
      senderId: 'supervisor1_1',
      recipientIds: ['admin3_1'],
      threadId: 'memo_thread_002',
      attachments: [],
      relatedEntity: {
        type: 'work_order',
        id: 'pending_wo_002'
      },
      actionButtons: [
        {
          id: 'create_wo_from_memo',
          label: 'Create Work Order',
          type: 'primary',
          actionType: 'function',
          target: 'convertMemoToWO'
        },
        {
          id: 'view_memo_details',
          label: 'View Details',
          type: 'secondary',
          actionType: 'modal',
          target: 'memo-details-modal'
        }
      ],
      status: 'delivered',
      readBy: [],
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1)
    },
    memoData: {
      workOrderSpecs: {
        title: 'Monthly Pipeline Inspection - Terminal 3',
        description: 'Conduct thorough inspection of main distribution pipeline system. Check for corrosion, leaks, pressure anomalies, and structural integrity.',
        category: 'Preventive Maintenance',
        priority: 'medium' as Priority,
        terminalId: 'terminal3',
        estimatedDuration: 6,
        suggestedWorkerId: undefined,
        requiredMaterials: ['Pressure Gauges', 'Leak Detection Fluid', 'Inspection Camera'],
        specialInstructions: 'Document all findings with photos. Report any anomalies immediately.'
      },
      urgencyLevel: 'routine',
      justification: 'Part of scheduled preventive maintenance program. Last inspection was 30 days ago with no issues found.',
      requestedBy: 'supervisor1_1',
      status: 'pending'
    }
  },

  // Memo 3: Supervisor 1_2 creates memo for Terminal 5 - Using template, already converted
  {
    message: {
      id: 'memo_003',
      subject: 'Work Order Request: Pump System Overhaul',
      content: 'Requesting pump system overhaul for Terminal 5. System showing signs of wear after 2 years of continuous operation.',
      type: 'supervisor_memo',
      priority: 'high',
      senderId: 'supervisor1_2',
      recipientIds: ['admin5_1', 'admin5_2'],
      threadId: 'memo_thread_003',
      attachments: [],
      relatedEntity: {
        type: 'work_order',
        id: 'wo_converted_001'
      },
      status: 'delivered',
      readBy: [{ userId: 'admin5_1', readAt: daysAgo(2) }],
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2)
    },
    memoData: {
      workOrderSpecs: {
        title: 'Pump System Overhaul - Terminal 5',
        description: 'Complete overhaul of primary pump system including bearing replacement, seal inspection, and motor evaluation.',
        category: 'Corrective Maintenance',
        priority: 'high' as Priority,
        terminalId: 'terminal5',
        estimatedDuration: 8,
        suggestedWorkerId: 'worker5_1',
        requiredMaterials: ['Pump Bearings', 'Mechanical Seals', 'Lubricant Oil', 'Gasket Set'],
        specialInstructions: 'Coordinate with operations to schedule downtime window.'
      },
      urgencyLevel: 'urgent',
      justification: 'Pump efficiency has dropped 15% over the past month. Preventive overhaul will avoid unplanned downtime.',
      requestedBy: 'supervisor1_2',
      status: 'converted',
      convertedToWorkOrderId: 'wo_from_memo_003',
      templateId: 'template_pump_maintenance'
    }
  },

  // Memo 4: Supervisor 2_1 (Region 2) creates memo for Terminal 20 - Pending
  {
    message: {
      id: 'memo_004',
      subject: 'Work Order Request: HVAC System Maintenance',
      content: 'Scheduled HVAC maintenance for Terminal 20 control room. Air conditioning units need filter replacement and system check.',
      type: 'supervisor_memo',
      priority: 'normal',
      senderId: 'supervisor2_1',
      recipientIds: ['admin20_1'],
      threadId: 'memo_thread_004',
      attachments: [],
      relatedEntity: {
        type: 'work_order',
        id: 'pending_wo_004'
      },
      actionButtons: [
        {
          id: 'create_wo_from_memo',
          label: 'Create Work Order',
          type: 'primary',
          actionType: 'function',
          target: 'convertMemoToWO'
        },
        {
          id: 'view_memo_details',
          label: 'View Details',
          type: 'secondary',
          actionType: 'modal',
          target: 'memo-details-modal'
        }
      ],
      status: 'delivered',
      readBy: [],
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(5)
    },
    memoData: {
      workOrderSpecs: {
        title: 'HVAC System Maintenance - Terminal 20',
        description: 'Quarterly HVAC maintenance including filter replacement, coil cleaning, and refrigerant level check.',
        category: 'Preventive Maintenance',
        priority: 'normal' as Priority,
        terminalId: 'terminal20',
        estimatedDuration: 3,
        suggestedWorkerId: undefined,
        requiredMaterials: ['Air Filters', 'Coil Cleaner', 'Refrigerant R410A'],
        specialInstructions: 'Work should be done during off-peak hours to minimize operational impact.'
      },
      urgencyLevel: 'routine',
      justification: 'Part of quarterly preventive maintenance schedule. Last service was 3 months ago.',
      requestedBy: 'supervisor2_1',
      status: 'pending',
      templateId: 'template_hvac_maintenance'
    }
  },

  // Memo 5: Supervisor 2_2 creates urgent memo for Terminal 25 - Pending
  {
    message: {
      id: 'memo_005',
      subject: 'Work Order Request: Safety System Calibration',
      content: 'Urgent request for safety system calibration at Terminal 25. Gas detection sensors require immediate recalibration.',
      type: 'supervisor_memo',
      priority: 'urgent',
      senderId: 'supervisor2_2',
      recipientIds: ['admin25_1', 'admin25_2'],
      threadId: 'memo_thread_005',
      attachments: [],
      relatedEntity: {
        type: 'work_order',
        id: 'pending_wo_005'
      },
      actionButtons: [
        {
          id: 'create_wo_from_memo',
          label: 'Create Work Order',
          type: 'primary',
          actionType: 'function',
          target: 'convertMemoToWO'
        },
        {
          id: 'view_memo_details',
          label: 'View Details',
          type: 'secondary',
          actionType: 'modal',
          target: 'memo-details-modal'
        }
      ],
      status: 'delivered',
      readBy: [],
      createdAt: hoursAgo(1),
      updatedAt: hoursAgo(1)
    },
    memoData: {
      workOrderSpecs: {
        title: 'Safety System Calibration - Terminal 25',
        description: 'Calibrate all gas detection sensors and safety shutdown systems. Regulatory compliance requirement.',
        category: 'Calibration',
        priority: 'high' as Priority,
        terminalId: 'terminal25',
        estimatedDuration: 5,
        suggestedWorkerId: 'worker25_1',
        requiredMaterials: ['Calibration Gas Cylinders', 'Test Equipment', 'Calibration Certificates'],
        specialInstructions: 'All work must be documented for regulatory audit. Certificates must be updated.'
      },
      urgencyLevel: 'urgent',
      justification: 'Annual calibration deadline is approaching. Non-compliance will result in operational restrictions.',
      requestedBy: 'supervisor2_2',
      status: 'pending',
      templateId: 'template_safety_calibration'
    }
  },

  // Memo 6: Supervisor 3_1 (Region 3) creates memo for Terminal 35 - Converted
  {
    message: {
      id: 'memo_006',
      subject: 'Work Order Request: Electrical Panel Inspection',
      content: 'Routine electrical panel inspection for Terminal 35 main distribution board.',
      type: 'supervisor_memo',
      priority: 'normal',
      senderId: 'supervisor3_1',
      recipientIds: ['admin35_1'],
      threadId: 'memo_thread_006',
      attachments: [],
      relatedEntity: {
        type: 'work_order',
        id: 'wo_from_memo_006'
      },
      status: 'delivered',
      readBy: [{ userId: 'admin35_1', readAt: daysAgo(5) }],
      createdAt: daysAgo(7),
      updatedAt: daysAgo(5)
    },
    memoData: {
      workOrderSpecs: {
        title: 'Electrical Panel Inspection - Terminal 35',
        description: 'Comprehensive inspection of main electrical distribution panel including thermographic scanning.',
        category: 'Inspection',
        priority: 'normal' as Priority,
        terminalId: 'terminal35',
        estimatedDuration: 4,
        suggestedWorkerId: 'worker35_2',
        requiredMaterials: ['Thermal Camera', 'Multimeter', 'Torque Wrench'],
        specialInstructions: 'Coordinate with electrical team for safe isolation procedures.'
      },
      urgencyLevel: 'routine',
      justification: 'Part of annual electrical safety inspection program.',
      requestedBy: 'supervisor3_1',
      status: 'converted',
      convertedToWorkOrderId: 'wo_from_memo_006'
    }
  },

  // Memo 7: Supervisor 4_1 (Region 4) creates custom memo for Terminal 50 - Pending
  {
    message: {
      id: 'memo_007',
      subject: 'Work Order Request: Tank Cleaning and Inspection',
      content: 'Request for storage tank internal cleaning and inspection at Terminal 50.',
      type: 'supervisor_memo',
      priority: 'high',
      senderId: 'supervisor4_1',
      recipientIds: ['admin50_1', 'admin50_2'],
      threadId: 'memo_thread_007',
      attachments: [],
      relatedEntity: {
        type: 'work_order',
        id: 'pending_wo_007'
      },
      actionButtons: [
        {
          id: 'create_wo_from_memo',
          label: 'Create Work Order',
          type: 'primary',
          actionType: 'function',
          target: 'convertMemoToWO'
        },
        {
          id: 'view_memo_details',
          label: 'View Details',
          type: 'secondary',
          actionType: 'modal',
          target: 'memo-details-modal'
        }
      ],
      status: 'delivered',
      readBy: [],
      createdAt: hoursAgo(8),
      updatedAt: hoursAgo(8)
    },
    memoData: {
      workOrderSpecs: {
        title: 'Tank Cleaning and Inspection - Terminal 50',
        description: 'Internal cleaning of storage tank #3 and API 653 inspection. Tank has been in service for 5 years.',
        category: 'Inspection',
        priority: 'high' as Priority,
        terminalId: 'terminal50',
        estimatedDuration: 16,
        suggestedWorkerId: undefined,
        requiredMaterials: ['Confined Space Equipment', 'Cleaning Chemicals', 'Inspection Tools', 'Safety Harness'],
        specialInstructions: 'Tank must be emptied and gas-freed before entry. Confined space permit required.'
      },
      urgencyLevel: 'urgent',
      justification: 'Scheduled 5-year internal inspection as per API 653 requirements. Regulatory compliance mandatory.',
      requestedBy: 'supervisor4_1',
      status: 'pending'
    }
  },

  // Memo 8: Supervisor 5_1 (Region 5) creates memo for Terminal 70 - Converted
  {
    message: {
      id: 'memo_008',
      subject: 'Work Order Request: Fire Suppression System Test',
      content: 'Annual fire suppression system testing and inspection for Terminal 70.',
      type: 'supervisor_memo',
      priority: 'high',
      senderId: 'supervisor5_1',
      recipientIds: ['admin70_1'],
      threadId: 'memo_thread_008',
      attachments: [],
      relatedEntity: {
        type: 'work_order',
        id: 'wo_from_memo_008'
      },
      status: 'delivered',
      readBy: [{ userId: 'admin70_1', readAt: daysAgo(1) }],
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1)
    },
    memoData: {
      workOrderSpecs: {
        title: 'Fire Suppression System Test - Terminal 70',
        description: 'Comprehensive testing of deluge system, foam proportioning, and fire detection panels.',
        category: 'Inspection',
        priority: 'high' as Priority,
        terminalId: 'terminal70',
        estimatedDuration: 6,
        suggestedWorkerId: 'worker70_1',
        requiredMaterials: ['Test Equipment', 'Foam Concentrate Sample', 'Calibration Tools'],
        specialInstructions: 'Coordinate with local fire department for testing protocol.'
      },
      urgencyLevel: 'urgent',
      justification: 'Annual fire safety compliance requirement. Insurance renewal depends on this inspection.',
      requestedBy: 'supervisor5_1',
      status: 'converted',
      convertedToWorkOrderId: 'wo_from_memo_008',
      templateId: 'template_fire_safety'
    }
  }
];

// Helper function to get memos by supervisor
export const getMemosBySupervisor = (supervisorId: string): MockMemo[] => {
  return mockMemos.filter(memo => memo.message.senderId === supervisorId);
};

// Helper function to get memos for a specific terminal
export const getMemosForTerminal = (terminalId: string): MockMemo[] => {
  return mockMemos.filter(memo => memo.memoData.workOrderSpecs.terminalId === terminalId);
};

// Helper function to get pending memos
export const getPendingMemos = (): MockMemo[] => {
  return mockMemos.filter(memo => memo.memoData.status === 'pending');
};

// Helper function to get converted memos
export const getConvertedMemos = (): MockMemo[] => {
  return mockMemos.filter(memo => memo.memoData.status === 'converted');
};

// Helper function to get memos by region (based on terminal)
export const getMemosByRegion = (regionId: string): MockMemo[] => {
  const regionTerminalMap: Record<string, number[]> = {
    'region1': Array.from({ length: 15 }, (_, i) => i + 1),
    'region2': Array.from({ length: 15 }, (_, i) => i + 16),
    'region3': Array.from({ length: 15 }, (_, i) => i + 31),
    'region4': Array.from({ length: 15 }, (_, i) => i + 46),
    'region5': Array.from({ length: 15 }, (_, i) => i + 61),
    'region6': Array.from({ length: 15 }, (_, i) => i + 76),
    'region7': Array.from({ length: 15 }, (_, i) => i + 91),
    'region8': Array.from({ length: 11 }, (_, i) => i + 106)
  };

  const terminalNums = regionTerminalMap[regionId] || [];
  const terminalIds = terminalNums.map(num => `terminal${num}`);

  return mockMemos.filter(memo =>
    terminalIds.includes(memo.memoData.workOrderSpecs.terminalId)
  );
};

// Export memos as messages for inbox integration
export const getMemoMessages = (): Message[] => {
  return mockMemos.map(memo => ({
    ...memo.message,
    memoData: memo.memoData
  }));
};
