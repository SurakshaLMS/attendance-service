import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { SecurityLoggerService } from '../services/security-logger.service';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly securityLogger: SecurityLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Generate unique request ID
    const requestId = this.generateRequestId();
    request.headers['x-request-id'] = requestId;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        this.securityLogger.logAPIAccess(request, response.statusCode, responseTime);
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

@Injectable()
export class SecurityHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        // Add additional security headers
        response.setHeader('X-Request-ID', response.req.headers['x-request-id'] || 'unknown');
        response.setHeader('X-Timestamp', new Date().toISOString());
      }),
    );
  }
}

@Injectable()
export class InputSanitizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Sanitize request body
    if (request.body) {
      request.body = this.sanitizeObject(request.body);
    }

    // Sanitize query parameters
    if (request.query) {
      request.query = this.sanitizeObject(request.query);
    }

    // Sanitize URL parameters
    if (request.params) {
      request.params = this.sanitizeObject(request.params);
    }

    return next.handle();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    if (!str) return str;
    
    // Remove potentially dangerous characters
    return str
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .trim();
  }
}

@Injectable()
export class RateLimitTrackingInterceptor implements NestInterceptor {
  private readonly requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100; // per window

  constructor(private readonly securityLogger: SecurityLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientId = this.getClientId(request);
    
    this.trackRequest(clientId, request);

    return next.handle();
  }

  private getClientId(request: Request): string {
    // Use user ID if authenticated, otherwise IP address
    const userId = (request as any).user?.id;
    return userId || request.ip || 'unknown';
  }

  private trackRequest(clientId: string, request: Request): void {
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      // Reset window
      this.requestCounts.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    } else {
      // Increment count
      clientData.count++;
      
      // Check if limit exceeded
      if (clientData.count > this.maxRequests) {
        this.securityLogger.logSuspiciousActivity(
          'RATE_LIMIT_TRACKING',
          request,
          {
            clientId,
            requestCount: clientData.count,
            windowMs: this.windowMs,
            maxRequests: this.maxRequests,
          },
        );
      }
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to trigger cleanup
      this.cleanupOldEntries();
    }
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    for (const [clientId, data] of this.requestCounts.entries()) {
      if (now > data.resetTime) {
        this.requestCounts.delete(clientId);
      }
    }
  }
}
