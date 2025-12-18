import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Message, MessageThread, InboxFolder, MessageType, Priority } from '@/types';
import { useAuthStore } from './auth';

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>([]);
  const threads = ref<MessageThread[]>([]);
  const folders = ref<InboxFolder[]>([]);
  const currentThreadId = ref<string | null>(null);
  const isLoading = ref(false);

  const authStore = useAuthStore();

  // Computed properties
  const unreadCount = computed(() => {
    return messages.value.filter(message => 
      message.recipientIds.includes(authStore.currentUser?.id || '') &&
      !message.readBy.some(read => read.userId === authStore.currentUser?.id)
    ).length;
  });

  const inboxMessages = computed(() => {
    return messages.value.filter(message => 
      message.recipientIds.includes(authStore.currentUser?.id || '')
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const sentMessages = computed(() => {
    return messages.value.filter(message => 
      message.senderId === authStore.currentUser?.id
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const currentThread = computed(() => {
    if (!currentThreadId.value) return null;
    return threads.value.find(thread => thread.id === currentThreadId.value) || null;
  });

  const currentThreadMessages = computed(() => {
    if (!currentThreadId.value) return [];
    return messages.value
      .filter(message => message.threadId === currentThreadId.value)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  // Actions
  const initializeInbox = () => {
    // Initialize default folders
    folders.value = [
      {
        id: 'inbox',
        name: 'Inbox',
        type: 'system',
        messageCount: 0,
        unreadCount: 0,
        icon: 'Inbox'
      },
      {
        id: 'sent',
        name: 'Sent',
        type: 'system',
        messageCount: 0,
        unreadCount: 0,
        icon: 'Send'
      },
      {
        id: 'work_orders',
        name: 'Work Orders',
        type: 'system',
        messageCount: 0,
        unreadCount: 0,
        icon: 'Wrench'
      },
      {
        id: 'notifications',
        name: 'System Notifications',
        type: 'system',
        messageCount: 0,
        unreadCount: 0,
        icon: 'Bell'
      },
      {
        id: 'inventory',
        name: 'Inventory Alerts',
        type: 'system',
        messageCount: 0,
        unreadCount: 0,
        icon: 'Package'
      }
    ];

    // Load mock data
    loadMockMessages();
    updateFolderCounts();
  };

  const loadMockMessages = () => {
    if (!authStore.currentUser) return;

    const currentUserId = authStore.currentUser.id;
    const now = new Date();
    
    // Generate mock messages based on user role
    const mockMessages: Message[] = [
      {
        id: 'msg1',
        subject: 'Work Order Assignment: Generator Maintenance',
        content: 'You have been assigned to work order WO-001 for generator maintenance at Terminal 1. Please review the details and start the work by the scheduled date.',
        type: 'work_order_comment',
        priority: 'normal',
        senderId: 'supervisor1',
        recipientIds: [currentUserId],
        threadId: 'thread1',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo1'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg2',
        content: 'Work order WO-002 has been completed and is ready for your review.',
        type: 'system_notification',
        priority: 'normal',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'thread2',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo2'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'msg3',
        subject: 'Low Inventory Alert',
        content: 'Oil Filter (Item Code: OF-001) stock level has dropped below the minimum threshold. Current stock: 3 units. Minimum threshold: 5 units.',
        type: 'system_notification',
        priority: 'high',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'thread3',
        attachments: [],
        relatedEntity: {
          type: 'inventory',
          id: 'inv1'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Add role-specific messages
    if (authStore.isAdmin) {
      mockMessages.push({
        id: 'msg4',
        subject: 'System Maintenance Scheduled',
        content: 'System maintenance is scheduled for tomorrow at 2:00 AM. Expected downtime: 30 minutes.',
        type: 'admin_broadcast',
        priority: 'normal',
        senderId: currentUserId,
        recipientIds: ['worker1', 'supervisor1', 'leader1'],
        threadId: 'thread4',
        attachments: [],
        status: 'sent',
        readBy: [],
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      });
    }

    if (authStore.isSupervisor) {
      mockMessages.push({
        id: 'msg5',
        content: 'Please review and approve the pending work orders for this week.',
        type: 'automated_reminder',
        priority: 'normal',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'thread5',
        attachments: [],
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
      });
    }

    messages.value = mockMessages;
    generateThreadsFromMessages();
  };

  const generateThreadsFromMessages = () => {
    const threadMap = new Map<string, MessageThread>();

    messages.value.forEach(message => {
      const threadId = message.threadId || message.id;
      
      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          id: threadId,
          subject: message.subject || 'No Subject',
          participants: [],
          lastMessage: message,
          messageCount: 1,
          unreadCount: message.readBy.some(read => read.userId === authStore.currentUser?.id) ? 0 : 1,
          type: message.type,
          relatedEntity: message.relatedEntity,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        });
      } else {
        const thread = threadMap.get(threadId)!;
        thread.messageCount++;
        if (!message.readBy.some(read => read.userId === authStore.currentUser?.id)) {
          thread.unreadCount++;
        }
        if (new Date(message.createdAt) > new Date(thread.lastMessage?.createdAt || '')) {
          thread.lastMessage = message;
          thread.updatedAt = message.updatedAt;
        }
      }
    });

    threads.value = Array.from(threadMap.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  const sendMessage = async (messageData: {
    content: string;
    subject?: string;
    recipientIds: string[];
    type: MessageType;
    priority: Priority;
    threadId?: string;
    parentId?: string;
    relatedEntity?: { type: 'work_order' | 'inventory' | 'user' | 'invoice'; id: string };
    attachments?: File[];
  }) => {
    if (!authStore.currentUser) return;

    isLoading.value = true;

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        subject: messageData.subject,
        content: messageData.content,
        type: messageData.type,
        priority: messageData.priority,
        senderId: authStore.currentUser.id,
        recipientIds: messageData.recipientIds,
        threadId: messageData.threadId || `thread_${Date.now()}`,
        parentId: messageData.parentId,
        attachments: [], // Would handle file uploads here
        relatedEntity: messageData.relatedEntity,
        status: 'sent',
        readBy: [{ userId: authStore.currentUser.id, readAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      messages.value.push(newMessage);
      generateThreadsFromMessages();
      updateFolderCounts();

      return { success: true, message: newMessage };
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    } finally {
      isLoading.value = false;
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    if (!authStore.currentUser) return;

    const userId = authStore.currentUser.id;
    const now = new Date().toISOString();

    messageIds.forEach(messageId => {
      const message = messages.value.find(m => m.id === messageId);
      if (message && !message.readBy.some(read => read.userId === userId)) {
        message.readBy.push({ userId, readAt: now });
      }
    });

    generateThreadsFromMessages();
    updateFolderCounts();
  };

  const deleteMessage = async (messageId: string) => {
    isLoading.value = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = messages.value.findIndex(m => m.id === messageId);
      if (index > -1) {
        messages.value.splice(index, 1);
        generateThreadsFromMessages();
        updateFolderCounts();
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete message' };
    } finally {
      isLoading.value = false;
    }
  };

  const setCurrentThread = (threadId: string | null) => {
    currentThreadId.value = threadId;
    
    // Mark thread messages as read when opened
    if (threadId && authStore.currentUser) {
      const threadMessageIds = messages.value
        .filter(m => m.threadId === threadId && 
                m.recipientIds.includes(authStore.currentUser?.id || '') &&
                !m.readBy.some(read => read.userId === authStore.currentUser?.id))
        .map(m => m.id);
      
      if (threadMessageIds.length > 0) {
        markAsRead(threadMessageIds);
      }
    }
  };

  const updateFolderCounts = () => {
    const userId = authStore.currentUser?.id;
    if (!userId) return;

    folders.value.forEach(folder => {
      let folderMessages: Message[] = [];

      switch (folder.id) {
        case 'inbox':
          folderMessages = inboxMessages.value;
          break;
        case 'sent':
          folderMessages = sentMessages.value;
          break;
        case 'work_orders':
          folderMessages = messages.value.filter(m => 
            m.type === 'work_order_comment' && m.recipientIds.includes(userId)
          );
          break;
        case 'notifications':
          folderMessages = messages.value.filter(m => 
            m.type === 'system_notification' && m.recipientIds.includes(userId)
          );
          break;
        case 'inventory':
          folderMessages = messages.value.filter(m => 
            m.relatedEntity?.type === 'inventory' && m.recipientIds.includes(userId)
          );
          break;
      }

      folder.messageCount = folderMessages.length;
      folder.unreadCount = folderMessages.filter(m => 
        !m.readBy.some(read => read.userId === userId)
      ).length;
    });
  };

  const getMessagesByFolder = (folderId: string) => {
    const userId = authStore.currentUser?.id;
    if (!userId) return [];

    switch (folderId) {
      case 'inbox':
        return inboxMessages.value;
      case 'sent':
        return sentMessages.value;
      case 'work_orders':
        return messages.value.filter(m => 
          m.type === 'work_order_comment' && m.recipientIds.includes(userId)
        );
      case 'notifications':
        return messages.value.filter(m => 
          m.type === 'system_notification' && m.recipientIds.includes(userId)
        );
      case 'inventory':
        return messages.value.filter(m => 
          m.relatedEntity?.type === 'inventory' && m.recipientIds.includes(userId)
        );
      default:
        return [];
    }
  };

  return {
    messages,
    threads,
    folders,
    currentThreadId,
    currentThread,
    currentThreadMessages,
    isLoading,
    unreadCount,
    inboxMessages,
    sentMessages,
    initializeInbox,
    sendMessage,
    markAsRead,
    deleteMessage,
    setCurrentThread,
    getMessagesByFolder
  };
});