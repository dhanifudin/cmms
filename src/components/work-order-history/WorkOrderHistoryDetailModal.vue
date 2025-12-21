<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <Archive class="h-5 w-5 text-muted-foreground" />
          <span>{{ workOrder.code }} - History Details</span>
          <Badge variant="outline" class="text-xs">
            Read Only
          </Badge>
        </DialogTitle>
      </DialogHeader>
      
      <div class="space-y-6">
        <!-- Basic Information -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center space-x-2">
              <FileText class="h-5 w-5" />
              <span>Work Order Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Title and Description -->
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Title</Label>
                <p className="mt-1 text-sm bg-muted px-3 py-2 rounded">{{ workOrder.title }}</p>
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 text-sm bg-muted px-3 py-2 rounded whitespace-pre-wrap">
                  {{ workOrder.category?.name || 'No description available' }}
                </p>
              </div>
              
              <!-- Status and Type -->
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" class="text-sm">
                    <CheckCircle class="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <div className="mt-1">
                  <Badge :variant="getTypeVariant(workOrder.maintenanceType)" class="text-sm">
                    {{ workOrder.maintenanceType }}
                  </Badge>
                </div>
              </div>
              
              <!-- Priority and Category -->
              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <div className="mt-1">
                  <Badge :variant="getPriorityVariant(workOrder.priority)" class="text-sm">
                    {{ workOrder.priority }}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="mt-1 text-sm bg-muted px-3 py-2 rounded">{{ workOrder.category.name }}</p>
              </div>
              
              <!-- Location -->
              <div>
                <Label className="text-sm font-medium">Terminal</Label>
                <p className="mt-1 text-sm bg-muted px-3 py-2 rounded">{{ workOrder.terminal.name }}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Region</Label>
                <p className="mt-1 text-sm bg-muted px-3 py-2 rounded">{{ workOrder.terminal.region }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <!-- Assignment and Completion Information -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center space-x-2">
              <Users class="h-5 w-5" />
              <span>Assignment & Completion</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Assignment -->
              <div>
                <Label className="text-sm font-medium">Assigned Worker</Label>
                <div className="mt-1 flex items-center space-x-2 bg-muted px-3 py-2 rounded">
                  <User class="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{{ workOrder.assignedTo?.name || 'Unassigned' }}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Completed By</Label>
                <div className="mt-1 flex items-center space-x-2 bg-muted px-3 py-2 rounded">
                  <UserCheck class="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{{ workOrder.completedBy.name }}</span>
                </div>
              </div>
              
              <!-- Dates -->
              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <p className="mt-1 text-sm bg-muted px-3 py-2 rounded">
                  {{ formatDate(workOrder.dueDate) }}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Completed Date</Label>
                <div className="mt-1 bg-muted px-3 py-2 rounded">
                  <p className="text-sm">{{ formatDate(workOrder.completedDate) }}</p>
                  <p className="text-xs text-muted-foreground">
                    {{ getCompletionStatus(workOrder.dueDate, workOrder.completedDate) }}
                  </p>
                </div>
              </div>
              
              <!-- Duration -->
              <div>
                <Label className="text-sm font-medium">Estimated Duration</Label>
                <p className="mt-1 text-sm bg-muted px-3 py-2 rounded">{{ workOrder.estimatedDuration }} hours</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Actual Duration</Label>
                <div className="mt-1 bg-muted px-3 py-2 rounded">
                  <p className="text-sm">{{ workOrder.actualDuration }} hours</p>
                  <p 
                    className="text-xs"
                    :class="getDurationVarianceClass(workOrder.actualDuration, workOrder.estimatedDuration)"
                  >
                    {{ getDurationVariance(workOrder.actualDuration, workOrder.estimatedDuration) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <!-- Completion Notes -->
        <Card v-if="workOrder.completionNotes">
          <CardHeader>
            <CardTitle class="text-lg flex items-center space-x-2">
              <MessageSquare class="h-5 w-5" />
              <span>Completion Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="bg-muted p-4 rounded-lg">
              <p class="text-sm whitespace-pre-wrap">{{ workOrder.completionNotes }}</p>
            </div>
          </CardContent>
        </Card>
        
        <!-- Checklist Progress (if available) -->
        <Card v-if="workOrder.checklistProgress">
          <CardHeader>
            <CardTitle class="text-lg flex items-center space-x-2">
              <CheckSquare class="h-5 w-5" />
              <span>Checklist Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Completion Progress</span>
                <Badge variant="outline">
                  {{ workOrder.checklistProgress.completed }}/{{ workOrder.checklistProgress.total }} items
                </Badge>
              </div>
              <div class="w-full bg-muted rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full transition-all"
                  :style="{ width: `${(workOrder.checklistProgress.completed / workOrder.checklistProgress.total) * 100}%` }"
                ></div>
              </div>
              <p class="text-xs text-muted-foreground">
                All checklist items were completed successfully
              </p>
            </div>
          </CardContent>
        </Card>
        
        <!-- Template Information (if used) -->
        <Card v-if="workOrder.templateUsed">
          <CardHeader>
            <CardTitle class="text-lg flex items-center space-x-2">
              <FileText class="h-5 w-5" />
              <span>Template Used</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="bg-muted p-4 rounded-lg space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-medium">{{ workOrder.templateUsed.name }}</span>
                <Badge variant="outline" class="text-xs">
                  v{{ workOrder.templateUsed.version }}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">
                Template ID: {{ workOrder.templateUsed.id }}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <!-- Audit Information -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center space-x-2">
              <Clock class="h-5 w-5" />
              <span>Audit Trail</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="mt-1 text-sm bg-muted px-3 py-2 rounded">
                    {{ formatDate(workOrder.createdAt) }} by {{ workOrder.createdBy.name }}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="mt-1 text-sm bg-muted px-3 py-2 rounded">
                    {{ formatDate(workOrder.lastUpdated) }}
                  </p>
                </div>
              </div>
              
              <div class="text-xs text-muted-foreground border-t pt-3">
                This work order has been archived and is now read-only. 
                Historical records are maintained for compliance and reporting purposes.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { WorkOrderHistoryRow } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import { 
  Archive, FileText, Users, User, UserCheck, CheckCircle, CheckSquare,
  MessageSquare, Clock
} from 'lucide-vue-next';

interface Props {
  workOrder: WorkOrderHistoryRow;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

// Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getCompletionStatus = (dueDate: string, completedDate: string): string => {
  const due = new Date(dueDate);
  const completed = new Date(completedDate);
  
  if (completed <= due) {
    const diffHours = Math.abs(due.getTime() - completed.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return 'Completed on time';
    }
    return `Completed ${Math.floor(diffHours / 24)} days early`;
  } else {
    const diffHours = Math.abs(completed.getTime() - due.getTime()) / (1000 * 60 * 60);
    return `Completed ${Math.floor(diffHours / 24)} days overdue`;
  }
};

const getDurationVariance = (actual: number, estimated: number): string => {
  const variance = ((actual - estimated) / estimated) * 100;
  const sign = variance > 0 ? '+' : '';
  return `${sign}${Math.round(variance)}% vs estimated`;
};

const getDurationVarianceClass = (actual: number, estimated: number): string => {
  const variance = ((actual - estimated) / estimated) * 100;
  if (Math.abs(variance) <= 10) return 'text-green-600';
  if (variance > 10) return 'text-red-600';
  return 'text-blue-600';
};

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'preventive':
      return 'default';
    case 'corrective':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};
</script>