<template>
  <Dialog :open="true" @update:open="(open: boolean) => !open && closeModal()">
    <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ isBeforeSubmission ? 'Submit Before Documentation' : 'Submit After Documentation' }}
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Checklist Section -->
          <div v-if="checklist.length > 0">
            <h4 class="text-sm font-medium mb-4">
              Complete Checklist ({{ isBeforeSubmission ? 'Before' : 'After' }} State)
            </h4>
            <div class="space-y-4 max-h-64 overflow-y-auto border border-border rounded-lg p-4">
              <div
                v-for="item in checklist"
                :key="item.id"
                class="border-b border-border pb-3 last:border-b-0"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <Label class="text-sm font-medium">
                      {{ item.label }}
                      <span v-if="item.required" class="text-destructive ml-1">*</span>
                    </Label>
                    <p v-if="item.unit" class="text-xs text-muted-foreground">Unit: {{ item.unit }}</p>
                  </div>

                  <div class="ml-4 min-w-32">
                    <!-- Yes/No type -->
                    <template v-if="item.type === 'yes_no'">
                      <Select v-model="checklistValues[item.id]" :required="item.required">
                        <SelectTrigger class="h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </template>

                    <!-- Number type -->
                    <template v-else-if="item.type === 'number'">
                      <Input
                        v-model.number="checklistValues[item.id]"
                        type="number"
                        :step="0.01"
                        :min="item.minValue"
                        :max="item.maxValue"
                        class="h-8"
                        :required="item.required"
                      />
                    </template>

                    <!-- Text type -->
                    <template v-else-if="item.type === 'text'">
                      <Input
                        v-model="checklistValues[item.id]"
                        type="text"
                        class="h-8"
                        :required="item.required"
                      />
                    </template>

                    <!-- Dropdown type -->
                    <template v-else-if="item.type === 'dropdown'">
                      <Select v-model="checklistValues[item.id]" :required="item.required">
                        <SelectTrigger class="h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="option in item.options"
                            :key="option"
                            :value="option"
                          >
                            {{ option }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </template>
                    
                    <!-- Rating type -->
                    <template v-else-if="item.type === 'rating'">
                      <div class="flex space-x-1">
                        <button
                          v-for="n in 5"
                          :key="n"
                          type="button"
                          @click="checklistValues[item.id] = n"
                          class="p-1"
                        >
                          <StarIcon
                            class="h-4 w-4"
                            :class="n <= (checklistValues[item.id] || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                          />
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Photos Section -->
          <div>
            <h4 class="text-sm font-medium mb-4">
              {{ isBeforeSubmission ? 'Before Photos' : 'After Photos' }}
            </h4>

            <!-- Photo Upload Area -->
            <div class="border-2 border-dashed border-border rounded-lg p-6">
              <input
                ref="photoInput"
                @change="handlePhotoSelect"
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                class="hidden"
              />

              <div v-if="selectedPhotos.length === 0" class="text-center">
                <CameraIcon class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div class="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    @click="($refs.photoInput as HTMLInputElement).click()"
                  >
                    <CameraIcon class="h-4 w-4 mr-2" />
                    Take Photos
                  </Button>
                  <p class="text-xs text-muted-foreground">
                    Take photos of the equipment before{{ isBeforeSubmission ? '' : '/after' }} maintenance
                  </p>
                </div>
              </div>
              
              <!-- Photo Preview Grid -->
              <div v-else class="space-y-4">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div
                    v-for="(photo, index) in selectedPhotos"
                    :key="index"
                    class="relative group"
                  >
                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        :src="photo.preview"
                        :alt="`Photo ${index + 1}`"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    
                    <!-- Photo overlay -->
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        class="opacity-0 group-hover:opacity-100 rounded-full"
                        @click="removePhoto(index)"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </Button>
                    </div>

                    <!-- Photo caption -->
                    <div class="mt-2">
                      <Input
                        v-model="photo.caption"
                        type="text"
                        placeholder="Add caption..."
                        class="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  class="w-full border-2 border-dashed"
                  @click="($refs.photoInput as HTMLInputElement).click()"
                >
                  <CameraIcon class="h-4 w-4 mr-2" />
                  Add More Photos
                </Button>
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div>
            <Label for="notes" class="block text-sm font-medium mb-2">
              {{ isBeforeSubmission ? 'Before Notes' : 'After Notes' }}
            </Label>
            <Textarea
              id="notes"
              v-model="notes"
              rows="4"
              placeholder="Add any additional notes or observations..."
            />
          </div>

          <!-- Material Usage (for after documentation) -->
          <div v-if="!isBeforeSubmission && materials.length > 0">
            <h4 class="text-sm font-medium mb-4">Material Usage</h4>
            <div class="space-y-3">
              <div
                v-for="material in materials"
                :key="material.itemId"
                class="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium">
                    {{ getInventoryItemName(material.itemId) }}
                  </p>
                  <p class="text-xs text-muted-foreground">Planned: {{ material.plannedQuantity }}</p>
                </div>
                <div class="w-24">
                  <Input
                    v-model.number="materialUsage[material.itemId]"
                    type="number"
                    :min="0"
                    :step="0.01"
                    :placeholder="material.plannedQuantity.toString()"
                    class="h-8 text-sm"
                  />
                  <p class="text-xs text-muted-foreground mt-1">Actual Used</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Validation Errors -->
          <div v-if="validationErrors.length > 0" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h5 class="text-sm font-medium text-destructive mb-2">Please complete the following:</h5>
            <ul class="text-sm text-destructive space-y-1">
              <li v-for="error in validationErrors" :key="error" class="flex items-center">
                <AlertCircle class="h-3 w-3 mr-2 flex-shrink-0" />
                {{ error }}
              </li>
            </ul>
          </div>

        <DialogFooter class="pt-6">
          <Button
            type="button"
            variant="outline"
            @click="closeModal"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="isSubmitting || !canSubmit"
          >
            {{ isSubmitting ? 'Submitting...' : (isBeforeSubmission ? 'Start Work' : 'Submit for Review') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ChecklistItem, MaterialRequirement } from '@/types';
import {
  Camera as CameraIcon,
  Trash2 as TrashIcon,
  Star as StarIcon,
  AlertCircle
} from 'lucide-vue-next';

interface Props {
  workOrderId: string;
  isBeforeSubmission: boolean;
  checklist: ChecklistItem[];
  materials: MaterialRequirement[];
}

interface PhotoUpload {
  file: File;
  preview: string;
  caption: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  submit: [data: {
    photos: File[];
    photoCaptions: string[];
    notes: string;
    checklistValues?: Record<string, any>;
    materialUsage?: Record<string, number>;
  }];
}>();

const inventoryStore = useInventoryStore();

const selectedPhotos = ref<PhotoUpload[]>([]);
const notes = ref('');
const checklistValues = ref<Record<string, any>>({});
const materialUsage = ref<Record<string, number>>({});
const isSubmitting = ref(false);

// Validation helpers
const missingPhotos = computed(() => selectedPhotos.value.length === 0);

const missingRequiredChecklistItems = computed(() => {
  if (props.checklist.length === 0) return [];
  
  const requiredItems = props.checklist.filter(item => item.required);
  return requiredItems.filter(item => 
    checklistValues.value[item.id] === undefined || 
    checklistValues.value[item.id] === ''
  );
});

const validationErrors = computed(() => {
  const errors: string[] = [];
  
  if (missingPhotos.value) {
    errors.push(`Please add at least one ${props.isBeforeSubmission ? 'before' : 'after'} photo`);
  }
  
  if (missingRequiredChecklistItems.value.length > 0) {
    const itemLabels = missingRequiredChecklistItems.value.map(item => item.label);
    errors.push(`Please complete required checklist items: ${itemLabels.join(', ')}`);
  }
  
  return errors;
});

const canSubmit = computed(() => {
  return validationErrors.value.length === 0;
});

onMounted(() => {
  // Initialize checklist values with existing values if available
  props.checklist.forEach(item => {
    const existingValue = props.isBeforeSubmission ? item.beforeValue : item.afterValue;
    if (existingValue !== undefined) {
      // Handle type conversion for display
      if (item.type === 'yes_no' && typeof existingValue === 'boolean') {
        checklistValues.value[item.id] = existingValue.toString();
      } else {
        checklistValues.value[item.id] = existingValue;
      }
    }
  });
  
  // Initialize material usage with planned quantities
  props.materials.forEach(material => {
    materialUsage.value[material.itemId] = material.actualQuantity || material.plannedQuantity;
  });
  
  // Handle escape key
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  // Cleanup preview URLs
  selectedPhotos.value.forEach(photo => {
    URL.revokeObjectURL(photo.preview);
  });
  
  document.removeEventListener('keydown', handleEscapeKey);
});

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal();
  }
};

const handlePhotoSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  
  files.forEach(file => {
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert(`File "${file.name}" is not an image.`);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
      return;
    }
    
    const preview = URL.createObjectURL(file);
    selectedPhotos.value.push({
      file,
      preview,
      caption: ''
    });
  });
  
  // Reset input
  target.value = '';
};

const removePhoto = (index: number) => {
  const photo = selectedPhotos.value[index];
  if (photo) {
    URL.revokeObjectURL(photo.preview);
  }
  selectedPhotos.value.splice(index, 1);
};

const getInventoryItemName = (itemId: string) => {
  const item = inventoryStore.getItemById(itemId);
  return item?.name || `Item ${itemId}`;
};

const handleSubmit = async () => {
  if (!canSubmit.value) return;
  
  isSubmitting.value = true;
  
  try {
    // Convert checklist values with proper type handling
    const processedChecklistValues: Record<string, any> = {};
    
    Object.entries(checklistValues.value).forEach(([key, value]) => {
      const checklistItem = props.checklist.find(item => item.id === key);
      
      if (checklistItem) {
        // Handle yes/no type - convert string to boolean
        if (checklistItem.type === 'yes_no') {
          processedChecklistValues[key] = value === 'true' || value === true;
        }
        // Handle number type - ensure it's a number
        else if (checklistItem.type === 'number') {
          processedChecklistValues[key] = typeof value === 'string' ? parseFloat(value) : value;
        }
        // Handle rating type - ensure it's a number
        else if (checklistItem.type === 'rating') {
          processedChecklistValues[key] = typeof value === 'string' ? parseInt(value) : value;
        }
        // Other types (text, dropdown) keep as is
        else {
          processedChecklistValues[key] = value;
        }
      }
    });
    
    const submissionData = {
      photos: selectedPhotos.value.map(photo => photo.file),
      photoCaptions: selectedPhotos.value.map(photo => photo.caption),
      notes: notes.value,
      checklistValues: processedChecklistValues,
      materialUsage: !props.isBeforeSubmission ? materialUsage.value : undefined
    };
    
    emit('submit', submissionData);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  emit('close');
};
</script>