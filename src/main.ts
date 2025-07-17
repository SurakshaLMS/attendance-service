import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ValidationPipe as CustomValidationPipe } from './common/pipes/validation.pipe';
import { RequestLoggingInterceptor, SecurityHeadersInterceptor } from './common/interceptors/security.interceptor';
import { SecurityLoggerService } from './common/services/security-logger.service';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Security middleware (helmet, rate limiting, etc.)
    app.use(new SecurityMiddleware().use);
    
    // Compression middleware
    app.use(compression());
    
    // Enable CORS with security considerations
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    });

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Global validation with security
    app.useGlobalPipes(
      new CustomValidationPipe(),
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
        disableErrorMessages: process.env.NODE_ENV === 'production',
      }),
    );

    // Security interceptors
    const securityLogger = app.get(SecurityLoggerService);
    app.useGlobalInterceptors(
      new RequestLoggingInterceptor(securityLogger),
      new SecurityHeadersInterceptor(),
    );

    // Set global prefix for API routes
    app.setGlobalPrefix('api/v1');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });

    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 Organization Service is running securely on: ${await app.getUrl()}`);
    logger.log(`📋 API Documentation available at: ${await app.getUrl()}/api/v1`);
    logger.log(`🛡️  Security features enabled: Helmet, Rate Limiting, Input Validation, Audit Logging`);
    
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
