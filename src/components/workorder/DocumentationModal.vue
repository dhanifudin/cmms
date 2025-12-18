<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isBeforeSubmission ? 'Submit Before Documentation' : 'Submit After Documentation' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Checklist Section (for before documentation) -->
          <div v-if="isBeforeSubmission && checklist.length > 0">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Complete Checklist (Before State)</h4>
            <div class="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
              <div
                v-for="item in checklist"
                :key="item.id"
                class="border-b border-gray-100 pb-3 last:border-b-0"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <label class="text-sm font-medium text-gray-700">
                      {{ item.label }}
                      <span v-if="item.required" class="text-red-500 ml-1">*</span>
                    </label>
                    <p v-if="item.unit" class="text-xs text-gray-500">Unit: {{ item.unit }}</p>
                  </div>
                  
                  <div class="ml-4 min-w-32">
                    <!-- Yes/No type -->
                    <template v-if="item.type === 'yes_no'">
                      <select
                        v-model="checklistValues[item.id]"
                        class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        :required="item.required"
                      >
                        <option value="">Select...</option>
                        <option :value="true">Yes</option>
                        <option :value="false">No</option>
                      </select>
                    </template>
                    
                    <!-- Number type -->
                    <template v-else-if="item.type === 'number'">
                      <input
                        v-model.number="checklistValues[item.id]"
                        type="number"
                        :step="0.01"
                        :min="item.minValue"
                        :max="item.maxValue"
                        class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        :required="item.required"
                      />
                    </template>
                    
                    <!-- Text type -->
                    <template v-else-if="item.type === 'text'">
                      <input
                        v-model="checklistValues[item.id]"
                        type="text"
                        class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        :required="item.required"
                      />
                    </template>
                    
                    <!-- Dropdown type -->
                    <template v-else-if="item.type === 'dropdown'">
                      <select
                        v-model="checklistValues[item.id]"
                        class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        :required="item.required"
                      >
                        <option value="">Select...</option>
                        <option
                          v-for="option in item.options"
                          :key="option"
                          :value="option"
                        >
                          {{ option }}
                        </option>
                      </select>
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
            <h4 class="text-sm font-medium text-gray-900 mb-4">
              {{ isBeforeSubmission ? 'Before Photos' : 'After Photos' }}
            </h4>
            
            <!-- Photo Upload Area -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                <CameraIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div class="space-y-2">
                  <button
                    @click="($refs.photoInput as HTMLInputElement).click()"
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <CameraIcon class="h-4 w-4 mr-2" />
                    Take Photos
                  </button>
                  <p class="text-xs text-gray-500">
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
                      <button
                        @click="removePhoto(index)"
                        type="button"
                        class="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                    
                    <!-- Photo caption -->
                    <div class="mt-2">
                      <input
                        v-model="photo.caption"
                        type="text"
                        placeholder="Add caption..."
                        class="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  @click="($refs.photoInput as HTMLInputElement).click()"
                  type="button"
                  class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <CameraIcon class="h-4 w-4 mx-auto mb-1" />
                  Add More Photos
                </button>
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              {{ isBeforeSubmission ? 'Before Notes' : 'After Notes' }}
            </label>
            <textarea
              v-model="notes"
              rows="4"
              placeholder="Add any additional notes or observations..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <!-- Material Usage (for after documentation) -->
          <div v-if="!isBeforeSubmission && materials.length > 0">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Material Usage</h4>
            <div class="space-y-3">
              <div
                v-for="material in materials"
                :key="material.itemId"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">
                    {{ getInventoryItemName(material.itemId) }}
                  </p>
                  <p class="text-xs text-gray-500">Planned: {{ material.plannedQuantity }}</p>
                </div>
                <div class="w-24">
                  <input
                    v-model.number="materialUsage[material.itemId]"
                    type="number"
                    :min="0"
                    :step="0.01"
                    :placeholder="material.plannedQuantity.toString()"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <p class="text-xs text-gray-500 mt-1">Actual Used</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              @click="closeModal"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !canSubmit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
              <span v-else>
                {{ isBeforeSubmission ? 'Start Work' : 'Submit for Review' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import type { ChecklistItem, MaterialRequirement } from '@/types';
import {
  X as XIcon,
  Camera as CameraIcon,
  Trash2 as TrashIcon,
  Star as StarIcon
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

const canSubmit = computed(() => {
  // Must have at least one photo for both before and after
  if (selectedPhotos.value.length === 0) return false;
  
  // For before submission, required checklist items must be filled
  if (props.isBeforeSubmission) {
    const requiredItems = props.checklist.filter(item => item.required);
    return requiredItems.every(item => 
      checklistValues.value[item.id] !== undefined && 
      checklistValues.value[item.id] !== ''
    );
  }
  
  return true;
});

onMounted(() => {
  // Initialize checklist values with existing values if available
  props.checklist.forEach(item => {
    const existingValue = props.isBeforeSubmission ? item.beforeValue : item.afterValue;
    if (existingValue !== undefined) {
      checklistValues.value[item.id] = existingValue;
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
    const submissionData = {
      photos: selectedPhotos.value.map(photo => photo.file),
      photoCaptions: selectedPhotos.value.map(photo => photo.caption),
      notes: notes.value,
      checklistValues: props.isBeforeSubmission ? checklistValues.value : undefined,
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