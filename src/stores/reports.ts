import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { PaginationState, ReportPaginationSizes } from '@/types/pagination';
import { getPaginationConfig } from '@/config/pagination';
import { useAuthStore } from './auth';

// Drill-down context types
export type DrillDownLevel = 'all' | 'region' | 'terminal' | 'worker';

export interface BreadcrumbItem {
  label: string;
  path: string;
  level: DrillDownLevel;
}

export interface DrillDownContext {
  level: DrillDownLevel;
  regionId?: string;
  terminalId?: string;
  workerId?: string;
  breadcrumb: BreadcrumbItem[];
}

// Work Order Status Report types
export interface WorkOrderStatusSummary {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  completionRate: number;
  overdueCount: number;
  avgCompletionTime: number;
}

export interface WorkOrderStatusRow {
  id: string;
  name: string;
  totalWorkOrders: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
  avgCompletionTime: number;
  isClickable: boolean;
}

export interface WorkOrderDetailRow {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  terminalName: string;
  workerName: string;
  dueDate: string;
  daysOverdue?: number;
  isClickable: boolean;
}

// Activity Report types
export interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'created' | 'started' | 'completed' | 'submitted' | 'approved' | 'rejected' | 'overdue';
  workOrderId: string;
  workOrderTitle: string;
  workOrderCode: string;
  userId: string;
  userName: string;
  terminalName: string;
  description: string;
}

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

  // Enterprise pagination state for different report sections
  const paginationConfig = getPaginationConfig('reports');
  
  // Terminal Performance Pagination
  const terminalPaginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Worker Performance Pagination  
  const workerPaginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Overdue Reports Pagination
  const overduePaginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Enterprise search and filter state
  const terminalSearchQuery = ref('');
  const workerSearchQuery = ref('');
  const overdueSearchQuery = ref('');
  const terminalSortBy = ref<'terminalName' | 'completionRate' | 'avgCompletionTime' | 'overdueCount' | 'totalCost'>('terminalName');
  const terminalSortOrder = ref<'asc' | 'desc'>('asc');
  const workerSortBy = ref<'workerName' | 'completedOrders' | 'avgCompletionTime' | 'qualityScore' | 'efficiency'>('workerName');
  const workerSortOrder = ref<'asc' | 'desc'>('asc');
  const overdueSortBy = ref<'title' | 'assignedWorker' | 'dueDate' | 'daysOverdue' | 'priority' | 'estimatedPenalty'>('daysOverdue');
  const overdueSortOrder = ref<'asc' | 'desc'>('desc');

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
      value: 'Rp 33,750,000',
      change: '+Rp 6,750,000',
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

  // Base terminal performance data (expanded for pagination testing)
  const baseTerminalPerformance = (): TerminalPerformance[] => [
    { terminalId: 'terminal1', terminalName: 'Terminal Tanjung Priok', completionRate: 95, avgCompletionTime: 2.8, overdueCount: 2, totalCost: 45000, workerCount: 12, efficiency: 'excellent' },
    { terminalId: 'terminal2', terminalName: 'Terminal Belawan', completionRate: 88, avgCompletionTime: 3.5, overdueCount: 5, totalCost: 38000, workerCount: 10, efficiency: 'good' },
    { terminalId: 'terminal3', terminalName: 'Terminal Balikpapan', completionRate: 92, avgCompletionTime: 3.1, overdueCount: 3, totalCost: 41000, workerCount: 11, efficiency: 'good' },
    { terminalId: 'terminal4', terminalName: 'Terminal Surabaya', completionRate: 85, avgCompletionTime: 4.2, overdueCount: 7, totalCost: 35000, workerCount: 9, efficiency: 'average' },
    { terminalId: 'terminal5', terminalName: 'Terminal Makassar', completionRate: 90, avgCompletionTime: 3.3, overdueCount: 4, totalCost: 39000, workerCount: 10, efficiency: 'good' },
    { terminalId: 'terminal6', terminalName: 'Terminal Banjarmasin', completionRate: 87, avgCompletionTime: 3.8, overdueCount: 6, totalCost: 36000, workerCount: 8, efficiency: 'average' },
    { terminalId: 'terminal7', terminalName: 'Terminal Pontianak', completionRate: 93, avgCompletionTime: 2.9, overdueCount: 3, totalCost: 42000, workerCount: 11, efficiency: 'good' },
    { terminalId: 'terminal8', terminalName: 'Terminal Palembang', completionRate: 89, avgCompletionTime: 3.4, overdueCount: 4, totalCost: 37000, workerCount: 9, efficiency: 'good' },
    { terminalId: 'terminal9', terminalName: 'Terminal Medan', completionRate: 91, avgCompletionTime: 3.2, overdueCount: 3, totalCost: 40000, workerCount: 10, efficiency: 'good' },
    { terminalId: 'terminal10', terminalName: 'Terminal Batam', completionRate: 86, avgCompletionTime: 3.7, overdueCount: 5, totalCost: 34000, workerCount: 8, efficiency: 'average' },
    { terminalId: 'terminal11', terminalName: 'Terminal Jayapura', completionRate: 83, avgCompletionTime: 4.5, overdueCount: 8, totalCost: 32000, workerCount: 7, efficiency: 'average' },
    { terminalId: 'terminal12', terminalName: 'Terminal Sorong', completionRate: 94, avgCompletionTime: 2.7, overdueCount: 2, totalCost: 43000, workerCount: 11, efficiency: 'excellent' }
  ];

  const terminalPerformance = computed((): TerminalPerformance[] => baseTerminalPerformance());

  // Base worker performance data (expanded for pagination testing)
  const baseWorkerPerformance = (): WorkerPerformance[] => [
    { workerId: 'worker1', workerName: 'Candra Wijaya', completedOrders: 28, avgCompletionTime: 2.5, overdueCount: 1, qualityScore: 95, efficiency: 'excellent', terminalId: 'terminal1' },
    { workerId: 'worker2', workerName: 'Dedi Kurniawan', completedOrders: 22, avgCompletionTime: 3.8, overdueCount: 4, qualityScore: 82, efficiency: 'average', terminalId: 'terminal2' },
    { workerId: 'worker3', workerName: 'Eko Santoso', completedOrders: 25, avgCompletionTime: 3.0, overdueCount: 2, qualityScore: 89, efficiency: 'good', terminalId: 'terminal1' },
    { workerId: 'worker4', workerName: 'Fajar Nugroho', completedOrders: 31, avgCompletionTime: 2.3, overdueCount: 0, qualityScore: 97, efficiency: 'excellent', terminalId: 'terminal3' },
    { workerId: 'worker5', workerName: 'Gunawan Sari', completedOrders: 19, avgCompletionTime: 4.1, overdueCount: 6, qualityScore: 75, efficiency: 'poor', terminalId: 'terminal4' },
    { workerId: 'worker6', workerName: 'Hendra Pratama', completedOrders: 26, avgCompletionTime: 2.8, overdueCount: 2, qualityScore: 91, efficiency: 'excellent', terminalId: 'terminal5' },
    { workerId: 'worker7', workerName: 'Indra Mahendra', completedOrders: 23, avgCompletionTime: 3.5, overdueCount: 3, qualityScore: 85, efficiency: 'good', terminalId: 'terminal2' },
    { workerId: 'worker8', workerName: 'Joko Sutrisno', completedOrders: 20, avgCompletionTime: 3.9, overdueCount: 5, qualityScore: 78, efficiency: 'average', terminalId: 'terminal6' },
    { workerId: 'worker9', workerName: 'Kurniawan Adi', completedOrders: 29, avgCompletionTime: 2.6, overdueCount: 1, qualityScore: 93, efficiency: 'excellent', terminalId: 'terminal7' },
    { workerId: 'worker10', workerName: 'Lucky Firmansyah', completedOrders: 24, avgCompletionTime: 3.2, overdueCount: 3, qualityScore: 87, efficiency: 'good', terminalId: 'terminal8' },
    { workerId: 'worker11', workerName: 'Made Suartika', completedOrders: 27, avgCompletionTime: 2.9, overdueCount: 2, qualityScore: 90, efficiency: 'good', terminalId: 'terminal9' },
    { workerId: 'worker12', workerName: 'Nanda Pratama', completedOrders: 21, avgCompletionTime: 3.7, overdueCount: 4, qualityScore: 80, efficiency: 'average', terminalId: 'terminal10' },
    { workerId: 'worker13', workerName: 'Oka Mahendra', completedOrders: 18, avgCompletionTime: 4.3, overdueCount: 7, qualityScore: 72, efficiency: 'poor', terminalId: 'terminal11' },
    { workerId: 'worker14', workerName: 'Putu Wijaya', completedOrders: 30, avgCompletionTime: 2.4, overdueCount: 1, qualityScore: 96, efficiency: 'excellent', terminalId: 'terminal12' },
    { workerId: 'worker15', workerName: 'Ravi Sharma', completedOrders: 26, avgCompletionTime: 3.1, overdueCount: 2, qualityScore: 88, efficiency: 'good', terminalId: 'terminal3' }
  ];

  const workerPerformance = computed((): WorkerPerformance[] => baseWorkerPerformance());

  // Base overdue reports data (expanded for pagination testing)
  const baseOverdueReports = (): OverdueReport[] => [
    { workOrderId: 'wo002', title: 'Generator Maintenance', assignedWorker: 'Dedi Kurniawan', terminalId: 'terminal2', dueDate: '2024-12-20', daysOverdue: 5, priority: 'normal', status: 'overdue', estimatedPenalty: 150 },
    { workOrderId: 'wo005', title: 'Safety Valve Inspection', assignedWorker: 'Eko Santoso', terminalId: 'terminal1', dueDate: '2024-12-22', daysOverdue: 3, priority: 'high', status: 'overdue', estimatedPenalty: 225 },
    { workOrderId: 'wo008', title: 'Pump System Check', assignedWorker: 'Gunawan Sari', terminalId: 'terminal4', dueDate: '2024-12-18', daysOverdue: 7, priority: 'critical', status: 'overdue', estimatedPenalty: 350 },
    { workOrderId: 'wo012', title: 'Compressor Service', assignedWorker: 'Joko Sutrisno', terminalId: 'terminal6', dueDate: '2024-12-21', daysOverdue: 4, priority: 'normal', status: 'overdue', estimatedPenalty: 200 },
    { workOrderId: 'wo015', title: 'Fire System Test', assignedWorker: 'Oka Mahendra', terminalId: 'terminal11', dueDate: '2024-12-19', daysOverdue: 6, priority: 'high', status: 'overdue', estimatedPenalty: 300 },
    { workOrderId: 'wo018', title: 'Pipeline Inspection', assignedWorker: 'Nanda Pratama', terminalId: 'terminal10', dueDate: '2024-12-23', daysOverdue: 2, priority: 'low', status: 'overdue', estimatedPenalty: 100 },
    { workOrderId: 'wo021', title: 'Electrical Panel Check', assignedWorker: 'Indra Mahendra', terminalId: 'terminal2', dueDate: '2024-12-17', daysOverdue: 8, priority: 'critical', status: 'overdue', estimatedPenalty: 400 },
    { workOrderId: 'wo024', title: 'Loading Arm Service', assignedWorker: 'Lucky Firmansyah', terminalId: 'terminal8', dueDate: '2024-12-24', daysOverdue: 1, priority: 'normal', status: 'overdue', estimatedPenalty: 75 },
    { workOrderId: 'wo027', title: 'Tank Cleaning', assignedWorker: 'Made Suartika', terminalId: 'terminal9', dueDate: '2024-12-16', daysOverdue: 9, priority: 'high', status: 'overdue', estimatedPenalty: 450 },
    { workOrderId: 'wo030', title: 'Control System Update', assignedWorker: 'Hendra Pratama', terminalId: 'terminal5', dueDate: '2024-12-25', daysOverdue: 0, priority: 'low', status: 'overdue', estimatedPenalty: 50 }
  ];

  const overdueReports = computed((): OverdueReport[] => baseOverdueReports());

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

  // Enterprise-standard filtering and pagination for Terminal Performance
  const filteredAndSearchedTerminals = computed(() => {
    let result = baseTerminalPerformance();

    // Apply search query
    if (terminalSearchQuery.value.trim()) {
      const search = terminalSearchQuery.value.trim().toLowerCase();
      result = result.filter(terminal =>
        terminal.terminalName.toLowerCase().includes(search) ||
        terminal.terminalId.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (terminalSortBy.value) {
        case 'terminalName':
          aValue = a.terminalName.toLowerCase();
          bValue = b.terminalName.toLowerCase();
          break;
        case 'completionRate':
          aValue = a.completionRate;
          bValue = b.completionRate;
          break;
        case 'avgCompletionTime':
          aValue = a.avgCompletionTime;
          bValue = b.avgCompletionTime;
          break;
        case 'overdueCount':
          aValue = a.overdueCount;
          bValue = b.overdueCount;
          break;
        case 'totalCost':
          aValue = a.totalCost;
          bValue = b.totalCost;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return terminalSortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return terminalSortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });

    // Update pagination total
    terminalPaginationState.value.totalItems = result.length;
    terminalPaginationState.value.totalPages = Math.ceil(result.length / terminalPaginationState.value.pageSize);
    
    // Ensure current page is valid
    if (terminalPaginationState.value.currentPage > terminalPaginationState.value.totalPages && terminalPaginationState.value.totalPages > 0) {
      terminalPaginationState.value.currentPage = terminalPaginationState.value.totalPages;
    }

    return result;
  });

  const paginatedTerminals = computed(() => {
    const startIndex = (terminalPaginationState.value.currentPage - 1) * terminalPaginationState.value.pageSize;
    const endIndex = startIndex + terminalPaginationState.value.pageSize;
    return filteredAndSearchedTerminals.value.slice(startIndex, endIndex);
  });

  // Enterprise-standard filtering and pagination for Worker Performance
  const filteredAndSearchedWorkers = computed(() => {
    let result = baseWorkerPerformance();

    // Apply search query
    if (workerSearchQuery.value.trim()) {
      const search = workerSearchQuery.value.trim().toLowerCase();
      result = result.filter(worker =>
        worker.workerName.toLowerCase().includes(search) ||
        worker.workerId.toLowerCase().includes(search) ||
        worker.terminalId.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (workerSortBy.value) {
        case 'workerName':
          aValue = a.workerName.toLowerCase();
          bValue = b.workerName.toLowerCase();
          break;
        case 'completedOrders':
          aValue = a.completedOrders;
          bValue = b.completedOrders;
          break;
        case 'avgCompletionTime':
          aValue = a.avgCompletionTime;
          bValue = b.avgCompletionTime;
          break;
        case 'qualityScore':
          aValue = a.qualityScore;
          bValue = b.qualityScore;
          break;
        case 'efficiency':
          aValue = a.efficiency;
          bValue = b.efficiency;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return workerSortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return workerSortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });

    // Update pagination total
    workerPaginationState.value.totalItems = result.length;
    workerPaginationState.value.totalPages = Math.ceil(result.length / workerPaginationState.value.pageSize);
    
    if (workerPaginationState.value.currentPage > workerPaginationState.value.totalPages && workerPaginationState.value.totalPages > 0) {
      workerPaginationState.value.currentPage = workerPaginationState.value.totalPages;
    }

    return result;
  });

  const paginatedWorkers = computed(() => {
    const startIndex = (workerPaginationState.value.currentPage - 1) * workerPaginationState.value.pageSize;
    const endIndex = startIndex + workerPaginationState.value.pageSize;
    return filteredAndSearchedWorkers.value.slice(startIndex, endIndex);
  });

  // Enterprise-standard filtering and pagination for Overdue Reports
  const filteredAndSearchedOverdue = computed(() => {
    let result = baseOverdueReports();

    // Apply search query
    if (overdueSearchQuery.value.trim()) {
      const search = overdueSearchQuery.value.trim().toLowerCase();
      result = result.filter(report =>
        report.title.toLowerCase().includes(search) ||
        report.workOrderId.toLowerCase().includes(search) ||
        report.assignedWorker.toLowerCase().includes(search) ||
        report.terminalId.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (overdueSortBy.value) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'assignedWorker':
          aValue = a.assignedWorker.toLowerCase();
          bValue = b.assignedWorker.toLowerCase();
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'daysOverdue':
          aValue = a.daysOverdue;
          bValue = b.daysOverdue;
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        case 'estimatedPenalty':
          aValue = a.estimatedPenalty;
          bValue = b.estimatedPenalty;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return overdueSortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return overdueSortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });

    // Update pagination total
    overduePaginationState.value.totalItems = result.length;
    overduePaginationState.value.totalPages = Math.ceil(result.length / overduePaginationState.value.pageSize);
    
    if (overduePaginationState.value.currentPage > overduePaginationState.value.totalPages && overduePaginationState.value.totalPages > 0) {
      overduePaginationState.value.currentPage = overduePaginationState.value.totalPages;
    }

    return result;
  });

  const paginatedOverdueReports = computed(() => {
    const startIndex = (overduePaginationState.value.currentPage - 1) * overduePaginationState.value.pageSize;
    const endIndex = startIndex + overduePaginationState.value.pageSize;
    return filteredAndSearchedOverdue.value.slice(startIndex, endIndex);
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

  // Enterprise pagination methods for Terminal Performance
  const setTerminalPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, terminalPaginationState.value.totalPages));
    terminalPaginationState.value.currentPage = newPage;
  };

  const setTerminalPageSize = (pageSize: number) => {
    const currentFirstItem = (terminalPaginationState.value.currentPage - 1) * terminalPaginationState.value.pageSize;
    terminalPaginationState.value.pageSize = pageSize;
    const newPage = Math.floor(currentFirstItem / pageSize) + 1;
    setTerminalPage(newPage);
  };

  const setTerminalSearchQuery = (query: string) => {
    terminalSearchQuery.value = query;
    terminalPaginationState.value.currentPage = 1; // Reset to first page when search changes
  };

  const setTerminalSort = (field: string) => {
    const validFields = ['terminalName', 'completionRate', 'avgCompletionTime', 'overdueCount', 'totalCost'];
    if (validFields.includes(field)) {
      if (terminalSortBy.value === field) {
        terminalSortOrder.value = terminalSortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        terminalSortBy.value = field as any;
        terminalSortOrder.value = 'asc';
      }
      terminalPaginationState.value.currentPage = 1;
    }
  };

  // Enterprise pagination methods for Worker Performance
  const setWorkerPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, workerPaginationState.value.totalPages));
    workerPaginationState.value.currentPage = newPage;
  };

  const setWorkerPageSize = (pageSize: number) => {
    const currentFirstItem = (workerPaginationState.value.currentPage - 1) * workerPaginationState.value.pageSize;
    workerPaginationState.value.pageSize = pageSize;
    const newPage = Math.floor(currentFirstItem / pageSize) + 1;
    setWorkerPage(newPage);
  };

  const setWorkerSearchQuery = (query: string) => {
    workerSearchQuery.value = query;
    workerPaginationState.value.currentPage = 1;
  };

  const setWorkerSort = (field: string) => {
    const validFields = ['workerName', 'completedOrders', 'avgCompletionTime', 'qualityScore', 'efficiency'];
    if (validFields.includes(field)) {
      if (workerSortBy.value === field) {
        workerSortOrder.value = workerSortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        workerSortBy.value = field as any;
        workerSortOrder.value = 'asc';
      }
      workerPaginationState.value.currentPage = 1;
    }
  };

  // Enterprise pagination methods for Overdue Reports
  const setOverduePage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, overduePaginationState.value.totalPages));
    overduePaginationState.value.currentPage = newPage;
  };

  const setOverduePageSize = (pageSize: number) => {
    const currentFirstItem = (overduePaginationState.value.currentPage - 1) * overduePaginationState.value.pageSize;
    overduePaginationState.value.pageSize = pageSize;
    const newPage = Math.floor(currentFirstItem / pageSize) + 1;
    setOverduePage(newPage);
  };

  const setOverdueSearchQuery = (query: string) => {
    overdueSearchQuery.value = query;
    overduePaginationState.value.currentPage = 1;
  };

  const setOverdueSort = (field: string) => {
    const validFields = ['title', 'assignedWorker', 'dueDate', 'daysOverdue', 'priority', 'estimatedPenalty'];
    if (validFields.includes(field)) {
      if (overdueSortBy.value === field) {
        overdueSortOrder.value = overdueSortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        overdueSortBy.value = field as any;
        overdueSortOrder.value = 'asc';
      }
      overduePaginationState.value.currentPage = 1;
    }
  };

  // Clear all filters method
  const clearAllFilters = () => {
    terminalSearchQuery.value = '';
    workerSearchQuery.value = '';
    overdueSearchQuery.value = '';
    terminalPaginationState.value.currentPage = 1;
    workerPaginationState.value.currentPage = 1;
    overduePaginationState.value.currentPage = 1;
  };

  // ============================================
  // DRILL-DOWN REPORT METHODS
  // ============================================

  // Mock region data
  const regions = [
    { id: 'region1', name: 'Region 1 - Sumatera Utara' },
    { id: 'region2', name: 'Region 2 - Sumatera Selatan' },
    { id: 'region3', name: 'Region 3 - Jawa Barat' },
    { id: 'region4', name: 'Region 4 - Jawa Timur' },
    { id: 'region5', name: 'Region 5 - Kalimantan' },
    { id: 'region6', name: 'Region 6 - Sulawesi' },
    { id: 'region7', name: 'Region 7 - Bali & Nusa Tenggara' },
    { id: 'region8', name: 'Region 8 - Papua & Maluku' }
  ];

  // Mock terminals data
  const getTerminalsForRegion = (regionId: string) => {
    const regionNum = parseInt(regionId.replace('region', ''));
    const startTerminal = (regionNum - 1) * 15 + 1;
    const endTerminal = Math.min(regionNum * 15, 116);

    const terminals = [];
    for (let i = startTerminal; i <= endTerminal; i++) {
      terminals.push({
        id: `terminal${i}`,
        name: `Terminal ${i}`,
        regionId
      });
    }
    return terminals;
  };

  // Get region name
  const getRegionName = (regionId: string): string => {
    return regions.find(r => r.id === regionId)?.name || regionId;
  };

  // Get terminal name
  const getTerminalName = (terminalId: string): string => {
    const terminalNum = terminalId.replace('terminal', '');
    return `Terminal ${terminalNum}`;
  };

  // Get worker name (mock)
  const getWorkerName = (workerId: string): string => {
    const workers = baseWorkerPerformance();
    return workers.find(w => w.workerId === workerId)?.workerName || workerId;
  };

  // Build breadcrumb for drill-down navigation
  const buildBreadcrumb = (
    reportPath: string,
    level: DrillDownLevel,
    regionId?: string,
    terminalId?: string,
    workerId?: string
  ): BreadcrumbItem[] => {
    const breadcrumb: BreadcrumbItem[] = [
      { label: 'Work Order Status', path: reportPath, level: 'all' }
    ];

    if (regionId && level !== 'all') {
      breadcrumb.push({
        label: getRegionName(regionId),
        path: `${reportPath}/${regionId}`,
        level: 'region'
      });
    }

    if (terminalId && (level === 'terminal' || level === 'worker')) {
      breadcrumb.push({
        label: getTerminalName(terminalId),
        path: `${reportPath}/${regionId}/${terminalId}`,
        level: 'terminal'
      });
    }

    if (workerId && level === 'worker') {
      breadcrumb.push({
        label: getWorkerName(workerId),
        path: `${reportPath}/${regionId}/${terminalId}/${workerId}`,
        level: 'worker'
      });
    }

    return breadcrumb;
  };

  // Apply role-based data filtering
  const applyRoleBasedFilter = (regionIds: string[], terminalIds: string[]): { regionIds: string[], terminalIds: string[] } => {
    const authStore = useAuthStore();
    const user = authStore.currentUser;

    if (!user) {
      return { regionIds: [], terminalIds: [] };
    }

    // Admin: Own terminal only
    if (authStore.isAdmin && user.terminalId) {
      return {
        regionIds: user.regionId ? [user.regionId] : [],
        terminalIds: [user.terminalId]
      };
    }

    // Supervisor/Leader: Their region's terminals
    if ((authStore.isSupervisor || authStore.isLeader) && user.regionId) {
      const regionTerminals = getTerminalsForRegion(user.regionId);
      return {
        regionIds: [user.regionId],
        terminalIds: terminalIds.length > 0
          ? terminalIds.filter(t => regionTerminals.some(rt => rt.id === t))
          : regionTerminals.map(t => t.id)
      };
    }

    // Worker: Own work only (handled at work order level)
    if (authStore.isWorker) {
      return {
        regionIds: user.regionId ? [user.regionId] : [],
        terminalIds: user.terminalId ? [user.terminalId] : []
      };
    }

    // Default: return as-is (for development/testing)
    return { regionIds, terminalIds };
  };

  // Get Work Order Status Report data
  const getWorkOrderStatusReport = (
    context: DrillDownContext,
    filters: { dateStart: string; dateEnd: string; statuses: string[]; }
  ): { summary: WorkOrderStatusSummary; rows: WorkOrderStatusRow[] } => {
    // Mock data generation based on drill-down level
    const summary: WorkOrderStatusSummary = {
      total: 100,
      byStatus: {
        'draft': 5,
        'pending_approval': 10,
        'assigned': 15,
        'in_progress': 25,
        'submitted_for_review': 12,
        'completed': 28,
        'rejected': 3,
        'revision_required': 2
      },
      byType: {
        'preventive': 65,
        'corrective': 35
      },
      byPriority: {
        'low': 20,
        'normal': 45,
        'high': 25,
        'urgent': 10
      },
      completionRate: 92,
      overdueCount: 5,
      avgCompletionTime: 3.2
    };

    let rows: WorkOrderStatusRow[] = [];

    switch (context.level) {
      case 'all':
        // Return aggregated data by region
        rows = regions.map(region => ({
          id: region.id,
          name: region.name,
          totalWorkOrders: Math.floor(Math.random() * 50) + 10,
          completed: Math.floor(Math.random() * 30) + 5,
          inProgress: Math.floor(Math.random() * 15) + 2,
          pending: Math.floor(Math.random() * 10) + 1,
          overdue: Math.floor(Math.random() * 5),
          completionRate: Math.floor(Math.random() * 20) + 80,
          avgCompletionTime: parseFloat((Math.random() * 3 + 2).toFixed(1)),
          isClickable: true
        }));
        break;

      case 'region':
        // Return aggregated data by terminal
        const terminals = getTerminalsForRegion(context.regionId || 'region1');
        rows = terminals.map(terminal => ({
          id: terminal.id,
          name: terminal.name,
          totalWorkOrders: Math.floor(Math.random() * 20) + 5,
          completed: Math.floor(Math.random() * 15) + 2,
          inProgress: Math.floor(Math.random() * 8) + 1,
          pending: Math.floor(Math.random() * 5),
          overdue: Math.floor(Math.random() * 3),
          completionRate: Math.floor(Math.random() * 20) + 80,
          avgCompletionTime: parseFloat((Math.random() * 3 + 2).toFixed(1)),
          isClickable: true
        }));
        break;

      case 'terminal':
        // Return aggregated data by worker
        const workers = baseWorkerPerformance().filter(w =>
          w.terminalId === context.terminalId
        );
        rows = workers.length > 0 ? workers.map(worker => ({
          id: worker.workerId,
          name: worker.workerName,
          totalWorkOrders: worker.completedOrders + worker.overdueCount + Math.floor(Math.random() * 5),
          completed: worker.completedOrders,
          inProgress: Math.floor(Math.random() * 5) + 1,
          pending: Math.floor(Math.random() * 3),
          overdue: worker.overdueCount,
          completionRate: worker.qualityScore,
          avgCompletionTime: worker.avgCompletionTime,
          isClickable: true
        })) : [
          // Fallback mock data
          {
            id: 'worker_mock_1',
            name: 'Mock Worker 1',
            totalWorkOrders: 15,
            completed: 10,
            inProgress: 3,
            pending: 1,
            overdue: 1,
            completionRate: 85,
            avgCompletionTime: 2.5,
            isClickable: true
          }
        ];
        break;

      case 'worker':
        // Worker level doesn't have aggregated rows - use individual work orders instead
        break;
    }

    return { summary, rows };
  };

  // Get individual work orders for worker-level drill-down
  const getWorkOrdersForWorker = (
    workerId: string,
    filters: { dateStart: string; dateEnd: string; statuses: string[]; }
  ): WorkOrderDetailRow[] => {
    // Mock work order details for a specific worker
    const statuses = ['draft', 'pending_approval', 'in_progress', 'completed', 'overdue'];
    const priorities = ['low', 'normal', 'high', 'urgent'];
    const types = ['preventive', 'corrective'];

    const mockWorkOrders: WorkOrderDetailRow[] = [];
    const count = Math.floor(Math.random() * 10) + 5;

    for (let i = 1; i <= count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)] || 'draft';
      const isOverdue = status === 'overdue' || (status !== 'completed' && Math.random() > 0.8);

      const dueDate = new Date(Date.now() + (Math.random() * 14 - 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      mockWorkOrders.push({
        id: `wo_${workerId}_${i}`,
        code: `WO-${workerId.replace('worker', 'W')}-${String(i).padStart(3, '0')}`,
        title: `Maintenance Task ${i}`,
        status: isOverdue ? 'overdue' : status,
        priority: priorities[Math.floor(Math.random() * priorities.length)] || 'normal',
        type: types[Math.floor(Math.random() * types.length)] || 'preventive',
        terminalName: getTerminalName(`terminal${Math.floor(Math.random() * 10) + 1}`),
        workerName: getWorkerName(workerId),
        dueDate: dueDate || '',
        daysOverdue: isOverdue ? Math.floor(Math.random() * 7) + 1 : undefined,
        isClickable: true
      });
    }

    return mockWorkOrders;
  };

  // Get Overdue Report data
  const getOverdueReportData = (
    context: DrillDownContext,
    filters: { dateStart: string; dateEnd: string; }
  ): { summary: { total: number; totalPenalty: number }; rows: any[] } => {
    const overdueData = baseOverdueReports();

    const summary = {
      total: overdueData.length,
      totalPenalty: overdueData.reduce((sum, item) => sum + item.estimatedPenalty, 0)
    };

    // Add urgency indicator based on days overdue
    const rows = overdueData.map(item => ({
      ...item,
      urgency: item.daysOverdue <= 2 ? 'low' : item.daysOverdue <= 5 ? 'medium' : 'high',
      isClickable: true
    }));

    return { summary, rows };
  };

  // Get Activity Report data
  const getActivityReport = (
    context: DrillDownContext,
    filters: { dateStart: string; dateEnd: string; },
    period: 'daily' | 'weekly'
  ): ActivityItem[] => {
    const authStore = useAuthStore();
    const currentUser = authStore.currentUser;
    const activities: ActivityItem[] = [];
    const activityTypes: ActivityItem['type'][] = ['created', 'started', 'completed', 'submitted', 'approved', 'rejected'];

    // Generate mock activities for the past 7 or 30 days
    const daysCount = period === 'daily' ? 7 : 30;

    // For workers, generate activities only for themselves
    const isWorker = authStore.isWorker;

    for (let day = 0; day < daysCount; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      // Generate 2-5 activities per day (fewer for workers)
      const activitiesPerDay = isWorker
        ? Math.floor(Math.random() * 2) + 1
        : Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < activitiesPerDay; i++) {
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)] || 'created';
        const workers = baseWorkerPerformance();

        // For workers, use their own data; for others, use random worker
        let worker;
        if (isWorker && currentUser) {
          worker = {
            workerId: currentUser.id,
            workerName: currentUser.name,
            terminalId: currentUser.terminalId || 'terminal1'
          };
        } else {
          worker = workers[Math.floor(Math.random() * workers.length)];
        }

        if (!worker) continue;

        activities.push({
          id: `activity_${day}_${i}`,
          timestamp: new Date(date.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          type,
          workOrderId: `wo_${Math.floor(Math.random() * 100)}`,
          workOrderTitle: `Maintenance Task ${Math.floor(Math.random() * 100)}`,
          workOrderCode: `WO-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
          userId: worker.workerId,
          userName: worker.workerName,
          terminalName: getTerminalName(worker.terminalId),
          description: getActivityDescription(type)
        });
      }
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities;
  };

  const getActivityDescription = (type: ActivityItem['type']): string => {
    const descriptions: Record<ActivityItem['type'], string> = {
      'created': 'Work order created',
      'started': 'Work started - Before documentation submitted',
      'completed': 'Work completed - After documentation submitted',
      'submitted': 'Submitted for supervisor review',
      'approved': 'Approved by supervisor',
      'rejected': 'Rejected - Revision required',
      'overdue': 'Work order became overdue'
    };
    return descriptions[type];
  };

  // Get available terminals for filtering (scoped by role)
  const getAvailableTerminals = computed(() => {
    const authStore = useAuthStore();
    const user = authStore.currentUser;

    if (!user) return [];

    // Admin: Own terminal only
    if (authStore.isAdmin && user.terminalId) {
      return [{ id: user.terminalId, name: getTerminalName(user.terminalId) }];
    }

    // Supervisor/Leader: Their region's terminals
    if ((authStore.isSupervisor || authStore.isLeader) && user.regionId) {
      return getTerminalsForRegion(user.regionId);
    }

    // For development: return all terminals from first few regions
    const allTerminals: { id: string; name: string }[] = [];
    for (let i = 1; i <= 3; i++) {
      allTerminals.push(...getTerminalsForRegion(`region${i}`));
    }
    return allTerminals;
  });

  // Get available regions for filtering (scoped by role)
  const getAvailableRegions = computed(() => {
    const authStore = useAuthStore();
    const user = authStore.currentUser;

    if (!user) return [];

    // Admin/Supervisor/Leader: Their region only
    if (user.regionId) {
      return regions.filter(r => r.id === user.regionId);
    }

    // For development: return all regions
    return regions;
  });

  return {
    // State
    loading,
    dateRange,
    selectedFilters,

    // Pagination state (enterprise standard)
    terminalPaginationState: readonly(terminalPaginationState),
    workerPaginationState: readonly(workerPaginationState),
    overduePaginationState: readonly(overduePaginationState),
    
    // Search and sort state
    terminalSearchQuery: readonly(terminalSearchQuery),
    workerSearchQuery: readonly(workerSearchQuery),
    overdueSearchQuery: readonly(overdueSearchQuery),
    terminalSortBy: readonly(terminalSortBy),
    terminalSortOrder: readonly(terminalSortOrder),
    workerSortBy: readonly(workerSortBy),
    workerSortOrder: readonly(workerSortOrder),
    overdueSortBy: readonly(overdueSortBy),
    overdueSortOrder: readonly(overdueSortOrder),
    
    // Paginated data
    paginatedTerminals,
    paginatedWorkers,
    paginatedOverdueReports,
    
    // Original computed data
    keyMetrics,
    chartData,
    terminalPerformance,
    workerPerformance,
    overdueReports,
    costAnalysis,
    
    // Terminal pagination actions
    setTerminalPage,
    setTerminalPageSize,
    setTerminalSearchQuery,
    setTerminalSort,
    
    // Worker pagination actions
    setWorkerPage,
    setWorkerPageSize,
    setWorkerSearchQuery,
    setWorkerSort,
    
    // Overdue pagination actions
    setOverduePage,
    setOverduePageSize,
    setOverdueSearchQuery,
    setOverdueSort,
    
    // General actions
    updateDateRange,
    updateFilters,
    exportReport,
    refreshReports,
    clearAllFilters,

    // Drill-down report methods
    regions,
    getRegionName,
    getTerminalName,
    getWorkerName,
    getTerminalsForRegion,
    buildBreadcrumb,
    applyRoleBasedFilter,
    getWorkOrderStatusReport,
    getWorkOrdersForWorker,
    getOverdueReportData,
    getActivityReport,
    getAvailableTerminals,
    getAvailableRegions
  };
});