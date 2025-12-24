<template>
  <ReportLayout
    :title="'Activity Report'"
    :subtitle="reportSubtitle"
    :breadcrumb="breadcrumb"
    :loading="loading"
    :show-filters="true"
    :show-refresh="true"
    :date-range="dateRange"
    :available-terminals="availableTerminals"
    :selected-terminals="selectedTerminals"
    :summary-metrics="summaryMetrics"
    :export-data="exportData"
    export-filename="activity-report"
    @update:date-range="handleDateRangeUpdate"
    @update:selected-terminals="selectedTerminals = $event"
    @apply-filters="loadReportData"
    @reset-filters="resetFilters"
    @refresh="loadReportData"
  >
    <!-- Period Toggle -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-gray-700">View Period:</span>
        <div class="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            @click="period = 'daily'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              period === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            Daily (7 Days)
          </button>
          <button
            @click="period = 'weekly'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200',
              period === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            Weekly (30 Days)
          </button>
        </div>
      </div>

      <!-- Activity Type Filter -->
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-gray-700">Filter:</span>
        <select
          v-model="activityTypeFilter"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Activities</option>
          <option value="created">Created</option>
          <option value="started">Started</option>
          <option value="completed">Completed</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <!-- Activity Type Summary -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div
        v-for="(count, type) in activityTypeCounts"
        :key="type"
        class="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
        :class="{ 'ring-2 ring-blue-500': activityTypeFilter === type }"
        @click="activityTypeFilter = activityTypeFilter === type ? '' : type"
      >
        <div class="flex items-center space-x-3">
          <div
            class="p-2 rounded-lg"
            :class="getActivityIconBackground(type)"
          >
            <component
              :is="getActivityIcon(type)"
              class="h-5 w-5"
              :class="getActivityIconColor(type)"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ count }}</p>
            <p class="text-xs text-gray-500 capitalize">{{ type }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Activity Timeline</h3>
          <span class="text-sm text-gray-500">{{ filteredActivities.length }} activities</span>
        </div>
      </div>

      <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        <!-- Group activities by date -->
        <template v-for="(group, date) in groupedActivities" :key="date">
          <!-- Date Header -->
          <div class="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h4 class="text-sm font-medium text-gray-700">
              {{ formatDateHeader(date) }}
              <span class="text-gray-500 ml-2">({{ group.length }} activities)</span>
            </h4>
          </div>

          <!-- Activities for this date -->
          <div
            v-for="activity in group"
            :key="activity.id"
            class="flex items-start space-x-4 px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="handleActivityClick(activity)"
          >
            <!-- Activity Icon -->
            <div
              class="flex-shrink-0 p-2 rounded-lg"
              :class="getActivityIconBackground(activity.type)"
            >
              <component
                :is="getActivityIcon(activity.type)"
                class="h-5 w-5"
                :class="getActivityIconColor(activity.type)"
              />
            </div>

            <!-- Activity Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">
                  {{ activity.description }}
                </p>
                <span class="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {{ formatTime(activity.timestamp) }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-600">
                <span class="font-medium">{{ activity.workOrderCode }}</span>
                - {{ activity.workOrderTitle }}
              </p>
              <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                <span class="flex items-center">
                  <User class="h-3 w-3 mr-1" />
                  {{ activity.userName }}
                </span>
                <span class="flex items-center">
                  <MapPin class="h-3 w-3 mr-1" />
                  {{ activity.terminalName }}
                </span>
              </div>
            </div>

            <!-- Navigate Arrow -->
            <ChevronRight class="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>
        </template>

        <!-- Empty State -->
        <div v-if="filteredActivities.length === 0" class="px-4 py-12 text-center">
          <Activity class="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p class="text-sm font-medium text-gray-500">No activities found</p>
          <p class="text-xs text-gray-400 mt-1">Try adjusting your filters or date range</p>
        </div>
      </div>
    </div>
  </ReportLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  ChevronRight,
  User,
  MapPin,
  Activity,
  Plus,
  Play,
  CheckCircle2,
  Send,
  ThumbsUp,
  XCircle,
  AlertTriangle
} from 'lucide-vue-next';
import ReportLayout from '@/components/reports/ReportLayout.vue';
import { useReportsStore, type ActivityItem } from '@/stores/reports';

const router = useRouter();
const reportsStore = useReportsStore();

// State
const loading = ref(false);
const period = ref<'daily' | 'weekly'>('daily');
const activityTypeFilter = ref('');
const getDateString = (date: Date): string => {
  const isoString = date.toISOString();
  return isoString.split('T')[0] || '';
};

const dateRange = ref({
  start: getDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  end: getDateString(new Date())
});
const selectedTerminals = ref<string[]>([]);
const activities = ref<ActivityItem[]>([]);

// Breadcrumb
const breadcrumb = computed(() => [
  { label: 'Activity Report', path: '/reports/activity', level: 'all' as const }
]);

// Computed
const reportSubtitle = computed(() => {
  const periodLabel = period.value === 'daily' ? 'Last 7 Days' : 'Last 30 Days';
  return `${periodLabel} | ${filteredActivities.value.length} activities`;
});

const filteredActivities = computed(() => {
  if (!activityTypeFilter.value) return activities.value;
  return activities.value.filter(a => a.type === activityTypeFilter.value);
});

const groupedActivities = computed(() => {
  const groups: Record<string, ActivityItem[]> = {};

  filteredActivities.value.forEach(activity => {
    const date = activity.timestamp.split('T')[0] || '';
    if (!date) return;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
  });

  // Sort dates descending
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  const sortedGroups: Record<string, ActivityItem[]> = {};
  sortedDates.forEach(date => {
    const items = groups[date];
    if (items) {
      sortedGroups[date] = items;
    }
  });

  return sortedGroups;
});

const activityTypeCounts = computed((): Record<string, number> => {
  const counts: Record<string, number> = {
    created: 0,
    started: 0,
    completed: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  };

  activities.value.forEach(activity => {
    const activityType = activity.type;
    if (activityType && activityType in counts) {
      const currentCount = counts[activityType];
      if (currentCount !== undefined) {
        counts[activityType] = currentCount + 1;
      }
    }
  });

  return counts;
});

const summaryMetrics = computed(() => [
  {
    id: 'total_activities',
    label: 'Total Activities',
    value: activities.value.length,
    icon: 'activity',
    iconColor: 'blue' as const
  },
  {
    id: 'completed',
    label: 'Completed',
    value: activityTypeCounts.value.completed ?? 0,
    icon: 'check-circle',
    iconColor: 'green' as const
  },
  {
    id: 'in_progress',
    label: 'Started',
    value: activityTypeCounts.value.started ?? 0,
    icon: 'clock',
    iconColor: 'blue' as const
  },
  {
    id: 'rejected',
    label: 'Rejected',
    value: activityTypeCounts.value.rejected ?? 0,
    icon: 'x-circle',
    iconColor: 'red' as const
  }
]);

const availableTerminals = computed(() => {
  return reportsStore.getAvailableTerminals;
});

const exportData = computed(() => {
  return filteredActivities.value.map(activity => ({
    'Timestamp': activity.timestamp,
    'Type': activity.type,
    'Work Order': activity.workOrderCode,
    'Title': activity.workOrderTitle,
    'User': activity.userName,
    'Terminal': activity.terminalName,
    'Description': activity.description
  }));
});

// Methods
const loadReportData = async () => {
  loading.value = true;

  try {
    activities.value = reportsStore.getActivityReport(
      { level: 'all', breadcrumb: [] },
      { dateStart: dateRange.value.start, dateEnd: dateRange.value.end },
      period.value
    );
  } finally {
    loading.value = false;
  }
};

const handleActivityClick = (activity: ActivityItem) => {
  router.push(`/work-orders/${activity.workOrderId}`);
};

const handleDateRangeUpdate = (newRange: { start: string; end: string }) => {
  dateRange.value = newRange;
};

const resetFilters = () => {
  selectedTerminals.value = [];
  activityTypeFilter.value = '';
  dateRange.value = {
    start: getDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    end: getDateString(new Date())
  };
  loadReportData();
};

const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === getDateString(today)) {
    return 'Today';
  }
  if (dateString === getDateString(yesterday)) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'created': Plus,
    'started': Play,
    'completed': CheckCircle2,
    'submitted': Send,
    'approved': ThumbsUp,
    'rejected': XCircle,
    'overdue': AlertTriangle
  };
  return iconMap[type] || Activity;
};

const getActivityIconBackground = (type: string): string => {
  const bgMap: Record<string, string> = {
    'created': 'bg-blue-50',
    'started': 'bg-purple-50',
    'completed': 'bg-green-50',
    'submitted': 'bg-indigo-50',
    'approved': 'bg-green-50',
    'rejected': 'bg-red-50',
    'overdue': 'bg-yellow-50'
  };
  return bgMap[type] || 'bg-gray-50';
};

const getActivityIconColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'created': 'text-blue-600',
    'started': 'text-purple-600',
    'completed': 'text-green-600',
    'submitted': 'text-indigo-600',
    'approved': 'text-green-600',
    'rejected': 'text-red-600',
    'overdue': 'text-yellow-600'
  };
  return colorMap[type] || 'text-gray-600';
};

// Watch for period change
watch(period, () => {
  loadReportData();
});

// Lifecycle
onMounted(() => {
  loadReportData();
});
</script>
