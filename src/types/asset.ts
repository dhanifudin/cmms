/**
 * Asset Management Types
 *
 * Type definitions for the CMMS Asset Management module.
 */

export interface Asset {
  id: string;
  code: string;                    // Unique asset code (e.g., "GC-JKT-001")
  name: string;
  description?: string;

  // Classification
  category: AssetCategory;
  type?: string;
  criticality: AssetCriticality;

  // Location
  terminalId: string;
  regionId: string;
  location: string;                // Physical location within terminal

  // Specifications
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  specifications?: Record<string, string>;

  // Lifecycle
  status: AssetStatus;
  acquisitionDate?: string;
  warrantyExpiration?: string;
  expectedLifeYears?: number;

  // Maintenance
  lastMaintenanceDate?: string;
  nextScheduledMaintenance?: string;
  maintenanceFrequency?: MaintenanceFrequency;

  // Metrics
  mtbf?: number;                   // Mean Time Between Failures (hours)
  mttr?: number;                   // Mean Time To Repair (hours)
  totalDowntime?: number;          // Total downtime (hours)
  failureCount?: number;           // Total number of failures

  // Cost tracking
  acquisitionCost?: number;
  currentValue?: number;
  totalMaintenanceCost?: number;

  // Relationships
  parentAssetId?: string;          // For hierarchical equipment
  childAssetIds?: string[];        // Child assets
  linkedWorkOrderIds?: string[];
  linkedSparePartIds?: string[];

  // Documents
  manualUrl?: string;
  photoUrl?: string;
  qrCode?: string;

  // Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
}

export type AssetStatus =
  | 'operational'
  | 'under_maintenance'
  | 'out_of_service'
  | 'decommissioned'
  | 'pending_installation';

export type AssetCriticality = 'critical' | 'important' | 'standard' | 'low';

export type AssetCategory =
  | 'pump'
  | 'compressor'
  | 'pipeline'
  | 'valve'
  | 'tank'
  | 'generator'
  | 'electrical'
  | 'instrumentation'
  | 'safety_system'
  | 'hvac'
  | 'vehicle'
  | 'tool'
  | 'other';

export interface MaintenanceFrequency {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval?: number;
  unit?: 'days' | 'weeks' | 'months' | 'hours';
}

export interface AssetMetrics {
  mtbf: number;
  mttr: number;
  availability: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  overdueWorkOrders: number;
  totalMaintenanceCost: number;
  healthScore: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  workOrderId: string;
  type: 'preventive' | 'corrective';
  description: string;
  cost: number;
  duration: number; // hours
  completedAt: string;
  completedBy: string;
  notes?: string;
}

export interface AssetFilter {
  search?: string;
  category?: AssetCategory | null;
  status?: AssetStatus | null;
  criticality?: AssetCriticality | null;
  terminalId?: string | null;
  regionId?: string | null;
  needsMaintenance?: boolean;
}

export interface CreateAssetForm {
  code?: string;
  name: string;
  description?: string;
  category: AssetCategory;
  type?: string;
  criticality: AssetCriticality;
  terminalId: string;
  regionId: string;
  location: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  specifications?: Record<string, string>;
  status?: AssetStatus;
  acquisitionDate?: string;
  warrantyExpiration?: string;
  expectedLifeYears?: number;
  acquisitionCost?: number;
  parentAssetId?: string;
  maintenanceFrequency?: MaintenanceFrequency;
}

export interface UpdateAssetForm extends Partial<CreateAssetForm> {
  id: string;
}

// Asset category display configuration
export const ASSET_CATEGORY_CONFIG: Record<AssetCategory, {
  label: string;
  icon: string;
  color: string;
}> = {
  pump: { label: 'Pump', icon: 'Droplets', color: 'blue' },
  compressor: { label: 'Compressor', icon: 'Wind', color: 'cyan' },
  pipeline: { label: 'Pipeline', icon: 'Workflow', color: 'gray' },
  valve: { label: 'Valve', icon: 'GitBranch', color: 'green' },
  tank: { label: 'Tank', icon: 'Database', color: 'orange' },
  generator: { label: 'Generator', icon: 'Zap', color: 'yellow' },
  electrical: { label: 'Electrical', icon: 'Plug', color: 'purple' },
  instrumentation: { label: 'Instrumentation', icon: 'Gauge', color: 'indigo' },
  safety_system: { label: 'Safety System', icon: 'ShieldCheck', color: 'red' },
  hvac: { label: 'HVAC', icon: 'Thermometer', color: 'teal' },
  vehicle: { label: 'Vehicle', icon: 'Truck', color: 'slate' },
  tool: { label: 'Tool', icon: 'Wrench', color: 'amber' },
  other: { label: 'Other', icon: 'Package', color: 'gray' }
};

// Asset status display configuration
export const ASSET_STATUS_CONFIG: Record<AssetStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  operational: { label: 'Operational', color: 'text-green-700', bgColor: 'bg-green-100' },
  under_maintenance: { label: 'Under Maintenance', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  out_of_service: { label: 'Out of Service', color: 'text-red-700', bgColor: 'bg-red-100' },
  decommissioned: { label: 'Decommissioned', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  pending_installation: { label: 'Pending Installation', color: 'text-blue-700', bgColor: 'bg-blue-100' }
};

// Asset criticality display configuration
export const ASSET_CRITICALITY_CONFIG: Record<AssetCriticality, {
  label: string;
  color: string;
  priority: number;
}> = {
  critical: { label: 'Critical', color: 'text-red-600', priority: 1 },
  important: { label: 'Important', color: 'text-orange-600', priority: 2 },
  standard: { label: 'Standard', color: 'text-blue-600', priority: 3 },
  low: { label: 'Low', color: 'text-gray-600', priority: 4 }
};
