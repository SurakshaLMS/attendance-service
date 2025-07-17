import { Module } from '@nestjs/common';
import { InstituteOrganizationController } from './institute-organization.controller';
import { InstituteOrganizationService } from './institute-organization.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/roles.guard';
import { OrganizationMemberGuard } from '../auth/organization-member.guard';

@Module({
  controllers: [InstituteOrganizationController],
  providers: [
    InstituteOrganizationService,
    PrismaService,
    RolesGuard,
    OrganizationMemberGuard,
  ],
  exports: [InstituteOrganizationService],
})
export class InstituteOrganizationModule {}
