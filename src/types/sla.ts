/**
 * SLA Management Types
 *
 * Type definitions for Service Level Agreement tracking in the CMMS.
 */

export interface SLARule {
  id: string;
  name: string;
  description?: string;

  // Scope - which work orders this SLA applies to
  scope: SLAScope;

  // Response time requirements
  responseTime: SLATimeRequirement;

  // Resolution time requirements
  resolutionTime: SLATimeRequirement;

  // Escalation rules
  escalations: SLAEscalation[];

  // Penalty configuration
  penalty?: SLAPenalty;

  // Status
  isActive: boolean;

  // Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface SLAScope {
  // Filter criteria for which work orders this SLA applies to
  priorities?: WorkOrderPriority[];
  maintenanceTypes?: ('preventive' | 'corrective')[];
  categories?: string[];
  terminalIds?: string[];
  regionIds?: string[];
  assetCriticalities?: ('critical' | 'important' | 'standard' | 'low')[];
}

export type WorkOrderPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SLATimeRequirement {
  // Time limit in hours
  hours: number;

  // Business hours only (9-5) or 24/7
  businessHoursOnly: boolean;

  // Exclude weekends
  excludeWeekends: boolean;

  // Exclude holidays
  excludeHolidays: boolean;
}

export interface SLAEscalation {
  id: string;

  // When to escalate (percentage of time remaining)
  triggerPercentage: number; // e.g., 75 = when 75% of time has passed

  // Who to notify
  notifyRoles: string[];
  notifyUserIds?: string[];

  // Notification message template
  messageTemplate?: string;

  // Level (1, 2, 3, etc.)
  level: number;
}

export interface SLAPenalty {
  // Penalty type
  type: 'fixed' | 'percentage' | 'per_hour';

  // Amount (currency for fixed, percentage for percentage, hourly rate for per_hour)
  amount: number;

  // Base for percentage calculation
  percentageBase?: 'labor_cost' | 'total_cost' | 'contract_value';

  // Maximum penalty cap
  maxPenalty?: number;

  // Grace period after deadline (hours)
  gracePeriodHours?: number;
}

// SLA tracking for individual work orders
export interface SLATracking {
  id: string;
  workOrderId: string;
  slaRuleId: string;

  // Timestamps
  startedAt: string;
  respondedAt?: string;
  resolvedAt?: string;

  // Calculated deadlines
  responseDeadline: string;
  resolutionDeadline: string;

  // Current status
  status: SLAStatus;

  // Breach information
  responseBreach?: SLABreachInfo;
  resolutionBreach?: SLABreachInfo;

  // Escalation history
  escalationHistory: SLAEscalationEvent[];

  // Pause tracking (e.g., when waiting for customer)
  pauseHistory: SLAPauseEvent[];
  totalPausedMinutes: number;

  // Calculated metrics
  responseTimeMinutes?: number;
  resolutionTimeMinutes?: number;

  // Penalty calculated
  penaltyAmount?: number;

  // Audit
  createdAt: string;
  updatedAt: string;
}

export type SLAStatus =
  | 'on_track'        // Within SLA time limits
  | 'at_risk'         // Approaching deadline
  | 'breached'        // Deadline exceeded
  | 'met'             // SLA met successfully
  | 'paused'          // SLA timer paused
  | 'cancelled';      // Work order cancelled

export interface SLABreachInfo {
  breachedAt: string;
  minutesOverdue: number;
  reason?: string;
}

export interface SLAEscalationEvent {
  id: string;
  escalationId: string;
  level: number;
  triggeredAt: string;
  notifiedUsers: string[];
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface SLAPauseEvent {
  id: string;
  pausedAt: string;
  resumedAt?: string;
  reason: SLAPauseReason;
  notes?: string;
  pausedBy: string;
  resumedBy?: string;
}

export type SLAPauseReason =
  | 'waiting_for_parts'
  | 'waiting_for_approval'
  | 'waiting_for_customer'
  | 'weather_conditions'
  | 'safety_hold'
  | 'other';

// SLA Dashboard metrics
export interface SLADashboardMetrics {
  // Overview
  totalTracked: number;
  onTrack: number;
  atRisk: number;
  breached: number;
  metSuccessfully: number;

  // Compliance rates
  responseComplianceRate: number;
  resolutionComplianceRate: number;
  overallComplianceRate: number;

  // Average times
  avgResponseTimeMinutes: number;
  avgResolutionTimeMinutes: number;

  // Penalty totals
  totalPenalties: number;

  // By priority breakdown
  byPriority: Record<WorkOrderPriority, SLAPriorityMetrics>;

  // Trend data (last 30 days)
  dailyMetrics: SLADailyMetric[];
}

export interface SLAPriorityMetrics {
  total: number;
  onTrack: number;
  atRisk: number;
  breached: number;
  complianceRate: number;
}

export interface SLADailyMetric {
  date: string;
  created: number;
  resolved: number;
  breached: number;
  complianceRate: number;
}

// Filter for SLA tracking list
export interface SLAFilter {
  status?: SLAStatus | null;
  priority?: WorkOrderPriority | null;
  terminalId?: string | null;
  regionId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  search?: string;
}

// Configuration for display
export const SLA_STATUS_CONFIG: Record<SLAStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  on_track: { label: 'On Track', color: 'text-green-700', bgColor: 'bg-green-100' },
  at_risk: { label: 'At Risk', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  breached: { label: 'Breached', color: 'text-red-700', bgColor: 'bg-red-100' },
  met: { label: 'Met', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  paused: { label: 'Paused', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bgColor: 'bg-gray-50' }
};

export const SLA_PRIORITY_CONFIG: Record<WorkOrderPriority, {
  label: string;
  color: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
}> = {
  critical: { label: 'Critical', color: 'text-red-600', responseTimeHours: 1, resolutionTimeHours: 4 },
  high: { label: 'High', color: 'text-orange-600', responseTimeHours: 4, resolutionTimeHours: 24 },
  medium: { label: 'Medium', color: 'text-yellow-600', responseTimeHours: 8, resolutionTimeHours: 48 },
  low: { label: 'Low', color: 'text-gray-600', responseTimeHours: 24, resolutionTimeHours: 168 }
};

export const SLA_PAUSE_REASON_CONFIG: Record<SLAPauseReason, {
  label: string;
  description: string;
}> = {
  waiting_for_parts: { label: 'Waiting for Parts', description: 'Paused while waiting for parts/materials to arrive' },
  waiting_for_approval: { label: 'Waiting for Approval', description: 'Paused pending approval from supervisor or client' },
  waiting_for_customer: { label: 'Waiting for Customer', description: 'Paused while waiting for customer response' },
  weather_conditions: { label: 'Weather Conditions', description: 'Paused due to adverse weather conditions' },
  safety_hold: { label: 'Safety Hold', description: 'Paused for safety reasons or investigations' },
  other: { label: 'Other', description: 'Paused for other reasons' }
};
