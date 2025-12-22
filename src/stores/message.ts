import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Message, MessageThread, InboxFolder, MessageType, MessageCategory, MessageAction, Priority, MessagePagination } from '@/types';
import { useAuthStore } from './auth';

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>([]);
  const threads = ref<MessageThread[]>([]);
  const folders = ref<InboxFolder[]>([]);
  const currentThreadId = ref<string | null>(null);
  const isLoading = ref(false);
  
  // Enhanced v2.0: Pagination state
  const pagination = ref<MessagePagination>({
    currentPage: 1,
    pageSize: 25,
    totalPages: 1,
    totalMessages: 0
  });

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
    
    // Gaming-style: Generate WO lifecycle notification messages
    const mockMessages: Message[] = [
      // Gaming Message 1: Template WO Created (for Admin)
      {
        id: 'gaming_msg_1',
        subject: '🎯 New Quest Template Available: Pipeline Maintenance',
        content: 'Template "Monthly Pipeline Inspection" has been created and is ready for deployment. Click to assign workers and begin the mission.\n\n🔧 Estimated Duration: 2-3 hours\n💰 Estimated Cost: Rp 2,500,000\n📍 Location: Terminal 1',
        type: 'wo_template_created',
        priority: 'normal',
        senderId: 'supervisor1',
        recipientIds: [currentUserId],
        threadId: 'gaming_thread_1',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo_template_1'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      },
      // Gaming Message 2: Mission Assigned
      {
        id: 'gaming_msg_2',
        subject: '⚡ Mission Briefing: Generator Check Assigned',
        content: 'Worker [Candra Wijaya] has been assigned to Generator Maintenance mission. Estimated completion: 2 hours. Good luck, operative!\n\n🎮 Mission Code: GEN-MAINT-001\n👤 Operative: Candra Wijaya\n⭐ Difficulty: Medium\n📅 Due Date: December 22, 2024',
        type: 'wo_assignment',
        priority: 'high',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'gaming_thread_2',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo_001'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      // Gaming Message 3: Mission Started
      {
        id: 'gaming_msg_3',
        subject: '🚀 Mission In Progress: Pump Inspection Started',
        content: 'Operative [Budi Santoso] has started the Pump System Inspection mission. Mission timer is now active.\n\n⏱️ Started: Just now\n📊 Progress: 0% → 25%\n🎯 Next Checkpoint: Pre-maintenance inspection complete',
        type: 'wo_started',
        priority: 'normal',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'gaming_thread_3',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo_002'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
      },
      // Gaming Message 4: Achievement Unlocked (WO Completed)
      {
        id: 'gaming_msg_4',
        subject: '✅ Achievement Unlocked: Safety Check Completed',
        content: 'Outstanding! [Diana Sari] has successfully completed the Safety System Check mission. Awaiting final review and approval.\n\n🏆 Achievement: Safety Champion\n⏱️ Completion Time: 1h 45m (Under estimate!)\n💎 Quality Score: 95/100\n🎖️ Bonus Points: +500 XP',
        type: 'wo_completed',
        priority: 'normal',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'gaming_thread_4',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo_003'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      },
      // Gaming Message 5: Admin Memo (WO Processing)
      {
        id: 'gaming_msg_5',
        subject: '📋 Admin Memo: Work Order Processing Required',
        content: 'The following completed mission requires your attention for final processing and invoice generation:\n\n🎯 Mission: Pipeline Leak Detection\n👤 Operative: Ahmad Sutrisno\n✅ Status: Approved by Supervisor\n💰 Cost Summary: Rp 1,850,000\n\nPlease process the completion paperwork and generate the invoice.',
        type: 'admin_memo',
        priority: 'normal',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'gaming_thread_5',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo_004'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
      },
      // Enhanced v2.0: Admin Memo with Create Work Order Action Button
      {
        id: 'gaming_msg_preventive_memo',
        subject: '📋 Admin Memo: Preventive Maintenance Schedule Required',
        content: 'Template "Monthly Generator Inspection" is due for deployment this month. Create work orders for scheduled preventive maintenance.\n\n🎯 Template: Monthly Generator Inspection\n🔧 Category: Power Systems\n⭐ Difficulty: Medium\n⏱️ Duration: 2-3 hours\n💰 Estimated Cost: Rp 1,850,000\n📍 Locations: Terminal 1, Terminal 2, Terminal 3\n\nAction required: Deploy template to create work orders for assigned operatives.',
        type: 'admin_memo',
        priority: 'high',
        senderId: 'supervisor1',
        recipientIds: [currentUserId],
        threadId: 'gaming_preventive_thread',
        attachments: [],
        actionButtons: [
          {
            id: 'create_wo_from_template',
            label: 'Create Work Order',
            type: 'primary',
            actionType: 'route',
            target: '/work-orders/create-from-template/generator_inspection_template'
          },
          {
            id: 'view_template_details',
            label: 'View Template',
            type: 'secondary',
            actionType: 'route',
            target: '/templates/generator_inspection_template'
          },
          {
            id: 'schedule_later',
            label: 'Schedule Later',
            type: 'secondary',
            actionType: 'modal',
            target: 'schedule-modal'
          }
        ],
        relatedEntity: {
          type: 'template',
          id: 'generator_inspection_template'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString()
      },
      // Gaming Message 6: Mission Failed (WO Rejected)
      {
        id: 'gaming_msg_6',
        subject: '❌ Mission Review: Additional Work Required',
        content: 'Mission "Compressor Lubrication" requires additional work. The supervisor has requested modifications before approval.\n\n📝 Feedback: Oil levels need re-checking\n🔄 Action Required: Re-submit after corrections\n⏰ New Deadline: Extended 24 hours\n💡 Tip: Double-check all measurements',
        type: 'wo_revision_required',
        priority: 'high',
        senderId: 'supervisor1',
        recipientIds: [currentUserId],
        threadId: 'gaming_thread_6',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo_005'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
      },
      // Gaming Message 7: Critical Alert (Overdue)
      {
        id: 'gaming_msg_7',
        subject: '🚨 CRITICAL ALERT: Mission Overdue!',
        content: 'URGENT: The "Gas Leak Detection" mission is now overdue and requires immediate attention!\n\n⚠️ Status: OVERDUE by 8 hours\n🎯 Mission: Gas Detection System Check\n👤 Operative: [Unassigned]\n💀 Penalty Active: Rp 375,000/day\n\n🚨 IMMEDIATE ACTION REQUIRED! 🚨',
        type: 'wo_overdue',
        priority: 'urgent',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'gaming_thread_7',
        attachments: [],
        relatedEntity: {
          type: 'work_order',
          id: 'wo_006'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
      },
      // Gaming Message 8: Inventory Alert (Gaming Style)
      {
        id: 'gaming_msg_8',
        subject: '📦 Resource Alert: Low Inventory Detected',
        content: 'Warning: Critical resource running low! Your mission supplies need restocking.\n\n🔧 Item: Oil Filter (OF-001)\n📊 Current Stock: 3 units\n⚠️ Minimum Required: 5 units\n🎮 Action: Restock mission available\n\nDont let your operatives run out of essential supplies!',
        type: 'inventory_alert',
        priority: 'high',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'gaming_thread_8',
        attachments: [],
        relatedEntity: {
          type: 'inventory',
          id: 'inv_001'
        },
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Gaming-style: Add role-specific gaming notifications
    if (authStore.isAdmin) {
      mockMessages.push({
        id: 'gaming_admin_1',
        subject: '⚙️ Command Center: Weekly Mission Summary',
        content: 'Weekly administrative briefing is ready for review. Operations report shows excellent progress this week!\n\n📊 Missions Completed: 23/25\n⚡ Success Rate: 92%\n👥 Active Operatives: 15\n💰 Week Revenue: Rp 45,750,000\n\nKeep up the excellent work, Commander!',
        type: 'admin_summary',
        priority: 'normal',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'gaming_admin_thread',
        attachments: [],
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      });
    }

    if (authStore.isSupervisor) {
      mockMessages.push({
        id: 'gaming_supervisor_1',
        subject: '📋 Squad Leader Briefing: Pending Approvals',
        content: 'Your squad operatives are awaiting mission approvals. Review the completed work and unlock their achievements!\n\n⏳ Pending Reviews: 3 missions\n🏆 Ready for Approval: Safety Check, Pump Maintenance\n🎯 Awaiting Assignment: Generator Inspection\n\nYour team is counting on your leadership!',
        type: 'supervisor_reminder',
        priority: 'normal',
        senderId: 'system',
        recipientIds: [currentUserId],
        threadId: 'gaming_supervisor_thread',
        attachments: [],
        status: 'delivered',
        readBy: [],
        createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
      });
    }

    // Enhanced v2.0: Generate additional mock messages for pagination testing
    const additionalMessages = generateAdditionalMockMessages(now, currentUserId);
    messages.value = [...mockMessages, ...additionalMessages];
    generateThreadsFromMessages();
    
    // Initialize pagination
    updatePagination(messages.value);
  };

  // Enhanced v2.0: Generate additional gaming-style messages for pagination
  const generateAdditionalMockMessages = (now: Date, currentUserId: string): Message[] => {
    const templates = [
      { name: 'Generator Inspection', category: 'Power Systems', difficulty: 'Medium', duration: '2-3 hours', cost: 'Rp 1,850,000' },
      { name: 'Compressor Maintenance', category: 'Gas Systems', difficulty: 'High', duration: '4-5 hours', cost: 'Rp 3,200,000' },
      { name: 'Pipeline Leak Detection', category: 'Pipeline Systems', difficulty: 'Low', duration: '1-2 hours', cost: 'Rp 950,000' },
      { name: 'Safety Valve Testing', category: 'Safety Systems', difficulty: 'Medium', duration: '2-3 hours', cost: 'Rp 1,500,000' },
      { name: 'Pressure Relief Check', category: 'Safety Systems', difficulty: 'High', duration: '3-4 hours', cost: 'Rp 2,750,000' }
    ];
    
    const workers = ['Ahmad Sutrisno', 'Budi Santoso', 'Candra Wijaya', 'Diana Sari', 'Eko Prasetyo'];
    const terminals = ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4', 'Terminal 5'];
    
    const additionalMessages: Message[] = [];
    
    // Generate 45 additional messages for pagination testing (total ~53 messages)
    for (let i = 1; i <= 45; i++) {
      const template = templates[i % templates.length];
      const worker = workers[i % workers.length];
      const terminal = terminals[i % terminals.length];
      const hoursAgo = Math.floor(Math.random() * 72) + 1; // 1-72 hours ago
      
      // Vary message types for diversity
      const messageTypes = [
        'wo_assignment',
        'wo_started', 
        'wo_completed',
        'admin_memo',
        'wo_template_created',
        'inventory_alert'
      ];
      
      const messageType = messageTypes[i % messageTypes.length] as MessageType;
      let subject = '';
      let content = '';
      
      switch (messageType) {
        case 'wo_assignment':
          subject = `⚡ Mission Assigned: ${template!.name} #${i.toString().padStart(3, '0')}`;
          content = `Worker [${worker}] has been assigned to ${template!.name} mission at ${terminal}.\n\n🎮 Mission Code: ${template!.category.toUpperCase()}-${i.toString().padStart(3, '0')}\n👤 Operative: ${worker}\n⭐ Difficulty: ${template!.difficulty}\n📍 Location: ${terminal}`;
          break;
        case 'wo_started':
          subject = `🚀 Mission Active: ${template!.name} Started`;
          content = `Operative [${worker}] has begun the ${template!.name} mission at ${terminal}.\n\n⏱️ Started: ${hoursAgo}h ago\n📊 Progress: 25% → In Progress\n🎯 Estimated Duration: ${template!.duration}`;
          break;
        case 'wo_completed':
          subject = `✅ Mission Complete: ${template!.name} Finished`;
          content = `Excellent work! [${worker}] has completed the ${template!.name} mission.\n\n🏆 Achievement: ${template!.category} Champion\n⏱️ Duration: ${template!.duration}\n💎 Quality Score: ${85 + Math.floor(Math.random() * 15)}/100\n🎖️ XP Earned: +${Math.floor(Math.random() * 500) + 300}`;
          break;
        case 'admin_memo':
          subject = `📋 Admin Memo: ${template!.name} Processing Required`;
          content = `Mission "${template!.name}" requires administrative processing and invoice generation.\n\n🎯 Mission: ${template!.name}\n👤 Operative: ${worker}\n📍 Location: ${terminal}\n💰 Cost: ${template!.cost}\n\nAction required for completion paperwork.`;
          break;
        case 'wo_template_created':
          subject = `🎯 New Quest Template: ${template!.name} Available`;
          content = `Template "${template!.name}" has been created and is ready for deployment.\n\n🔧 Category: ${template!.category}\n⭐ Difficulty: ${template!.difficulty}\n⏱️ Duration: ${template!.duration}\n💰 Estimated Cost: ${template!.cost}`;
          break;
        case 'inventory_alert':
          subject = `📦 Resource Alert: ${template!.category} Supplies Low`;
          content = `Warning: Mission supplies running low for ${template!.category} operations!\n\n🔧 Category: ${template!.category}\n📊 Current Stock: ${Math.floor(Math.random() * 5) + 1} units\n⚠️ Minimum Required: 5 units\n🎮 Restock mission recommended`;
          break;
      }
      
      // Enhanced v2.0: Add action buttons for admin memos and template creation
      const actionButtons = messageType === 'admin_memo' ? [
        {
          id: 'create_wo_from_template',
          label: 'Create Work Order',
          type: 'primary' as const,
          actionType: 'route' as const,
          target: `/work-orders/create-from-template/${template!.name.toLowerCase().replace(/\s+/g, '_')}`
        },
        {
          id: 'view_details',
          label: 'View Details',
          type: 'secondary' as const,
          actionType: 'route' as const,
          target: `/work-orders/${i.toString().padStart(3, '0')}`
        }
      ] : messageType === 'wo_template_created' ? [
        {
          id: 'deploy_template',
          label: 'Deploy Template',
          type: 'primary' as const,
          actionType: 'route' as const,
          target: `/work-orders/create-from-template/${template!.name.toLowerCase().replace(/\s+/g, '_')}`
        }
      ] : undefined;

      additionalMessages.push({
        id: `gaming_additional_${i}`,
        subject,
        content,
        type: messageType,
        priority: i % 4 === 0 ? 'urgent' : i % 3 === 0 ? 'high' : 'normal',
        senderId: messageType === 'wo_template_created' ? 'supervisor1' : 'system',
        recipientIds: [currentUserId],
        threadId: `gaming_additional_thread_${i}`,
        attachments: [],
        actionButtons,
        relatedEntity: {
          type: messageType === 'inventory_alert' ? 'inventory' : 
                messageType === 'wo_template_created' ? 'template' : 'work_order',
          id: messageType === 'wo_template_created' ? 
                template!.name.toLowerCase().replace(/\s+/g, '_') : 
                `wo_${i.toString().padStart(3, '0')}`
        },
        status: 'delivered',
        readBy: Math.random() > 0.7 ? [{ userId: currentUserId, readAt: new Date(now.getTime() - Math.random() * hoursAgo * 60 * 60 * 1000).toISOString() }] : [],
        createdAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString()
      });
    }
    
    return additionalMessages;
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

  // Enhanced v2.0: Pagination functions
  const paginateMessages = (messageList: Message[], page: number, pageSize: number) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return messageList.slice(startIndex, endIndex);
  };

  const updatePagination = (messageList: Message[]) => {
    pagination.value.totalMessages = messageList.length;
    pagination.value.totalPages = Math.ceil(messageList.length / pagination.value.pageSize);
    
    // Ensure current page is within bounds
    if (pagination.value.currentPage > pagination.value.totalPages) {
      pagination.value.currentPage = Math.max(1, pagination.value.totalPages);
    }
  };

  const setPaginationPage = (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      pagination.value.currentPage = page;
    }
  };

  const setPaginationPageSize = (pageSize: 25 | 50 | 100) => {
    pagination.value.pageSize = pageSize;
    pagination.value.currentPage = 1; // Reset to first page when changing page size
    
    // Recalculate pagination for current folder
    const userId = authStore.currentUser?.id;
    if (userId) {
      const currentFolderMessages = getMessagesByFolder(selectedFolder.value || 'inbox');
      updatePagination(currentFolderMessages);
    }
  };

  const selectedFolder = ref<string>('inbox');

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
            (m.type === 'work_order_comment' || 
             m.type === 'wo_assignment' || 
             m.type === 'wo_started' || 
             m.type === 'wo_completed' || 
             m.type === 'wo_revision_required' || 
             m.type === 'wo_overdue' || 
             m.type === 'wo_template_created' || 
             m.type === 'admin_memo') && 
            m.recipientIds.includes(userId)
          );
          break;
        case 'notifications':
          folderMessages = messages.value.filter(m => 
            m.type === 'system_notification' && m.recipientIds.includes(userId)
          );
          break;
        case 'inventory':
          folderMessages = messages.value.filter(m => 
            (m.relatedEntity?.type === 'inventory' || m.type === 'inventory_alert') && m.recipientIds.includes(userId)
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
          (m.type === 'work_order_comment' || 
           m.type === 'wo_assignment' || 
           m.type === 'wo_started' || 
           m.type === 'wo_completed' || 
           m.type === 'wo_revision_required' || 
           m.type === 'wo_overdue' || 
           m.type === 'wo_template_created' || 
           m.type === 'admin_memo') && 
          m.recipientIds.includes(userId)
        );
      case 'notifications':
        return messages.value.filter(m => 
          m.type === 'system_notification' && m.recipientIds.includes(userId)
        );
      case 'inventory':
        return messages.value.filter(m => 
          (m.relatedEntity?.type === 'inventory' || m.type === 'inventory_alert') && m.recipientIds.includes(userId)
        );
      default:
        return [];
    }
  };

  // System notification helpers (replacing notification store functionality)
  const sendSystemMessage = async (messageData: {
    subject: string;
    content: string;
    category: MessageCategory;
    priority?: Priority;
    recipientIds: string[];
    actionButtons?: MessageAction[];
    relatedEntity?: { type: 'work_order' | 'inventory' | 'invoice' | 'user'; id: string };
    metadata?: Record<string, any>;
    expiresAt?: string;
  }) => {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subject: messageData.subject,
      content: messageData.content,
      type: 'system_notification',
      category: messageData.category,
      priority: messageData.priority || 'normal',
      senderId: 'system',
      recipientIds: messageData.recipientIds,
      attachments: [],
      actionButtons: messageData.actionButtons,
      relatedEntity: messageData.relatedEntity,
      status: 'delivered',
      readBy: [],
      expiresAt: messageData.expiresAt,
      metadata: messageData.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    messages.value.unshift(message);
    generateThreadsFromMessages();
    updateFolderCounts();

    // Auto-expire if expiration date set
    if (message.expiresAt) {
      const expireTime = new Date(message.expiresAt).getTime() - Date.now();
      if (expireTime > 0) {
        setTimeout(() => {
          deleteMessage(message.id);
        }, expireTime);
      }
    }

    return message;
  };

  // Notification helpers for common scenarios
  const notifyWorkOrderAssigned = (workOrderId: string, workOrderTitle: string, workerId: string) => {
    if (authStore.currentUser?.id === workerId) {
      return sendSystemMessage({
        subject: `New Work Order Assigned: ${workOrderTitle}`,
        content: `${workOrderTitle} has been assigned to you. Please review the details and start when ready.`,
        category: 'work_order',
        priority: 'high',
        recipientIds: [workerId],
        actionButtons: [
          {
            id: 'view_assignment',
            label: 'View Details',
            type: 'primary',
            actionType: 'route',
            target: `/work-orders/${workOrderId}`
          },
          {
            id: 'start_work',
            label: 'Start Work',
            type: 'secondary',
            actionType: 'api',
            target: `/api/work-orders/${workOrderId}/start`,
            requireConfirmation: true,
            confirmationMessage: 'Are you ready to start this work order?'
          }
        ],
        relatedEntity: { type: 'work_order', id: workOrderId },
        metadata: { workOrderTitle, assignedBy: 'supervisor' }
      });
    }
    return null;
  };

  const notifyWorkOrderCompleted = (workOrderId: string, workOrderTitle: string, supervisorIds: string[]) => {
    return sendSystemMessage({
      subject: `Work Order Completed: ${workOrderTitle}`,
      content: `${workOrderTitle} has been completed and needs approval.`,
      category: 'work_order',
      priority: 'normal',
      recipientIds: supervisorIds,
      actionButtons: [
        {
          id: 'review_work',
          label: 'Review & Approve',
          type: 'primary',
          actionType: 'route',
          target: `/work-orders/${workOrderId}`
        }
      ],
      relatedEntity: { type: 'work_order', id: workOrderId },
      metadata: { workOrderTitle, status: 'submitted_for_review' }
    });
  };

  const notifyWorkOrderOverdue = (workOrderId: string, workOrderTitle: string, recipientIds: string[]) => {
    return sendSystemMessage({
      subject: `Work Order Overdue: ${workOrderTitle}`,
      content: `${workOrderTitle} is now overdue. Please complete as soon as possible.`,
      category: 'work_order',
      priority: 'urgent',
      recipientIds,
      actionButtons: [
        {
          id: 'view_urgent',
          label: 'View Urgent Task',
          type: 'danger',
          actionType: 'route',
          target: `/work-orders/${workOrderId}`
        }
      ],
      relatedEntity: { type: 'work_order', id: workOrderId },
      metadata: { workOrderTitle, overdue: true }
    });
  };

  const notifyLowInventory = (itemName: string, itemId: string, currentStock: number, minThreshold: number, adminIds: string[]) => {
    return sendSystemMessage({
      subject: `Low Stock Alert: ${itemName}`,
      content: `${itemName} stock is low (${currentStock}/${minThreshold}). Consider restocking.`,
      category: 'inventory',
      priority: 'high',
      recipientIds: adminIds,
      actionButtons: [
        {
          id: 'view_inventory',
          label: 'View Inventory',
          type: 'primary',
          actionType: 'route',
          target: `/inventory/${itemId}`
        },
        {
          id: 'create_purchase_request',
          label: 'Create Purchase Request',
          type: 'secondary',
          actionType: 'route',
          target: `/inventory/${itemId}/purchase`
        }
      ],
      relatedEntity: { type: 'inventory', id: itemId },
      metadata: { itemName, currentStock, minThreshold }
    });
  };

  const notifyInvoiceGenerated = (invoiceId: string, invoiceNumber: string, recipientIds: string[]) => {
    return sendSystemMessage({
      subject: `Invoice Generated: ${invoiceNumber}`,
      content: `Invoice ${invoiceNumber} has been successfully generated and is ready for review.`,
      category: 'invoice',
      priority: 'normal',
      recipientIds,
      actionButtons: [
        {
          id: 'view_invoice',
          label: 'View Invoice',
          type: 'primary',
          actionType: 'route',
          target: `/invoices/${invoiceId}`
        }
      ],
      relatedEntity: { type: 'invoice', id: invoiceId },
      metadata: { invoiceNumber }
    });
  };

  const showSuccessMessage = (message: string, userId?: string) => {
    const recipientIds = userId ? [userId] : [authStore.currentUser?.id || ''];
    return sendSystemMessage({
      subject: 'Success',
      content: message,
      category: 'system',
      priority: 'low',
      recipientIds,
      expiresAt: new Date(Date.now() + 30000).toISOString() // Auto-expire after 30 seconds
    });
  };

  const showErrorMessage = (message: string, userId?: string) => {
    const recipientIds = userId ? [userId] : [authStore.currentUser?.id || ''];
    return sendSystemMessage({
      subject: 'Error',
      content: message,
      category: 'system',
      priority: 'high',
      recipientIds,
      expiresAt: new Date(Date.now() + 60000).toISOString() // Auto-expire after 1 minute
    });
  };

  const executeMessageAction = async (messageId: string, actionId: string) => {
    const message = messages.value.find(m => m.id === messageId);
    if (!message?.actionButtons) return { success: false };

    const action = message.actionButtons.find(a => a.id === actionId);
    if (!action) return { success: false };

    try {
      if (action.requireConfirmation) {
        const confirmed = confirm(action.confirmationMessage || 'Are you sure you want to perform this action?');
        if (!confirmed) return { success: false };
      }

      // Mark message as read when action is taken
      markAsRead([messageId]);

      // Handle different action types
      switch (action.actionType) {
        case 'route':
          // Would use router in component - for now just log
          console.log('Navigate to:', action.target);
          break;
        case 'api':
          // Make API call
          await fetch(action.target, { method: 'POST' });
          break;
        case 'modal':
          // Open modal - would emit event or use modal store
          console.log('Open modal:', action.target);
          break;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to execute message action:', error);
      return { success: false, error };
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
    getMessagesByFolder,
    sendSystemMessage,
    notifyWorkOrderAssigned,
    notifyWorkOrderCompleted,
    notifyWorkOrderOverdue,
    notifyLowInventory,
    notifyInvoiceGenerated,
    showSuccessMessage,
    showErrorMessage,
    executeMessageAction,
    // Enhanced v2.0: Pagination
    pagination,
    paginateMessages,
    updatePagination,
    setPaginationPage,
    setPaginationPageSize
  };
});