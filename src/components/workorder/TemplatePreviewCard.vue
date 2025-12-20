<template>
  <Card class="template-preview-card">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-2">
            <Badge :variant="getTypeVariant(template.type)">
              {{ template.type }}
            </Badge>
            <Badge v-if="template.subType" variant="outline">
              {{ template.subType }}
            </Badge>
            <Badge variant="outline">v{{ template.version }}</Badge>
          </div>
          <CardTitle class="text-xl mb-1">{{ template.name }}</CardTitle>
          <p class="text-muted-foreground">{{ template.description }}</p>
        </div>
        <Button variant="ghost" size="sm" @click="$emit('close')">
          <X class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>

    <CardContent class="space-y-6">
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Clock class="h-6 w-6 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
          <div class="text-lg font-semibold">{{ template.estimatedDuration }}h</div>
          <div class="text-xs text-muted-foreground">Duration</div>
        </div>
        
        <div class="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <CheckSquare class="h-6 w-6 mx-auto mb-1 text-green-600 dark:text-green-400" />
          <div class="text-lg font-semibold">{{ template.checklist?.length || 0 }}</div>
          <div class="text-xs text-muted-foreground">Checklist Items</div>
        </div>
        
        <div class="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
          <Package class="h-6 w-6 mx-auto mb-1 text-orange-600 dark:text-orange-400" />
          <div class="text-lg font-semibold">{{ template.materials?.length || 0 }}</div>
          <div class="text-xs text-muted-foreground">Materials</div>
        </div>
        
        <div class="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <Star class="h-6 w-6 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
          <div class="text-lg font-semibold">{{ template.defaultPriority }}</div>
          <div class="text-xs text-muted-foreground">Priority</div>
        </div>
      </div>

      <!-- Template Details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Checklist Preview -->
        <div v-if="template.checklist && template.checklist.length > 0">
          <h4 class="font-semibold mb-3 flex items-center">
            <CheckSquare class="h-4 w-4 mr-2" />
            Checklist Items
          </h4>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="(item, index) in template.checklist.slice(0, 5)"
              :key="item.id"
              class="flex items-start space-x-2 p-2 bg-muted/30 rounded text-sm"
            >
              <span class="text-muted-foreground">{{ index + 1 }}.</span>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-medium">{{ item.label }}</span>
                  <Badge v-if="item.required" variant="destructive" class="text-xs">Required</Badge>
                  <Badge variant="outline" class="text-xs">{{ item.type }}</Badge>
                </div>
                <p v-if="item.description" class="text-xs text-muted-foreground mt-1">
                  {{ item.description }}
                </p>
              </div>
            </div>
            <div v-if="template.checklist.length > 5" class="text-xs text-muted-foreground text-center py-2">
              +{{ template.checklist.length - 5 }} more items
            </div>
          </div>
        </div>

        <!-- Materials Preview -->
        <div v-if="template.materials && template.materials.length > 0">
          <h4 class="font-semibold mb-3 flex items-center">
            <Package class="h-4 w-4 mr-2" />
            Required Materials
          </h4>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="material in template.materials.slice(0, 5)"
              :key="material.itemId"
              class="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
            >
              <div>
                <span class="font-medium">{{ material.itemName }}</span>
                <p v-if="material.notes" class="text-xs text-muted-foreground">
                  {{ material.notes }}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <Badge variant="outline" class="text-xs">
                  {{ material.plannedQuantity }}
                </Badge>
                <Badge v-if="material.isOptional" variant="secondary" class="text-xs">
                  Optional
                </Badge>
              </div>
            </div>
            <div v-if="template.materials.length > 5" class="text-xs text-muted-foreground text-center py-2">
              +{{ template.materials.length - 5 }} more materials
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="space-y-4">
        <!-- Instructions -->
        <div v-if="template.instructions">
          <h4 class="font-semibold mb-2 flex items-center">
            <FileText class="h-4 w-4 mr-2" />
            Instructions
          </h4>
          <p class="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
            {{ template.instructions }}
          </p>
        </div>

        <!-- Safety Notes -->
        <div v-if="template.safetyNotes">
          <h4 class="font-semibold mb-2 flex items-center text-red-600">
            <Shield class="h-4 w-4 mr-2" />
            Safety Notes
          </h4>
          <div class="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-3">
            <p class="text-sm text-red-800 dark:text-red-200">
              {{ template.safetyNotes }}
            </p>
          </div>
        </div>

        <!-- Safety Requirements -->
        <div v-if="template.safetyRequirements && template.safetyRequirements.length > 0">
          <h4 class="font-semibold mb-2 flex items-center text-orange-600">
            <AlertTriangle class="h-4 w-4 mr-2" />
            Safety Requirements
          </h4>
          <ul class="space-y-1">
            <li 
              v-for="requirement in template.safetyRequirements"
              :key="requirement"
              class="flex items-center space-x-2 text-sm"
            >
              <AlertTriangle class="h-3 w-3 text-orange-500" />
              <span>{{ requirement }}</span>
            </li>
          </ul>
        </div>

        <!-- Prerequisites -->
        <div v-if="template.prerequisites && template.prerequisites.length > 0">
          <h4 class="font-semibold mb-2 flex items-center">
            <CheckCircle class="h-4 w-4 mr-2" />
            Prerequisites
          </h4>
          <ul class="space-y-1">
            <li 
              v-for="prerequisite in template.prerequisites"
              :key="prerequisite"
              class="flex items-center space-x-2 text-sm"
            >
              <CheckCircle class="h-3 w-3 text-blue-500" />
              <span>{{ prerequisite }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Template Metadata -->
      <div class="border-t pt-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <Label class="text-xs text-muted-foreground">Template Code</Label>
            <p class="font-mono">{{ template.code }}</p>
          </div>
          <div>
            <Label class="text-xs text-muted-foreground">Usage Count</Label>
            <p class="flex items-center space-x-1">
              <TrendingUp class="h-3 w-3" />
              <span>{{ template.usageCount || 0 }} times</span>
            </p>
          </div>
          <div>
            <Label class="text-xs text-muted-foreground">Last Used</Label>
            <p>{{ template.lastUsedAt ? formatDate(template.lastUsedAt) : 'Never' }}</p>
          </div>
          <div>
            <Label class="text-xs text-muted-foreground">Status</Label>
            <Badge :variant="getStatusVariant(template.status)" class="text-xs">
              {{ template.status }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="template.tags && template.tags.length > 0" class="border-t pt-4">
        <Label class="text-sm font-medium mb-2 block">Tags</Label>
        <div class="flex flex-wrap gap-1">
          <Badge 
            v-for="tag in template.tags" 
            :key="tag"
            variant="outline" 
            class="text-xs"
          >
            {{ tag }}
          </Badge>
        </div>
      </div>
    </CardContent>

    <!-- Actions -->
    <div class="flex items-center justify-between p-6 bg-muted/30 border-t">
      <div class="text-sm text-muted-foreground">
        Ready to use this template?
      </div>
      
      <div class="flex items-center space-x-3">
        <Button variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        <Button @click="$emit('use-template')">
          <FileText class="h-4 w-4 mr-2" />
          Use This Template
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Icons
import {
  Clock,
  CheckSquare,
  Package,
  Star,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  X,
} from 'lucide-vue-next';

interface Props {
  template: WorkOrderTemplate;
}

defineProps<Props>();

defineEmits<{
  'use-template': [];
  close: [];
}>();

// Methods
const getTypeVariant = (type: string) => {
  switch (type) {
    case 'preventive': return 'default';
    case 'corrective': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'draft': return 'secondary';
    case 'deprecated': return 'destructive';
    case 'archived': return 'outline';
    default: return 'secondary';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};
</script>