import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SecurityLoggerService } from '../services/security-logger.service';

@Injectable()
export class OrganizationValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(OrganizationValidationPipe.name);

  constructor(private securityLogger: SecurityLoggerService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        const constraints = error.constraints || {};
        return `${error.property}: ${Object.values(constraints).join(', ')}`;
      });

      this.logger.warn(`Validation failed: ${errorMessages.join('; ')}`);
      this.securityLogger.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: 'unknown',
        ip: '0.0.0.0',
        userAgent: 'unknown',
        path: 'validation',
        method: 'VALIDATION',
        timestamp: new Date(),
        details: { 
          validationErrors: errorMessages,
          inputData: this.sanitizeForLogging(value),
        },
      });

      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}

@Injectable()
export class OrganizationIdValidationPipe implements PipeTransform {
  private readonly logger = new Logger(OrganizationIdValidationPipe.name);

  constructor(private securityLogger: SecurityLoggerService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'orgId') {
      return value;
    }

    const orgId = parseInt(value);
    
    if (isNaN(orgId) || orgId <= 0) {
      this.logger.warn(`Invalid organization ID: ${value}`);
      this.securityLogger.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: 'unknown',
        ip: '0.0.0.0',
        userAgent: 'unknown',
        path: 'validation',
        method: 'VALIDATION',
        timestamp: new Date(),
        details: { 
          invalidOrgId: value,
          reason: 'Invalid organization ID format',
        },
      });
      throw new BadRequestException('Invalid organization ID');
    }

    return orgId;
  }
}

@Injectable()
export class UserIdValidationPipe implements PipeTransform {
  private readonly logger = new Logger(UserIdValidationPipe.name);

  constructor(private securityLogger: SecurityLoggerService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'userId') {
      return value;
    }

    const userId = parseInt(value);
    
    if (isNaN(userId) || userId <= 0) {
      this.logger.warn(`Invalid user ID: ${value}`);
      this.securityLogger.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: 'unknown',
        ip: '0.0.0.0',
        userAgent: 'unknown',
        path: 'validation',
        method: 'VALIDATION',
        timestamp: new Date(),
        details: { 
          invalidUserId: value,
          reason: 'Invalid user ID format',
        },
      });
      throw new BadRequestException('Invalid user ID');
    }

    return userId;
  }
}
