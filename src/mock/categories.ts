// Mock Data for Work Order Categories

import type { WorkOrderCategory } from '@/types/templates';

export const mockCategories: WorkOrderCategory[] = [
  // Root Categories (Level 1)
  {
    id: 'cat-pipeline',
    name: 'Pipeline Maintenance',
    description: 'All maintenance activities related to gas pipeline systems',
    level: 1,
    iconName: 'PipeIcon',
    color: '#3B82F6', // Blue
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'cat-compressor',
    name: 'Compressor & Pump Systems',
    description: 'Maintenance for compressors, pumps, and related mechanical systems',
    level: 1,
    iconName: 'GearIcon',
    color: '#10B981', // Green
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:05:00Z',
    updatedAt: '2024-01-15T08:05:00Z'
  },
  {
    id: 'cat-safety',
    name: 'Safety Systems',
    description: 'Fire detection, gas detection, and safety equipment maintenance',
    level: 1,
    iconName: 'ShieldIcon',
    color: '#EF4444', // Red
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:10:00Z',
    updatedAt: '2024-01-15T08:10:00Z'
  },
  {
    id: 'cat-storage',
    name: 'Storage & Tank Systems',
    description: 'Storage tanks, vessels, and containment system maintenance',
    level: 1,
    iconName: 'TankIcon',
    color: '#8B5CF6', // Purple
    isActive: true,
    sortOrder: 4,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:15:00Z',
    updatedAt: '2024-01-15T08:15:00Z'
  },
  {
    id: 'cat-electrical',
    name: 'Electrical Systems',
    description: 'Electrical equipment, control systems, and instrumentation',
    level: 1,
    iconName: 'ZapIcon',
    color: '#F59E0B', // Yellow
    isActive: true,
    sortOrder: 5,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:20:00Z',
    updatedAt: '2024-01-15T08:20:00Z'
  },

  // Pipeline Sub-categories (Level 2)
  {
    id: 'cat-pipeline-gas',
    name: 'Gas Pipeline Systems',
    description: 'Main gas transmission and distribution pipelines',
    parentId: 'cat-pipeline',
    level: 2,
    iconName: 'PipelineIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:25:00Z',
    updatedAt: '2024-01-15T08:25:00Z'
  },
  {
    id: 'cat-pipeline-valves',
    name: 'Pipeline Valves',
    description: 'Control valves, isolation valves, and valve actuators',
    parentId: 'cat-pipeline',
    level: 2,
    iconName: 'ValveIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'cat-pipeline-fittings',
    name: 'Pipeline Fittings & Accessories',
    description: 'Flanges, joints, supports, and pipeline accessories',
    parentId: 'cat-pipeline',
    level: 2,
    iconName: 'ConnectionIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:35:00Z',
    updatedAt: '2024-01-15T08:35:00Z'
  },

  // Compressor Sub-categories (Level 2)
  {
    id: 'cat-compressor-gas',
    name: 'Gas Compressors',
    description: 'Centrifugal and reciprocating gas compressors',
    parentId: 'cat-compressor',
    level: 2,
    iconName: 'CompressorIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:40:00Z',
    updatedAt: '2024-01-15T08:40:00Z'
  },
  {
    id: 'cat-compressor-pumps',
    name: 'Pump Stations',
    description: 'Liquid pumps and pumping systems',
    parentId: 'cat-compressor',
    level: 2,
    iconName: 'PumpIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:45:00Z',
    updatedAt: '2024-01-15T08:45:00Z'
  },
  {
    id: 'cat-compressor-drives',
    name: 'Drive Systems',
    description: 'Motors, turbines, and drive coupling systems',
    parentId: 'cat-compressor',
    level: 2,
    iconName: 'MotorIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:50:00Z',
    updatedAt: '2024-01-15T08:50:00Z'
  },

  // Safety Sub-categories (Level 2)
  {
    id: 'cat-safety-fire-gas',
    name: 'Fire & Gas Detection',
    description: 'Fire detection systems and gas leak detection equipment',
    parentId: 'cat-safety',
    level: 2,
    iconName: 'FlameIcon',
    color: '#EF4444',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T08:55:00Z',
    updatedAt: '2024-01-15T08:55:00Z'
  },
  {
    id: 'cat-safety-emergency',
    name: 'Emergency Systems',
    description: 'Emergency shutdown systems and safety valves',
    parentId: 'cat-safety',
    level: 2,
    iconName: 'AlertIcon',
    color: '#EF4444',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'cat-safety-personal',
    name: 'Personal Safety Equipment',
    description: 'PPE, safety showers, eyewash stations',
    parentId: 'cat-safety',
    level: 2,
    iconName: 'HardHatIcon',
    color: '#EF4444',
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:05:00Z',
    updatedAt: '2024-01-15T09:05:00Z'
  },

  // Storage Sub-categories (Level 2)
  {
    id: 'cat-storage-tanks',
    name: 'Storage Tanks',
    description: 'Above-ground and underground storage tanks',
    parentId: 'cat-storage',
    level: 2,
    iconName: 'TankStorageIcon',
    color: '#8B5CF6',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:10:00Z',
    updatedAt: '2024-01-15T09:10:00Z'
  },
  {
    id: 'cat-storage-vessels',
    name: 'Pressure Vessels',
    description: 'Pressure vessels, separators, and process vessels',
    parentId: 'cat-storage',
    level: 2,
    iconName: 'VesselIcon',
    color: '#8B5CF6',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  },

  // Electrical Sub-categories (Level 2)
  {
    id: 'cat-electrical-power',
    name: 'Power Distribution',
    description: 'Switchgear, transformers, and power distribution systems',
    parentId: 'cat-electrical',
    level: 2,
    iconName: 'PowerIcon',
    color: '#F59E0B',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:20:00Z',
    updatedAt: '2024-01-15T09:20:00Z'
  },
  {
    id: 'cat-electrical-control',
    name: 'Control Systems',
    description: 'PLCs, DCS, SCADA, and process control systems',
    parentId: 'cat-electrical',
    level: 2,
    iconName: 'ControlIcon',
    color: '#F59E0B',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:25:00Z',
    updatedAt: '2024-01-15T09:25:00Z'
  },
  {
    id: 'cat-electrical-instrumentation',
    name: 'Instrumentation',
    description: 'Sensors, transmitters, and measurement devices',
    parentId: 'cat-electrical',
    level: 2,
    iconName: 'GaugeIcon',
    color: '#F59E0B',
    isActive: true,
    sortOrder: 3,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  },

  // Level 3 Sub-categories (Examples)
  {
    id: 'cat-pipeline-gas-transmission',
    name: 'Transmission Pipelines',
    description: 'High-pressure transmission pipeline systems',
    parentId: 'cat-pipeline-gas',
    level: 3,
    iconName: 'PipelineTransmissionIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:35:00Z',
    updatedAt: '2024-01-15T09:35:00Z'
  },
  {
    id: 'cat-pipeline-gas-distribution',
    name: 'Distribution Pipelines',
    description: 'Low-pressure distribution pipeline systems',
    parentId: 'cat-pipeline-gas',
    level: 3,
    iconName: 'PipelineDistributionIcon',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:40:00Z',
    updatedAt: '2024-01-15T09:40:00Z'
  },
  {
    id: 'cat-compressor-gas-centrifugal',
    name: 'Centrifugal Compressors',
    description: 'Centrifugal gas compressor units',
    parentId: 'cat-compressor-gas',
    level: 3,
    iconName: 'CentrifugalIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 1,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:45:00Z',
    updatedAt: '2024-01-15T09:45:00Z'
  },
  {
    id: 'cat-compressor-gas-reciprocating',
    name: 'Reciprocating Compressors',
    description: 'Reciprocating gas compressor units',
    parentId: 'cat-compressor-gas',
    level: 3,
    iconName: 'ReciprocatingIcon',
    color: '#10B981',
    isActive: true,
    sortOrder: 2,
    createdBy: 'admin1',
    createdAt: '2024-01-15T09:50:00Z',
    updatedAt: '2024-01-15T09:50:00Z'
  },

  // Example inactive category
  {
    id: 'cat-legacy-systems',
    name: 'Legacy Systems (Deprecated)',
    description: 'Old systems that are being phased out',
    level: 1,
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