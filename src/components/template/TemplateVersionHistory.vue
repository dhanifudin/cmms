<template>
  <div class="template-version-history">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold">Version History</h3>
        <p class="text-sm text-muted-foreground">
          Track changes and manage template versions
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          @click="showCompareDialog = true"
          :disabled="selectedVersions.length !== 2"
        >
          <GitCompare class="h-4 w-4 mr-2" />
          Compare Versions
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          @click="createNewVersion"
        >
          <Plus class="h-4 w-4 mr-2" />
          New Version
        </Button>
      </div>
    </div>

    <!-- Version Timeline -->
    <div class="relative">
      <!-- Timeline Line -->
      <div class="absolute left-8 top-0 bottom-0 w-px bg-border"></div>
      
      <!-- Version Items -->
      <div class="space-y-6">
        <div
          v-for="version in sortedVersions"
          :key="version.id"
          class="relative flex items-start space-x-4"
        >
          <!-- Timeline Dot -->
          <div 
            :class="[
              'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2',
              getVersionDotClass(version)
            ]"
          >
            <Crown v-if="version.id === template.id" class="h-4 w-4" />
            <GitBranch v-else class="h-4 w-4" />
          </div>
          
          <!-- Version Card -->
          <Card class="flex-1">
            <CardContent class="p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Version Header -->
                  <div class="flex items-center space-x-3 mb-2">
                    <div class="flex items-center space-x-2">
                      <Badge :variant="getStatusVariant(version.status)">
                        v{{ version.version }}
                      </Badge>
                      <Badge v-if="version.id === template.id" variant="default">
                        Current
                      </Badge>
                      <Badge v-if="version.status === 'deprecated'" variant="destructive">
                        Deprecated
                      </Badge>
                    </div>
                    <span class="text-sm text-muted-foreground">
                      {{ formatDate(version.createdAt) }}
                    </span>
                  </div>
                  
                  <!-- Version Info -->
                  <div class="space-y-2">
                    <h4 class="font-medium">{{ version.name }}</h4>
                    <p class="text-sm text-muted-foreground line-clamp-2">
                      {{ version.description }}
                    </p>
                    
                    <!-- Change Summary -->
                    <div v-if="version.changeLog" class="text-sm">
                      <div class="font-medium text-muted-foreground mb-1">Changes:</div>
                      <ul class="space-y-1">
                        <li 
                          v-for="change in version.changeLog.slice(0, 3)"
                          :key="change.id"
                          class="flex items-center space-x-2 text-sm"
                        >
                          <div 
                            :class="[
                              'w-2 h-2 rounded-full',
                              getChangeTypeColor(change.type)
                            ]"
                          />
                          <span>{{ change.description }}</span>
                        </li>
                        <li v-if="version.changeLog.length > 3" class="text-xs text-muted-foreground">
                          +{{ version.changeLog.length - 3 }} more changes
                        </li>
                      </ul>
                    </div>
                    
                    <!-- Version Metadata -->
                    <div class="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Created by {{ getUserName(version.createdBy) }}</span>
                      <span>{{ version.checklist?.length || 0 }} checklist items</span>
                      <span>{{ version.materials?.length || 0 }} materials</span>
                    </div>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center space-x-1">
                  <Checkbox 
                    :checked="selectedVersions.includes(version.id)"
                    @update:checked="(checked: boolean) => toggleVersionSelection(version.id, checked)"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        @click="previewVersion(version)"
                        v-if="version.id !== template.id"
                      >
                        <Eye class="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        @click="editVersion(version)"
                        v-if="version.status === 'draft'"
                      >
                        <Edit class="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        @click="cloneVersion(version)"
                      >
                        <Copy class="h-4 w-4 mr-2" />
                        Clone Version
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        @click="promoteVersion(version)"
                        v-if="version.id !== template.id && version.status === 'active'"
                      >
                        <ArrowUp class="h-4 w-4 mr-2" />
                        Promote to Current
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        @click="deprecateVersion(version)"
                        v-if="version.id !== template.id && version.status === 'active'"
                      >
                        <Archive class="h-4 w-4 mr-2" />
                        Deprecate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator v-if="version.status === 'draft'" />
                      <DropdownMenuItem 
                        @click="deleteVersion(version)"
                        v-if="version.status === 'draft'"
                        class="text-destructive focus:text-destructive"
                      >
                        <Trash2 class="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Version Comparison Dialog -->
    <Dialog v-if="showCompareDialog" :open="true" @update:open="closeCompareDialog">
      <DialogContent class="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Compare Template Versions</DialogTitle>
        </DialogHeader>
        <VersionComparison 
          v-if="selectedVersionsData.length >= 2 && selectedVersionsData[0] && selectedVersionsData[1]"
          :versions="[selectedVersionsData[0], selectedVersionsData[1]]"
          @close="closeCompareDialog"
        />
        <div v-else class="text-center py-8 text-muted-foreground">
          Please select exactly 2 versions to compare.
        </div>
      </DialogContent>
    </Dialog>

    <!-- New Version Dialog -->
    <Dialog v-if="showNewVersionDialog" :open="true" @update:open="closeNewVersionDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label>Version Number</Label>
            <Input 
              v-model="newVersionNumber"
              placeholder="e.g., 2.1.0"
            />
          </div>
          <div>
            <Label>Change Description</Label>
            <Textarea 
              v-model="newVersionDescription"
              placeholder="Describe the changes in this version..."
              rows="3"
            />
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox 
              v-model:checked="newVersionDraft"
            />
            <Label>Create as draft</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="closeNewVersionDialog">
            Cancel
          </Button>
          <Button 
            @click="confirmNewVersion"
            :disabled="!newVersionNumber"
          >
            Create Version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTemplateStore } from '@/stores/template';
import { useUserStore } from '@/stores/user';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Custom Components
import VersionComparison from './VersionComparison.vue';

// Icons
import {
  GitCompare,
  GitBranch,
  Crown,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  ArrowUp,
  Archive,
  Trash2,
} from 'lucide-vue-next';

interface Props {
  template: WorkOrderTemplate;
  versions?: WorkOrderTemplate[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [version: WorkOrderTemplate];
  preview: [version: WorkOrderTemplate];
  promote: [version: WorkOrderTemplate];
  newVersion: [data: { version: string; description: string; isDraft: boolean }];
}>();

// Stores
const templateStore = useTemplateStore();
const userStore = useUserStore();
const { toast } = useToast();

// State
const selectedVersions = ref<string[]>([]);
const showCompareDialog = ref(false);
const showNewVersionDialog = ref(false);
const newVersionNumber = ref('');
const newVersionDescription = ref('');
const newVersionDraft = ref(true);

// Computed
const sortedVersions = computed(() => {
  const allVersions = props.versions || [props.template];
  return allVersions.sort((a, b) => {
    // Sort by creation date, newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

const selectedVersionsData = computed(() => {
  return selectedVersions.value
    .map(id => sortedVersions.value.find(v => v.id === id))
    .filter(Boolean) as WorkOrderTemplate[];
});

// Methods
const toggleVersionSelection = (versionId: string, checked: boolean) => {
  if (checked) {
    if (selectedVersions.value.length < 2) {
      selectedVersions.value.push(versionId);
    } else {
      // Replace oldest selection
      const secondSelection = selectedVersions.value[1];
      if (secondSelection) {
        selectedVersions.value = [secondSelection, versionId];
      } else {
        selectedVersions.value = [versionId];
      }
    }
  } else {
    selectedVersions.value = selectedVersions.value.filter(id => id !== versionId);
  }
};

const getVersionDotClass = (version: WorkOrderTemplate) => {
  if (version.id === props.template.id) {
    return 'bg-primary border-primary text-primary-foreground';
  }
  
  switch (version.status) {
    case 'active':
      return 'bg-green-100 border-green-300 text-green-700';
    case 'deprecated':
      return 'bg-red-100 border-red-300 text-red-700';
    case 'draft':
      return 'bg-yellow-100 border-yellow-300 text-yellow-700';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-700';
  }
};

const getStatusVariant = (status: string) => {
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

const getChangeTypeColor = (type: string) => {
  switch (type) {
    case 'added':
      return 'bg-green-500';
    case 'modified':
      return 'bg-blue-500';
    case 'removed':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getUserName = (userId: string | undefined) => {
  if (!userId) return 'Unknown User';
  const user = userStore.getUserById(userId);
  return user?.name || 'Unknown User';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const previewVersion = (version: WorkOrderTemplate) => {
  emit('preview', version);
};

const editVersion = (version: WorkOrderTemplate) => {
  emit('edit', version);
};

const cloneVersion = async (version: WorkOrderTemplate) => {
  try {
    await templateStore.cloneTemplate(version.id, `${version.name} (Clone)`);
    toast({
      title: 'Version Cloned',
      description: 'Version has been cloned successfully'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to clone version',
      variant: 'destructive'
    });
  }
};

const promoteVersion = (version: WorkOrderTemplate) => {
  emit('promote', version);
};

const deprecateVersion = async (version: WorkOrderTemplate) => {
  try {
    await templateStore.deprecateTemplate(version.id);
    toast({
      title: 'Version Deprecated',
      description: 'Version has been deprecated successfully'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to deprecate version',
      variant: 'destructive'
    });
  }
};

const deleteVersion = async (version: WorkOrderTemplate) => {
  if (confirm(`Delete version ${version.version}?`)) {
    try {
      await templateStore.deleteTemplate(version.id);
      toast({
        title: 'Version Deleted',
        description: 'Version has been deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete version',
        variant: 'destructive'
      });
    }
  }
};

const createNewVersion = () => {
  const currentVersion = props.template.version;
  const versionParts = currentVersion.split('.').map(Number);
  
  // Ensure we have at least 3 parts for semantic versioning
  while (versionParts.length < 3) {
    versionParts.push(0);
  }
  
  versionParts[1] = (versionParts[1] || 0) + 1; // Increment minor version
  versionParts[2] = 0;  // Reset patch version
  
  newVersionNumber.value = versionParts.join('.');
  newVersionDescription.value = '';
  newVersionDraft.value = true;
  showNewVersionDialog.value = true;
};

const confirmNewVersion = () => {
  emit('newVersion', {
    version: newVersionNumber.value,
    description: newVersionDescription.value,
    isDraft: newVersionDraft.value
  });
  closeNewVersionDialog();
};

const closeCompareDialog = () => {
  showCompareDialog.value = false;
  selectedVersions.value = [];
};

const closeNewVersionDialog = () => {
  showNewVersionDialog.value = false;
  newVersionNumber.value = '';
  newVersionDescription.value = '';
  newVersionDraft.value = true;
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>