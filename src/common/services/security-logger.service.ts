import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

export interface SecurityEvent {
  type: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'SUSPICIOUS_ACTIVITY' | 'ACCESS_DENIED' | 'RATE_LIMIT_EXCEEDED';
  userId?: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  timestamp: Date;
  details?: any;
}

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger(SecurityLoggerService.name);

  logSecurityEvent(event: SecurityEvent): void {
    const logEntry = {
      ...event,
      timestamp: event.timestamp.toISOString(),
      severity: this.getSeverity(event.type),
    };

    switch (event.type) {
      case 'AUTH_FAILURE':
      case 'SUSPICIOUS_ACTIVITY':
      case 'ACCESS_DENIED':
        this.logger.warn(`Security Event: ${event.type}`, logEntry);
        break;
      case 'RATE_LIMIT_EXCEEDED':
        this.logger.error(`Security Event: ${event.type}`, logEntry);
        break;
      case 'AUTH_SUCCESS':
        this.logger.log(`Security Event: ${event.type}`, logEntry);
        break;
      default:
        this.logger.log(`Security Event: ${event.type}`, logEntry);
    }

    // In production, you might want to send critical events to external monitoring
    if (this.isCriticalEvent(event.type)) {
      this.sendToExternalMonitoring(logEntry);
    }
  }

  logAPIAccess(req: Request, statusCode: number, responseTime: number): void {
    const logEntry = {
      method: req.method,
      path: req.url,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= 400) {
      this.logger.warn('API Error', logEntry);
    } else {
      this.logger.log('API Access', logEntry);
    }
  }

  logDatabaseAccess(operation: string, table: string, userId?: string): void {
    const logEntry = {
      operation,
      table,
      userId: userId || 'system',
      timestamp: new Date().toISOString(),
    };

    this.logger.log('Database Access', logEntry);
  }

  logSuspiciousActivity(
    type: string,
    req: Request,
    details: any,
  ): void {
    const event: SecurityEvent = {
      type: 'SUSPICIOUS_ACTIVITY',
      userId: (req as any).user?.id,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      path: req.url,
      method: req.method,
      timestamp: new Date(),
      details: { type, ...details },
    };

    this.logSecurityEvent(event);
  }

  private getSeverity(type: SecurityEvent['type']): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (type) {
      case 'AUTH_SUCCESS':
        return 'LOW';
      case 'AUTH_FAILURE':
        return 'MEDIUM';
      case 'ACCESS_DENIED':
        return 'MEDIUM';
      case 'SUSPICIOUS_ACTIVITY':
        return 'HIGH';
      case 'RATE_LIMIT_EXCEEDED':
        return 'CRITICAL';
      default:
        return 'MEDIUM';
    }
  }

  private isCriticalEvent(type: SecurityEvent['type']): boolean {
    return ['RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_ACTIVITY'].includes(type);
  }

  private sendToExternalMonitoring(logEntry: any): void {
    // Implement external monitoring integration here
    // For example: send to CloudWatch, DataDog, Splunk, etc.
    // This is a placeholder for production implementation
    this.logger.warn('Critical security event detected', logEntry);
  }
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  logUserAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changes?: any,
  ): void {
    const auditEntry = {
      userId,
      action,
      resourceType,
      resourceId,
      changes: changes ? JSON.stringify(changes) : undefined,
      timestamp: new Date().toISOString(),
      ip: 'unknown', // This should be passed from the request context
    };

    this.logger.log(`Audit: ${action} on ${resourceType}`, auditEntry);
  }

  logOrganizationChange(
    userId: string,
    organizationId: string,
    action: string,
    changes: any,
  ): void {
    this.logUserAction(userId, action, 'organization', organizationId, changes);
  }

  logCauseChange(
    userId: string,
    causeId: string,
    action: string,
    changes: any,
  ): void {
    this.logUserAction(userId, action, 'cause', causeId, changes);
  }

  logEnrollmentChange(
    userId: string,
    enrollmentType: 'cause' | 'organization',
    targetId: string,
    action: string,
  ): void {
    this.logUserAction(userId, action, `${enrollmentType}_enrollment`, targetId);
  }
}
