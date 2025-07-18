import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationEnhancedController } from './organization-enhanced.controller';
import { OrganizationEnhancedService } from './organization-enhanced-basic.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityLoggerService } from '../common/services/security-logger.service';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationController, OrganizationEnhancedController],
  providers: [OrganizationService, OrganizationEnhancedService, PrismaService, SecurityLoggerService],
  exports: [OrganizationService, OrganizationEnhancedService],
})
export class OrganizationModule {}
