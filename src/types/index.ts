// Core system types for CMMS

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  terminalId?: string;
  regionId?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  ssoProvider?: 'talenta' | 'idaman'; // SSO authentication provider
  lastLogin?: string; // ISO timestamp of last login
}

export type UserRole = 'admin' | 'supervisor' | 'leader' | 'worker';

export interface Terminal {
  id: string;
  name: string;
  code: string;
  location: string;
  regionId: string;
  status: 'active' | 'inactive';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Region {
  id: string;
  name: string;
  code: string;
  terminals: Terminal[];
  manager?: User;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective';
  subType?: 'planned' | 'incidental';
  status: WorkOrderStatus;
  priority: Priority;
  terminalId: string;
  assignedWorkerId?: string;
  createdBy: string;
  approvedBy?: string;
  startDate: string;
  dueDate: string;
  estimatedDuration: number; // in hours
  completedAt?: string;
  parentId?: string; // for hierarchy
  children?: WorkOrder[];
  checklist: ChecklistItem[];
  beforePhotos: Photo[];
  afterPhotos: Photo[];
  beforeNotes?: string;
  afterNotes?: string;
  materials: MaterialRequirement[];
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'assigned' 
  | 'in_progress' 
  | 'submitted_for_review' 
  | 'completed' 
  | 'rejected' 
  | 'revision_required';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  label: string;
  type: 'yes_no' | 'number' | 'text' | 'dropdown' | 'rating';
  required: boolean;
  beforeValue?: any;
  afterValue?: any;
  unit?: string;
  options?: string[]; // for dropdown
  minValue?: number;
  maxValue?: number;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  timestamp: string;
  workOrderId: string;
  type: 'before' | 'after';
}

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  unitOfMeasure: string;
  currentStock: number;
  minThreshold: number;
  unitPrice: number;
  storageLocation?: string;
  supplier?: string;
  lastUpdated: string;
  status: 'active' | 'inactive';
}

export interface MaterialRequirement {
  itemId: string;
  item?: InventoryItem;
  plannedQuantity: number;
  actualQuantity?: number;
  notes?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  reference?: string; // work order ID, purchase order ID, etc.
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: NotificationCategory;
  priority: Priority;
  userId: string;
  read: boolean;
  actionUrl?: string;
  actionButtons?: NotificationAction[];
  relatedEntity?: {
    type: 'work_order' | 'inventory' | 'user' | 'invoice';
    id: string;
  };
  metadata?: Record<string, any>;
  escalationLevel?: number;
  escalatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

export type NotificationCategory = 
  | 'work_order'
  | 'inventory' 
  | 'invoice'
  | 'communication'
  | 'system'
  | 'emergency';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  actionType: 'route' | 'api' | 'modal';
  target?: string; // URL for route, API endpoint, or modal identifier
  requireConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface NotificationSettings {
  userId: string;
  categories: Record<NotificationCategory, boolean>;
  priorities: Record<Priority, boolean>;
  deliveryChannels: {
    inApp: boolean;
    inbox: boolean;
    push?: boolean;
    email?: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    timezone: string;
  };
  escalationSettings: {
    enabled: boolean;
    delayMinutes: number; // Escalate after X minutes if unread
    maxLevel: number;
  };
  sounds: {
    enabled: boolean;
    highPriorityOnly: boolean;
  };
  updatedAt: string;
}

// Message and Communication types
export interface Message {
  id: string;
  subject?: string;
  content: string;
  type: MessageType;
  priority: Priority;
  senderId: string;
  sender?: User;
  recipientIds: string[];
  recipients?: User[];
  threadId?: string;
  parentId?: string; // for replies
  attachments: MessageAttachment[];
  relatedEntity?: {
    type: 'work_order' | 'inventory' | 'invoice' | 'user';
    id: string;
  };
  status: 'sent' | 'delivered' | 'read';
  readBy: MessageReadStatus[];
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 
  | 'direct_message'
  | 'work_order_comment' 
  | 'system_notification'
  | 'admin_broadcast'
  | 'supervisor_feedback'
  | 'automated_reminder';

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface MessageReadStatus {
  userId: string;
  readAt: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: User[];
  lastMessage?: Message;
  messageCount: number;
  unreadCount: number;
  type: MessageType;
  relatedEntity?: {
    type: 'work_order' | 'inventory' | 'invoice' | 'user';
    id: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InboxFolder {
  id: string;
  name: string;
  type: 'system' | 'custom';
  messageCount: number;
  unreadCount: number;
  icon?: string;
  color?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Invoice types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  workOrderIds: string[];
  terminalId?: string;
  regionId?: string;
  recipientType: 'terminal' | 'region' | 'external_client' | 'contractor';
  recipientDetails: {
    name: string;
    email: string;
    address?: string;
    company?: string;
  };
  items: InvoiceItem[];
  summary: {
    laborCost: number;
    materialCost: number;
    penalties: number;
    subtotal: number;
    total: number;
  };
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  generatedAt: string;
  sentAt?: string;
  dueDate: string;
  paidAt?: string;
  generatedBy: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  workOrderId: string;
  type: 'labor' | 'material' | 'penalty';
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

// Form types
export interface CreateWorkOrderForm {
  title: string;
  description: string;
  type: 'preventive' | 'corrective';
  subType?: 'planned' | 'incidental';
  priority: Priority;
  terminalId: string;
  assignedWorkerId?: string;
  startDate: string;
  dueDate: string;
  estimatedDuration: number;
  parentId?: string;
  materials: MaterialRequirement[];
}