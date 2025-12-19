<template>
  <Dialog :open="true" @update:open="$emit('cancel')">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Import Categories</DialogTitle>
      </DialogHeader>
      
      <div class="space-y-4">
        <div>
          <Label for="file">Select JSON File</Label>
          <Input
            id="file"
            type="file"
            accept=".json"
            @change="handleFileSelect"
          />
          <p class="text-xs text-muted-foreground mt-1">
            Upload a JSON file containing category data
          </p>
        </div>
        
        <div v-if="selectedFile" class="p-3 bg-muted/50 rounded-lg">
          <div class="flex items-center space-x-2">
            <FileText class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ selectedFile.name }}</span>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ formatFileSize(selectedFile.size) }}
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button 
          type="button"
          :disabled="!selectedFile"
          @click="handleImport"
        >
          Import Categories
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import { FileText } from 'lucide-vue-next';

const selectedFile = ref<File | null>(null);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (files && files.length > 0 && files[0]) {
    selectedFile.value = files[0];
  }
};

const emit = defineEmits<{
  import: [file: File];
  cancel: [];
}>();

const handleImport = () => {
  if (selectedFile.value) {
    // Emit the file to parent component
    // Parent will handle the actual import logic
    emit('import', selectedFile.value);
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>