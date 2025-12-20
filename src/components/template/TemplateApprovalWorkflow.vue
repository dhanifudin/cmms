<template>
  <div class="approval-workflow">
    <!-- Workflow Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold">Approval Workflow</h3>
        <p class="text-sm text-muted-foreground">
          Review and approve template changes
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Badge :variant="getWorkflowStatusVariant()">
          {{ getWorkflowStatus() }}
        </Badge>
        <Button 
          v-if="canApprove" 
          @click="showApprovalDialog = true"
        >
          <CheckCircle class="h-4 w-4 mr-2" />
          Approve
        </Button>
        <Button 
          v-if="canReject" 
          variant="destructive" 
          @click="showRejectionDialog = true"
        >
          <XCircle class="h-4 w-4 mr-2" />
          Reject
        </Button>
      </div>
    </div>

    <!-- Approval Timeline -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="text-base">Approval History</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="relative">
          <!-- Timeline Line -->
          <div class="absolute left-4 top-0 bottom-0 w-px bg-border"></div>
          
          <!-- Timeline Items -->
          <div class="space-y-6">
            <div
              v-for="(step, index) in approvalSteps"
              :key="index"
              class="relative flex items-start space-x-4"
            >
              <!-- Timeline Dot -->
              <div 
                :class="[
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2',
                  getStepClass(step)
                ]"
              >
                <CheckCircle v-if="step.status === 'approved'" class="h-4 w-4" />
                <XCircle v-else-if="step.status === 'rejected'" class="h-4 w-4" />
                <Clock v-else-if="step.status === 'pending'" class="h-4 w-4" />
                <User v-else class="h-4 w-4" />
              </div>
              
              <!-- Step Content -->
              <div class="flex-1 pb-6">
                <div class="flex items-start justify-between">
                  <div>
                    <h4 class="font-medium">{{ step.title }}</h4>
                    <p class="text-sm text-muted-foreground">{{ step.description }}</p>
                    <div class="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                      <span>{{ getUserName(step.assignee) }}</span>
                      <span>•</span>
                      <span>{{ formatDate(step.createdAt) }}</span>
                    </div>
                  </div>
                  <Badge :variant="getStepStatusVariant(step.status)">
                    {{ step.status }}
                  </Badge>
                </div>
                
                <div v-if="step.comments" class="mt-3 p-3 bg-muted/30 rounded text-sm">
                  <div class="font-medium mb-1">Comments:</div>
                  <p>{{ step.comments }}</p>
                </div>
                
                <div v-if="step.attachments && step.attachments.length > 0" class="mt-3">
                  <div class="text-sm font-medium mb-2">Attachments:</div>
                  <div class="space-y-1">
                    <div
                      v-for="attachment in step.attachments"
                      :key="attachment.id"
                      class="flex items-center space-x-2 text-sm"
                    >
                      <Paperclip class="h-3 w-3" />
                      <span>{{ attachment.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Approval Requirements -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="text-base">Approval Requirements</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Template Validation -->
          <div class="flex items-start space-x-3">
            <div class="flex-none mt-1">
              <div 
                :class="[
                  'w-4 h-4 rounded-full flex items-center justify-center',
                  validationChecks.templateValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                ]"
              >
                <Check v-if="validationChecks.templateValid" class="h-3 w-3" />
                <X v-else class="h-3 w-3" />
              </div>
            </div>
            <div>
              <div class="font-medium text-sm">Template Validation</div>
              <div class="text-sm text-muted-foreground">
                {{ validationChecks.templateValid ? 'Template passes all validation checks' : 'Template has validation errors' }}
              </div>
            </div>
          </div>

          <!-- Checklist Completeness -->
          <div class="flex items-start space-x-3">
            <div class="flex-none mt-1">
              <div 
                :class="[
                  'w-4 h-4 rounded-full flex items-center justify-center',
                  validationChecks.checklistComplete ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                ]"
              >
                <Check v-if="validationChecks.checklistComplete" class="h-3 w-3" />
                <AlertTriangle v-else class="h-3 w-3" />
              </div>
            </div>
            <div>
              <div class="font-medium text-sm">Checklist Completeness</div>
              <div class="text-sm text-muted-foreground">
                {{ template.checklist?.length || 0 }} checklist items defined
              </div>
            </div>
          </div>

          <!-- Safety Requirements -->
          <div class="flex items-start space-x-3">
            <div class="flex-none mt-1">
              <div 
                :class="[
                  'w-4 h-4 rounded-full flex items-center justify-center',
                  validationChecks.safetyComplete ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                ]"
              >
                <Check v-if="validationChecks.safetyComplete" class="h-3 w-3" />
                <AlertTriangle v-else class="h-3 w-3" />
              </div>
            </div>
            <div>
              <div class="font-medium text-sm">Safety Requirements</div>
              <div class="text-sm text-muted-foreground">
                {{ template.safetyRequirements?.length || 0 }} safety requirements defined
              </div>
            </div>
          </div>

          <!-- Required Approvals -->
          <div class="flex items-start space-x-3">
            <div class="flex-none mt-1">
              <div 
                :class="[
                  'w-4 h-4 rounded-full flex items-center justify-center',
                  validationChecks.approvalsMet ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                ]"
              >
                <Check v-if="validationChecks.approvalsMet" class="h-3 w-3" />
                <X v-else class="h-3 w-3" />
              </div>
            </div>
            <div>
              <div class="font-medium text-sm">Required Approvals</div>
              <div class="text-sm text-muted-foreground">
                {{ completedApprovals }}/{{ requiredApprovals }} approvals completed
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Approval Dialog -->
    <Dialog v-if="showApprovalDialog" :open="true" @update:open="closeApprovalDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Template</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label>Approval Comments</Label>
            <Textarea 
              v-model="approvalComments"
              placeholder="Add any comments about this approval..."
              rows="3"
            />
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox v-model:checked="notifyCreator" />
            <Label>Notify template creator</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="closeApprovalDialog">
            Cancel
          </Button>
          <Button @click="confirmApproval">
            <CheckCircle class="h-4 w-4 mr-2" />
            Approve Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Rejection Dialog -->
    <Dialog v-if="showRejectionDialog" :open="true" @update:open="closeRejectionDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Template</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label>Rejection Reason <span class="text-red-500">*</span></Label>
            <Textarea 
              v-model="rejectionReason"
              placeholder="Explain why this template is being rejected..."
              rows="4"
              required
            />
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox v-model:checked="notifyCreator" />
            <Label>Notify template creator</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="closeRejectionDialog">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            @click="confirmRejection"
            :disabled="!rejectionReason"
          >
            <XCircle class="h-4 w-4 mr-2" />
            Reject Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderTemplate } from '@/types/templates';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Paperclip,
  Check,
  X,
  AlertTriangle,
} from 'lucide-vue-next';

interface ApprovalStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  assignee: string;
  createdAt: string;
  completedAt?: string;
  comments?: string;
  attachments?: { id: string; name: string; url: string }[];
}

interface Props {
  template: WorkOrderTemplate;
  approvalSteps?: ApprovalStep[];
  canApprove?: boolean;
  canReject?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  approvalSteps: () => [],
  canApprove: false,
  canReject: false
});

const emit = defineEmits<{
  approve: [comments: string, notify: boolean];
  reject: [reason: string, notify: boolean];
}>();

// Stores
const userStore = useUserStore();
const { toast } = useToast();

// State
const showApprovalDialog = ref(false);
const showRejectionDialog = ref(false);
const approvalComments = ref('');
const rejectionReason = ref('');
const notifyCreator = ref(true);

// Computed
const validationChecks = computed(() => {
  const checks = {
    templateValid: props.template.name && props.template.description && props.template.code,
    checklistComplete: (props.template.checklist?.length || 0) > 0,
    safetyComplete: (props.template.safetyRequirements?.length || 0) > 0,
    approvalsMet: false
  };
  
  const approved = props.approvalSteps.filter(step => step.status === 'approved').length;
  const required = props.approvalSteps.length;
  checks.approvalsMet = approved >= Math.max(1, Math.floor(required * 0.5)); // At least 50% approval
  
  return checks;
});

const completedApprovals = computed(() => {
  return props.approvalSteps.filter(step => step.status === 'approved').length;
});

const requiredApprovals = computed(() => {
  return props.approvalSteps.length;
});

// Methods
const getWorkflowStatus = () => {
  const pending = props.approvalSteps.some(step => step.status === 'pending');
  const rejected = props.approvalSteps.some(step => step.status === 'rejected');
  
  if (rejected) return 'Rejected';
  if (pending) return 'Pending Approval';
  if (validationChecks.value.approvalsMet) return 'Approved';
  return 'Under Review';
};

const getWorkflowStatusVariant = () => {
  const status = getWorkflowStatus();
  switch (status) {
    case 'Approved':
      return 'default';
    case 'Rejected':
      return 'destructive';
    case 'Pending Approval':
    case 'Under Review':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStepClass = (step: ApprovalStep) => {
  switch (step.status) {
    case 'approved':
      return 'bg-green-100 border-green-300 text-green-700';
    case 'rejected':
      return 'bg-red-100 border-red-300 text-red-700';
    case 'pending':
      return 'bg-yellow-100 border-yellow-300 text-yellow-700';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-700';
  }
};

const getStepStatusVariant = (status: string) => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getUserName = (userId: string) => {
  const user = userStore.getUserById(userId);
  return user?.name || 'Unknown User';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const confirmApproval = () => {
  emit('approve', approvalComments.value, notifyCreator.value);
  closeApprovalDialog();
  toast({
    title: 'Template Approved',
    description: 'Template has been approved successfully'
  });
};

const confirmRejection = () => {
  emit('reject', rejectionReason.value, notifyCreator.value);
  closeRejectionDialog();
  toast({
    title: 'Template Rejected',
    description: 'Template has been rejected'
  });
};

const closeApprovalDialog = () => {
  showApprovalDialog.value = false;
  approvalComments.value = '';
  notifyCreator.value = true;
};

const closeRejectionDialog = () => {
  showRejectionDialog.value = false;
  rejectionReason.value = '';
  notifyCreator.value = true;
};
</script>