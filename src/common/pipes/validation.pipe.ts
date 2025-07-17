import { 
  PipeTransform, 
  Injectable, 
  ArgumentMetadata, 
  BadRequestException 
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import * as DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Sanitize input data
    const sanitizedValue = this.sanitizeInput(value);
    
    const object = plainToClass(metatype, sanitizedValue);
    const errors = await validate(object, {
      whitelist: true, // Remove properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true,
      validateCustomDecorators: true,
    });

    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      }).join('; ');
      
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private sanitizeInput(value: any): any {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value.trim());
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeInput(item));
    }
    
    if (value !== null && typeof value === 'object') {
      const sanitized: any = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeInput(value[key]);
        }
      }
      return sanitized;
    }
    
    return value;
  }
}

@Injectable()
export class SecurityValidationService {
  // Check for SQL injection patterns
  static validateSqlInjection(input: string): boolean {
    const sqlInjectionPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i,
      /exec(\s|\+)+(s|x)p\w+/i,
      /UNION(?:\s+ALL)?\s+SELECT/i,
      /INSERT(?:\s+INTO)?\s+/i,
      /UPDATE\s+\w+\s+SET/i,
      /DELETE\s+FROM/i,
      /DROP\s+(TABLE|DATABASE)/i,
      /ALTER\s+TABLE/i,
      /CREATE\s+(TABLE|DATABASE)/i
    ];

    return !sqlInjectionPatterns.some(pattern => pattern.test(input));
  }

  // Check for XSS patterns
  static validateXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload=/gi,
      /onerror=/gi,
      /onclick=/gi,
      /onmouseover=/gi
    ];

    return !xssPatterns.some(pattern => pattern.test(input));
  }

  // Validate file uploads
  static validateFileUpload(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  // Validate URL format
  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Check for path traversal attempts
  static validatePathTraversal(path: string): boolean {
    const dangerousPatterns = [
      /\.\./,
      /\.\\\./,
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e/i,
      /%252e%252e/i,
      /\0/
    ];

    return !dangerousPatterns.some(pattern => pattern.test(path));
  }
}
