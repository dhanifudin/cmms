<template>
  <div class="checklist-item-preview py-2">
    <div class="flex items-start space-x-3">
      <!-- Required indicator -->
      <div class="flex-none mt-1">
        <span v-if="item.required" class="text-red-500 text-sm">*</span>
        <span v-else class="text-muted-foreground text-sm">○</span>
      </div>
      
      <!-- Item content -->
      <div class="flex-1 space-y-2">
        <!-- Label and description -->
        <div>
          <div class="flex items-center space-x-2">
            <Label class="text-sm font-medium">
              {{ item.label || 'Checklist Item Label' }}
            </Label>
            <Badge v-if="item.section" variant="outline" class="text-xs">
              {{ item.section }}
            </Badge>
          </div>
          <p v-if="item.description" class="text-xs text-muted-foreground mt-1">
            {{ item.description }}
          </p>
        </div>
        
        <!-- Input based on type -->
        <div class="preview-input">
          <!-- Yes/No -->
          <div v-if="item.type === 'yes_no'" class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <input type="radio" disabled class="text-sm" />
              <Label class="text-sm">Yes</Label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="radio" disabled class="text-sm" />
              <Label class="text-sm">No</Label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="radio" disabled class="text-sm" />
              <Label class="text-sm">N/A</Label>
            </div>
          </div>

          <!-- Number -->
          <div v-else-if="item.type === 'number'" class="flex items-center space-x-2">
            <Input
              type="number"
              :placeholder="getNumberPlaceholder()"
              :min="item.minValue"
              :max="item.maxValue"
              disabled
              class="w-32 h-8"
            />
            <span v-if="item.unit" class="text-sm text-muted-foreground">{{ item.unit }}</span>
            <div v-if="item.minValue !== undefined || item.maxValue !== undefined" class="text-xs text-muted-foreground">
              ({{ item.minValue || '−∞' }} - {{ item.maxValue || '∞' }})
            </div>
          </div>

          <!-- Text -->
          <div v-else-if="item.type === 'text'">
            <Input
              :placeholder="item.defaultValue || 'Enter text...'"
              disabled
              class="h-8"
            />
            <p v-if="item.pattern" class="text-xs text-muted-foreground mt-1">
              Pattern: <code class="bg-muted px-1 rounded">{{ item.pattern }}</code>
            </p>
          </div>

          <!-- Dropdown -->
          <div v-else-if="item.type === 'dropdown'">
            <Select disabled>
              <SelectTrigger class="w-full h-8">
                <SelectValue placeholder="Select option..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in (item.options || ['Option 1', 'Option 2'])"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Rating -->
          <div v-else-if="item.type === 'rating'" class="flex items-center space-x-1">
            <div
              v-for="n in (item.maxValue || 5)"
              :key="n"
              class="w-6 h-6 border border-border rounded cursor-pointer hover:bg-primary/10 flex items-center justify-center"
            >
              <span class="text-sm">{{ n }}</span>
            </div>
            <span class="text-sm text-muted-foreground ml-2">
              (1-{{ item.maxValue || 5 }} scale)
            </span>
          </div>

          <!-- Photo -->
          <div v-else-if="item.type === 'photo'" class="space-y-2">
            <div class="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Camera class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p class="text-sm text-muted-foreground">Photo upload area</p>
            </div>
          </div>

          <!-- Signature -->
          <div v-else-if="item.type === 'signature'" class="space-y-2">
            <div class="border-2 border-dashed border-border rounded-lg p-4 text-center h-24">
              <Edit class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p class="text-sm text-muted-foreground">Signature area</p>
            </div>
          </div>
        </div>

        <!-- Help text -->
        <p v-if="item.helpText" class="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          💡 {{ item.helpText }}
        </p>

        <!-- Thresholds (for number type) -->
        <div v-if="item.type === 'number' && (item.warningThreshold || item.criticalThreshold)" class="text-xs space-y-1">
          <div v-if="item.warningThreshold" class="flex items-center space-x-2 text-orange-600">
            <AlertTriangle class="h-3 w-3" />
            <span>Warning at {{ item.warningThreshold }}{{ item.unit ? ' ' + item.unit : '' }}</span>
          </div>
          <div v-if="item.criticalThreshold" class="flex items-center space-x-2 text-red-600">
            <AlertCircle class="h-3 w-3" />
            <span>Critical at {{ item.criticalThreshold }}{{ item.unit ? ' ' + item.unit : '' }}</span>
          </div>
        </div>

        <!-- Conditional logic indicator -->
        <div v-if="item.conditionalLogic && item.conditionalLogic.length > 0" class="text-xs text-purple-600">
          <div class="flex items-center space-x-1">
            <Zap class="h-3 w-3" />
            <span>Conditional item ({{ item.conditionalLogic.length }} rule{{ item.conditionalLogic.length > 1 ? 's' : '' }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChecklistItemTemplate } from '@/types/templates';

// UI Components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Camera,
  Edit,
  AlertTriangle,
  AlertCircle,
  Zap,
} from 'lucide-vue-next';

interface Props {
  item: Omit<ChecklistItemTemplate, 'id' | 'templateId'>;
}

const props = defineProps<Props>();

// Helper methods
const getNumberPlaceholder = () => {
  if (props.item.minValue !== undefined && props.item.maxValue !== undefined) {
    return `${props.item.minValue} - ${props.item.maxValue}`;
  } else if (props.item.minValue !== undefined) {
    return `Min: ${props.item.minValue}`;
  } else if (props.item.maxValue !== undefined) {
    return `Max: ${props.item.maxValue}`;
  }
  return 'Enter value';
};
</script>

<style scoped>
.preview-input {
  opacity: 0.8;
}

.preview-input input[type="radio"] {
  pointer-events: none;
}

code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
</style>