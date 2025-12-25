/**
 * SLA Store
 *
 * Manages SLA rules and tracking for the CMMS application.
 * Handles SLA configuration, tracking, escalations, and metrics.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  SLARule,
  SLATracking,
  SLAStatus,
  SLAFilter,
  SLADashboardMetrics,
  SLAEscalationEvent,
  SLAPauseEvent,
  SLAPauseReason,
  WorkOrderPriority
} from '@/types/sla';
import { SLA_PRIORITY_CONFIG } from '@/types/sla';
import { getCurrentUserId } from '@/utils/auth';

// Default SLA rules based on priority
const defaultSLARules: SLARule[] = [
  {
    id: 'sla_critical',
    name: 'Critical Priority SLA',
    description: 'SLA for critical priority work orders requiring immediate response',
    scope: {
      priorities: ['critical'],
      assetCriticalities: ['critical']
    },
    responseTime: {
      hours: 1,
      businessHoursOnly: false,
      excludeWeekends: false,
      excludeHolidays: false
    },
    resolutionTime: {
      hours: 4,
      businessHoursOnly: false,
      excludeWeekends: false,
      excludeHolidays: false
    },
    escalations: [
      {
        id: 'esc_crit_1',
        triggerPercentage: 50,
        notifyRoles: ['supervisor'],
        level: 1,
        messageTemplate: 'Critical work order {workOrderCode} is at 50% of response time'
      },
      {
        id: 'esc_crit_2',
        triggerPercentage: 75,
        notifyRoles: ['supervisor', 'admin'],
        level: 2,
        messageTemplate: 'URGENT: Critical work order {workOrderCode} is at 75% of response time'
      },
      {
        id: 'esc_crit_3',
        triggerPercentage: 100,
        notifyRoles: ['supervisor', 'admin', 'leader'],
        level: 3,
        messageTemplate: 'BREACH: Critical work order {workOrderCode} has exceeded SLA'
      }
    ],
    penalty: {
      type: 'percentage',
      amount: 10,
      percentageBase: 'labor_cost',
      maxPenalty: 50000000,
      gracePeriodHours: 0
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sla_high',
    name: 'High Priority SLA',
    description: 'SLA for high priority work orders',
    scope: {
      priorities: ['high']
    },
    responseTime: {
      hours: 4,
      businessHoursOnly: true,
      excludeWeekends: false,
      excludeHolidays: false
    },
    resolutionTime: {
      hours: 24,
      businessHoursOnly: true,
      excludeWeekends: false,
      excludeHolidays: false
    },
    escalations: [
      {
        id: 'esc_high_1',
        triggerPercentage: 75,
        notifyRoles: ['supervisor'],
        level: 1,
        messageTemplate: 'High priority work order {workOrderCode} is approaching deadline'
      },
      {
        id: 'esc_high_2',
        triggerPercentage: 100,
        notifyRoles: ['supervisor', 'admin'],
        level: 2,
        messageTemplate: 'BREACH: High priority work order {workOrderCode} has exceeded SLA'
      }
    ],
    penalty: {
      type: 'percentage',
      amount: 5,
      percentageBase: 'labor_cost',
      maxPenalty: 25000000,
      gracePeriodHours: 1
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sla_medium',
    name: 'Medium Priority SLA',
    description: 'SLA for medium priority work orders',
    scope: {
      priorities: ['medium']
    },
    responseTime: {
      hours: 8,
      businessHoursOnly: true,
      excludeWeekends: true,
      excludeHolidays: true
    },
    resolutionTime: {
      hours: 48,
      businessHoursOnly: true,
      excludeWeekends: true,
      excludeHolidays: true
    },
    escalations: [
      {
        id: 'esc_med_1',
        triggerPercentage: 90,
        notifyRoles: ['supervisor'],
        level: 1,
        messageTemplate: 'Medium priority work order {workOrderCode} is nearing deadline'
      }
    ],
    penalty: {
      type: 'fixed',
      amount: 1000000,
      gracePeriodHours: 4
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sla_low',
    name: 'Low Priority SLA',
    description: 'SLA for low priority work orders',
    scope: {
      priorities: ['low']
    },
    responseTime: {
      hours: 24,
      businessHoursOnly: true,
      excludeWeekends: true,
      excludeHolidays: true
    },
    resolutionTime: {
      hours: 168, // 7 days
      businessHoursOnly: true,
      excludeWeekends: true,
      excludeHolidays: true
    },
    escalations: [],
    penalty: {
      type: 'fixed',
      amount: 500000,
      gracePeriodHours: 8
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Generate mock SLA tracking data
function generateMockTrackings(): SLATracking[] {
  const trackings: SLATracking[] = [];
  const now = new Date();

  // Generate 50 sample tracking records
  for (let i = 0; i < 50; i++) {
    const priorities: WorkOrderPriority[] = ['critical', 'high', 'medium', 'low'];
    const priorityIndex = Math.floor(Math.random() * priorities.length);
    const priority = priorities[priorityIndex] || 'medium';
    const slaConfig = SLA_PRIORITY_CONFIG[priority];

    const startedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const responseDeadline = new Date(startedAt.getTime() + slaConfig.responseTimeHours * 60 * 60 * 1000);
    const resolutionDeadline = new Date(startedAt.getTime() + slaConfig.resolutionTimeHours * 60 * 60 * 1000);

    // Randomly determine status
    const random = Math.random();
    let status: SLAStatus;
    let respondedAt: string | undefined;
    let resolvedAt: string | undefined;
    let responseTimeMinutes: number | undefined;
    let resolutionTimeMinutes: number | undefined;

    if (random < 0.6) {
      // Met SLA
      status = 'met';
      const responseTime = Math.random() * slaConfig.responseTimeHours * 60;
      const resolutionTime = responseTime + Math.random() * (slaConfig.resolutionTimeHours - slaConfig.responseTimeHours) * 60;
      respondedAt = new Date(startedAt.getTime() + responseTime * 60 * 1000).toISOString();
      resolvedAt = new Date(startedAt.getTime() + resolutionTime * 60 * 1000).toISOString();
      responseTimeMinutes = responseTime;
      resolutionTimeMinutes = resolutionTime;
    } else if (random < 0.8) {
      // On track (in progress)
      status = 'on_track';
      if (Math.random() > 0.5) {
        const responseTime = Math.random() * slaConfig.responseTimeHours * 60;
        respondedAt = new Date(startedAt.getTime() + responseTime * 60 * 1000).toISOString();
        responseTimeMinutes = responseTime;
      }
    } else if (random < 0.9) {
      // At risk
      status = 'at_risk';
      const responseTime = Math.random() * slaConfig.responseTimeHours * 60;
      respondedAt = new Date(startedAt.getTime() + responseTime * 60 * 1000).toISOString();
      responseTimeMinutes = responseTime;
    } else {
      // Breached
      status = 'breached';
      const responseTime = slaConfig.responseTimeHours * 60 * (1 + Math.random() * 0.5);
      respondedAt = new Date(startedAt.getTime() + responseTime * 60 * 1000).toISOString();
      responseTimeMinutes = responseTime;
    }

    const slaRuleId = `sla_${priority}`;

    trackings.push({
      id: `tracking_${i + 1}`,
      workOrderId: `wo_${String(i + 1).padStart(3, '0')}`,
      slaRuleId,
      startedAt: startedAt.toISOString(),
      respondedAt,
      resolvedAt,
      responseDeadline: responseDeadline.toISOString(),
      resolutionDeadline: resolutionDeadline.toISOString(),
      status,
      escalationHistory: [],
      pauseHistory: [],
      totalPausedMinutes: 0,
      responseTimeMinutes,
      resolutionTimeMinutes,
      createdAt: startedAt.toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return trackings;
}

export const useSLAStore = defineStore('sla', () => {
  // State
  const rules = ref<SLARule[]>([...defaultSLARules]);
  const trackings = ref<SLATracking[]>(generateMockTrackings());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const filter = ref<SLAFilter>({
    status: null,
    priority: null,
    terminalId: null,
    regionId: null,
    dateFrom: null,
    dateTo: null,
    search: ''
  });

  // Computed
  const activeRules = computed(() => rules.value.filter(r => r.isActive));

  const filteredTrackings = computed(() => {
    let result = [...trackings.value];

    if (filter.value.status) {
      result = result.filter(t => t.status === filter.value.status);
    }

    if (filter.value.search) {
      const searchLower = filter.value.search.toLowerCase();
      result = result.filter(t =>
        t.workOrderId.toLowerCase().includes(searchLower)
      );
    }

    if (filter.value.dateFrom) {
      const fromDate = new Date(filter.value.dateFrom);
      result = result.filter(t => new Date(t.startedAt) >= fromDate);
    }

    if (filter.value.dateTo) {
      const toDate = new Date(filter.value.dateTo);
      result = result.filter(t => new Date(t.startedAt) <= toDate);
    }

    return result;
  });

  const trackingsByStatus = computed(() => {
    const grouped: Record<SLAStatus, SLATracking[]> = {
      on_track: [],
      at_risk: [],
      breached: [],
      met: [],
      paused: [],
      cancelled: []
    };

    trackings.value.forEach(tracking => {
      grouped[tracking.status].push(tracking);
    });

    return grouped;
  });

  const dashboardMetrics = computed((): SLADashboardMetrics => {
    const total = trackings.value.length;
    const onTrack = trackingsByStatus.value.on_track.length;
    const atRisk = trackingsByStatus.value.at_risk.length;
    const breached = trackingsByStatus.value.breached.length;
    const met = trackingsByStatus.value.met.length;

    // Calculate compliance rates
    const resolved = trackings.value.filter(t => t.resolvedAt);
    const responseCompliant = resolved.filter(t =>
      t.responseTimeMinutes !== undefined &&
      t.responseTimeMinutes <= getResponseTimeLimit(t.slaRuleId)
    );
    const resolutionCompliant = resolved.filter(t =>
      t.resolutionTimeMinutes !== undefined &&
      t.resolutionTimeMinutes <= getResolutionTimeLimit(t.slaRuleId)
    );

    const responseComplianceRate = resolved.length > 0
      ? (responseCompliant.length / resolved.length) * 100
      : 100;
    const resolutionComplianceRate = resolved.length > 0
      ? (resolutionCompliant.length / resolved.length) * 100
      : 100;
    const overallComplianceRate = (responseComplianceRate + resolutionComplianceRate) / 2;

    // Calculate average times
    const responseTimes = resolved
      .filter(t => t.responseTimeMinutes !== undefined)
      .map(t => t.responseTimeMinutes!);
    const resolutionTimes = resolved
      .filter(t => t.resolutionTimeMinutes !== undefined)
      .map(t => t.resolutionTimeMinutes!);

    const avgResponseTimeMinutes = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
    const avgResolutionTimeMinutes = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // Calculate total penalties
    const totalPenalties = trackings.value
      .filter(t => t.penaltyAmount)
      .reduce((sum, t) => sum + (t.penaltyAmount || 0), 0);

    // By priority breakdown
    const byPriority: Record<WorkOrderPriority, { total: number; onTrack: number; atRisk: number; breached: number; complianceRate: number }> = {
      critical: { total: 0, onTrack: 0, atRisk: 0, breached: 0, complianceRate: 0 },
      high: { total: 0, onTrack: 0, atRisk: 0, breached: 0, complianceRate: 0 },
      medium: { total: 0, onTrack: 0, atRisk: 0, breached: 0, complianceRate: 0 },
      low: { total: 0, onTrack: 0, atRisk: 0, breached: 0, complianceRate: 0 }
    };

    trackings.value.forEach(t => {
      const priority = getPriorityFromRule(t.slaRuleId);
      if (priority && byPriority[priority]) {
        byPriority[priority].total++;
        if (t.status === 'on_track') byPriority[priority].onTrack++;
        if (t.status === 'at_risk') byPriority[priority].atRisk++;
        if (t.status === 'breached') byPriority[priority].breached++;
      }
    });

    // Calculate compliance rate per priority
    Object.keys(byPriority).forEach(p => {
      const priority = p as WorkOrderPriority;
      const priorityTotal = byPriority[priority].total;
      const priorityBreached = byPriority[priority].breached;
      byPriority[priority].complianceRate = priorityTotal > 0
        ? ((priorityTotal - priorityBreached) / priorityTotal) * 100
        : 100;
    });

    return {
      totalTracked: total,
      onTrack,
      atRisk,
      breached,
      metSuccessfully: met,
      responseComplianceRate,
      resolutionComplianceRate,
      overallComplianceRate,
      avgResponseTimeMinutes,
      avgResolutionTimeMinutes,
      totalPenalties,
      byPriority,
      dailyMetrics: [] // Would be calculated from actual data
    };
  });

  // Helper functions
  const getResponseTimeLimit = (slaRuleId: string): number => {
    const rule = rules.value.find(r => r.id === slaRuleId);
    return rule ? rule.responseTime.hours * 60 : Infinity;
  };

  const getResolutionTimeLimit = (slaRuleId: string): number => {
    const rule = rules.value.find(r => r.id === slaRuleId);
    return rule ? rule.resolutionTime.hours * 60 : Infinity;
  };

  const getPriorityFromRule = (slaRuleId: string): WorkOrderPriority | null => {
    if (slaRuleId.includes('critical')) return 'critical';
    if (slaRuleId.includes('high')) return 'high';
    if (slaRuleId.includes('medium')) return 'medium';
    if (slaRuleId.includes('low')) return 'low';
    return null;
  };

  // Actions
  const setFilter = (newFilter: Partial<SLAFilter>) => {
    filter.value = { ...filter.value, ...newFilter };
  };

  const clearFilter = () => {
    filter.value = {
      status: null,
      priority: null,
      terminalId: null,
      regionId: null,
      dateFrom: null,
      dateTo: null,
      search: ''
    };
  };

  const getRuleById = (ruleId: string): SLARule | undefined => {
    return rules.value.find(r => r.id === ruleId);
  };

  const getTrackingById = (trackingId: string): SLATracking | undefined => {
    return trackings.value.find(t => t.id === trackingId);
  };

  const getTrackingByWorkOrder = (workOrderId: string): SLATracking | undefined => {
    return trackings.value.find(t => t.workOrderId === workOrderId);
  };

  const createRule = async (rule: Omit<SLARule, 'id' | 'createdAt' | 'createdBy' | 'updatedAt'>): Promise<SLARule> => {
    isLoading.value = true;
    error.value = null;

    try {
      const now = new Date().toISOString();
      const newRule: SLARule = {
        ...rule,
        id: `sla_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        createdBy: getCurrentUserId(),
        updatedAt: now
      };

      rules.value.push(newRule);
      return newRule;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create SLA rule';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<SLARule>): Promise<SLARule> => {
    isLoading.value = true;
    error.value = null;

    try {
      const index = rules.value.findIndex(r => r.id === ruleId);
      if (index === -1) {
        throw new Error(`SLA rule with id ${ruleId} not found`);
      }

      const existingRule = rules.value[index];
      // Create updated rule by merging only defined values from updates
      const updatedRule: SLARule = Object.assign({}, existingRule, {
        updatedAt: new Date().toISOString(),
        updatedBy: getCurrentUserId()
      });

      // Apply updates (only defined values)
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          (updatedRule as any)[key] = value;
        }
      });

      rules.value[index] = updatedRule;
      return updatedRule;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update SLA rule';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteRule = async (ruleId: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const index = rules.value.findIndex(r => r.id === ruleId);
      if (index === -1) {
        throw new Error(`SLA rule with id ${ruleId} not found`);
      }

      rules.value.splice(index, 1);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete SLA rule';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const startTracking = async (workOrderId: string, priority: WorkOrderPriority): Promise<SLATracking> => {
    const slaRuleId = `sla_${priority}`;
    const rule = rules.value.find(r => r.id === slaRuleId);

    if (!rule) {
      throw new Error(`No SLA rule found for priority ${priority}`);
    }

    const now = new Date();
    const responseDeadline = new Date(now.getTime() + rule.responseTime.hours * 60 * 60 * 1000);
    const resolutionDeadline = new Date(now.getTime() + rule.resolutionTime.hours * 60 * 60 * 1000);

    const tracking: SLATracking = {
      id: `tracking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      workOrderId,
      slaRuleId,
      startedAt: now.toISOString(),
      responseDeadline: responseDeadline.toISOString(),
      resolutionDeadline: resolutionDeadline.toISOString(),
      status: 'on_track',
      escalationHistory: [],
      pauseHistory: [],
      totalPausedMinutes: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    trackings.value.push(tracking);
    return tracking;
  };

  const recordResponse = async (trackingId: string): Promise<void> => {
    const tracking = trackings.value.find(t => t.id === trackingId);
    if (!tracking) {
      throw new Error(`Tracking with id ${trackingId} not found`);
    }

    const now = new Date();
    tracking.respondedAt = now.toISOString();
    tracking.responseTimeMinutes = (now.getTime() - new Date(tracking.startedAt).getTime()) / (1000 * 60);
    tracking.updatedAt = now.toISOString();

    // Check if response was within SLA
    if (new Date(tracking.responseDeadline) < now) {
      tracking.responseBreach = {
        breachedAt: tracking.responseDeadline,
        minutesOverdue: tracking.responseTimeMinutes - getResponseTimeLimit(tracking.slaRuleId)
      };
    }
  };

  const recordResolution = async (trackingId: string): Promise<void> => {
    const tracking = trackings.value.find(t => t.id === trackingId);
    if (!tracking) {
      throw new Error(`Tracking with id ${trackingId} not found`);
    }

    const now = new Date();
    tracking.resolvedAt = now.toISOString();
    tracking.resolutionTimeMinutes = (now.getTime() - new Date(tracking.startedAt).getTime()) / (1000 * 60);
    tracking.updatedAt = now.toISOString();

    // Check if resolution was within SLA
    if (new Date(tracking.resolutionDeadline) < now) {
      tracking.status = 'breached';
      tracking.resolutionBreach = {
        breachedAt: tracking.resolutionDeadline,
        minutesOverdue: tracking.resolutionTimeMinutes - getResolutionTimeLimit(tracking.slaRuleId)
      };

      // Calculate penalty
      const rule = rules.value.find(r => r.id === tracking.slaRuleId);
      if (rule?.penalty) {
        if (rule.penalty.type === 'fixed') {
          tracking.penaltyAmount = rule.penalty.amount;
        } else if (rule.penalty.type === 'per_hour') {
          const hoursOverdue = tracking.resolutionBreach.minutesOverdue / 60;
          tracking.penaltyAmount = Math.min(
            rule.penalty.amount * hoursOverdue,
            rule.penalty.maxPenalty || Infinity
          );
        }
      }
    } else {
      tracking.status = 'met';
    }
  };

  const pauseTracking = async (trackingId: string, reason: SLAPauseReason, notes?: string): Promise<void> => {
    const tracking = trackings.value.find(t => t.id === trackingId);
    if (!tracking) {
      throw new Error(`Tracking with id ${trackingId} not found`);
    }

    const pauseEvent: SLAPauseEvent = {
      id: `pause_${Date.now()}`,
      pausedAt: new Date().toISOString(),
      reason,
      notes,
      pausedBy: getCurrentUserId()
    };

    tracking.pauseHistory.push(pauseEvent);
    tracking.status = 'paused';
    tracking.updatedAt = new Date().toISOString();
  };

  const resumeTracking = async (trackingId: string): Promise<void> => {
    const tracking = trackings.value.find(t => t.id === trackingId);
    if (!tracking || tracking.status !== 'paused') {
      throw new Error(`Tracking with id ${trackingId} not found or not paused`);
    }

    const lastPause = tracking.pauseHistory[tracking.pauseHistory.length - 1];
    if (lastPause && !lastPause.resumedAt) {
      const now = new Date();
      lastPause.resumedAt = now.toISOString();
      lastPause.resumedBy = getCurrentUserId();

      // Calculate paused duration
      const pausedDuration = (now.getTime() - new Date(lastPause.pausedAt).getTime()) / (1000 * 60);
      tracking.totalPausedMinutes += pausedDuration;

      // Extend deadlines by paused duration
      const durationMs = pausedDuration * 60 * 1000;
      tracking.responseDeadline = new Date(new Date(tracking.responseDeadline).getTime() + durationMs).toISOString();
      tracking.resolutionDeadline = new Date(new Date(tracking.resolutionDeadline).getTime() + durationMs).toISOString();
    }

    tracking.status = 'on_track';
    tracking.updatedAt = new Date().toISOString();
  };

  const checkAndUpdateStatuses = (): void => {
    const now = new Date();

    trackings.value.forEach(tracking => {
      if (tracking.status === 'on_track' || tracking.status === 'at_risk') {
        const responseDeadline = new Date(tracking.responseDeadline);
        const resolutionDeadline = new Date(tracking.resolutionDeadline);

        // Check for breach
        if (!tracking.respondedAt && now > responseDeadline) {
          tracking.status = 'breached';
        } else if (tracking.respondedAt && !tracking.resolvedAt && now > resolutionDeadline) {
          tracking.status = 'breached';
        }
        // Check for at risk (75% of time passed)
        else if (!tracking.respondedAt) {
          const totalTime = responseDeadline.getTime() - new Date(tracking.startedAt).getTime();
          const elapsed = now.getTime() - new Date(tracking.startedAt).getTime();
          if (elapsed / totalTime >= 0.75) {
            tracking.status = 'at_risk';
          }
        } else if (!tracking.resolvedAt) {
          const totalTime = resolutionDeadline.getTime() - new Date(tracking.startedAt).getTime();
          const elapsed = now.getTime() - new Date(tracking.startedAt).getTime();
          if (elapsed / totalTime >= 0.75) {
            tracking.status = 'at_risk';
          }
        }
      }
    });
  };

  return {
    // State
    rules,
    trackings,
    isLoading,
    error,
    filter,

    // Computed
    activeRules,
    filteredTrackings,
    trackingsByStatus,
    dashboardMetrics,

    // Actions
    setFilter,
    clearFilter,
    getRuleById,
    getTrackingById,
    getTrackingByWorkOrder,
    createRule,
    updateRule,
    deleteRule,
    startTracking,
    recordResponse,
    recordResolution,
    pauseTracking,
    resumeTracking,
    checkAndUpdateStatuses
  };
});
