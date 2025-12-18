import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface ReportMetric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  period: string;
  category: 'work_orders' | 'inventory' | 'invoices' | 'performance';
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      fill?: boolean;
    }[];
  };
  options?: any;
}

export interface TerminalPerformance {
  terminalId: string;
  terminalName: string;
  completionRate: number;
  avgCompletionTime: number;
  overdueCount: number;
  totalCost: number;
  workerCount: number;
  efficiency: 'excellent' | 'good' | 'average' | 'poor';
}

export interface WorkerPerformance {
  workerId: string;
  workerName: string;
  completedOrders: number;
  avgCompletionTime: number;
  overdueCount: number;
  qualityScore: number;
  efficiency: 'excellent' | 'good' | 'average' | 'poor';
  terminalId: string;
}

export interface OverdueReport {
  workOrderId: string;
  title: string;
  assignedWorker: string;
  terminalId: string;
  dueDate: string;
  daysOverdue: number;
  priority: string;
  status: string;
  estimatedPenalty: number;
}

export const useReportsStore = defineStore('reports', () => {
  // State
  const loading = ref(false);
  const dateRange = ref({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const selectedFilters = ref({
    terminals: [] as string[],
    regions: [] as string[],
    workers: [] as string[],
    categories: [] as string[]
  });

  // Mock data would be used for real API integration

  // Computed metrics
  const keyMetrics = computed((): ReportMetric[] => [
    {
      id: 'completion_rate',
      title: 'Completion Rate',
      value: '92%',
      change: '+5%',
      changeType: 'increase',
      period: 'vs last month',
      category: 'work_orders'
    },
    {
      id: 'avg_completion_time',
      title: 'Avg Completion Time',
      value: '3.2 days',
      change: '-0.5 days',
      changeType: 'decrease',
      period: 'vs last month',
      category: 'performance'
    },
    {
      id: 'overdue_count', 
      title: 'Overdue Work Orders',
      value: 12,
      change: '+3',
      changeType: 'increase',
      period: 'vs last month',
      category: 'work_orders'
    },
    {
      id: 'total_penalties',
      title: 'Total Penalties',
      value: '$2,250',
      change: '+$450',
      changeType: 'increase',
      period: 'this month',
      category: 'invoices'
    },
    {
      id: 'low_stock_items',
      title: 'Low Stock Items',
      value: 8,
      change: 'stable',
      changeType: 'neutral',
      period: 'vs last month',
      category: 'inventory'
    },
    {
      id: 'worker_efficiency',
      title: 'Worker Efficiency',
      value: '87%',
      change: '+2%',
      changeType: 'increase',
      period: 'vs last month',
      category: 'performance'
    }
  ]);

  const chartData = computed((): ChartData[] => [
    {
      id: 'work_orders_trend',
      title: 'Work Orders Completion Trend',
      type: 'line',
      data: {
        labels: ['Nov 1-7', 'Nov 8-14', 'Nov 15-21', 'Nov 22-28', 'Dec 1-7', 'Dec 8-14', 'Dec 15-21'],
        datasets: [{
          label: 'Completed',
          data: [25, 32, 28, 35, 42, 38, 45],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true
        }, {
          label: 'Created',
          data: [28, 35, 30, 38, 45, 41, 48],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true
        }]
      }
    },
    {
      id: 'maintenance_types',
      title: 'Maintenance Types Distribution',
      type: 'doughnut',
      data: {
        labels: ['Preventive', 'Corrective - Planned', 'Corrective - Emergency'],
        datasets: [{
          label: 'Maintenance Types',
          data: [65, 25, 10],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
        }]
      }
    },
    {
      id: 'terminal_performance',
      title: 'Completion Rate by Terminal',
      type: 'bar',
      data: {
        labels: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4', 'Terminal 5'],
        datasets: [{
          label: 'Completion Rate (%)',
          data: [95, 88, 92, 85, 90],
          backgroundColor: '#3B82F6'
        }]
      }
    },
    {
      id: 'cost_breakdown',
      title: 'Monthly Cost Breakdown',
      type: 'bar',
      data: {
        labels: ['Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Labor',
            data: [15000, 18000, 22000],
            backgroundColor: '#10B981'
          },
          {
            label: 'Materials',
            data: [8000, 9500, 11000],
            backgroundColor: '#3B82F6'
          },
          {
            label: 'Penalties',
            data: [1200, 1800, 2250],
            backgroundColor: '#EF4444'
          }
        ]
      }
    }
  ]);

  const terminalPerformance = computed((): TerminalPerformance[] => [
    {
      terminalId: 'terminal1',
      terminalName: 'Terminal Tanjung Priok',
      completionRate: 95,
      avgCompletionTime: 2.8,
      overdueCount: 2,
      totalCost: 45000,
      workerCount: 12,
      efficiency: 'excellent'
    },
    {
      terminalId: 'terminal2', 
      terminalName: 'Terminal Belawan',
      completionRate: 88,
      avgCompletionTime: 3.5,
      overdueCount: 5,
      totalCost: 38000,
      workerCount: 10,
      efficiency: 'good'
    },
    {
      terminalId: 'terminal3',
      terminalName: 'Terminal Balikpapan',
      completionRate: 92,
      avgCompletionTime: 3.1,
      overdueCount: 3,
      totalCost: 41000,
      workerCount: 11,
      efficiency: 'good'
    }
  ]);

  const workerPerformance = computed((): WorkerPerformance[] => [
    {
      workerId: 'worker1',
      workerName: 'Candra Wijaya',
      completedOrders: 28,
      avgCompletionTime: 2.5,
      overdueCount: 1,
      qualityScore: 95,
      efficiency: 'excellent',
      terminalId: 'terminal1'
    },
    {
      workerId: 'worker2',
      workerName: 'Dedi Kurniawan',
      completedOrders: 22,
      avgCompletionTime: 3.8,
      overdueCount: 4,
      qualityScore: 82,
      efficiency: 'average',
      terminalId: 'terminal2'
    },
    {
      workerId: 'worker3',
      workerName: 'Eko Santoso',
      completedOrders: 25,
      avgCompletionTime: 3.0,
      overdueCount: 2,
      qualityScore: 89,
      efficiency: 'good',
      terminalId: 'terminal1'
    }
  ]);

  const overdueReports = computed((): OverdueReport[] => [
    {
      workOrderId: 'wo002',
      title: 'Generator Maintenance',
      assignedWorker: 'Dedi Kurniawan',
      terminalId: 'terminal2',
      dueDate: '2024-12-20',
      daysOverdue: 5,
      priority: 'normal',
      status: 'overdue',
      estimatedPenalty: 150
    },
    {
      workOrderId: 'wo005',
      title: 'Safety Valve Inspection',
      assignedWorker: 'Eko Santoso',
      terminalId: 'terminal1', 
      dueDate: '2024-12-22',
      daysOverdue: 3,
      priority: 'high',
      status: 'overdue',
      estimatedPenalty: 225
    }
  ]);

  const costAnalysis = computed(() => {
    const totalLabor = 61000;
    const totalMaterials = 28500;
    const totalPenalties = 5250;
    const total = totalLabor + totalMaterials + totalPenalties;

    return {
      total,
      breakdown: {
        labor: { amount: totalLabor, percentage: Math.round((totalLabor / total) * 100) },
        materials: { amount: totalMaterials, percentage: Math.round((totalMaterials / total) * 100) },
        penalties: { amount: totalPenalties, percentage: Math.round((totalPenalties / total) * 100) }
      },
      trends: {
        labor: { change: '+15%', changeType: 'increase' as const },
        materials: { change: '+8%', changeType: 'increase' as const },
        penalties: { change: '+25%', changeType: 'increase' as const }
      }
    };
  });

  // Actions
  const updateDateRange = (start: string, end: string) => {
    dateRange.value = { start, end };
  };

  const updateFilters = (filters: Partial<typeof selectedFilters.value>) => {
    selectedFilters.value = { ...selectedFilters.value, ...filters };
  };

  const exportReport = async (reportType: string, format: 'pdf' | 'excel' | 'csv') => {
    loading.value = true;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, this would generate and download the file
      console.log(`Exporting ${reportType} as ${format}`);
      
      return {
        success: true,
        filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`
      };
    } finally {
      loading.value = false;
    }
  };

  const refreshReports = async () => {
    loading.value = true;
    try {
      // Simulate API call to refresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would fetch fresh data from the API
      console.log('Reports refreshed');
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    loading,
    dateRange,
    selectedFilters,
    
    // Computed
    keyMetrics,
    chartData,
    terminalPerformance,
    workerPerformance,
    overdueReports,
    costAnalysis,
    
    // Actions
    updateDateRange,
    updateFilters,
    exportReport,
    refreshReports
  };
});