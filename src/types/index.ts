// Core system types for CMMS

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  terminalId?: string;
  regionId?: string;
  status: UserStatus;
  avatar?: string;
  ssoProvider?: 'talenta' | 'idaman'; // SSO authentication provider
  lastLogin?: string; // ISO timestamp of last login
  employeeId?: string; // Employee ID from HRIS
  phoneNumber?: string;
  department?: string;
  hireDate?: string;
  mfaEnabled?: boolean;
  passwordLastChanged?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export type UserRole = 'admin' | 'supervisor' | 'leader' | 'worker';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

// User Management Types
export interface UserStatusHistory {
  id: string;
  userId: string;
  previousStatus: UserStatus;
  newStatus: UserStatus;
  reason: string;
  changedBy: string;
  changedAt: string;
  effectiveDate: string;
  notes?: string;
}

export interface UserRoleHistory {
  id: string;
  userId: string;
  previousRole: UserRole;
  newRole: UserRole;
  promotionReason: string;
  approvedBy: string;
  approvedAt: string;
  effectiveDate: string;
  trainingCompleted?: boolean;
  performanceScore?: number;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionCode: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
  notes?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
}

export interface UserAuditLog {
  id: string;
  userId?: string;
  actionType: UserAuditAction;
  actionDescription: string;
  performedBy: string;
  ipAddress?: string;
  timestamp: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  affectedUsers?: string[];
  reason?: string;
}

export type UserAuditAction = 
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'status_changed'
  | 'role_changed'
  | 'permission_granted'
  | 'permission_revoked'
  | 'password_changed'
  | 'password_reset'
  | 'login_success'
  | 'login_failed'
  | 'session_started'
  | 'session_ended'
  | 'bulk_operation'
  | 'data_export'
  | 'admin_action';

export interface CreateUserForm {
  name: string;
  email: string;
  employeeId?: string;
  phoneNumber?: string;
  role: UserRole;
  terminalId?: string;
  regionId?: string;
  department?: string;
  hireDate?: string;
  ssoProvider?: 'talenta' | 'idaman';
  status: UserStatus;
  mfaEnabled?: boolean;
  sendWelcomeEmail?: boolean;
  notes?: string;
}

export interface UpdateUserForm {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  employeeId?: string;
  phoneNumber?: string;
  terminalId?: string;
  regionId?: string;
  department?: string;
  ssoProvider?: string;
  hireDate?: string;
  mfaEnabled?: boolean;
  forcePasswordReset?: boolean;
  notes?: string;
}

export interface BulkUserOperation {
  operation: 'status_change' | 'role_change' | 'permission_update' | 'delete' | 'export';
  userIds: string[];
  parameters?: Record<string, any>;
  reason?: string;
  scheduledFor?: string;
}

export interface UserFilter {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  terminalId?: string;
  regionId?: string;
  department?: string;
  ssoProvider?: 'talenta' | 'idaman';
  mfaEnabled?: boolean;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface UserManagementStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<UserStatus, number>;
  usersByTerminal: Record<string, number>;
  mfaAdoptionRate: number;
  averageSessionDuration: number;
  recentLoginCount: number;
}

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
  fromTemplate?: boolean; // Indicates if this material came from a template
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


// Message and Communication types
export interface MessageAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  actionType: 'route' | 'api' | 'modal';
  target: string;
  requireConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface Message {
  id: string;
  subject?: string;
  content: string;
  type: MessageType;
  category?: MessageCategory;
  priority: Priority;
  senderId: string;
  sender?: User;
  recipientIds: string[];
  recipients?: User[];
  threadId?: string;
  parentId?: string; // for replies
  attachments: MessageAttachment[];
  actionButtons?: MessageAction[];
  relatedEntity?: {
    type: 'work_order' | 'inventory' | 'invoice' | 'user';
    id: string;
  };
  status: 'sent' | 'delivered' | 'read';
  readBy: MessageReadStatus[];
  expiresAt?: string;
  metadata?: Record<string, any>;
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

export type MessageCategory = 
  | 'system'
  | 'work_order'
  | 'inventory'
  | 'invoice'
  | 'user'
  | 'emergency';

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