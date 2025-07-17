import { Module } from '@nestjs/common';
import { CausesController } from './causes.controller';
import { CausesService } from './causes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLoggerService } from '../common/services/security-logger.service';

@Module({
  controllers: [CausesController],
  providers: [CausesService, PrismaService, AuditLoggerService],
  exports: [CausesService],
})
export class CausesModule {}
