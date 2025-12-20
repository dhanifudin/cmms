<template>
  <div class="template-lifecycle-manager space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold">Template Lifecycle Management</h2>
        <p class="text-sm text-muted-foreground">
          Manage versions, approvals, and template operations
        </p>
      </div>
      
      <div class="flex items-center space-x-2">
        <Badge :variant="getTemplateStatusVariant(template.status)">
          {{ template.status }}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings class="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="activeTab = 'versions'">
              <GitBranch class="h-4 w-4 mr-2" />
              Manage Versions
            </DropdownMenuItem>
            <DropdownMenuItem @click="activeTab = 'approval'">
              <CheckSquare class="h-4 w-4 mr-2" />
              Approval Workflow
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportTemplate">
              <Download class="h-4 w-4 mr-2" />
              Export Template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              @click="submitForApproval"
              v-if="template.status === 'draft'"
            >
              <Send class="h-4 w-4 mr-2" />
              Submit for Approval
            </DropdownMenuItem>
            <DropdownMenuItem 
              @click="archiveTemplate"
              v-if="template.status !== 'archived'"
            >
              <Archive class="h-4 w-4 mr-2" />
              Archive Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Template Overview Card -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Template Info -->
          <div class="md:col-span-2">
            <h3 class="font-semibold text-lg mb-2">{{ template.name }}</h3>
            <p class="text-muted-foreground text-sm mb-4">{{ template.description }}</p>
            
            <div class="flex items-center space-x-4 text-sm">
              <div class="flex items-center space-x-1">
                <Code class="h-4 w-4" />
                <span>{{ template.code }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <Tag class="h-4 w-4" />
                <span>v{{ template.version }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <Calendar class="h-4 w-4" />
                <span>{{ formatDate(template.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Statistics -->
          <div>
            <div class="text-sm text-muted-foreground mb-1">Usage</div>
            <div class="text-2xl font-bold">{{ template.usageCount || 0 }}</div>
            <div class="text-sm text-muted-foreground">work orders</div>
          </div>
          
          <div>
            <div class="text-sm text-muted-foreground mb-1">Versions</div>
            <div class="text-2xl font-bold">{{ templateVersions.length }}</div>
            <div class="text-sm text-muted-foreground">total versions</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="versions">
          <GitBranch class="h-4 w-4 mr-2" />
          Version History
        </TabsTrigger>
        <TabsTrigger value="approval">
          <CheckSquare class="h-4 w-4 mr-2" />
          Approval Workflow
        </TabsTrigger>
        <TabsTrigger value="operations">
          <Settings class="h-4 w-4 mr-2" />
          Operations
        </TabsTrigger>
      </TabsList>

      <!-- Version History Tab -->
      <TabsContent value="versions">
        <TemplateVersionHistory
          :template="template"
          :versions="templateVersions"
          @edit="editVersion"
          @preview="previewVersionHandler"
          @promote="promoteVersion"
          @new-version="createNewVersion"
        />
      </TabsContent>

      <!-- Approval Workflow Tab -->
      <TabsContent value="approval">
        <TemplateApprovalWorkflow
          :template="template"
          :approval-steps="approvalSteps"
          :can-approve="canApprove"
          :can-reject="canReject"
          @approve="handleApproval"
          @reject="handleRejection"
        />
      </TabsContent>

      <!-- Operations Tab -->
      <TabsContent value="operations">
        <div class="space-y-6">
          <!-- Template Operations -->
          <Card>
            <CardHeader>
              <CardTitle>Template Operations</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Status Management -->
              <div class="flex items-center justify-between p-4 border rounded">
                <div>
                  <div class="font-medium">Template Status</div>
                  <div class="text-sm text-muted-foreground">
                    Current status: {{ template.status }}
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    @click="toggleStatus"
                    :disabled="template.status === 'archived'"
                  >
                    {{ template.isActive ? 'Deactivate' : 'Activate' }}
                  </Button>
                </div>
              </div>

              <!-- Version Management -->
              <div class="flex items-center justify-between p-4 border rounded">
                <div>
                  <div class="font-medium">Version Control</div>
                  <div class="text-sm text-muted-foreground">
                    Create new versions and manage existing ones
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    @click="activeTab = 'versions'"
                  >
                    Manage Versions
                  </Button>
                </div>
              </div>

              <!-- Approval Management -->
              <div class="flex items-center justify-between p-4 border rounded">
                <div>
                  <div class="font-medium">Approval Workflow</div>
                  <div class="text-sm text-muted-foreground">
                    Submit for approval or manage approval process
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    @click="activeTab = 'approval'"
                  >
                    View Workflow
                  </Button>
                  <Button 
                    size="sm"
                    @click="submitForApproval"
                    v-if="template.status === 'draft'"
                  >
                    Submit for Approval
                  </Button>
                </div>
              </div>

              <!-- Export/Import -->
              <div class="flex items-center justify-between p-4 border rounded">
                <div>
                  <div class="font-medium">Export Template</div>
                  <div class="text-sm text-muted-foreground">
                    Download template as JSON or share with other systems
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    @click="exportTemplate"
                  >
                    <Download class="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <!-- Archive -->
              <div 
                v-if="template.status !== 'archived'"
                class="flex items-center justify-between p-4 border rounded border-destructive/50"
              >
                <div>
                  <div class="font-medium text-destructive">Archive Template</div>
                  <div class="text-sm text-muted-foreground">
                    Archive this template to remove it from active use
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <Button 
                    variant="destructive"
                    size="sm"
                    @click="archiveTemplate"
                  >
                    <Archive class="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <!-- Version Preview Dialog -->
    <Dialog v-if="showPreviewDialog" :open="true" @update:open="closePreviewDialog">
      <DialogContent class="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Template Preview - v{{ previewVersion?.version }}</DialogTitle>
        </DialogHeader>
        <div class="overflow-auto">
          <TemplatePreview 
            v-if="previewVersion"
            :template="previewVersion"
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTemplateStore } from '@/stores/template';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderTemplate } from '@/types/templates';

// Custom Components
import TemplateVersionHistory from './TemplateVersionHistory.vue';
import TemplateApprovalWorkflow from './TemplateApprovalWorkflow.vue';
import TemplatePreview from './TemplatePreview.vue';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
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

// Icons
import {
  Settings,
  GitBranch,
  CheckSquare,
  Download,
  Send,
  Archive,
  Code,
  Tag,
  Calendar,
} from 'lucide-vue-next';

interface Props {
  template: WorkOrderTemplate;
  canApprove?: boolean;
  canReject?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canApprove: false,
  canReject: false
});

// Stores
const templateStore = useTemplateStore();
const { toast } = useToast();

// State
const activeTab = ref('versions');
const showPreviewDialog = ref(false);
const selectedPreviewVersion = ref<WorkOrderTemplate | null>(null);

// Mock approval steps (in real app would come from API)
const approvalSteps = ref([
  {
    id: '1',
    title: 'Technical Review',
    description: 'Review template for technical accuracy',
    status: 'approved' as const,
    assignee: 'tech-reviewer',
    createdAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T14:30:00Z',
    comments: 'Template looks good, all checklist items are properly defined.'
  },
  {
    id: '2',
    title: 'Safety Review',
    description: 'Verify safety requirements and procedures',
    status: 'pending' as const,
    assignee: 'safety-officer',
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '3',
    title: 'Management Approval',
    description: 'Final approval from management',
    status: 'pending' as const,
    assignee: 'manager',
    createdAt: '2024-01-15T14:30:00Z'
  }
]);

// Computed
const templateVersions = computed(() => {
  return templateStore.getTemplateVersions(props.template.id);
});

const previewVersion = computed(() => {
  return selectedPreviewVersion.value;
});

// Methods
const getTemplateStatusVariant = (status: string) => {
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const editVersion = (version: WorkOrderTemplate) => {
  // Emit event to parent to open editor
  toast({
    title: 'Edit Version',
    description: `Opening editor for version ${version.version}`
  });
};

const previewVersionHandler = (version: WorkOrderTemplate) => {
  selectedPreviewVersion.value = version;
  showPreviewDialog.value = true;
};

const promoteVersion = async (version: WorkOrderTemplate) => {
  try {
    await templateStore.promoteVersion(version.id);
    toast({
      title: 'Version Promoted',
      description: `Version ${version.version} is now the current version`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to promote version',
      variant: 'destructive'
    });
  }
};

const createNewVersion = async (data: { version: string; description: string; isDraft: boolean }) => {
  try {
    await templateStore.createNewVersion(props.template.id, data);
    toast({
      title: 'Version Created',
      description: `New version ${data.version} created successfully`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to create new version',
      variant: 'destructive'
    });
  }
};

const handleApproval = async (comments: string, notify: boolean) => {
  try {
    await templateStore.approveTemplateVersion(props.template.id, { comments, notify });
    toast({
      title: 'Template Approved',
      description: 'Template has been approved successfully'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to approve template',
      variant: 'destructive'
    });
  }
};

const handleRejection = async (reason: string, notify: boolean) => {
  try {
    await templateStore.rejectTemplateVersion(props.template.id, { reason, notify });
    toast({
      title: 'Template Rejected',
      description: 'Template has been rejected'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to reject template',
      variant: 'destructive'
    });
  }
};

const submitForApproval = async () => {
  try {
    await templateStore.submitForApproval(props.template.id);
    toast({
      title: 'Submitted for Approval',
      description: 'Template has been submitted for approval'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to submit for approval',
      variant: 'destructive'
    });
  }
};

const toggleStatus = async () => {
  try {
    await templateStore.toggleTemplateStatus(props.template.id, !props.template.isActive);
    toast({
      title: 'Status Updated',
      description: `Template ${props.template.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update status',
      variant: 'destructive'
    });
  }
};

const archiveTemplate = async () => {
  if (confirm('Are you sure you want to archive this template?')) {
    try {
      await templateStore.updateTemplate(props.template.id, { status: 'archived' });
      toast({
        title: 'Template Archived',
        description: 'Template has been archived'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive template',
        variant: 'destructive'
      });
    }
  }
};

const exportTemplate = () => {
  // Create downloadable JSON
  const exportData = {
    ...props.template,
    exportedAt: new Date().toISOString(),
    exportedBy: 'current-user'
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `template-${props.template.code}-v${props.template.version}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  
  toast({
    title: 'Template Exported',
    description: 'Template has been downloaded as JSON'
  });
};

const closePreviewDialog = () => {
  showPreviewDialog.value = false;
  selectedPreviewVersion.value = null;
};

// Initialize
onMounted(() => {
  // Load template versions and approval data
});
</script>