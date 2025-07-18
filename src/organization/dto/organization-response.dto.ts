import { OrganizationRole, OrganizationType, VerificationStatus, OrganizationVisibility } from './enhanced-organization.dto';

export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends BaseResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface OrganizationResponseDto {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  requiresVerification: boolean;
  visibility: OrganizationVisibility;
  settings?: any;
  enrollmentKey?: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  activeMembers: number;
  pendingMembers: number;
  isUserMember?: boolean;
  userRole?: OrganizationRole;
  userStatus?: VerificationStatus;
}

export interface InstituteOrganizationResponseDto extends OrganizationResponseDto {
  instituteId: number;
  institute: {
    id: number;
    name: string;
    logo?: string;
  };
  category?: string;
  tags?: string[];
}

export interface GlobalOrganizationResponseDto extends OrganizationResponseDto {
  category?: string;
  tags?: string[];
  allowedInstitutes?: number[];
  allowedInstituteNames?: string[];
}

export interface OrganizationUserResponseDto {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    isActive: boolean;
    lastLogin?: Date;
  };
  role: OrganizationRole;
  verificationStatus: VerificationStatus;
  joinedAt: Date;
  lastActive?: Date;
  notes?: string;
  permissions?: string[];
}

export interface OrganizationStatsResponseDto {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  membersByRole: {
    [key in OrganizationRole]: number;
  };
  membersByStatus: {
    [key in VerificationStatus]: number;
  };
  recentActivity: {
    newMembers: number;
    approvedMembers: number;
    rejectedMembers: number;
    leftMembers: number;
  };
  growthStats: {
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  engagementStats: {
    activeToday: number;
    activeThisWeek: number;
    activeThisMonth: number;
    averageSessionTime: number;
  };
}

export interface OrganizationActivityResponseDto {
  id: number;
  action: string;
  actor: {
    id: number;
    name: string;
    avatar?: string;
  };
  target?: {
    id: number;
    name: string;
    type: 'USER' | 'ORGANIZATION' | 'SETTINGS';
  };
  description: string;
  metadata?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface EnrollmentResponseDto {
  success: boolean;
  message: string;
  enrollment?: {
    id: number;
    status: VerificationStatus;
    role: OrganizationRole;
    requiresApproval: boolean;
    approvalUrl?: string;
  };
}

export interface BulkOperationResponseDto {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    userId: number;
    success: boolean;
    error?: string;
  }>;
  summary: {
    processed: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

export interface OrganizationSettingsResponseDto {
  allowPublicEnrollment: boolean;
  requireEmailVerification: boolean;
  autoApproveEnrollments: boolean;
  maxMembers: number;
  allowedDomains: string[];
  customFields?: any;
  enrollmentKey: string;
  lastKeyRegeneration?: Date;
  keyRegenerationHistory: Array<{
    regeneratedAt: Date;
    regeneratedBy: string;
    reason?: string;
  }>;
}

export interface NotificationResponseDto {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
  actions?: Array<{
    label: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  }>;
}

export interface AuditLogResponseDto {
  id: number;
  action: string;
  actor: {
    id: number;
    name: string;
    email: string;
  };
  target?: {
    id: number;
    type: string;
    name: string;
  };
  description: string;
  metadata?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'AUTH' | 'USER_MANAGEMENT' | 'SETTINGS' | 'DATA' | 'SYSTEM';
}

export interface ExportResponseDto {
  success: boolean;
  message: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
  format: 'csv' | 'json' | 'xlsx';
  recordCount: number;
  generatedAt: Date;
  expiresAt: Date;
}

export interface ValidationErrorDto {
  field: string;
  message: string;
  value?: any;
  constraints?: { [key: string]: string };
}

export interface SecurityAlertResponseDto {
  id: number;
  type: 'SUSPICIOUS_LOGIN' | 'MULTIPLE_FAILED_ATTEMPTS' | 'UNAUTHORIZED_ACCESS' | 'DATA_BREACH' | 'SYSTEM_INTRUSION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedUsers: number;
  organizationId: number;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  actions: Array<{
    label: string;
    url: string;
    method: string;
  }>;
  metadata?: any;
}

export interface SystemHealthResponseDto {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
      responseTime: number;
      lastChecked: Date;
    };
    auth: {
      status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
      responseTime: number;
      lastChecked: Date;
    };
    cache: {
      status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
      responseTime: number;
      lastChecked: Date;
    };
  };
  metrics: {
    totalOrganizations: number;
    totalUsers: number;
    activeUsers: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
  lastUpdated: Date;
}

export interface PermissionResponseDto {
  id: number;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  conditions?: any;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermissionResponseDto {
  role: OrganizationRole;
  permissions: PermissionResponseDto[];
  canManageUsers: boolean;
  canManageOrganization: boolean;
  canViewAuditLogs: boolean;
  canExportData: boolean;
  canSendNotifications: boolean;
  maxMembersCanManage: number;
  restrictedActions: string[];
}

export interface OrganizationInviteResponseDto {
  id: number;
  email: string;
  role: OrganizationRole;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  invitedBy: {
    id: number;
    name: string;
    email: string;
  };
  invitedAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  inviteUrl: string;
  notes?: string;
}

export interface OrganizationAnalyticsResponseDto {
  timeRange: {
    start: Date;
    end: Date;
  };
  overview: {
    totalMembers: number;
    newMembers: number;
    activeMembers: number;
    memberRetentionRate: number;
    averageSessionDuration: number;
  };
  membershipTrends: Array<{
    date: Date;
    newMembers: number;
    leftMembers: number;
    totalMembers: number;
  }>;
  activityMetrics: Array<{
    date: Date;
    activeUsers: number;
    sessions: number;
    pageViews: number;
    averageSessionTime: number;
  }>;
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    topFeatures: Array<{
      feature: string;
      usage: number;
      uniqueUsers: number;
    }>;
  };
  demographics: {
    byInstitute: Array<{
      instituteName: string;
      count: number;
      percentage: number;
    }>;
    byRole: Array<{
      role: OrganizationRole;
      count: number;
      percentage: number;
    }>;
    byJoinDate: Array<{
      month: string;
      count: number;
    }>;
  };
}
