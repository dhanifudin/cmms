import type { WorkOrder, ChecklistItem } from '@/types';

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
    label: 'Safety Barriers Condition',
    type: 'dropdown',
    required: true,
    options: ['Good', 'Minor Damage', 'Major Damage', 'Missing']
  }
];

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo001',
    title: 'Gas Pipeline Pressure Test - Main Line A',
    description: 'Monthly pressure testing of the main gas pipeline system to ensure operational safety and detect any potential leaks or pressure drops.',
    type: 'preventive',
    status: 'assigned',
    priority: 'high',
    terminalId: 'terminal1',
    assignedWorkerId: 'worker1',
    createdBy: 'admin1',
    startDate: '2024-12-18T08:00:00Z',
    dueDate: '2024-12-20T17:00:00Z',
    estimatedDuration: 4,
    checklist: pipelineChecklistItems,
    beforePhotos: [],
    afterPhotos: [],
    materials: [
      { itemId: 'item001', plannedQuantity: 2 }, // Pipeline gaskets
      { itemId: 'item005', plannedQuantity: 1 }  // Pressure gauge
    ],
    createdAt: '2024-12-17T10:00:00Z',
    updatedAt: '2024-12-17T10:00:00Z'
  },
  {
    id: 'wo002',
    title: 'Gas Compressor Monthly Inspection - Unit C2',
    description: 'Comprehensive monthly inspection of gas compressor unit C2 including lubrication system check, pressure monitoring, and vibration analysis.',
    type: 'preventive',
    status: 'in_progress',
    priority: 'normal',
    terminalId: 'terminal1',
    assignedWorkerId: 'worker1',
    createdBy: 'admin1',
    approvedBy: 'supervisor1',
    startDate: '2024-12-17T09:00:00Z',
    dueDate: '2024-12-19T16:00:00Z',
    estimatedDuration: 6,
    checklist: compressorChecklistItems.map(item => ({
      ...item,
      beforeValue: item.id === 'oil_level' ? 'Low' : 
                   item.id === 'suction_pressure' ? 15 :
                   item.id === 'discharge_pressure' ? 45 :
                   item.id === 'vibration_level' ? 'Normal' :
                   item.id === 'temperature' ? 85 : undefined
    })),
    beforePhotos: [],
    afterPhotos: [],
    beforeNotes: 'Initial inspection shows oil level is low, needs topping up. All other parameters within normal range.',
    materials: [
      { itemId: 'item003', plannedQuantity: 5 }, // Compressor oil
      { itemId: 'item007', plannedQuantity: 1 }  // Oil filter
    ],
    createdAt: '2024-12-16T14:00:00Z',
    updatedAt: '2024-12-17T09:30:00Z'
  },
  {
    id: 'wo003',
    title: 'Fire & Gas Detection System Calibration',
    description: 'Quarterly calibration of all fire and gas detection sensors in the main processing area to ensure accurate readings and proper alarm functionality.',
    type: 'preventive',
    status: 'submitted_for_review',
    priority: 'high',
    terminalId: 'terminal2',
    assignedWorkerId: 'worker2',
    createdBy: 'admin2',
    approvedBy: 'supervisor1',
    startDate: '2024-12-16T08:00:00Z',
    dueDate: '2024-12-18T17:00:00Z',
    estimatedDuration: 8,
    completedAt: '2024-12-17T15:30:00Z',
    checklist: safetyChecklistItems.map(item => ({
      ...item,
      beforeValue: item.id === 'gas_detector_status' ? 'Needs Calibration' :
                   item.id === 'emergency_valve_test' ? false :
                   item.id === 'fire_suppression' ? 'Operational' :
                   item.id === 'safety_barriers' ? 'Good' : undefined,
      afterValue: item.id === 'gas_detector_status' ? 'Operational' :
                  item.id === 'emergency_valve_test' ? true :
                  item.id === 'fire_suppression' ? 'Operational' :
                  item.id === 'safety_barriers' ? 'Good' : undefined
    })),
    beforePhotos: [],
    afterPhotos: [],
    beforeNotes: 'Gas detectors showing calibration required. Emergency valve needs testing. Fire suppression system operational.',
    afterNotes: 'All gas detectors successfully calibrated and tested. Emergency valve test completed successfully. All safety systems operational.',
    materials: [
      { itemId: 'item002', plannedQuantity: 4, actualQuantity: 4 }, // Gas detector sensors
      { itemId: 'item004', plannedQuantity: 2, actualQuantity: 2 }  // Safety equipment
    ],
    createdAt: '2024-12-15T11:00:00Z',
    updatedAt: '2024-12-17T15:30:00Z'
  },
  {
    id: 'wo004',
    title: 'Emergency Gas Leak Repair - Pipeline Section B7',
    description: 'URGENT: Gas leak detected in pipeline section B7. Immediate repair required to ensure safety compliance and prevent environmental hazards.',
    type: 'corrective',
    subType: 'incidental',
    status: 'pending_approval',
    priority: 'urgent',
    terminalId: 'terminal1',
    createdBy: 'admin1',
    startDate: '2024-12-18T06:00:00Z',
    dueDate: '2024-12-18T18:00:00Z',
    estimatedDuration: 12,
    checklist: [
      {
        id: 'leak_location',
        label: 'Leak Location Identified',
        type: 'yes_no',
        required: true
      },
      {
        id: 'isolation_complete',
        label: 'Pipeline Section Isolated',
        type: 'yes_no',
        required: true
      },
      {
        id: 'repair_method',
        label: 'Repair Method Used',
        type: 'dropdown',
        required: true,
        options: ['Gasket Replacement', 'Pipe Clamp', 'Pipe Section Replacement', 'Welding Repair']
      },
      {
        id: 'pressure_test_post',
        label: 'Post-Repair Pressure Test (PSI)',
        type: 'number',
        required: true,
        unit: 'PSI',
        minValue: 0,
        maxValue: 100
      }
    ],
    beforePhotos: [],
    afterPhotos: [],
    materials: [
      { itemId: 'item001', plannedQuantity: 4 }, // Pipeline gaskets
      { itemId: 'item006', plannedQuantity: 1 }, // Pipe clamp
      { itemId: 'item008', plannedQuantity: 1 }  // Emergency repair kit
    ],
    createdAt: '2024-12-18T05:30:00Z',
    updatedAt: '2024-12-18T05:30:00Z'
  },
  {
    id: 'wo005',
    title: 'Pump Station P3 Routine Maintenance',
    description: 'Weekly routine maintenance of pump station P3 including lubrication, filter replacement, and performance check.',
    type: 'preventive',
    status: 'completed',
    priority: 'normal',
    terminalId: 'terminal2',
    assignedWorkerId: 'worker2',
    createdBy: 'admin2',
    approvedBy: 'supervisor1',
    startDate: '2024-12-15T10:00:00Z',
    dueDate: '2024-12-16T15:00:00Z',
    estimatedDuration: 3,
    completedAt: '2024-12-16T13:00:00Z',
    checklist: [
      {
        id: 'pump_pressure',
        label: 'Pump Pressure (PSI)',
        type: 'number',
        required: true,
        unit: 'PSI',
        beforeValue: 32,
        afterValue: 35
      },
      {
        id: 'flow_rate',
        label: 'Flow Rate (L/min)',
        type: 'number',
        required: true,
        unit: 'L/min',
        beforeValue: 150,
        afterValue: 165
      },
      {
        id: 'filter_condition',
        label: 'Filter Condition',
        type: 'dropdown',
        required: true,
        options: ['Clean', 'Dirty', 'Needs Replacement'],
        beforeValue: 'Dirty',
        afterValue: 'Clean'
      }
    ],
    beforePhotos: [],
    afterPhotos: [],
    beforeNotes: 'Pump showing reduced pressure and flow rate. Filter appears dirty.',
    afterNotes: 'Filter replaced, lubrication completed. Pump performance restored to normal levels.',
    materials: [
      { itemId: 'item007', plannedQuantity: 1, actualQuantity: 1 }, // Oil filter
      { itemId: 'item009', plannedQuantity: 2, actualQuantity: 2 }  // Pump seals
    ],
    createdAt: '2024-12-14T09:00:00Z',
    updatedAt: '2024-12-16T13:00:00Z'
  },
  {
    id: 'wo006',
    title: 'Tank T5 Inspection and Cleaning',
    description: 'Quarterly inspection and cleaning of storage tank T5 including internal inspection, cleaning, and coating assessment.',
    type: 'preventive',
    status: 'draft',
    priority: 'normal',
    terminalId: 'terminal3',
    createdBy: 'admin3',
    startDate: '2024-12-20T08:00:00Z',
    dueDate: '2024-12-22T17:00:00Z',
    estimatedDuration: 16,
    checklist: [
      {
        id: 'tank_isolation',
        label: 'Tank Properly Isolated',
        type: 'yes_no',
        required: true
      },
      {
        id: 'internal_cleaning',
        label: 'Internal Cleaning Complete',
        type: 'yes_no',
        required: true
      },
      {
        id: 'coating_condition',
        label: 'Internal Coating Condition',
        type: 'dropdown',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Replacement']
      },
      {
        id: 'inspection_findings',
        label: 'Inspection Findings',
        type: 'text',
        required: false
      }
    ],
    beforePhotos: [],
    afterPhotos: [],
    materials: [
      { itemId: 'item010', plannedQuantity: 10 }, // Cleaning chemicals
      { itemId: 'item004', plannedQuantity: 1 }   // Safety equipment
    ],
    createdAt: '2024-12-17T16:00:00Z',
    updatedAt: '2024-12-17T16:00:00Z'
  },
  {
    id: 'wo007',
    title: 'Pipeline Valve Maintenance - Section A3',
    description: 'Routine maintenance of pipeline valves in section A3, including lubrication, seal inspection, and operational testing.',
    type: 'preventive',
    status: 'in_progress',
    priority: 'normal',
    terminalId: 'terminal1',
    assignedWorkerId: 'worker1',
    createdBy: 'admin1',
    approvedBy: 'supervisor1',
    startDate: '2024-12-18T10:00:00Z',
    dueDate: '2024-12-20T15:00:00Z',
    estimatedDuration: 4,
    checklist: [
      {
        id: 'valve_pressure_before',
        label: 'Valve Inlet Pressure (PSI)',
        type: 'number',
        required: true,
        unit: 'PSI',
        minValue: 0,
        maxValue: 100,
        beforeValue: 32
      },
      {
        id: 'valve_operation',
        label: 'Valve Operation Test',
        type: 'yes_no',
        required: true,
        beforeValue: false
      },
      {
        id: 'seal_condition',
        label: 'Seal Condition',
        type: 'dropdown',
        required: true,
        options: ['Good', 'Fair', 'Poor', 'Replaced'],
        beforeValue: 'Poor'
      },
      {
        id: 'lubrication_status',
        label: 'Lubrication Applied',
        type: 'yes_no',
        required: true,
        beforeValue: false
      }
    ],
    beforePhotos: [],
    afterPhotos: [],
    beforeNotes: 'Valve shows signs of wear, seal appears damaged and needs replacement. Lubrication required.',
    materials: [
      { itemId: 'item001', plannedQuantity: 2 }, // Pipeline gaskets  
      { itemId: 'item009', plannedQuantity: 1 }  // Pump seals (valve seals)
    ],
    createdAt: '2024-12-18T08:00:00Z',
    updatedAt: '2024-12-18T10:30:00Z'
  }
];