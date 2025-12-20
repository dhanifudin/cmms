// Enhanced Mock Data for Work Order Categories with Template Integration

import type { WorkOrderCategory } from '@/types/templates';

export const mockCategories: WorkOrderCategory[] = [
  // Root Categories (Level 1)
  {
    id: 'cat-pipeline',
    name: 'Pipeline Maintenance',
    description: 'All maintenance activities related to gas pipeline systems',
    code: 'PIPE_MAINT',
    level: 1,
    path: 'Pipeline Maintenance',
    templateCount: 8,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_pipeline'],
    defaultPriority: 'normal',
    defaultEstimatedDuration: 4,
    iconName: 'PipeIcon',
    color: '#3B82F6', // Blue
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    lastUsed: '2024-12-18T14:30:00Z'
  },
  {
    id: 'cat-compressor',
    name: 'Compressor & Pump Systems',
    description: 'Maintenance for compressors, pumps, and related mechanical systems',
    code: 'COMP_MAINT',
    level: 1,
    path: 'Compressor & Pump Systems',
    templateCount: 12,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_compressor'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 6,
    iconName: 'GearIcon',
    color: '#10B981', // Green
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:05:00Z',
    updatedAt: '2024-01-15T08:05:00Z',
    lastUsed: '2024-12-19T09:15:00Z'
  },
  {
    id: 'cat-safety',
    name: 'Safety Systems',
    description: 'Fire detection, gas detection, and safety equipment maintenance',
    code: 'SAFETY_MAINT',
    level: 1,
    path: 'Safety Systems',
    templateCount: 15,
    maintenanceTypes: ['preventive'],
    requiredPermissions: ['access_safety_systems'],
    defaultPriority: 'urgent',
    defaultEstimatedDuration: 3,
    iconName: 'ShieldIcon',
    color: '#EF4444', // Red
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:10:00Z',
    updatedAt: '2024-01-15T08:10:00Z',
    lastUsed: '2024-12-19T11:45:00Z'
  },
  {
    id: 'cat-storage',
    name: 'Storage & Tank Systems',
    description: 'Storage tanks, vessels, and containment system maintenance',
    code: 'STORAGE_MAINT',
    level: 1,
    path: 'Storage & Tank Systems',
    templateCount: 6,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_storage'],
    defaultPriority: 'normal',
    defaultEstimatedDuration: 5,
    iconName: 'TankIcon',
    color: '#8B5CF6', // Purple
    isActive: true,
    sortOrder: 4,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:15:00Z',
    updatedAt: '2024-01-15T08:15:00Z',
    lastUsed: '2024-12-17T16:20:00Z'
  },
  {
    id: 'cat-electrical',
    name: 'Electrical Systems',
    description: 'Electrical equipment, control systems, and instrumentation',
    code: 'ELEC_MAINT',
    level: 1,
    path: 'Electrical Systems',
    templateCount: 10,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_electrical'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 4,
    iconName: 'ZapIcon',
    color: '#F59E0B', // Yellow
    isActive: true,
    sortOrder: 5,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:20:00Z',
    updatedAt: '2024-01-15T08:20:00Z',
    lastUsed: '2024-12-19T08:30:00Z'
  },

  // Pipeline Sub-categories (Level 2)
  {
    id: 'cat-pipeline-gas',
    name: 'Gas Pipeline Systems',
    description: 'Main gas transmission and distribution pipelines',
    code: 'PIPE_GAS',
    parentId: 'cat-pipeline',
    level: 2,
    path: 'Pipeline Maintenance/Gas Pipeline Systems',
    templateCount: 5,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_pipeline', 'access_gas_systems'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 5,
    iconName: 'PipelineIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:25:00Z',
    updatedAt: '2024-01-15T08:25:00Z',
    lastUsed: '2024-12-18T16:20:00Z'
  },
  {
    id: 'cat-pipeline-valves',
    name: 'Pipeline Valves',
    description: 'Control valves, isolation valves, and valve actuators',
    code: 'PIPE_VALVES',
    parentId: 'cat-pipeline',
    level: 2,
    path: 'Pipeline Maintenance/Pipeline Valves',
    templateCount: 2,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_pipeline'],
    defaultPriority: 'normal',
    defaultEstimatedDuration: 3,
    iconName: 'ValveIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    lastUsed: '2024-12-16T10:15:00Z'
  },
  {
    id: 'cat-pipeline-fittings',
    name: 'Pipeline Fittings & Accessories',
    description: 'Flanges, joints, supports, and pipeline accessories',
    code: 'PIPE_FITTINGS',
    parentId: 'cat-pipeline',
    level: 2,
    path: 'Pipeline Maintenance/Pipeline Fittings & Accessories',
    templateCount: 1,
    maintenanceTypes: ['corrective'],
    requiredPermissions: ['access_pipeline'],
    defaultPriority: 'low',
    defaultEstimatedDuration: 2,
    iconName: 'ConnectionIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:35:00Z',
    updatedAt: '2024-01-15T08:35:00Z',
    lastUsed: '2024-12-15T14:30:00Z'
  },

  // Compressor Sub-categories (Level 2)
  {
    id: 'cat-compressor-gas',
    name: 'Gas Compressors',
    description: 'Centrifugal and reciprocating gas compressors',
    code: 'COMP_GAS',
    parentId: 'cat-compressor',
    level: 2,
    path: 'Compressor & Pump Systems/Gas Compressors',
    templateCount: 7,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_compressor', 'access_gas_systems'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 8,
    iconName: 'CompressorIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:40:00Z',
    updatedAt: '2024-01-15T08:40:00Z',
    lastUsed: '2024-12-19T08:30:00Z'
  },
  {
    id: 'cat-compressor-pumps',
    name: 'Pump Stations',
    description: 'Liquid pumps and pumping systems',
    code: 'COMP_PUMP',
    parentId: 'cat-compressor',
    level: 2,
    path: 'Compressor & Pump Systems/Pump Stations',
    templateCount: 3,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_compressor'],
    defaultPriority: 'normal',
    defaultEstimatedDuration: 4,
    iconName: 'PumpIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:45:00Z',
    updatedAt: '2024-01-15T08:45:00Z',
    lastUsed: '2024-12-18T15:45:00Z'
  },
  {
    id: 'cat-compressor-drives',
    name: 'Drive Systems',
    description: 'Motors, turbines, and drive coupling systems',
    code: 'COMP_DRIVES',
    parentId: 'cat-compressor',
    level: 2,
    path: 'Compressor & Pump Systems/Drive Systems',
    templateCount: 2,
    maintenanceTypes: ['preventive'],
    requiredPermissions: ['access_compressor'],
    defaultPriority: 'normal',
    defaultEstimatedDuration: 6,
    iconName: 'MotorIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:50:00Z',
    updatedAt: '2024-01-15T08:50:00Z',
    lastUsed: '2024-12-17T12:20:00Z'
  },

  // Safety Sub-categories (Level 2)
  {
    id: 'cat-safety-fire-gas',
    name: 'Fire & Gas Detection',
    description: 'Fire detection systems and gas leak detection equipment',
    code: 'SAFETY_FIRE_GAS',
    parentId: 'cat-safety',
    level: 2,
    path: 'Safety Systems/Fire & Gas Detection',
    templateCount: 8,
    maintenanceTypes: ['preventive'],
    requiredPermissions: ['access_safety_systems', 'access_fire_systems'],
    defaultPriority: 'urgent',
    defaultEstimatedDuration: 2,
    iconName: 'FlameIcon',
    color: '#EF4444',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:55:00Z',
    updatedAt: '2024-01-15T08:55:00Z',
    lastUsed: '2024-12-19T07:20:00Z'
  },
  {
    id: 'cat-safety-emergency',
    name: 'Emergency Systems',
    description: 'Emergency shutdown systems and safety valves',
    code: 'SAFETY_EMERGENCY',
    parentId: 'cat-safety',
    level: 2,
    path: 'Safety Systems/Emergency Systems',
    templateCount: 4,
    maintenanceTypes: ['preventive'],
    requiredPermissions: ['access_safety_systems', 'access_emergency_systems'],
    defaultPriority: 'urgent',
    defaultEstimatedDuration: 3,
    iconName: 'AlertIcon',
    color: '#EF4444',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    lastUsed: '2024-12-18T13:10:00Z'
  },
  {
    id: 'cat-safety-personal',
    name: 'Personal Safety Equipment',
    description: 'PPE, safety showers, eyewash stations',
    code: 'SAFETY_PPE',
    parentId: 'cat-safety',
    level: 2,
    path: 'Safety Systems/Personal Safety Equipment',
    templateCount: 3,
    maintenanceTypes: ['preventive'],
    requiredPermissions: ['access_safety_systems'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 1,
    iconName: 'HardHatIcon',
    color: '#EF4444',
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:05:00Z',
    updatedAt: '2024-01-15T09:05:00Z',
    lastUsed: '2024-12-17T09:30:00Z'
  },

  // Storage Sub-categories (Level 2)
  {
    id: 'cat-storage-tanks',
    name: 'Storage Tanks',
    description: 'Above-ground and underground storage tanks',
    code: 'STORAGE_TANKS',
    parentId: 'cat-storage',
    level: 2,
    path: 'Storage & Tank Systems/Storage Tanks',
    templateCount: 4,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_storage'],
    defaultPriority: 'normal',
    defaultEstimatedDuration: 6,
    iconName: 'TankStorageIcon',
    color: '#8B5CF6',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:10:00Z',
    updatedAt: '2024-01-15T09:10:00Z',
    lastUsed: '2024-12-16T14:45:00Z'
  },
  {
    id: 'cat-storage-vessels',
    name: 'Pressure Vessels',
    description: 'Pressure vessels, separators, and process vessels',
    code: 'STORAGE_VESSELS',
    parentId: 'cat-storage',
    level: 2,
    path: 'Storage & Tank Systems/Pressure Vessels',
    templateCount: 2,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_storage'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 4,
    iconName: 'VesselIcon',
    color: '#8B5CF6',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    lastUsed: '2024-12-17T16:20:00Z'
  },

  // Electrical Sub-categories (Level 2)
  {
    id: 'cat-electrical-power',
    name: 'Power Distribution',
    description: 'Switchgear, transformers, and power distribution systems',
    code: 'ELEC_POWER',
    parentId: 'cat-electrical',
    level: 2,
    path: 'Electrical Systems/Power Distribution',
    templateCount: 5,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_electrical'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 4,
    iconName: 'PowerIcon',
    color: '#F59E0B',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:20:00Z',
    updatedAt: '2024-01-15T09:20:00Z',
    lastUsed: '2024-12-18T11:25:00Z'
  },
  {
    id: 'cat-electrical-control',
    name: 'Control Systems',
    description: 'PLCs, DCS, SCADA, and process control systems',
    code: 'ELEC_CONTROL',
    parentId: 'cat-electrical',
    level: 2,
    path: 'Electrical Systems/Control Systems',
    templateCount: 3,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_electrical', 'access_control_systems'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 5,
    iconName: 'ControlIcon',
    color: '#F59E0B',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:25:00Z',
    updatedAt: '2024-01-15T09:25:00Z',
    lastUsed: '2024-12-19T08:30:00Z'
  },
  {
    id: 'cat-electrical-instrumentation',
    name: 'Instrumentation',
    description: 'Sensors, transmitters, and measurement devices',
    code: 'ELEC_INSTRUMENTS',
    parentId: 'cat-electrical',
    level: 2,
    path: 'Electrical Systems/Instrumentation',
    templateCount: 2,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_electrical'],
    defaultPriority: 'normal',
    defaultEstimatedDuration: 3,
    iconName: 'GaugeIcon',
    color: '#F59E0B',
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    lastUsed: '2024-12-17T15:40:00Z'
  },

  // Level 3 Sub-categories (Examples)
  {
    id: 'cat-pipeline-gas-transmission',
    name: 'Transmission Pipelines',
    description: 'High-pressure transmission pipeline systems',
    code: 'PIPE_GAS_TRANS',
    parentId: 'cat-pipeline-gas',
    level: 3,
    path: 'Pipeline Maintenance/Gas Pipeline Systems/Transmission Pipelines',
    templateCount: 3,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_pipeline', 'access_gas_systems', 'access_transmission'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 6,
    iconName: 'PipelineTransmissionIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:35:00Z',
    updatedAt: '2024-01-15T09:35:00Z',
    lastUsed: '2024-12-18T16:20:00Z'
  },
  {
    id: 'cat-pipeline-gas-distribution',
    name: 'Distribution Pipelines',
    description: 'Low-pressure distribution pipeline systems',
    code: 'PIPE_GAS_DIST',
    parentId: 'cat-pipeline-gas',
    level: 3,
    path: 'Pipeline Maintenance/Gas Pipeline Systems/Distribution Pipelines',
    templateCount: 2,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_pipeline', 'access_gas_systems'],
    defaultPriority: 'normal',
    defaultEstimatedDuration: 4,
    iconName: 'PipelineDistributionIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:40:00Z',
    updatedAt: '2024-01-15T09:40:00Z',
    lastUsed: '2024-12-17T13:10:00Z'
  },
  {
    id: 'cat-compressor-gas-centrifugal',
    name: 'Centrifugal Compressors',
    description: 'Centrifugal gas compressor units',
    code: 'COMP_GAS_CENT',
    parentId: 'cat-compressor-gas',
    level: 3,
    path: 'Compressor & Pump Systems/Gas Compressors/Centrifugal Compressors',
    templateCount: 4,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_compressor', 'access_gas_systems'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 10,
    iconName: 'CentrifugalIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:45:00Z',
    updatedAt: '2024-01-15T09:45:00Z',
    lastUsed: '2024-12-19T08:30:00Z'
  },
  {
    id: 'cat-compressor-gas-reciprocating',
    name: 'Reciprocating Compressors',
    description: 'Reciprocating gas compressor units',
    code: 'COMP_GAS_RECIP',
    parentId: 'cat-compressor-gas',
    level: 3,
    path: 'Compressor & Pump Systems/Gas Compressors/Reciprocating Compressors',
    templateCount: 3,
    maintenanceTypes: ['preventive', 'corrective'],
    requiredPermissions: ['access_compressor', 'access_gas_systems'],
    defaultPriority: 'high',
    defaultEstimatedDuration: 8,
    iconName: 'ReciprocatingIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:50:00Z',
    updatedAt: '2024-01-15T09:50:00Z',
    lastUsed: '2024-12-18T12:45:00Z'
  },

  // Example inactive category
  {
    id: 'cat-legacy-systems',
    name: 'Legacy Systems (Deprecated)',
    description: 'Old systems that are being phased out',
    code: 'LEGACY_SYS',
    level: 1,
    path: 'Legacy Systems (Deprecated)',
    templateCount: 0,
    maintenanceTypes: [],
    requiredPermissions: [],
    defaultPriority: 'low',
    defaultEstimatedDuration: 1,
    iconName: 'ArchiveIcon',
    color: '#6B7280', // Gray
    isActive: false,
    sortOrder: 99,
    createdBy: 'admin1',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  }
];

// Helper function to build category tree
export function buildCategoryTree(categories: WorkOrderCategory[]): WorkOrderCategory[] {
  const categoryMap = new Map<string, WorkOrderCategory>();
  const rootCategories: WorkOrderCategory[] = [];

  // Create a map for quick lookup
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Build the tree structure
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  // Sort categories by sortOrder at each level
  const sortCategories = (cats: WorkOrderCategory[]): WorkOrderCategory[] => {
    return cats
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(cat => ({
        ...cat,
        children: cat.children ? sortCategories(cat.children) : []
      }));
  };

  return sortCategories(rootCategories);
}

// Helper function to get category path
export function getCategoryPath(categoryId: string, categories: WorkOrderCategory[]): string {
  const categoryMap = new Map<string, WorkOrderCategory>();
  categories.forEach(cat => categoryMap.set(cat.id, cat));

  const buildPath = (id: string): string[] => {
    const category = categoryMap.get(id);
    if (!category) return [];
    
    const path = [category.name];
    if (category.parentId) {
      path.unshift(...buildPath(category.parentId));
    }
    return path;
  };

  return buildPath(categoryId).join(' > ');
}

// Helper function to get all descendant IDs
export function getDescendantIds(categoryId: string, categories: WorkOrderCategory[]): string[] {
  const descendants: string[] = [];
  const children = categories.filter(cat => cat.parentId === categoryId);
  
  children.forEach(child => {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(child.id, categories));
  });
  
  return descendants;
}

// Helper function to validate category hierarchy
export function validateCategoryHierarchy(
  categoryId: string, 
  newParentId: string | undefined, 
  categories: WorkOrderCategory[]
): { valid: boolean; error?: string } {
  if (!newParentId) {
    return { valid: true }; // Root category
  }

  // Check if new parent exists
  const newParent = categories.find(cat => cat.id === newParentId);
  if (!newParent) {
    return { valid: false, error: 'Parent category does not exist' };
  }

  // Check for circular reference
  const descendantIds = getDescendantIds(categoryId, categories);
  if (descendantIds.includes(newParentId)) {
    return { valid: false, error: 'Cannot move category to its own descendant' };
  }

  // Check depth limit (max 10 levels)
  let depth = 1;
  let currentParent = newParent;
  while (currentParent.parentId && depth < 10) {
    currentParent = categories.find(cat => cat.id === currentParent.parentId)!;
    depth++;
  }

  if (depth >= 10) {
    return { valid: false, error: 'Maximum hierarchy depth exceeded (10 levels)' };
  }

  return { valid: true };
}