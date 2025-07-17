import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { InstituteOrganizationModule } from './institute-organization/institute-organization.module';
import { SyncModule } from './sync/sync.module';
import { CausesModule } from './causes/causes.module';
import { PrismaService } from './prisma/prisma.service';
import { SecurityLoggerService, AuditLoggerService } from './common/services/security-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
    AuthModule,
    OrganizationModule,
    InstituteOrganizationModule,
    SyncModule,
    CausesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    PrismaService, 
    SecurityLoggerService, 
    AuditLoggerService,
  ],
  exports: [SecurityLoggerService, AuditLoggerService],
})
export class AppModule {}
