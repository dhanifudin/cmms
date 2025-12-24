<template>
  <div class="h-[90vh] max-h-[90vh] flex bg-gray-50 mx-auto my-4 rounded-lg shadow-lg overflow-hidden">
    <!-- Sidebar - Status Filters -->
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex-shrink-0">
        <h1 class="text-base font-semibold text-gray-900">Memo</h1>
        <p class="text-xs text-gray-500 mt-1">Create and track work order requests</p>
      </div>

      <!-- Create Button -->
      <div class="p-3 border-b border-gray-200">
        <button
          @click="showCreateMemoModal = true"
          class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      <!-- Status Filters -->
      <div class="flex-1 overflow-y-auto min-h-0 p-2">
        <button
          v-for="status in statusFilters"
          :key="status.id"
          @click="selectedStatus = status.id"
          class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors mb-1"
          :class="{
            'bg-blue-100 text-blue-700': selectedStatus === status.id,
            'text-gray-700': selectedStatus !== status.id
          }"
        >
          <component
            :is="getStatusIcon(status.id)"
            class="h-4 w-4 mr-2 flex-shrink-0"
          />
          <span class="flex-1 text-left truncate">{{ status.name }}</span>
          <span
            v-if="status.count > 0"
            class="ml-1 px-2 py-0.5 text-xs rounded-full flex-shrink-0"
            :class="{
              'bg-blue-200 text-blue-700': selectedStatus === status.id,
              'bg-gray-100 text-gray-600': selectedStatus !== status.id
            }"
          >
            {{ status.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex h-full min-h-0">
      <!-- Memo List -->
      <div class="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
        <div class="p-3 border-b border-gray-200 flex-shrink-0">
          <!-- Search -->
          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search requests..."
              class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <div v-if="isLoading" class="p-4 text-center text-gray-500">
            Loading requests...
          </div>

          <div v-else-if="filteredMemos.length === 0" class="p-6 text-center text-gray-500">
            <FileTextIcon class="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p class="font-medium">No requests found</p>
            <p class="text-sm mt-1">Click "New Request" to create one</p>
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="memo in filteredMemos"
              :key="memo.id"
              @click="selectMemo(memo)"
              class="p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors"
              :class="{
                'border-l-blue-500 bg-blue-50': selectedMemo?.id === memo.id,
                'border-l-transparent': selectedMemo?.id !== memo.id
              }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ memo.memoData?.workOrderSpecs.title }}
                    </p>
                  </div>

                  <div class="mt-1 flex items-center space-x-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusColor(memo.memoData?.status || 'pending')"
                    >
                      {{ getStatusLabel(memo.memoData?.status || 'pending') }}
                    </span>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs"
                      :class="getUrgencyColor(memo.memoData?.urgencyLevel || 'routine')"
                    >
                      {{ memo.memoData?.urgencyLevel }}
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-2">
                    {{ formatTime(memo.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Memo Detail -->
      <div class="flex-1 flex flex-col h-full">
        <div v-if="!selectedMemo" class="flex-1 flex items-center justify-center bg-gray-50 h-full">
          <div class="text-center">
            <FileTextIcon class="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No request selected</h3>
            <p class="text-gray-500">Choose a request from the list to view details</p>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col bg-white h-full min-h-0">
          <!-- Memo Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-lg font-medium text-gray-900">
                  {{ selectedMemo.memoData?.workOrderSpecs.title }}
                </h2>

                <div class="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span><strong>Category:</strong> {{ selectedMemo.memoData?.workOrderSpecs.category }}</span>
                  <span><strong>Priority:</strong> {{ selectedMemo.memoData?.workOrderSpecs.priority }}</span>
                </div>

                <p class="text-sm text-gray-500 mt-1">
                  Submitted {{ formatDateTime(selectedMemo.createdAt) }}
                </p>
              </div>

              <div class="ml-4">
                <span
                  class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
                  :class="getStatusColor(selectedMemo.memoData?.status || 'pending')"
                >
                  <component :is="getStatusIcon(selectedMemo.memoData?.status || 'pending')" class="h-4 w-4 mr-1.5" />
                  {{ getStatusLabel(selectedMemo.memoData?.status || 'pending') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Memo Content -->
          <div class="flex-1 px-6 py-4 overflow-y-auto min-h-0">
            <div v-if="selectedMemo.memoData" class="space-y-6">
              <!-- Work Order Specifications -->
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-3">Work Order Specifications</h4>
                <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm font-medium text-gray-700">Terminal:</span>
                      <p class="text-sm text-gray-900">{{ getTerminalName(selectedMemo.memoData.workOrderSpecs.terminalId) }}</p>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-700">Estimated Duration:</span>
                      <p class="text-sm text-gray-900">{{ selectedMemo.memoData.workOrderSpecs.estimatedDuration }} hours</p>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-700">Urgency Level:</span>
                      <p class="text-sm text-gray-900 capitalize">{{ selectedMemo.memoData.urgencyLevel }}</p>
                    </div>
                  </div>

                  <div>
                    <span class="text-sm font-medium text-gray-700">Description:</span>
                    <p class="text-sm text-gray-900 mt-1">{{ selectedMemo.memoData.workOrderSpecs.description }}</p>
                  </div>

                  <div v-if="selectedMemo.memoData.workOrderSpecs.suggestedWorkerId">
                    <span class="text-sm font-medium text-gray-700">Suggested Worker:</span>
                    <p class="text-sm text-gray-900">{{ getWorkerName(selectedMemo.memoData.workOrderSpecs.suggestedWorkerId) }}</p>
                  </div>

                  <div v-if="selectedMemo.memoData.workOrderSpecs.requiredMaterials?.length">
                    <span class="text-sm font-medium text-gray-700">Required Materials:</span>
                    <ul class="text-sm text-gray-900 mt-1 list-disc list-inside">
                      <li v-for="material in selectedMemo.memoData.workOrderSpecs.requiredMaterials" :key="material">
                        {{ material }}
                      </li>
                    </ul>
                  </div>

                  <div v-if="selectedMemo.memoData.workOrderSpecs.specialInstructions">
                    <span class="text-sm font-medium text-gray-700">Special Instructions:</span>
                    <p class="text-sm text-gray-900 mt-1">{{ selectedMemo.memoData.workOrderSpecs.specialInstructions }}</p>
                  </div>
                </div>
              </div>

              <!-- Justification -->
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-3">Business Justification</h4>
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p class="text-sm text-gray-900">{{ selectedMemo.memoData.justification }}</p>
                </div>
              </div>

              <!-- Conversion Status -->
              <div v-if="selectedMemo.memoData.status === 'converted' && selectedMemo.memoData.convertedToWorkOrderId">
                <h4 class="text-md font-medium text-gray-900 mb-3">Work Order Created</h4>
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-900">
                      Your request has been converted to a work order.
                    </p>
                    <router-link
                      :to="`/work-orders/${selectedMemo.memoData.convertedToWorkOrderId}`"
                      class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <ExternalLinkIcon class="h-4 w-4 mr-1.5" />
                      View Work Order
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Pending Status Info -->
              <div v-if="selectedMemo.memoData.status === 'pending'">
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div class="flex items-start">
                    <ClockIcon class="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p class="text-sm text-blue-800">
                      Your request is pending review by the terminal admin. You will be notified once it has been processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Memo Modal -->
    <CreateMemoModal
      v-if="showCreateMemoModal"
      :show="showCreateMemoModal"
      @close="showCreateMemoModal = false"
      @success="handleMemoSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMessageStore } from '@/stores/message';
import { useAuthStore } from '@/stores/auth';
import type { Message } from '@/types';
import {
  Plus as PlusIcon,
  Search as SearchIcon,
  FileText as FileTextIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  Inbox as InboxIcon,
  ExternalLink as ExternalLinkIcon
} from 'lucide-vue-next';
import CreateMemoModal from '@/components/memo/CreateMemoModal.vue';

const messageStore = useMessageStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const selectedStatus = ref('all');
const selectedMemo = ref<Message | null>(null);
const showCreateMemoModal = ref(false);

const isLoading = computed(() => messageStore.isLoading);

// Status filters - only pending and converted (no rejected)
const statusFilters = computed(() => {
  return [
    { id: 'all', name: 'All Requests', count: myMemos.value.length },
    { id: 'pending', name: 'Pending', count: myMemos.value.filter(m => m.memoData?.status === 'pending').length },
    { id: 'converted', name: 'Converted', count: myMemos.value.filter(m => m.memoData?.status === 'converted').length }
  ];
});

// Get supervisor's own memos
const myMemos = computed(() => {
  return messageStore.messages.filter(message => {
    if (message.type !== 'supervisor_memo' || !message.memoData) return false;
    return message.senderId === authStore.currentUser?.id;
  });
});

const filteredMemos = computed(() => {
  let memos = myMemos.value;

  // Filter by status
  if (selectedStatus.value !== 'all') {
    memos = memos.filter(memo => memo.memoData?.status === selectedStatus.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    memos = memos.filter(memo =>
      memo.memoData?.workOrderSpecs.title.toLowerCase().includes(query) ||
      memo.memoData?.workOrderSpecs.description.toLowerCase().includes(query) ||
      memo.memoData?.workOrderSpecs.category.toLowerCase().includes(query)
    );
  }

  return memos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

onMounted(() => {
  messageStore.initializeInbox();
});

const selectMemo = (memo: Message) => {
  selectedMemo.value = memo;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    converted: 'bg-green-100 text-green-700'
  };
  return colors[status] || colors.pending;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending Review',
    converted: 'Converted to WO'
  };
  return labels[status] || status;
};

const getUrgencyColor = (urgency: string) => {
  const colors: Record<string, string> = {
    routine: 'bg-gray-100 text-gray-600',
    urgent: 'bg-orange-100 text-orange-600',
    emergency: 'bg-red-100 text-red-600'
  };
  return colors[urgency] || colors.routine;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, typeof InboxIcon> = {
    all: InboxIcon,
    pending: ClockIcon,
    converted: CheckCircleIcon
  };
  return icons[status] || ClockIcon;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getTerminalName = (terminalId: string) => {
  const terminals: Record<string, string> = {
    'terminal_001': 'Terminal 1 - Jakarta',
    'terminal_002': 'Terminal 2 - Surabaya',
    'terminal_003': 'Terminal 3 - Medan',
    'terminal_004': 'Terminal 4 - Makassar'
  };
  return terminals[terminalId] || terminalId;
};

const getWorkerName = (workerId: string) => {
  const workers: Record<string, string> = {
    'worker_001': 'Ahmad Rahman',
    'worker_002': 'Budi Santoso',
    'worker_003': 'Sari Dewi',
    'worker_004': 'Eko Prabowo'
  };
  return workers[workerId] || workerId;
};

const handleMemoSuccess = () => {
  showCreateMemoModal.value = false;
  messageStore.initializeInbox();
};
</script>
