<template>
  <div class="space-y-6">
    <!-- Template Header -->
    <div class="border-b pb-4">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold">{{ template.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ template.description }}</p>
          <div class="flex items-center space-x-2 mt-2">
            <Badge :variant="getStatusVariant(template.status)">
              {{ template.status }}
            </Badge>
            <Badge variant="outline">{{ template.type }}</Badge>
            <code class="text-xs bg-muted px-1 py-0.5 rounded">{{ template.code }}</code>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Select v-model="selectedTimeRange">
            <SelectTrigger class="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" @click="refreshAnalytics">
            <RefreshCw class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Usage Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <TrendingUp class="h-5 w-5 text-blue-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-600">Total Usage</p>
              <p class="text-2xl font-bold">{{ analytics.totalUsage }}</p>
              <p class="text-xs text-muted-foreground">{{ analytics.usageTrend > 0 ? '+' : '' }}{{ analytics.usageTrend }}% vs last period</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <Clock class="h-5 w-5 text-green-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-600">Avg. Duration</p>
              <p class="text-2xl font-bold">{{ analytics.avgDuration }}h</p>
              <p class="text-xs text-muted-foreground">vs {{ template.estimatedDuration }}h estimated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <CheckCircle class="h-5 w-5 text-purple-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-600">Success Rate</p>
              <p class="text-2xl font-bold">{{ analytics.successRate }}%</p>
              <p class="text-xs text-muted-foreground">{{ analytics.completedTasks }}/{{ analytics.totalTasks }} completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle class="h-5 w-5 text-orange-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-600">Issue Rate</p>
              <p class="text-2xl font-bold">{{ analytics.issueRate }}%</p>
              <p class="text-xs text-muted-foreground">{{ analytics.workOrdersWithIssues }} work orders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Usage Trends Chart -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <BarChart3 class="h-5 w-5" />
          <span>Usage Trends</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
          <div class="text-center text-muted-foreground">
            <BarChart3 class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">Usage trend chart</p>
            <p class="text-xs">Shows template usage over {{ selectedTimeRange }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Time Analysis -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <Clock class="h-5 w-5" />
            <span>Time Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Estimated Duration</span>
              <span class="font-medium">{{ template.estimatedDuration }}h</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Average Actual</span>
              <span class="font-medium">{{ analytics.avgDuration }}h</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Shortest Completion</span>
              <span class="font-medium text-green-600">{{ analytics.minDuration }}h</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Longest Completion</span>
              <span class="font-medium text-red-600">{{ analytics.maxDuration }}h</span>
            </div>
            <div class="mt-4 p-3 bg-muted/20 rounded-lg">
              <div class="flex justify-between items-center text-sm">
                <span>Efficiency Score</span>
                <span class="font-bold" :class="getEfficiencyColor(analytics.efficiencyScore)">{{ analytics.efficiencyScore }}%</span>
              </div>
              <p class="text-xs text-muted-foreground mt-1">Based on estimated vs actual time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quality Metrics -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <Award class="h-5 w-5" />
            <span>Quality Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">First-time Pass Rate</span>
              <span class="font-medium text-green-600">{{ analytics.firstTimePassRate }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Revision Requests</span>
              <span class="font-medium text-yellow-600">{{ analytics.revisionRate }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Rejected Work Orders</span>
              <span class="font-medium text-red-600">{{ analytics.rejectionRate }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Average Rating</span>
              <div class="flex items-center space-x-1">
                <span class="font-medium">{{ analytics.avgRating }}/5</span>
                <div class="flex space-x-0.5">
                  <Star 
                    v-for="i in 5" 
                    :key="i" 
                    class="h-3 w-3" 
                    :class="i <= Math.floor(analytics.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'"
                  />
                </div>
              </div>
            </div>
            <div class="mt-4 p-3 bg-muted/20 rounded-lg">
              <div class="flex justify-between items-center text-sm">
                <span>Quality Score</span>
                <span class="font-bold" :class="getQualityColor(analytics.qualityScore)">{{ analytics.qualityScore }}%</span>
              </div>
              <p class="text-xs text-muted-foreground mt-1">Composite quality metric</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Template Composition -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Checklist Items -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <CheckSquare class="h-5 w-5" />
            <span>Checklist Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Total Items</span>
              <span class="font-medium">{{ template.checklist?.length || 0 }}</span>
            </div>
            
            <div class="space-y-2">
              <div class="text-sm font-medium">By Type</div>
              <div class="space-y-1">
                <div 
                  v-for="(count, type) in checklistByType" 
                  :key="type"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="capitalize">{{ type.replace('_', ' ') }}</span>
                  <span>{{ count }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="requiredItemsCount > 0" class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Required Items</span>
              <span class="font-medium text-red-600">{{ requiredItemsCount }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Materials -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <Package class="h-5 w-5" />
            <span>Materials</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Total Materials</span>
              <span class="font-medium">{{ template.materials?.length || 0 }}</span>
            </div>
            
            <div v-if="template.materials && template.materials.length > 0" class="space-y-2">
              <div class="text-sm font-medium">Materials List</div>
              <div class="space-y-1 max-h-32 overflow-y-auto">
                <div 
                  v-for="material in template.materials" 
                  :key="material.itemId"
                  class="flex items-center justify-between text-sm py-1"
                >
                  <span>{{ material.itemName }}</span>
                  <span class="text-muted-foreground">{{ material.plannedQuantity }}</span>
                </div>
              </div>
            </div>
            
            <div class="text-xs text-muted-foreground">
              Materials are automatically tracked during work order execution
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Work Orders -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <FileText class="h-5 w-5" />
            <span>Recent Usage</span>
          </div>
          <Badge variant="outline">{{ analytics.recentWorkOrders.length }} records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="analytics.recentWorkOrders.length === 0" class="text-center py-8 text-muted-foreground">
          <Calendar class="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">No recent usage data</p>
          <p class="text-xs">Work orders using this template will appear here</p>
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="workOrder in analytics.recentWorkOrders.slice(0, 5)" 
            :key="workOrder.id"
            class="flex items-center justify-between p-3 border rounded-lg"
          >
            <div class="flex-1">
              <div class="font-medium text-sm">{{ workOrder.title }}</div>
              <div class="text-xs text-muted-foreground">{{ workOrder.assignedWorker }} • {{ formatDate(workOrder.completedAt) }}</div>
            </div>
            <div class="flex items-center space-x-2">
              <Badge :variant="getStatusVariant(workOrder.status)" class="text-xs">
                {{ workOrder.status }}
              </Badge>
              <span class="text-xs text-muted-foreground">{{ workOrder.actualDuration }}h</span>
            </div>
          </div>
          <div v-if="analytics.recentWorkOrders.length > 5" class="text-center">
            <Button variant="ghost" size="sm" @click="showAllWorkOrders = true">
              View all {{ analytics.recentWorkOrders.length }} work orders
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Comparison with Similar Templates -->
    <Card v-if="analytics.similarTemplates.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <GitCompare class="h-5 w-5" />
          <span>Comparison with Similar Templates</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b text-left">
                <th class="pb-2 text-sm font-medium">Template</th>
                <th class="pb-2 text-sm font-medium text-center">Usage</th>
                <th class="pb-2 text-sm font-medium text-center">Avg. Duration</th>
                <th class="pb-2 text-sm font-medium text-center">Success Rate</th>
                <th class="pb-2 text-sm font-medium text-center">Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b bg-accent/20">
                <td class="py-2 font-medium text-sm">{{ template.name }} (Current)</td>
                <td class="py-2 text-center text-sm">{{ analytics.totalUsage }}</td>
                <td class="py-2 text-center text-sm">{{ analytics.avgDuration }}h</td>
                <td class="py-2 text-center text-sm">{{ analytics.successRate }}%</td>
                <td class="py-2 text-center text-sm">{{ analytics.avgRating }}/5</td>
              </tr>
              <tr v-for="similar in analytics.similarTemplates" :key="similar.id" class="border-b">
                <td class="py-2 text-sm">{{ similar.name }}</td>
                <td class="py-2 text-center text-sm">{{ similar.usage }}</td>
                <td class="py-2 text-center text-sm">{{ similar.avgDuration }}h</td>
                <td class="py-2 text-center text-sm">{{ similar.successRate }}%</td>
                <td class="py-2 text-center text-sm">{{ similar.avgRating }}/5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Template Tags -->
    <Card v-if="template.tags && template.tags.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <Tag class="h-5 w-5" />
          <span>Tags</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Badge 
            v-for="tag in template.tags" 
            :key="tag"
            variant="outline"
          >
            {{ tag }}
          </Badge>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { WorkOrderTemplate } from '@/types/templates';
import { useTemplateStore } from '@/stores/template';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  TrendingUp,
  Clock,
  Calendar,
  CheckSquare,
  Package,
  FileText,
  Tag,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Award,
  Star,
  RefreshCw,
  GitCompare,
} from 'lucide-vue-next';

interface Props {
  template: WorkOrderTemplate;
}

interface TemplateAnalytics {
  totalUsage: number;
  usageTrend: number;
  avgDuration: number;
  successRate: number;
  completedTasks: number;
  totalTasks: number;
  issueRate: number;
  workOrdersWithIssues: number;
  minDuration: number;
  maxDuration: number;
  efficiencyScore: number;
  firstTimePassRate: number;
  revisionRate: number;
  rejectionRate: number;
  avgRating: number;
  qualityScore: number;
  recentWorkOrders: Array<{
    id: string;
    title: string;
    status: string;
    assignedWorker: string;
    completedAt: string;
    actualDuration: number;
  }>;
  similarTemplates: Array<{
    id: string;
    name: string;
    usage: number;
    avgDuration: number;
    successRate: number;
    avgRating: number;
  }>;
}

const props = defineProps<Props>();
const templateStore = useTemplateStore();

// State
const selectedTimeRange = ref('30d');
const showAllWorkOrders = ref(false);
const analytics = ref<TemplateAnalytics>({
  totalUsage: 0,
  usageTrend: 0,
  avgDuration: 0,
  successRate: 0,
  completedTasks: 0,
  totalTasks: 0,
  issueRate: 0,
  workOrdersWithIssues: 0,
  minDuration: 0,
  maxDuration: 0,
  efficiencyScore: 0,
  firstTimePassRate: 0,
  revisionRate: 0,
  rejectionRate: 0,
  avgRating: 0,
  qualityScore: 0,
  recentWorkOrders: [],
  similarTemplates: [],
});

// Computed
const checklistByType = computed(() => {
  if (!props.template.checklist) return {};
  
  const typeCount: Record<string, number> = {};
  props.template.checklist.forEach(item => {
    typeCount[item.type] = (typeCount[item.type] || 0) + 1;
  });
  
  return typeCount;
});

const requiredItemsCount = computed(() => {
  if (!props.template.checklist) return 0;
  return props.template.checklist.filter(item => item.required).length;
});

// Methods
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
      return 'default';
    case 'draft':
    case 'assigned':
    case 'in progress':
      return 'secondary';
    case 'deprecated':
    case 'rejected':
      return 'destructive';
    case 'archived':
    case 'pending':
      return 'outline';
    default:
      return 'secondary';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString();
};

const getEfficiencyColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const getQualityColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

const refreshAnalytics = async () => {
  await generateMockAnalytics();
};

const generateMockAnalytics = async () => {
  // Generate realistic mock analytics data
  const baseUsage = Math.floor(Math.random() * 100) + 20;
  const baseDuration = props.template.estimatedDuration || 2;
  
  analytics.value = {
    totalUsage: baseUsage,
    usageTrend: Math.floor(Math.random() * 40) - 20, // -20 to +20%
    avgDuration: Number((baseDuration + (Math.random() - 0.5) * 2).toFixed(1)),
    successRate: Math.floor(Math.random() * 15) + 85, // 85-100%
    completedTasks: Math.floor(baseUsage * 0.9),
    totalTasks: baseUsage,
    issueRate: Math.floor(Math.random() * 10) + 2, // 2-12%
    workOrdersWithIssues: Math.floor(baseUsage * 0.08),
    minDuration: Number((baseDuration * 0.6).toFixed(1)),
    maxDuration: Number((baseDuration * 1.8).toFixed(1)),
    efficiencyScore: Math.floor(Math.random() * 25) + 75, // 75-100%
    firstTimePassRate: Math.floor(Math.random() * 20) + 80, // 80-100%
    revisionRate: Math.floor(Math.random() * 10) + 5, // 5-15%
    rejectionRate: Math.floor(Math.random() * 5) + 1, // 1-5%
    avgRating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5-5.0
    qualityScore: Math.floor(Math.random() * 20) + 80, // 80-100%
    recentWorkOrders: generateMockWorkOrders(),
    similarTemplates: generateSimilarTemplates(),
  };
};

const generateMockWorkOrders = () => {
  const workers = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'Chris Brown'];
  const statuses = ['completed', 'in progress', 'pending review', 'rejected'];
  const count = Math.floor(Math.random() * 10) + 5;
  
  return Array.from({ length: count }, (_, i) => ({
    id: `wo-${props.template.id}-${i + 1}`,
    title: `${props.template.name} - Task ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)] as string,
    assignedWorker: workers[Math.floor(Math.random() * workers.length)] as string,
    completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    actualDuration: Number((Math.random() * 4 + 1).toFixed(1)),
  })).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
};

const generateSimilarTemplates = () => {
  // Get templates from the same category
  const allTemplates = templateStore.templates.filter(
    t => t.categoryId === props.template.categoryId && t.id !== props.template.id
  );
  
  return allTemplates.slice(0, 3).map(template => ({
    id: template.id,
    name: template.name,
    usage: Math.floor(Math.random() * 80) + 10,
    avgDuration: Number((Math.random() * 4 + 1).toFixed(1)),
    successRate: Math.floor(Math.random() * 15) + 85,
    avgRating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
  }));
};

// Lifecycle
onMounted(() => {
  generateMockAnalytics();
});
</script>