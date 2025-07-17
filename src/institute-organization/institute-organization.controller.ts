import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InstituteOrganizationService } from './institute-organization.service';
import { OrganizationMemberGuard } from '../auth/organization-member.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('institute-organizations')
@UseGuards(AuthGuard('jwt'))
export class InstituteOrganizationController {
  constructor(
    private instituteOrganizationService: InstituteOrganizationService,
  ) {}

  @Get(':orgId')
  @UseGuards(OrganizationMemberGuard)
  async getOrganization(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.instituteOrganizationService.getOrganizationById(orgId);
  }

  @Get(':orgId/members')
  @UseGuards(OrganizationMemberGuard)
  async getMembers(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.instituteOrganizationService.getOrganizationMembers(orgId);
  }

  @Get(':orgId/pending-verifications')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY')
  async getPendingVerifications(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.instituteOrganizationService.getPendingVerifications(orgId);
  }

  @Get(':orgId/stats')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY')
  async getStats(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.instituteOrganizationService.getOrganizationStats(orgId);
  }

  @Put(':orgId/members/:userId/role')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT')
  async updateUserRole(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body('role') role: string,
    @Request() req: any,
  ) {
    return this.instituteOrganizationService.updateUserRole(
      orgId,
      userId,
      role,
      req.user.id,
    );
  }

  @Delete(':orgId/members/:userId')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT')
  async removeUser(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ) {
    return this.instituteOrganizationService.removeUserFromOrganization(
      orgId,
      userId,
      req.user.id,
    );
  }

  @Put(':orgId/settings')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT')
  async updateSettings(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() settings: {
      name?: string;
      description?: string;
      logo?: string;
      requiresVerification?: boolean;
    },
    @Request() req: any,
  ) {
    return this.instituteOrganizationService.updateOrganizationSettings(
      orgId,
      settings,
      req.user.id,
    );
  }

  @Post(':orgId/enrollment-key/regenerate')
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY')
  async regenerateEnrollmentKey(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Request() req: any,
  ) {
    return this.instituteOrganizationService.generateNewEnrollmentKey(
      orgId,
      req.user.id,
    );
  }
}
