import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';
import { useWorkOrderStore } from './workorder';
import { useInventoryStore } from './inventory';
import type { User } from '@/types';

interface KPI {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
  icon: string;
  color: string;
  description?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

interface PerformanceMetric {
  terminalId: string;
  terminalName: string;
  completionRate: number;
  onTimeRate: number;
  averageCompletionTime: number;
  totalWorkOrders: number;
  overdueWorkOrders: number;
  workerCount: number;
  efficiency: number;
}

export const useDashboardStore = defineStore('dashboard', () => {
  const authStore = useAuthStore();
  const workOrderStore = useWorkOrderStore();
  const inventoryStore = useInventoryStore();

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Terminal Performance Data
  const terminalPerformance = ref<PerformanceMetric[]>([
    {
      terminalId: 'terminal1',
      terminalName: 'Terminal 1 - Jakarta',
      completionRate: 89,
      onTimeRate: 94,
      averageCompletionTime: 4.2,
      totalWorkOrders: 45,
      overdueWorkOrders: 2,
      workerCount: 8,
      efficiency: 92
    },
    {
      terminalId: 'terminal2',
      terminalName: 'Terminal 2 - Surabaya',
      completionRate: 76,
      onTimeRate: 82,
      averageCompletionTime: 5.1,
      totalWorkOrders: 38,
      overdueWorkOrders: 4,
      workerCount: 6,
      efficiency: 79
    },
    {
      terminalId: 'terminal3',
      terminalName: 'Terminal 3 - Medan',
      completionRate: 95,
      onTimeRate: 97,
      averageCompletionTime: 3.8,
      totalWorkOrders: 52,
      overdueWorkOrders: 1,
      workerCount: 10,
      efficiency: 96
    }
  ]);

  // Regional Performance Data
  const regionalPerformance = ref({
    region1: {
      name: 'Jakarta Region',
      terminals: ['terminal1'],
      completionRate: 89,
      onTimeRate: 94,
      totalWorkOrders: 45,
      totalCost: 125000,
      efficiency: 92
    },
    region2: {
      name: 'East Java Region', 
      terminals: ['terminal2'],
      completionRate: 76,
      onTimeRate: 82,
      totalWorkOrders: 38,
      totalCost: 98000,
      efficiency: 79
    },
    region3: {
      name: 'North Sumatra Region',
      terminals: ['terminal3'],
      completionRate: 95,
      onTimeRate: 97,
      totalWorkOrders: 52,
      totalCost: 142000,
      efficiency: 96
    }
  });

  // Worker-specific KPIs
  const workerKPIs = computed((): KPI[] => {
    if (!authStore.isWorker || !authStore.currentUser) return [];

    const myWorkOrders = workOrderStore.myWorkOrders;
    const completedThisMonth = myWorkOrders.filter(wo => {
      const completed = new Date(wo.completedAt || '');
      const thisMonth = new Date();
      return wo.status === 'completed' && 
             completed.getMonth() === thisMonth.getMonth() &&
             completed.getFullYear() === thisMonth.getFullYear();
    }).length;

    const activeWorkOrders = myWorkOrders.filter(wo => 
      ['assigned', 'in_progress'].includes(wo.status)
    ).length;

    const overdueWorkOrders = myWorkOrders.filter(wo => {
      const dueDate = new Date(wo.dueDate);
      const now = new Date();
      return dueDate < now && !['completed', 'rejected'].includes(wo.status);
    }).length;

    const inProgressWorkOrders = myWorkOrders.filter(wo => 
      wo.status === 'in_progress'
    ).length;

    return [
      {
        id: 'active_tasks',
        title: 'My Active Tasks',
        value: activeWorkOrders,
        change: 2,
        changeType: 'increase',
        period: 'from yesterday',
        icon: 'ClipboardList',
        color: 'blue',
        description: 'Currently assigned and in-progress work orders'
      },
      {
        id: 'completed_month',
        title: 'Completed This Month',
        value: completedThisMonth,
        change: 15,
        changeType: 'increase',
        period: 'vs last month',
        icon: 'CheckCircle',
        color: 'green'
      },
      {
        id: 'overdue_tasks',
        title: 'Overdue Tasks',
        value: overdueWorkOrders,
        change: -1,
        changeType: 'decrease',
        period: 'from yesterday',
        icon: 'AlertTriangle',
        color: 'red'
      },
      {
        id: 'in_progress',
        title: 'In Progress',
        value: inProgressWorkOrders,
        change: 0,
        changeType: 'neutral',
        period: 'no change',
        icon: 'Clock',
        color: 'purple'
      }
    ];
  });

  // Admin KPIs
  const adminKPIs = computed((): KPI[] => {
    if (!authStore.isAdmin) return [];

    const allWorkOrders = workOrderStore.workOrders;
    const lowStockItems = inventoryStore.lowStockItems;
    const totalInventoryValue = inventoryStore.totalValue;

    const currentUser = authStore.currentUser;
    const terminalWorkOrders = currentUser?.terminalId 
      ? allWorkOrders.filter(wo => wo.terminalId === currentUser.terminalId)
      : allWorkOrders;

    const completedThisWeek = terminalWorkOrders.filter(wo => {
      const completed = new Date(wo.completedAt || '');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return wo.status === 'completed' && completed > weekAgo;
    }).length;

    return [
      {
        id: 'total_work_orders',
        title: 'Total Work Orders',
        value: terminalWorkOrders.length,
        change: 12,
        changeType: 'increase',
        period: 'this month',
        icon: 'ClipboardList',
        color: 'blue'
      },
      {
        id: 'completed_week',
        title: 'Completed This Week',
        value: completedThisWeek,
        change: 8,
        changeType: 'increase',
        period: 'vs last week',
        icon: 'CheckCircle',
        color: 'green'
      },
      {
        id: 'low_stock_items',
        title: 'Low Stock Items',
        value: lowStockItems.length,
        change: -2,
        changeType: 'decrease',
        period: 'from last check',
        icon: 'AlertTriangle',
        color: 'orange'
      },
      {
        id: 'inventory_value',
        title: 'Inventory Value',
        value: `$${Math.round(totalInventoryValue / 1000)}K`,
        change: 5,
        changeType: 'increase',
        period: 'this month',
        icon: 'DollarSign',
        color: 'green'
      }
    ];
  });

  // Supervisor KPIs
  const supervisorKPIs = computed((): KPI[] => {
    if (!authStore.isSupervisor) return [];

    const allWorkOrders = workOrderStore.workOrders;
    const pendingApprovals = workOrderStore.pendingApproval;
    const forReview = workOrderStore.submitForReview;
    const overdue = workOrderStore.overdue;

    return [
      {
        id: 'pending_approval',
        title: 'Pending Approval',
        value: pendingApprovals.length,
        change: 3,
        changeType: 'increase',
        period: 'new today',
        icon: 'Clock',
        color: 'orange'
      },
      {
        id: 'for_review',
        title: 'For Review',
        value: forReview.length,
        change: 1,
        changeType: 'increase',
        period: 'new today',
        icon: 'FileText',
        color: 'blue'
      },
      {
        id: 'overdue_orders',
        title: 'Overdue Orders',
        value: overdue.length,
        change: -2,
        changeType: 'decrease',
        period: 'vs yesterday',
        icon: 'AlertTriangle',
        color: 'red'
      },
      {
        id: 'completion_rate',
        title: 'Completion Rate',
        value: '87%',
        change: 3,
        changeType: 'increase',
        period: 'this month',
        icon: 'TrendingUp',
        color: 'green'
      }
    ];
  });

  // Get chart data for work order trends
  const workOrderTrendData = computed((): ChartData => {
    const last7Days = [];
    const completedData = [];
    const createdData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7Days.push(dateStr);
      
      // Mock data for demonstration
      completedData.push(Math.floor(Math.random() * 10) + 3);
      createdData.push(Math.floor(Math.random() * 8) + 2);
    }

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Completed',
          data: completedData,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 1)'
        },
        {
          label: 'Created',
          data: createdData,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)'
        }
      ]
    };
  });

  // Get maintenance type distribution
  const maintenanceTypeData = computed((): ChartData => {
    const allWorkOrders = workOrderStore.workOrders;
    const preventive = allWorkOrders.filter(wo => wo.type === 'preventive').length;
    const corrective = allWorkOrders.filter(wo => wo.type === 'corrective').length;

    return {
      labels: ['Preventive', 'Corrective'],
      datasets: [
        {
          label: 'Work Orders',
          data: [preventive, corrective],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ]
        }
      ]
    };
  });

  // Priority distribution
  const priorityDistributionData = computed((): ChartData => {
    const allWorkOrders = workOrderStore.workOrders;
    const low = allWorkOrders.filter(wo => wo.priority === 'low').length;
    const normal = allWorkOrders.filter(wo => wo.priority === 'normal').length;
    const high = allWorkOrders.filter(wo => wo.priority === 'high').length;
    const urgent = allWorkOrders.filter(wo => wo.priority === 'urgent').length;

    return {
      labels: ['Low', 'Normal', 'High', 'Urgent'],
      datasets: [
        {
          label: 'Work Orders',
          data: [low, normal, high, urgent],
          backgroundColor: [
            'rgba(156, 163, 175, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ]
        }
      ]
    };
  });

  // Get current user KPIs based on role
  const currentUserKPIs = computed(() => {
    if (authStore.isWorker) return workerKPIs.value;
    if (authStore.isAdmin) return adminKPIs.value;
    if (authStore.isSupervisor) return supervisorKPIs.value;
    return [];
  });

  // Get terminal performance for current user
  const currentTerminalPerformance = computed(() => {
    const currentUser = authStore.currentUser;
    if (!currentUser?.terminalId) return null;
    
    return terminalPerformance.value.find(t => t.terminalId === currentUser.terminalId);
  });

  // Get regional performance for supervisor
  const currentRegionalPerformance = computed(() => {
    const currentUser = authStore.currentUser;
    if (!authStore.isSupervisor || !currentUser?.regionId) return null;
    
    return Object.values(regionalPerformance.value);
  });

  // Actions
  const refreshDashboard = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API calls to refresh data
      await Promise.all([
        workOrderStore.fetchWorkOrders(),
        inventoryStore.fetchInventoryItems()
      ]);

      // In a real app, this would fetch updated analytics data
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to refresh dashboard';
    } finally {
      isLoading.value = false;
    }
  };

  const getTerminalPerformance = (terminalId: string) => {
    return terminalPerformance.value.find(t => t.terminalId === terminalId);
  };

  const getTopPerformingTerminals = (limit = 3) => {
    return [...terminalPerformance.value]
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, limit);
  };

  const getLowPerformingTerminals = (limit = 3) => {
    return [...terminalPerformance.value]
      .sort((a, b) => a.efficiency - b.efficiency)
      .slice(0, limit);
  };

  return {
    isLoading,
    error,
    terminalPerformance,
    regionalPerformance,
    currentUserKPIs,
    currentTerminalPerformance,
    currentRegionalPerformance,
    workOrderTrendData,
    maintenanceTypeData,
    priorityDistributionData,
    refreshDashboard,
    getTerminalPerformance,
    getTopPerformingTerminals,
    getLowPerformingTerminals
  };
});