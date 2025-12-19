<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isReply ? 'Reply to Message' : 'Compose Message' }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Recipients (only show if not a reply) -->
          <div v-if="!isReply">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              To <span class="text-red-500">*</span>
            </label>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="recipient in selectedRecipients"
                  :key="recipient.id"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {{ recipient.name }}
                  <button
                    @click="removeRecipient(recipient.id)"
                    type="button"
                    class="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </span>
              </div>
              
              <div class="relative">
                <input
                  v-model="recipientSearch"
                  @input="searchRecipients"
                  @focus="showRecipientDropdown = true"
                  type="text"
                  placeholder="Type to search users..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <!-- Dropdown -->
                <div
                  v-if="showRecipientDropdown && filteredUsers.length > 0"
                  class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="user in filteredUsers"
                    :key="user.id"
                    @click="addRecipient(user)"
                    type="button"
                    class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center"
                  >
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                      <p class="text-xs text-gray-500">{{ user.email }} • {{ user.role.toUpperCase() }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="errors.recipients" class="text-sm text-red-600 mt-1">{{ errors.recipients }}</div>
          </div>

          <!-- Subject -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              v-model="form.subject"
              type="text"
              placeholder="Enter subject..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Priority -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              v-model="form.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <!-- Message Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="form.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="direct_message">Direct Message</option>
              <option value="work_order_comment">Work Order Comment</option>
              <option value="admin_broadcast" v-if="authStore.isAdmin">Admin Broadcast</option>
              <option value="supervisor_feedback" v-if="authStore.isSupervisor">Supervisor Feedback</option>
            </select>
          </div>

          <!-- Related Entity (conditional) -->
          <div v-if="form.type === 'work_order_comment'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Work Order</label>
            <select
              v-model="form.relatedWorkOrderId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select work order...</option>
              <option value="wo1">WO-001: Generator Maintenance</option>
              <option value="wo2">WO-002: Pump Inspection</option>
              <option value="wo3">WO-003: Safety Check</option>
            </select>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Message <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.content"
              rows="6"
              placeholder="Type your message here..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
            <div v-if="errors.content" class="text-sm text-red-600 mt-1">{{ errors.content }}</div>
          </div>

          <!-- Attachments -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
            <div class="border-2 border-dashed border-gray-300 rounded-md p-4">
              <input
                ref="fileInput"
                @change="handleFileSelect"
                type="file"
                multiple
                class="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
              
              <div v-if="form.attachments.length === 0" class="text-center">
                <button
                  @click="($refs.fileInput as HTMLInputElement).click()"
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PaperclipIcon class="h-4 w-4 mr-2" />
                  Add Files
                </button>
                <p class="text-xs text-gray-500 mt-1">
                  Supported: Images, PDF, Word, Excel, Text files
                </p>
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="(file, index) in form.attachments"
                  :key="index"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div class="flex items-center">
                    <PaperclipIcon class="h-4 w-4 text-gray-400 mr-2" />
                    <span class="text-sm text-gray-900">{{ file.name }}</span>
                    <span class="text-xs text-gray-500 ml-2">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button
                    @click="removeFile(index)"
                    type="button"
                    class="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  @click="($refs.fileInput as HTMLInputElement).click()"
                  type="button"
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add more files
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              @click="$emit('close')"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
              <span v-else>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { User, Message, Priority, MessageType } from '@/types';
import { X as XMarkIcon, Paperclip as PaperclipIcon } from 'lucide-vue-next';

interface Props {
  replyTo?: Message | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  send: [messageData: any];
}>();

const authStore = useAuthStore();

const form = ref({
  subject: '',
  content: '',
  priority: 'normal' as Priority,
  type: 'direct_message' as MessageType,
  relatedWorkOrderId: '',
  attachments: [] as File[]
});

const selectedRecipients = ref<User[]>([]);
const recipientSearch = ref('');
const showRecipientDropdown = ref(false);
const isLoading = ref(false);
const errors = ref<Record<string, string>>({});

// Mock users for recipient selection
const allUsers = ref<User[]>([
  {
    id: 'admin1',
    name: 'Ahmad Sutrisno',
    email: 'admin@terminal1.com',
    role: 'admin',
    terminalId: 'terminal1',
    regionId: 'region1',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'supervisor1',
    name: 'Budi Santoso',
    email: 'supervisor@pertamc.com',
    role: 'supervisor',
    regionId: 'region1',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'worker1',
    name: 'Candra Wijaya',
    email: 'worker@terminal1.com',
    role: 'worker',
    terminalId: 'terminal1',
    regionId: 'region1',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'leader1',
    name: 'Diana Sari',
    email: 'leader@pertamc.com',
    role: 'leader',
    regionId: 'region1',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]);

const isReply = computed(() => !!props.replyTo);

const filteredUsers = computed(() => {
  if (!recipientSearch.value) return [];
  
  const search = recipientSearch.value.toLowerCase();
  return allUsers.value
    .filter(user => 
      user.id !== authStore.currentUser?.id && // Don't include current user
      !selectedRecipients.value.some(r => r.id === user.id) && // Don't include already selected
      (user.name.toLowerCase().includes(search) || 
       user.email.toLowerCase().includes(search) ||
       user.role.toLowerCase().includes(search))
    )
    .slice(0, 5); // Limit results
});

onMounted(() => {
  if (props.replyTo) {
    setupReply();
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside);
});

const setupReply = () => {
  if (!props.replyTo) return;
  
  const sender = allUsers.value.find(u => u.id === props.replyTo?.senderId);
  if (sender) {
    selectedRecipients.value = [sender];
  }
  
  form.value.subject = props.replyTo.subject?.startsWith('Re: ') 
    ? props.replyTo.subject 
    : `Re: ${props.replyTo.subject || 'No Subject'}`;
  
  form.value.type = props.replyTo.type;
  form.value.priority = props.replyTo.priority;
  
  if (props.replyTo.relatedEntity?.type === 'work_order') {
    form.value.relatedWorkOrderId = props.replyTo.relatedEntity.id;
  }
};

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    showRecipientDropdown.value = false;
  }
};

const searchRecipients = () => {
  showRecipientDropdown.value = true;
};

const addRecipient = (user: User) => {
  if (!selectedRecipients.value.some(r => r.id === user.id)) {
    selectedRecipients.value.push(user);
  }
  recipientSearch.value = '';
  showRecipientDropdown.value = false;
  errors.value.recipients = '';
};

const removeRecipient = (userId: string) => {
  selectedRecipients.value = selectedRecipients.value.filter(r => r.id !== userId);
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  
  // Validate file size (5MB max per file)
  const maxSize = 5 * 1024 * 1024;
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
      return false;
    }
    return true;
  });
  
  form.value.attachments.push(...validFiles);
  target.value = ''; // Reset input
};

const removeFile = (index: number) => {
  form.value.attachments.splice(index, 1);
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const validateForm = () => {
  errors.value = {};
  
  if (!isReply.value && selectedRecipients.value.length === 0) {
    errors.value.recipients = 'Please select at least one recipient';
  }
  
  if (!form.value.content.trim()) {
    errors.value.content = 'Message content is required';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  isLoading.value = true;
  
  try {
    const messageData = {
      subject: form.value.subject,
      content: form.value.content,
      type: form.value.type,
      priority: form.value.priority,
      recipientIds: selectedRecipients.value.map(r => r.id),
      attachments: form.value.attachments,
      threadId: props.replyTo?.threadId,
      parentId: props.replyTo?.id,
      relatedEntity: form.value.relatedWorkOrderId 
        ? { type: 'work_order', id: form.value.relatedWorkOrderId }
        : props.replyTo?.relatedEntity
    };
    
    emit('send', messageData);
  } finally {
    isLoading.value = false;
  }
};
</script>