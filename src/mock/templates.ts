// Mock Data for Work Order Templates

import type { 
  WorkOrderTemplate, 
  SOPStep, 
  ChecklistItemTemplate, 
  MaterialRequirementTemplate,
  RecurrencePattern 
} from '@/types/templates';

// Common SOP Steps for different maintenance types
const pressureTestSteps: Omit<SOPStep, 'id'>[] = [
  {
    stepNumber: 1,
    title: 'Isolate Pipeline Section',
    description: 'Close all relevant valves to isolate the pipeline section to be tested. Verify isolation is complete.',
    estimatedDuration: 30,
    isRequired: true,
    safetyNotes: ['Verify zero energy state', 'Use lockout/tagout procedures'],
    requiredTools: ['Valve keys', 'LOTO devices']
  },
  {
    stepNumber: 2,
    title: 'Install Test Equipment',
    description: 'Connect pressure testing equipment including gauge, pump, and safety relief valve.',
    estimatedDuration: 45,
    isRequired: true,
    safetyNotes: ['Ensure equipment ratings exceed test pressure', 'Check equipment calibration'],
    requiredTools: ['Pressure gauge', 'Test pump', 'Relief valve']
  },
  {
    stepNumber: 3,
    title: 'Pressurize to Test Pressure',
    description: 'Gradually increase pressure to specified test pressure. Monitor for any unusual sounds or movements.',
    estimatedDuration: 60,
    isRequired: true,
    safetyNotes: ['Maintain safe distance during pressurization', 'Have emergency procedures ready'],
    requiredTools: ['Pressure pump', 'Pressure monitoring equipment']
  },
  {
    stepNumber: 4,
    title: 'Hold Pressure and Inspect',
    description: 'Maintain test pressure for required duration. Conduct visual inspection for leaks or deformation.',
    estimatedDuration: 120,
    isRequired: true,
    safetyNotes: ['Do not approach pressurized equipment unnecessarily'],
    requiredTools: ['Leak detection equipment', 'Visual inspection tools']
  },
  {
    stepNumber: 5,
    title: 'Depressurize and Document',
    description: 'Safely depressurize the system and document all findings. Remove test equipment.',
    estimatedDuration: 30,
    isRequired: true,
    safetyNotes: ['Controlled depressurization only', 'Verify complete depressurization'],
    requiredTools: ['Documentation forms', 'Measuring equipment']
  }
];

const compressorInspectionSteps: Omit<SOPStep, 'id'>[] = [
  {
    stepNumber: 1,
    title: 'Pre-Inspection Safety Check',
    description: 'Verify compressor is shut down and properly isolated. Check for any safety hazards.',
    estimatedDuration: 15,
    isRequired: true,
    safetyNotes: ['Confirm zero energy state', 'Check for gas leaks', 'PPE required'],
    requiredTools: ['Gas detector', 'PPE', 'LOTO devices']
  },
  {
    stepNumber: 2,
    title: 'Visual Inspection',
    description: 'Conduct thorough visual inspection of compressor exterior, connections, and surrounding area.',
    estimatedDuration: 30,
    isRequired: true,
    safetyNotes: ['Look for signs of leaks, corrosion, or damage'],
    requiredTools: ['Flashlight', 'Inspection mirror', 'Camera for documentation']
  },
  {
    stepNumber: 3,
    title: 'Lubrication System Check',
    description: 'Check oil levels, oil condition, and lubrication system operation. Change oil if required.',
    estimatedDuration: 45,
    isRequired: true,
    safetyNotes: ['Handle oil properly', 'Use appropriate disposal methods'],
    requiredTools: ['Oil level gauge', 'Oil sample containers', 'New oil if needed']
  },
  {
    stepNumber: 4,
    title: 'Performance Parameter Check',
    description: 'Record all operational parameters including pressures, temperatures, and vibration levels.',
    estimatedDuration: 30,
    isRequired: true,
    safetyNotes: ['Use calibrated instruments only'],
    requiredTools: ['Pressure gauges', 'Temperature sensors', 'Vibration analyzer']
  },
  {
    stepNumber: 5,
    title: 'Filter Replacement',
    description: 'Inspect and replace air intake filters and oil filters as needed.',
    estimatedDuration: 20,
    isRequired: false,
    safetyNotes: ['Dispose of filters properly'],
    requiredTools: ['New filters', 'Filter tools']
  }
];

// Common Checklist Templates
const pressureTestChecklist: Omit<ChecklistItemTemplate, 'id'>[] = [
  {
    label: 'Test Pressure (PSI)',
    type: 'number',
    required: true,
    unit: 'PSI',
    minValue: 0,
    maxValue: 1000,
    helpText: 'Record the actual test pressure achieved'
  },
  {
    label: 'Pressure Hold Duration (minutes)',
    type: 'number',
    required: true,
    unit: 'minutes',
    minValue: 1,
    maxValue: 480,
    helpText: 'Duration pressure was maintained'
  },
  {
    label: 'Visual Leak Detection',
    type: 'yes_no',
    required: true,
    helpText: 'Any visible leaks detected during test?'
  },
  {
    label: 'Pressure Drop (%)',
    type: 'number',
    required: true,
    unit: '%',
    minValue: 0,
    maxValue: 100,
    helpText: 'Percentage pressure drop during test period'
  },
  {
    label: 'Test Result',
    type: 'dropdown',
    required: true,
    options: ['Pass', 'Fail', 'Needs Retest'],
    helpText: 'Overall test result'
  }
];

const compressorInspectionChecklist: Omit<ChecklistItemTemplate, 'id'>[] = [
  {
    label: 'Suction Pressure (PSI)',
    type: 'number',
    required: true,
    unit: 'PSI',
    minValue: 0,
    maxValue: 100,
    helpText: 'Compressor suction pressure reading'
  },
  {
    label: 'Discharge Pressure (PSI)',
    type: 'number',
    required: true,
    unit: 'PSI',
    minValue: 0,
    maxValue: 500,
    helpText: 'Compressor discharge pressure reading'
  },
  {
    label: 'Oil Level',
    type: 'dropdown',
    required: true,
    options: ['Low', 'Normal', 'High', 'Overfilled'],
    helpText: 'Current oil level in sight glass'
  },
  {
    label: 'Oil Condition',
    type: 'dropdown',
    required: true,
    options: ['Clean', 'Slightly Dirty', 'Dirty', 'Contaminated'],
    helpText: 'Visual assessment of oil condition'
  },
  {
    label: 'Vibration Level',
    type: 'dropdown',
    required: true,
    options: ['Normal', 'Slightly Elevated', 'High', 'Excessive'],
    helpText: 'Overall vibration assessment'
  },
  {
    label: 'Operating Temperature (°C)',
    type: 'number',
    required: true,
    unit: '°C',
    minValue: -10,
    maxValue: 150,
    helpText: 'Main bearing or cylinder temperature'
  },
  {
    label: 'Unusual Noises',
    type: 'yes_no',
    required: true,
    helpText: 'Any unusual noises detected?'
  }
];

// Common Material Templates
const pipelineMaterials: MaterialRequirementTemplate[] = [
  {
    itemId: 'item001',
    itemName: 'Pipeline Gaskets',
    plannedQuantity: 4,
    isOptional: false,
    notes: 'Standard pressure-rated gaskets'
  },
  {
    itemId: 'item002',
    itemName: 'Gas Detector Sensors',
    plannedQuantity: 2,
    isOptional: true,
    notes: 'Calibration gas if needed'
  },
  {
    itemId: 'item005',
    itemName: 'Pressure Gauge',
    plannedQuantity: 1,
    isOptional: false,
    notes: 'Calibrated test gauge'
  }
];

const compressorMaterials: MaterialRequirementTemplate[] = [
  {
    itemId: 'item003',
    itemName: 'Compressor Oil',
    plannedQuantity: 10,
    isOptional: false,
    notes: 'Manufacturer specified grade'
  },
  {
    itemId: 'item007',
    itemName: 'Oil Filter',
    plannedQuantity: 2,
    isOptional: false,
    notes: 'OEM filter element'
  },
  {
    itemId: 'item011',
    itemName: 'Air Filter',
    plannedQuantity: 1,
    isOptional: true,
    notes: 'Replace if dirty or damaged'
  }
];

// Recurrence Patterns
const monthlyPattern: RecurrencePattern = {
  type: 'monthly',
  interval: 1,
  dayOfMonth: 15
};

const quarterlyPattern: RecurrencePattern = {
  type: 'quarterly',
  interval: 1,
  dayOfMonth: 1
};

// Work Order Templates
export const mockTemplates: WorkOrderTemplate[] = [
  // Pipeline Templates
  {
    id: 'template-pipeline-pressure-test',
    name: 'Pipeline Pressure Test',
    description: 'Standard operating procedure for pipeline pressure testing to verify integrity and leak detection.',
    categoryId: 'cat-pipeline-gas-transmission',
    type: 'preventive',
    defaultPriority: 'high',
    estimatedDuration: 5.5,
    sopSteps: pressureTestSteps.map((step, index) => ({
      ...step,
      id: `sop-pressure-${index + 1}`
    })),
    safetyRequirements: [
      'Confined space entry permit if required',
      'Gas detection equipment mandatory',
      'Fire watch standby',
      'Emergency response plan activated'
    ],
    prerequisites: [
      'Pipeline operational history review',
      'Weather conditions suitable',
      'All permits obtained',
      'Test equipment calibrated within 12 months'
    ],
    checklist: pressureTestChecklist.map((item, index) => ({
      ...item,
      id: `checklist-pressure-${index + 1}`
    })),
    materials: pipelineMaterials,
    requiredSkills: ['Pipeline Testing Certification', 'Pressure Systems'],
    requiredCertifications: ['Confined Space', 'Gas Detection'],
    isRecurring: true,
    recurrencePattern: quarterlyPattern,
    version: '2.1',
    approvedBy: 'supervisor1',
    approvedAt: '2024-02-01T10:00:00Z',
    isActive: true,
    tags: ['pressure', 'testing', 'safety', 'pipeline'],
    usageCount: 23,
    lastUsedAt: '2024-12-15T14:30:00Z',
    createdBy: 'admin1',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },

  {
    id: 'template-valve-maintenance',
    name: 'Pipeline Valve Routine Maintenance',
    description: 'Preventive maintenance for pipeline isolation and control valves including lubrication and operation testing.',
    categoryId: 'cat-pipeline-valves',
    type: 'preventive',
    defaultPriority: 'normal',
    estimatedDuration: 3,
    sopSteps: [
      {
        id: 'sop-valve-1',
        stepNumber: 1,
        title: 'Valve Isolation and Safety',
        description: 'Isolate valve from system pressure and verify safe working conditions.',
        estimatedDuration: 15,
        isRequired: true,
        safetyNotes: ['Verify valve is not under pressure', 'Use proper LOTO procedures'],
        requiredTools: ['Valve keys', 'Pressure gauge', 'LOTO kit']
      },
      {
        id: 'sop-valve-2',
        stepNumber: 2,
        title: 'Visual Inspection',
        description: 'Inspect valve body, stem, actuator, and mounting for damage or wear.',
        estimatedDuration: 20,
        isRequired: true,
        safetyNotes: ['Check for gas leaks before handling'],
        requiredTools: ['Flashlight', 'Gas detector']
      },
      {
        id: 'sop-valve-3',
        stepNumber: 3,
        title: 'Lubrication Service',
        description: 'Apply appropriate lubricant to valve stem and operating mechanism.',
        estimatedDuration: 15,
        isRequired: true,
        safetyNotes: ['Use approved lubricants only'],
        requiredTools: ['Grease gun', 'Valve lubricant']
      },
      {
        id: 'sop-valve-4',
        stepNumber: 4,
        title: 'Operation Test',
        description: 'Cycle valve through full range of motion and verify smooth operation.',
        estimatedDuration: 10,
        isRequired: true,
        safetyNotes: ['Do not force valve operation'],
        requiredTools: ['Operating handle', 'Stroke counter']
      }
    ],
    safetyRequirements: [
      'Gas detection equipment',
      'Proper valve isolation',
      'Personal protective equipment'
    ],
    prerequisites: [
      'Valve operational status confirmed',
      'System isolation possible',
      'Lubricants available'
    ],
    checklist: [
      {
        id: 'checklist-valve-1',
        label: 'Valve Inlet Pressure (PSI)',
        type: 'number',
        required: true,
        unit: 'PSI',
        minValue: 0,
        maxValue: 1000
      },
      {
        id: 'checklist-valve-2',
        label: 'Valve Operation Test',
        type: 'dropdown',
        required: true,
        options: ['Smooth', 'Slight Binding', 'Difficult', 'Seized']
      },
      {
        id: 'checklist-valve-3',
        label: 'Seal Condition',
        type: 'dropdown',
        required: true,
        options: ['Good', 'Fair', 'Poor', 'Needs Replacement']
      },
      {
        id: 'checklist-valve-4',
        label: 'Lubrication Applied',
        type: 'yes_no',
        required: true
      },
      {
        id: 'checklist-valve-5',
        label: 'Gas Leakage Detected',
        type: 'yes_no',
        required: true
      }
    ],
    materials: [
      {
        itemId: 'item001',
        itemName: 'Pipeline Gaskets',
        plannedQuantity: 2,
        isOptional: true,
        notes: 'For seal replacement if needed'
      },
      {
        itemId: 'item012',
        itemName: 'Valve Lubricant',
        plannedQuantity: 1,
        isOptional: false,
        notes: 'High-pressure valve grease'
      }
    ],
    requiredSkills: ['Valve Maintenance', 'Mechanical Systems'],
    requiredCertifications: [],
    isRecurring: true,
    recurrencePattern: monthlyPattern,
    version: '1.3',
    approvedBy: 'supervisor1',
    approvedAt: '2024-01-25T11:00:00Z',
    isActive: true,
    tags: ['valve', 'maintenance', 'lubrication', 'preventive'],
    usageCount: 45,
    lastUsedAt: '2024-12-18T10:15:00Z',
    createdBy: 'admin1',
    createdAt: '2024-01-22T08:30:00Z',
    updatedAt: '2024-01-25T11:00:00Z'
  },

  // Compressor Templates
  {
    id: 'template-compressor-monthly-inspection',
    name: 'Gas Compressor Monthly Inspection',
    description: 'Comprehensive monthly inspection of gas compressor units including lubrication system, performance parameters, and safety systems.',
    categoryId: 'cat-compressor-gas-centrifugal',
    type: 'preventive',
    defaultPriority: 'normal',
    estimatedDuration: 6,
    sopSteps: compressorInspectionSteps.map((step, index) => ({
      ...step,
      id: `sop-compressor-${index + 1}`
    })),
    safetyRequirements: [
      'Compressor shutdown and lockout',
      'Gas detection continuous monitoring',
      'Fire watch if hot work required',
      'Respiratory protection if needed'
    ],
    prerequisites: [
      'Compressor operational data review',
      'Spare parts availability check',
      'Lubrication oil inventory',
      'Calibrated instruments available'
    ],
    checklist: compressorInspectionChecklist.map((item, index) => ({
      ...item,
      id: `checklist-compressor-${index + 1}`
    })),
    materials: compressorMaterials,
    requiredSkills: ['Compressor Systems', 'Rotating Equipment', 'Lubrication Systems'],
    requiredCertifications: ['Rotating Equipment', 'Confined Space'],
    isRecurring: true,
    recurrencePattern: monthlyPattern,
    version: '3.0',
    approvedBy: 'supervisor1',
    approvedAt: '2024-02-15T13:00:00Z',
    isActive: true,
    tags: ['compressor', 'inspection', 'monthly', 'lubrication'],
    usageCount: 12,
    lastUsedAt: '2024-12-17T09:30:00Z',
    createdBy: 'admin2',
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-02-15T13:00:00Z'
  },

  // Safety System Templates
  {
    id: 'template-fire-gas-calibration',
    name: 'Fire & Gas Detection System Calibration',
    description: 'Quarterly calibration and functional testing of fire and gas detection sensors and alarm systems.',
    categoryId: 'cat-safety-fire-gas',
    type: 'preventive',
    defaultPriority: 'high',
    estimatedDuration: 8,
    sopSteps: [
      {
        id: 'sop-firegas-1',
        stepNumber: 1,
        title: 'System Preparation',
        description: 'Notify control room and prepare calibration equipment. Verify bypass procedures.',
        estimatedDuration: 30,
        isRequired: true,
        safetyNotes: ['Coordinate with operations', 'Ensure backup detection active'],
        requiredTools: ['Calibration gas', 'Gas analyzer', 'Communication radio']
      },
      {
        id: 'sop-firegas-2',
        stepNumber: 2,
        title: 'Gas Detector Calibration',
        description: 'Calibrate each gas detector with known concentration calibration gas.',
        estimatedDuration: 180,
        isRequired: true,
        safetyNotes: ['Use only certified calibration gas', 'Monitor wind direction'],
        requiredTools: ['Calibration gas kit', 'Flow regulator', 'Calibration hood']
      },
      {
        id: 'sop-firegas-3',
        stepNumber: 3,
        title: 'Fire Detector Testing',
        description: 'Test fire detection devices using appropriate test equipment.',
        estimatedDuration: 120,
        isRequired: true,
        safetyNotes: ['Do not use open flame', 'Use test equipment only'],
        requiredTools: ['Heat gun', 'Smoke test equipment', 'Beam test kit']
      },
      {
        id: 'sop-firegas-4',
        stepNumber: 4,
        title: 'Alarm System Verification',
        description: 'Verify alarm annunciation and automatic shutdown sequences.',
        estimatedDuration: 60,
        isRequired: true,
        safetyNotes: ['Coordinate with control room', 'Test in bypass mode'],
        requiredTools: ['System documentation', 'Alarm test panel']
      },
      {
        id: 'sop-firegas-5',
        stepNumber: 5,
        title: 'Documentation and Return to Service',
        description: 'Document all test results and return system to normal operation.',
        estimatedDuration: 30,
        isRequired: true,
        safetyNotes: ['Verify all bypasses removed'],
        requiredTools: ['Test forms', 'Documentation system']
      }
    ],
    safetyRequirements: [
      'Hot work permit if required',
      'Control room coordination mandatory',
      'Backup detection systems active',
      'Emergency response team notification'
    ],
    prerequisites: [
      'Calibration gas inventory verification',
      'Test equipment calibration current',
      'Operations coordination complete',
      'Weather conditions suitable'
    ],
    checklist: [
      {
        id: 'checklist-firegas-1',
        label: 'Gas Detector Calibration Status',
        type: 'dropdown',
        required: true,
        options: ['Pass', 'Fail', 'Out of Range', 'Needs Adjustment']
      },
      {
        id: 'checklist-firegas-2',
        label: 'Fire Detector Response Test',
        type: 'dropdown',
        required: true,
        options: ['Pass', 'Fail', 'Slow Response', 'No Response']
      },
      {
        id: 'checklist-firegas-3',
        label: 'Alarm Response Time (seconds)',
        type: 'number',
        required: true,
        unit: 'seconds',
        minValue: 0,
        maxValue: 300
      },
      {
        id: 'checklist-firegas-4',
        label: 'Auto-Shutdown Test',
        type: 'yes_no',
        required: true
      },
      {
        id: 'checklist-firegas-5',
        label: 'Communication Test',
        type: 'dropdown',
        required: true,
        options: ['Good', 'Intermittent', 'Poor', 'Failed']
      }
    ],
    materials: [
      {
        itemId: 'item002',
        itemName: 'Gas Detector Sensors',
        plannedQuantity: 5,
        isOptional: true,
        notes: 'Replacement sensors if needed'
      },
      {
        itemId: 'item013',
        itemName: 'Calibration Gas',
        plannedQuantity: 3,
        isOptional: false,
        notes: 'Multi-gas calibration standard'
      },
      {
        itemId: 'item004',
        itemName: 'Safety Equipment',
        plannedQuantity: 1,
        isOptional: false,
        notes: 'Test equipment and PPE'
      }
    ],
    requiredSkills: ['Fire & Gas Systems', 'Instrumentation', 'Safety Systems'],
    requiredCertifications: ['Gas Detection Systems', 'Fire Safety'],
    isRecurring: true,
    recurrencePattern: quarterlyPattern,
    version: '2.5',
    approvedBy: 'supervisor1',
    approvedAt: '2024-03-01T09:00:00Z',
    isActive: true,
    tags: ['fire detection', 'gas detection', 'calibration', 'safety'],
    usageCount: 8,
    lastUsedAt: '2024-12-16T08:00:00Z',
    createdBy: 'admin1',
    createdAt: '2024-02-25T10:00:00Z',
    updatedAt: '2024-03-01T09:00:00Z'
  },

  // Storage System Template
  {
    id: 'template-tank-inspection',
    name: 'Storage Tank Annual Inspection',
    description: 'Comprehensive annual inspection of storage tanks including internal and external examination.',
    categoryId: 'cat-storage-tanks',
    type: 'preventive',
    defaultPriority: 'high',
    estimatedDuration: 16,
    sopSteps: [
      {
        id: 'sop-tank-1',
        stepNumber: 1,
        title: 'Tank Preparation and Isolation',
        description: 'Isolate tank from service, drain contents, and prepare for entry.',
        estimatedDuration: 240,
        isRequired: true,
        safetyNotes: ['Confined space entry procedures', 'Gas testing required', 'Hot work permits'],
        requiredTools: ['Isolation blanks', 'Drain equipment', 'Gas testing equipment']
      },
      {
        id: 'sop-tank-2',
        stepNumber: 2,
        title: 'External Visual Inspection',
        description: 'Inspect tank exterior, foundation, and support structures.',
        estimatedDuration: 120,
        isRequired: true,
        safetyNotes: ['Fall protection if working at height'],
        requiredTools: ['Inspection ladders', 'Camera', 'Measuring tools']
      },
      {
        id: 'sop-tank-3',
        stepNumber: 3,
        title: 'Internal Inspection',
        description: 'Enter tank and conduct thorough internal inspection of walls, floor, and roof.',
        estimatedDuration: 300,
        isRequired: true,
        safetyNotes: ['Confined space entry permit', 'Continuous gas monitoring', 'Rescue team standby'],
        requiredTools: ['Portable lighting', 'Gas monitors', 'Inspection tools']
      },
      {
        id: 'sop-tank-4',
        stepNumber: 4,
        title: 'Thickness Testing',
        description: 'Perform ultrasonic thickness testing on tank walls and floor.',
        estimatedDuration: 180,
        isRequired: true,
        safetyNotes: ['Calibrated equipment only'],
        requiredTools: ['UT thickness gauge', 'Reference standards', 'Data logger']
      }
    ],
    safetyRequirements: [
      'Confined space entry permit',
      'Hot work permit if required',
      'Continuous gas monitoring',
      'Emergency response team on standby',
      'Fall protection systems'
    ],
    prerequisites: [
      'Tank out of service authorization',
      'Product removal complete',
      'Tank cleaning completed',
      'All permits obtained'
    ],
    checklist: [
      {
        id: 'checklist-tank-1',
        label: 'Tank Isolation Complete',
        type: 'yes_no',
        required: true
      },
      {
        id: 'checklist-tank-2',
        label: 'Gas Testing Results',
        type: 'dropdown',
        required: true,
        options: ['Safe', 'Marginal', 'Unsafe', 'Needs Ventilation']
      },
      {
        id: 'checklist-tank-3',
        label: 'External Corrosion Rating',
        type: 'dropdown',
        required: true,
        options: ['None', 'Light', 'Moderate', 'Severe']
      },
      {
        id: 'checklist-tank-4',
        label: 'Internal Coating Condition',
        type: 'dropdown',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Failed']
      },
      {
        id: 'checklist-tank-5',
        label: 'Minimum Wall Thickness (mm)',
        type: 'number',
        required: true,
        unit: 'mm',
        minValue: 0,
        maxValue: 50
      }
    ],
    materials: [
      {
        itemId: 'item010',
        itemName: 'Cleaning Chemicals',
        plannedQuantity: 20,
        isOptional: false,
        notes: 'Tank cleaning solutions'
      },
      {
        itemId: 'item004',
        itemName: 'Safety Equipment',
        plannedQuantity: 5,
        isOptional: false,
        notes: 'Confined space entry equipment'
      },
      {
        itemId: 'item014',
        itemName: 'Inspection Materials',
        plannedQuantity: 1,
        isOptional: false,
        notes: 'Testing and documentation supplies'
      }
    ],
    requiredSkills: ['Tank Inspection', 'Confined Space Entry', 'NDT Testing'],
    requiredCertifications: ['Confined Space', 'UT Testing Level 2', 'Tank Inspector'],
    isRecurring: true,
    recurrencePattern: {
      type: 'annually',
      interval: 1,
      monthOfYear: 6
    },
    version: '1.8',
    approvedBy: 'supervisor2',
    approvedAt: '2024-03-10T15:00:00Z',
    isActive: true,
    tags: ['tank', 'inspection', 'confined space', 'annual'],
    usageCount: 3,
    lastUsedAt: '2024-06-15T07:00:00Z',
    createdBy: 'admin3',
    createdAt: '2024-03-05T12:00:00Z',
    updatedAt: '2024-03-10T15:00:00Z'
  },

  // Electrical System Template
  {
    id: 'template-electrical-inspection',
    name: 'Electrical System Quarterly Inspection',
    description: 'Quarterly inspection of electrical panels, wiring, and instrumentation systems.',
    categoryId: 'cat-electrical-power',
    type: 'preventive',
    defaultPriority: 'normal',
    estimatedDuration: 4,
    sopSteps: [
      {
        id: 'sop-electrical-1',
        stepNumber: 1,
        title: 'Electrical Safety Isolation',
        description: 'De-energize electrical systems and apply lockout/tagout procedures.',
        estimatedDuration: 30,
        isRequired: true,
        safetyNotes: ['Verify zero energy state', 'Test before touching', 'Use proper PPE'],
        requiredTools: ['Multimeter', 'LOTO devices', 'Voltage tester']
      },
      {
        id: 'sop-electrical-2',
        stepNumber: 2,
        title: 'Panel and Enclosure Inspection',
        description: 'Inspect electrical panels, enclosures, and junction boxes.',
        estimatedDuration: 90,
        isRequired: true,
        safetyNotes: ['Check for proper grounding'],
        requiredTools: ['Flashlight', 'Camera', 'Torque wrench']
      },
      {
        id: 'sop-electrical-3',
        stepNumber: 3,
        title: 'Connection Inspection and Tightening',
        description: 'Check all electrical connections and tighten to specified torque.',
        estimatedDuration: 120,
        isRequired: true,
        safetyNotes: ['Use calibrated torque tools'],
        requiredTools: ['Torque wrench', 'Connection specifications', 'Wire markers']
      },
      {
        id: 'sop-electrical-4',
        stepNumber: 4,
        title: 'Insulation and Continuity Testing',
        description: 'Perform insulation resistance and continuity testing.',
        estimatedDuration: 90,
        isRequired: true,
        safetyNotes: ['High voltage testing precautions'],
        requiredTools: ['Megohmmeter', 'Continuity tester', 'Test leads']
      }
    ],
    safetyRequirements: [
      'Electrical safety training',
      'Arc flash protection',
      'Electrical lockout/tagout',
      'Qualified electrical personnel only'
    ],
    prerequisites: [
      'Electrical drawings available',
      'Test equipment calibrated',
      'Coordination with operations',
      'Backup power arrangements if needed'
    ],
    checklist: [
      {
        id: 'checklist-electrical-1',
        label: 'Panel Condition',
        type: 'dropdown',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Needs Attention']
      },
      {
        id: 'checklist-electrical-2',
        label: 'Connection Torque Check',
        type: 'yes_no',
        required: true
      },
      {
        id: 'checklist-electrical-3',
        label: 'Insulation Resistance (MΩ)',
        type: 'number',
        required: true,
        unit: 'MΩ',
        minValue: 0,
        maxValue: 1000
      },
      {
        id: 'checklist-electrical-4',
        label: 'Ground Continuity Test',
        type: 'dropdown',
        required: true,
        options: ['Pass', 'Fail', 'Marginal']
      }
    ],
    materials: [
      {
        itemId: 'item015',
        itemName: 'Electrical Supplies',
        plannedQuantity: 1,
        isOptional: false,
        notes: 'Wire nuts, tape, markers'
      },
      {
        itemId: 'item004',
        itemName: 'Safety Equipment',
        plannedQuantity: 1,
        isOptional: false,
        notes: 'Arc flash protection'
      }
    ],
    requiredSkills: ['Electrical Systems', 'Testing Procedures', 'Safety Protocols'],
    requiredCertifications: ['Electrical Safety', 'Arc Flash Training'],
    isRecurring: true,
    recurrencePattern: quarterlyPattern,
    version: '1.2',
    approvedBy: 'supervisor2',
    approvedAt: '2024-02-20T11:00:00Z',
    isActive: true,
    tags: ['electrical', 'inspection', 'safety', 'quarterly'],
    usageCount: 6,
    lastUsedAt: '2024-12-10T13:00:00Z',
    createdBy: 'admin2',
    createdAt: '2024-02-18T09:00:00Z',
    updatedAt: '2024-02-20T11:00:00Z'
  },

  // Draft Template (not approved)
  {
    id: 'template-emergency-response-draft',
    name: 'Emergency Response Procedure (DRAFT)',
    description: 'Emergency response procedure for gas leak incidents - currently in review.',
    categoryId: 'cat-safety-emergency',
    type: 'corrective',
    subType: 'incidental',
    defaultPriority: 'urgent',
    estimatedDuration: 2,
    sopSteps: [
      {
        id: 'sop-emergency-1',
        stepNumber: 1,
        title: 'Immediate Assessment',
        description: 'Assess the situation and determine appropriate response level.',
        estimatedDuration: 5,
        isRequired: true,
        safetyNotes: ['Personal safety first', 'Call emergency services if needed'],
        requiredTools: ['Gas detector', 'Radio', 'Emergency procedures']
      }
    ],
    safetyRequirements: ['Emergency response training'],
    prerequisites: ['Emergency response team available'],
    checklist: [
      {
        id: 'checklist-emergency-1',
        label: 'Response Level',
        type: 'dropdown',
        required: true,
        options: ['Level 1', 'Level 2', 'Level 3', 'All Clear']
      }
    ],
    materials: [],
    requiredSkills: ['Emergency Response'],
    requiredCertifications: ['Emergency Response Team'],
    isRecurring: false,
    version: '0.1',
    isActive: false, // Not approved yet
    tags: ['emergency', 'response', 'draft'],
    usageCount: 0,
    createdBy: 'admin2',
    createdAt: '2024-12-10T16:00:00Z',
    updatedAt: '2024-12-10T16:00:00Z'
  }
];

// Helper function to get templates by category
export function getTemplatesByCategory(categoryId: string): WorkOrderTemplate[] {
  return mockTemplates.filter(template => template.categoryId === categoryId);
}

// Helper function to get active templates only
export function getActiveTemplates(): WorkOrderTemplate[] {
  return mockTemplates.filter(template => template.isActive);
}

// Helper function to get templates requiring approval
export function getTemplatesRequiringApproval(): WorkOrderTemplate[] {
  return mockTemplates.filter(template => !template.approvedBy && template.isActive === false);
}