<template>
  <div class="h-[90vh] max-h-[90vh] flex bg-gray-50 mx-auto my-4 rounded-lg shadow-lg overflow-hidden">
    <!-- Sidebar -->
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <!-- Header -->
      <div class="p-3 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h1 class="text-base font-semibold text-gray-900">Inbox</h1>
            <p class="text-xs text-gray-500">System notifications</p>
          </div>
          <!-- Compose only for supervisors with WO context -->
          <button
            v-if="authStore.isSupervisor"
            @click="showComposeModal = true"
            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon class="h-3 w-3 mr-1" />
            New
          </button>
        </div>

        <!-- Search -->
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search messages..."
            class="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Folders -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="p-1">
          <button
            v-for="folder in folders"
            :key="folder.id"
            @click="selectedFolder = folder.id"
            class="w-full flex items-center px-3 py-2 text-sm font-medium rounded hover:bg-gray-100 transition-colors mb-1"
            :class="{
              'bg-blue-100 text-blue-700': selectedFolder === folder.id,
              'text-gray-700': selectedFolder !== folder.id
            }"
          >
            <component
              :is="getIconComponent(folder.icon || 'Folder')"
              class="h-4 w-4 mr-2 flex-shrink-0"
            />
            <span class="flex-1 text-left truncate">{{ folder.name }}</span>
            <span
              v-if="folder.messageCount > 0"
              class="ml-1 px-1.5 py-0.5 text-xs rounded-full flex-shrink-0"
              :class="{
                'bg-blue-100 text-blue-600': folder.unreadCount === 0,
                'bg-red-100 text-red-600 font-medium': folder.unreadCount > 0
              }"
            >
              {{ folder.unreadCount > 0 ? folder.unreadCount : folder.messageCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full">
      <!-- Message Pagination - Top of main content area -->
      <MessagePagination
        v-if="filteredMessages.length > 0"
        :current-page="messageStore.pagination.currentPage"
        :total-pages="messageStore.pagination.totalPages"
        :total-messages="messageStore.pagination.totalMessages"
        :page-size="messageStore.pagination.pageSize"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
      
      <!-- Message List -->
      <div class="flex-1 flex h-full min-h-0">
        <!-- Thread/Message List -->
        <div class="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
          <div class="p-3 border-b border-gray-200 flex-shrink-0">
            <h2 class="text-sm font-medium text-gray-900">
              {{ getCurrentFolderName() }}
              <span v-if="filteredMessages.length > 0" class="text-gray-500">
                ({{ filteredMessages.length }})
              </span>
            </h2>
          </div>

          <div class="flex-1 overflow-y-auto min-h-0">
            <div v-if="isLoading" class="p-3 text-center text-gray-500">
              Loading messages...
            </div>
            
            <div v-else-if="filteredMessages.length === 0" class="p-3 text-center text-gray-500">
              <InboxIcon class="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No messages found</p>
            </div>

            <div v-else class="divide-y divide-gray-200">
              <div
                v-for="message in paginatedMessages"
                :key="message.id"
                @click="selectMessage(message)"
                class="p-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors"
                :class="{
                  'border-l-blue-500 bg-blue-50': selectedMessage?.id === message.id,
                  'border-l-transparent': selectedMessage?.id !== message.id,
                  'bg-white': !isMessageRead(message),
                  'bg-gray-50': isMessageRead(message)
                }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <p
                        class="text-sm font-medium text-gray-900 truncate"
                        :class="{ 'font-semibold': !isMessageRead(message) }"
                      >
                        {{ getSenderName(message) }}
                      </p>
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="getPriorityColor(message.priority)"
                      >
                        {{ message.priority }}
                      </span>
                    </div>
                    
                    <p
                      v-if="message.subject"
                      class="text-sm text-gray-900 truncate mt-1"
                      :class="{ 'font-medium': !isMessageRead(message) }"
                    >
                      {{ message.subject }}
                    </p>
                    
                    <p class="text-sm text-gray-600 truncate mt-1">
                      {{ message.content }}
                    </p>
                    
                    <div class="flex items-center mt-2 space-x-2">
                      <span class="text-xs text-gray-500">
                        {{ formatTime(message.createdAt) }}
                      </span>
                      
                      <span
                        v-if="message.attachments.length > 0"
                        class="inline-flex items-center text-xs text-gray-500"
                      >
                        <PaperclipIcon class="h-3 w-3 mr-1" />
                        {{ message.attachments.length }}
                      </span>
                      
                      <span
                        v-if="message.relatedEntity"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                      >
                        {{ message.relatedEntity.type.replace('_', ' ') }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="ml-2 flex-shrink-0">
                    <div
                      v-if="!isMessageRead(message)"
                      class="h-2 w-2 rounded-full bg-blue-600"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Detail -->
        <div class="flex-1 flex flex-col h-full">
          <div v-if="!selectedMessage" class="flex-1 flex items-center justify-center bg-gray-50 h-full">
            <div class="text-center">
              <MailIcon class="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">No message selected</h3>
              <p class="text-gray-500">Choose a message from the list to view its content.</p>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col bg-white h-full min-h-0">
            <!-- Message Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h2 class="text-lg font-medium text-gray-900">
                    {{ selectedMessage.subject || 'No Subject' }}
                  </h2>
                  
                  <div class="mt-2 flex items-center text-sm text-gray-600">
                    <span class="font-medium">From:</span>
                    <span class="ml-1">{{ getSenderName(selectedMessage) }}</span>
                    <span class="mx-2">•</span>
                    <span>{{ formatDateTime(selectedMessage.createdAt) }}</span>
                  </div>
                  
                  <div v-if="selectedMessage.recipientIds.length > 1" class="mt-1 flex items-center text-sm text-gray-600">
                    <span class="font-medium">To:</span>
                    <span class="ml-1">{{ getRecipientNames(selectedMessage) }}</span>
                  </div>
                </div>

                <div class="ml-4 flex items-center space-x-2">
                  <!-- Gaming-style: Read-only notifications, no replies -->
                  <div class="inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm font-medium rounded text-gray-500 bg-gray-50">
                    <MailIcon class="h-4 w-4 mr-1" />
                    Read Only
                  </div>
                  
                  <button
                    @click="deleteMessage(selectedMessage.id)"
                    class="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50"
                  >
                    <TrashIcon class="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <!-- Message Content -->
            <div class="flex-1 px-6 py-4 overflow-y-auto min-h-0">
              <div class="prose prose-sm max-w-none">
                <div class="whitespace-pre-wrap">{{ selectedMessage.content }}</div>
              </div>

              <!-- Attachments -->
              <div v-if="selectedMessage.attachments.length > 0" class="mt-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
                <div class="space-y-2">
                  <div
                    v-for="attachment in selectedMessage.attachments"
                    :key="attachment.id"
                    class="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <PaperclipIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ attachment.originalName }}</p>
                      <p class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</p>
                    </div>
                    <button class="text-sm text-blue-600 hover:text-blue-800">Download</button>
                  </div>
                </div>
              </div>

              <!-- Related Entity -->
              <div v-if="selectedMessage.relatedEntity" class="mt-6">
                <div class="p-4 bg-gray-50 rounded-md">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Related to</h4>
                  <router-link
                    :to="getRelatedEntityLink(selectedMessage.relatedEntity)"
                    class="text-sm text-blue-600 hover:text-blue-800 capitalize"
                  >
                    {{ selectedMessage.relatedEntity.type.replace('_', ' ') }} #{{ selectedMessage.relatedEntity.id }}
                  </router-link>
                </div>
              </div>
              
              <!-- Enhanced v2.0: Action Buttons -->
              <MessageActionButtons
                v-if="selectedMessage.actionButtons && selectedMessage.actionButtons.length > 0"
                :action-buttons="selectedMessage.actionButtons"
                :message-id="selectedMessage.id"
                @action-executed="handleActionExecuted"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Compose Modal -->
    <ComposeMessageModal
      v-if="showComposeModal"
      @close="showComposeModal = false"
      @send="handleSendMessage"
      :reply-to="replyToMessageData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useMessageStore } from '@/stores/message';
import { useAuthStore } from '@/stores/auth';
import type { Message } from '@/types';
import {
  Plus as PlusIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  Mail as MailIcon,
  Trash2 as TrashIcon,
  Paperclip as PaperclipIcon
} from 'lucide-vue-next';
import ComposeMessageModal from '@/components/inbox/ComposeMessageModal.vue';
import MessagePagination from '@/components/inbox/MessagePagination.vue';
import MessageActionButtons from '@/components/inbox/MessageActionButtons.vue';

const messageStore = useMessageStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const selectedFolder = ref('inbox');
const selectedMessage = ref<Message | null>(null);
const showComposeModal = ref(false);
const replyToMessageData = ref<Message | null>(null);

const folders = computed(() => messageStore.folders);
const isLoading = computed(() => messageStore.isLoading);

const filteredMessages = computed(() => {
  let messages = messageStore.getMessagesByFolder(selectedFolder.value);
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    messages = messages.filter(message =>
      message.content.toLowerCase().includes(query) ||
      message.subject?.toLowerCase().includes(query) ||
      getSenderName(message).toLowerCase().includes(query)
    );
  }
  
  // Enhanced v2.0: Update pagination when filtered messages change
  messageStore.updatePagination(messages);
  
  return messages;
});

// Enhanced v2.0: Paginated messages for display
const paginatedMessages = computed(() => {
  const allMessages = filteredMessages.value;
  return messageStore.paginateMessages(
    allMessages, 
    messageStore.pagination.currentPage, 
    messageStore.pagination.pageSize
  );
});

onMounted(() => {
  messageStore.initializeInbox();
});

watch(selectedFolder, () => {
  selectedMessage.value = null;
});

const getCurrentFolderName = () => {
  const folder = folders.value.find(f => f.id === selectedFolder.value);
  return folder?.name || 'Messages';
};

const selectMessage = (message: Message) => {
  selectedMessage.value = message;
  
  // Mark as read if not already
  if (!isMessageRead(message)) {
    messageStore.markAsRead([message.id]);
  }
};

const isMessageRead = (message: Message) => {
  return message.readBy.some(read => read.userId === authStore.currentUser?.id);
};

const getSenderName = (message: Message) => {
  if (message.senderId === 'system') {
    return 'System';
  }
  // In a real app, you'd fetch user details
  return 'User ' + message.senderId;
};

const getRecipientNames = (message: Message) => {
  return message.recipientIds.map(id => 'User ' + id).join(', ');
};

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600'
  };
  return colors[priority as keyof typeof colors] || colors.normal;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    Inbox: InboxIcon,
    Send: MailIcon,
    Wrench: InboxIcon,
    Bell: InboxIcon,
    Package: InboxIcon,
    Folder: InboxIcon
  };
  return icons[iconName] || InboxIcon;
};

const getRelatedEntityLink = (entity: { type: string; id: string }) => {
  const routes = {
    work_order: `/work-orders/${entity.id}`,
    inventory: `/inventory/${entity.id}`,
    invoice: `/invoices/${entity.id}`,
    user: `/users/${entity.id}`
  };
  return routes[entity.type as keyof typeof routes] || '#';
};

const deleteMessage = async (messageId: string) => {
  if (confirm('Are you sure you want to delete this message?')) {
    await messageStore.deleteMessage(messageId);
    if (selectedMessage.value?.id === messageId) {
      selectedMessage.value = null;
    }
  }
};

const handleSendMessage = async (messageData: any) => {
  await messageStore.sendMessage(messageData);
  showComposeModal.value = false;
  replyToMessageData.value = null;
};

// Gaming-style: No reply functionality
// const replyToMessage = () => {
//   if (selectedMessage.value) {
//     replyToMessageData.value = selectedMessage.value;
//     showComposeModal.value = true;
//   }
// };

// Enhanced v2.0: Pagination event handlers
const handlePageChange = (page: number) => {
  messageStore.setPaginationPage(page);
  selectedMessage.value = null; // Clear selection when changing pages
};

const handlePageSizeChange = (pageSize: 25 | 50 | 100) => {
  messageStore.setPaginationPageSize(pageSize);
  selectedMessage.value = null; // Clear selection when changing page size
};

// Enhanced v2.0: Action button handler
const handleActionExecuted = (actionId: string, result: { success: boolean; error?: any }) => {
  if (result.success) {
    // Gaming-style success feedback
    console.log(`🎮 Action "${actionId}" completed successfully!`);
    
    // Mark message as read when action is taken
    if (selectedMessage.value) {
      messageStore.markAsRead([selectedMessage.value.id]);
    }
  } else {
    // Gaming-style error feedback  
    console.error(`❌ Action "${actionId}" failed:`, result.error);
  }
};
</script>