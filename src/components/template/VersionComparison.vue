<template>
  <div class="version-comparison">
    <!-- Comparison Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="grid grid-cols-2 gap-8 flex-1">
        <div class="text-center">
          <h3 class="font-semibold text-lg">{{ versions[0]?.name }}</h3>
          <div class="flex items-center justify-center space-x-2 mt-2">
            <Badge variant="outline">v{{ versions[0]?.version }}</Badge>
            <span class="text-sm text-muted-foreground">
              {{ formatDate(versions[0]?.createdAt) }}
            </span>
          </div>
        </div>
        
        <div class="text-center">
          <h3 class="font-semibold text-lg">{{ versions[1]?.name }}</h3>
          <div class="flex items-center justify-center space-x-2 mt-2">
            <Badge variant="outline">v{{ versions[1]?.version }}</Badge>
            <span class="text-sm text-muted-foreground">
              {{ formatDate(versions[1]?.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparison Tabs -->
    <Tabs default-value="overview" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="checklist">Checklist</TabsTrigger>
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>

      <!-- Overview Tab -->
      <TabsContent value="overview">
        <div class="grid grid-cols-2 gap-6">
          <!-- Left Version -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">{{ versions[0]?.name }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label class="text-sm font-medium">Description</Label>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ versions[0]?.description || 'No description' }}
                </p>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium">Type</Label>
                  <p class="text-sm capitalize">{{ versions[0]?.type }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium">Priority</Label>
                  <p class="text-sm">{{ versions[0]?.defaultPriority }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium">Duration</Label>
                  <p class="text-sm">{{ versions[0]?.estimatedDuration }}h</p>
                </div>
                <div>
                  <Label class="text-sm font-medium">Status</Label>
                  <Badge :variant="getStatusVariant(versions[0]?.status)">
                    {{ versions[0]?.status }}
                  </Badge>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium">Checklist Items</Label>
                  <p class="text-sm">{{ versions[0]?.checklist?.length || 0 }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium">Materials</Label>
                  <p class="text-sm">{{ versions[0]?.materials?.length || 0 }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Right Version -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">{{ versions[1]?.name }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label class="text-sm font-medium">Description</Label>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ versions[1]?.description || 'No description' }}
                </p>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium">Type</Label>
                  <p class="text-sm capitalize">{{ versions[1]?.type }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium">Priority</Label>
                  <p class="text-sm">{{ versions[1]?.defaultPriority }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium">Duration</Label>
                  <p class="text-sm">{{ versions[1]?.estimatedDuration }}h</p>
                </div>
                <div>
                  <Label class="text-sm font-medium">Status</Label>
                  <Badge :variant="getStatusVariant(versions[1]?.status)">
                    {{ versions[1]?.status }}
                  </Badge>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium">Checklist Items</Label>
                  <p class="text-sm">{{ versions[1]?.checklist?.length || 0 }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium">Materials</Label>
                  <p class="text-sm">{{ versions[1]?.materials?.length || 0 }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Checklist Tab -->
      <TabsContent value="checklist">
        <div class="grid grid-cols-2 gap-6">
          <!-- Left Version Checklist -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">
                {{ versions[0]?.name }} Checklist ({{ versions[0]?.checklist?.length || 0 }})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <div
                  v-for="item in versions[0]?.checklist"
                  :key="item.id"
                  :class="[
                    'p-3 rounded border',
                    getChecklistItemClass(item, versions[1]?.checklist)
                  ]"
                >
                  <div class="flex items-start space-x-2">
                    <div class="flex-none mt-1">
                      <span v-if="item.required" class="text-red-500 text-sm">*</span>
                      <span v-else class="text-muted-foreground text-sm">○</span>
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-sm">{{ item.label }}</div>
                      <div class="text-xs text-muted-foreground">
                        Type: {{ item.type }}, Order: {{ item.order }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Right Version Checklist -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">
                {{ versions[1]?.name }} Checklist ({{ versions[1]?.checklist?.length || 0 }})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <div
                  v-for="item in versions[1]?.checklist"
                  :key="item.id"
                  :class="[
                    'p-3 rounded border',
                    getChecklistItemClass(item, versions[0]?.checklist)
                  ]"
                >
                  <div class="flex items-start space-x-2">
                    <div class="flex-none mt-1">
                      <span v-if="item.required" class="text-red-500 text-sm">*</span>
                      <span v-else class="text-muted-foreground text-sm">○</span>
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-sm">{{ item.label }}</div>
                      <div class="text-xs text-muted-foreground">
                        Type: {{ item.type }}, Order: {{ item.order }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Checklist Changes Summary -->
        <Card class="mt-4">
          <CardHeader>
            <CardTitle class="text-base">Checklist Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="p-3 bg-green-50 rounded">
                <div class="text-2xl font-bold text-green-600">{{ checklistDiff.added.length }}</div>
                <div class="text-sm text-green-700">Added Items</div>
              </div>
              <div class="p-3 bg-blue-50 rounded">
                <div class="text-2xl font-bold text-blue-600">{{ checklistDiff.modified.length }}</div>
                <div class="text-sm text-blue-700">Modified Items</div>
              </div>
              <div class="p-3 bg-red-50 rounded">
                <div class="text-2xl font-bold text-red-600">{{ checklistDiff.removed.length }}</div>
                <div class="text-sm text-red-700">Removed Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Materials Tab -->
      <TabsContent value="materials">
        <div class="grid grid-cols-2 gap-6">
          <!-- Left Version Materials -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">
                {{ versions[0]?.name }} Materials ({{ versions[0]?.materials?.length || 0 }})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2 max-h-96 overflow-y-auto">
                <div
                  v-for="material in versions[0]?.materials"
                  :key="material.itemId"
                  class="flex items-center justify-between p-2 border rounded"
                >
                  <span class="font-medium text-sm">{{ material.itemName }}</span>
                  <span class="text-sm text-muted-foreground">
                    {{ material.plannedQuantity }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Right Version Materials -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">
                {{ versions[1]?.name }} Materials ({{ versions[1]?.materials?.length || 0 }})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2 max-h-96 overflow-y-auto">
                <div
                  v-for="material in versions[1]?.materials"
                  :key="material.itemId"
                  class="flex items-center justify-between p-2 border rounded"
                >
                  <span class="font-medium text-sm">{{ material.itemName }}</span>
                  <span class="text-sm text-muted-foreground">
                    {{ material.plannedQuantity }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Details Tab -->
      <TabsContent value="details">
        <div class="grid grid-cols-2 gap-6">
          <!-- Left Version Details -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">{{ versions[0]?.name }} Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label class="text-sm font-medium">Instructions</Label>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ versions[0]?.instructions || 'No instructions' }}
                </p>
              </div>
              
              <div>
                <Label class="text-sm font-medium">Safety Notes</Label>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ versions[0]?.safetyNotes || 'No safety notes' }}
                </p>
              </div>
              
              <div v-if="versions[0]?.tags && versions[0].tags.length > 0">
                <Label class="text-sm font-medium">Tags</Label>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge 
                    v-for="tag in versions[0].tags" 
                    :key="tag"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ tag }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Right Version Details -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">{{ versions[1]?.name }} Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label class="text-sm font-medium">Instructions</Label>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ versions[1]?.instructions || 'No instructions' }}
                </p>
              </div>
              
              <div>
                <Label class="text-sm font-medium">Safety Notes</Label>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ versions[1]?.safetyNotes || 'No safety notes' }}
                </p>
              </div>
              
              <div v-if="versions[1]?.tags && versions[1].tags.length > 0">
                <Label class="text-sm font-medium">Tags</Label>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge 
                    v-for="tag in versions[1].tags" 
                    :key="tag"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ tag }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WorkOrderTemplate, ChecklistItemTemplate } from '@/types/templates';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  versions: [WorkOrderTemplate, WorkOrderTemplate];
}

const props = defineProps<Props>();

// Computed
const checklistDiff = computed(() => {
  const left = props.versions[0]?.checklist || [];
  const right = props.versions[1]?.checklist || [];
  
  const added: ChecklistItemTemplate[] = [];
  const modified: ChecklistItemTemplate[] = [];
  const removed: ChecklistItemTemplate[] = [];
  
  // Find added items (in right but not in left)
  right.forEach(rightItem => {
    const leftMatch = left.find(leftItem => 
      leftItem.label === rightItem.label && leftItem.type === rightItem.type
    );
    if (!leftMatch) {
      added.push(rightItem);
    }
  });
  
  // Find removed items (in left but not in right)
  left.forEach(leftItem => {
    const rightMatch = right.find(rightItem => 
      rightItem.label === leftItem.label && rightItem.type === leftItem.type
    );
    if (!rightMatch) {
      removed.push(leftItem);
    }
  });
  
  // Find modified items
  left.forEach(leftItem => {
    const rightMatch = right.find(rightItem => 
      rightItem.label === leftItem.label && rightItem.type === leftItem.type
    );
    if (rightMatch && (
      leftItem.required !== rightMatch.required ||
      leftItem.order !== rightMatch.order ||
      leftItem.description !== rightMatch.description
    )) {
      modified.push(rightMatch);
    }
  });
  
  return { added, modified, removed };
});

// Methods
const getStatusVariant = (status?: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'deprecated':
      return 'destructive';
    case 'archived':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getChecklistItemClass = (item: ChecklistItemTemplate, compareList?: ChecklistItemTemplate[]) => {
  if (!compareList) return '';
  
  const match = compareList.find(compareItem => 
    compareItem.label === item.label && compareItem.type === item.type
  );
  
  if (!match) {
    return 'bg-green-50 border-green-200'; // Added item
  }
  
  if (match && (
    match.required !== item.required ||
    match.order !== item.order ||
    match.description !== item.description
  )) {
    return 'bg-blue-50 border-blue-200'; // Modified item
  }
  
  return ''; // Unchanged item
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};
</script>