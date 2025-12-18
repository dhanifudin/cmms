<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0">
      <CardTitle>{{ title }}</CardTitle>
      <div class="flex items-center space-x-2">
        <Button
          v-for="view in views"
          :key="view"
          :variant="selectedView === view ? 'default' : 'outline'"
          size="sm"
          @click="selectedView = view"
        >
          {{ view }}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Terminal</TableHead>
            <TableHead>Completion Rate</TableHead>
            <TableHead>On-Time Rate</TableHead>
            <TableHead>Avg. Time (hrs)</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Overdue</TableHead>
            <TableHead>Workers</TableHead>
            <TableHead>Efficiency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="terminal in sortedTerminals"
            :key="terminal.terminalId"
            class="cursor-pointer hover:bg-muted/50"
          >
            <TableCell>
              <div class="flex items-center">
                <div
                  class="w-3 h-3 rounded-full mr-3"
                  :class="getEfficiencyColor(terminal.efficiency)"
                ></div>
                <div>
                  <div class="text-sm font-medium">{{ terminal.terminalName }}</div>
                  <div class="text-sm text-muted-foreground">{{ terminal.terminalId.toUpperCase() }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ terminal.completionRate }}%</span>
                <div class="w-16 bg-secondary rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="getPerformanceBarColor(terminal.completionRate)"
                    :style="{ width: `${terminal.completionRate}%` }"
                  ></div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ terminal.onTimeRate }}%</span>
                <Badge :variant="terminal.onTimeRate >= 90 ? 'default' : terminal.onTimeRate >= 70 ? 'secondary' : 'destructive'">
                  {{ getPerformanceLabel(terminal.onTimeRate) }}
                </Badge>
              </div>
            </TableCell>
            <TableCell class="text-sm">{{ terminal.averageCompletionTime }}</TableCell>
            <TableCell class="text-sm">{{ terminal.totalWorkOrders }}</TableCell>
            <TableCell>
              <Badge :variant="terminal.overdueWorkOrders > 0 ? 'destructive' : 'secondary'">
                {{ terminal.overdueWorkOrders }}
              </Badge>
            </TableCell>
            <TableCell class="text-sm">{{ terminal.workerCount }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ terminal.efficiency }}%</span>
                <component
                  :is="getEfficiencyIcon(terminal.efficiency)"
                  class="w-4 h-4"
                  :class="getEfficiencyIconColor(terminal.efficiency)"
                />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next';

interface Props {
  title: string;
  views?: string[];
  terminals: TerminalPerformance[];
}

interface TerminalPerformance {
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

const props = withDefaults(defineProps<Props>(), {
  views: () => ['Week', 'Month', 'Quarter']
});

const selectedView = ref(props.views[0]);

const sortedTerminals = computed(() => {
  return [...props.terminals].sort((a, b) => b.efficiency - a.efficiency);
});

const getPerformanceLabel = (rate: number) => {
  if (rate >= 90) return 'Excellent';
  if (rate >= 70) return 'Good';
  if (rate >= 50) return 'Fair';
  return 'Poor';
};

const getPerformanceBarColor = (rate: number) => {
  if (rate >= 80) return 'bg-green-500';
  if (rate >= 60) return 'bg-blue-500';
  if (rate >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 85) return 'bg-green-500';
  if (efficiency >= 70) return 'bg-blue-500';
  if (efficiency >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getEfficiencyIcon = (efficiency: number) => {
  if (efficiency >= 70) return TrendingUp;
  if (efficiency >= 50) return Minus;
  return TrendingDown;
};

const getEfficiencyIconColor = (efficiency: number) => {
  if (efficiency >= 70) return 'text-green-600';
  if (efficiency >= 50) return 'text-yellow-600';
  return 'text-red-600';
};
</script>
