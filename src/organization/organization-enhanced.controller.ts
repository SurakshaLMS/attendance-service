import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  ParseIntPipe,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationRolesGuard } from '../common/guards/organization-roles.guard';
import { EnhancedOrganizationMemberGuard } from '../common/guards/enhanced-organization-member.guard';
import { OrganizationValidationPipe } from '../common/pipes/organization-validation.pipe';
import { RequestLoggingInterceptor } from '../common/interceptors/security.interceptor';
import { HttpExceptionFilter } from '../common/filters/exception.filter';
import { SecurityLoggerService } from '../common/services/security-logger.service';
import { OrganizationEnhancedService } from './organization-enhanced-basic.service';
import { 
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateInstituteOrganizationDto,
  UpdateInstituteOrganizationDto,
  CreateGlobalOrganizationDto,
  UpdateGlobalOrganizationDto,
  EnrollUserDto,
  AssignUserDto,
  UpdateUserRoleDto,
  VerifyUserDto,
  RemoveUserDto,
  BulkUserOperationDto,
  BulkAssignUsersDto,
  OrganizationSettingsDto,
  RegenerateKeyDto,
  OrganizationStatsFilterDto,
  ExportDataDto,
  SearchOrganizationsDto,
  SearchUsersDto,
  NotificationDto,
  AuditLogFilterDto,
  OrganizationRole,
} from './dto/enhanced-organization.dto';
import {
  BaseResponse,
  PaginatedResponse,
  OrganizationResponseDto,
  InstituteOrganizationResponseDto,
  GlobalOrganizationResponseDto,
  OrganizationUserResponseDto,
  OrganizationStatsResponseDto,
  OrganizationActivityResponseDto,
  EnrollmentResponseDto,
  BulkOperationResponseDto,
  OrganizationSettingsResponseDto,
  NotificationResponseDto,
  AuditLogResponseDto,
  ExportResponseDto,
  SecurityAlertResponseDto,
  SystemHealthResponseDto,
  RolePermissionResponseDto,
  OrganizationInviteResponseDto,
  OrganizationAnalyticsResponseDto,
} from './dto/organization-response.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
@UseInterceptors(RequestLoggingInterceptor)
@UseFilters(HttpExceptionFilter)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OrganizationEnhancedController {
  constructor(
    private readonly organizationService: OrganizationEnhancedService,
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  // ==================== ORGANIZATION MANAGEMENT ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(OrganizationValidationPipe)
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationResponseDto>> {
    try {
      this.securityLogger.log('Organization creation attempted', {
        userId: req.user.id,
        organizationName: createOrganizationDto.name,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const organization = await this.organizationService.createOrganization(
        createOrganizationDto,
        req.user.id,
      );

      this.securityLogger.log('Organization created successfully', {
        userId: req.user.id,
        organizationId: organization.id,
        organizationName: organization.name,
      });

      return {
        success: true,
        message: 'Organization created successfully',
        data: organization,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Organization creation failed', {
        userId: req.user.id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getOrganizations(
    @Query() searchDto: SearchOrganizationsDto,
    @Req() req: any,
  ): Promise<PaginatedResponse<OrganizationResponseDto[]>> {
    try {
      const result = await this.organizationService.searchOrganizations(
        searchDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Organizations retrieved successfully',
        data: result.organizations,
        pagination: result.pagination,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve organizations', {
        userId: req.user.id,
        error: error.message,
      });
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard)
  async getOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationResponseDto>> {
    try {
      const organization = await this.organizationService.getOrganizationById(
        id,
        req.user.id,
      );

      return {
        success: true,
        message: 'Organization retrieved successfully',
        data: organization,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve organization', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async updateOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationResponseDto>> {
    try {
      this.securityLogger.log('Organization update attempted', {
        userId: req.user.id,
        organizationId: id,
        changes: updateOrganizationDto,
      });

      const organization = await this.organizationService.updateOrganization(
        id,
        updateOrganizationDto,
        req.user.id,
      );

      this.securityLogger.log('Organization updated successfully', {
        userId: req.user.id,
        organizationId: id,
      });

      return {
        success: true,
        message: 'Organization updated successfully',
        data: organization,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Organization update failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  async deleteOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<BaseResponse<void>> {
    try {
      this.securityLogger.log('Organization deletion attempted', {
        userId: req.user.id,
        organizationId: id,
      });

      await this.organizationService.deleteOrganization(id, req.user.id);

      this.securityLogger.log('Organization deleted successfully', {
        userId: req.user.id,
        organizationId: id,
      });

      return {
        success: true,
        message: 'Organization deleted successfully',
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Organization deletion failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== INSTITUTE ORGANIZATIONS ====================

  @Post('institute')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(OrganizationValidationPipe)
  async createInstituteOrganization(
    @Body() createInstituteOrganizationDto: CreateInstituteOrganizationDto,
    @Req() req: any,
  ): Promise<BaseResponse<InstituteOrganizationResponseDto>> {
    try {
      this.securityLogger.log('Institute organization creation attempted', {
        userId: req.user.id,
        organizationName: createInstituteOrganizationDto.name,
        instituteId: createInstituteOrganizationDto.instituteId,
      });

      const organization = await this.organizationService.createInstituteOrganization(
        createInstituteOrganizationDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Institute organization created successfully',
        data: organization,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Institute organization creation failed', {
        userId: req.user.id,
        error: error.message,
      });
      throw error;
    }
  }

  @Get('institute/:instituteId')
  @HttpCode(HttpStatus.OK)
  async getInstituteOrganizations(
    @Param('instituteId', ParseIntPipe) instituteId: number,
    @Query() searchDto: SearchOrganizationsDto,
    @Req() req: any,
  ): Promise<PaginatedResponse<InstituteOrganizationResponseDto[]>> {
    try {
      const result = await this.organizationService.getInstituteOrganizations(
        instituteId,
        searchDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Institute organizations retrieved successfully',
        data: result.organizations,
        pagination: result.pagination,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve institute organizations', {
        userId: req.user.id,
        instituteId,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== GLOBAL ORGANIZATIONS ====================

  @Post('global')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(OrganizationValidationPipe)
  async createGlobalOrganization(
    @Body() createGlobalOrganizationDto: CreateGlobalOrganizationDto,
    @Req() req: any,
  ): Promise<BaseResponse<GlobalOrganizationResponseDto>> {
    try {
      this.securityLogger.log('Global organization creation attempted', {
        userId: req.user.id,
        organizationName: createGlobalOrganizationDto.name,
      });

      const organization = await this.organizationService.createGlobalOrganization(
        createGlobalOrganizationDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Global organization created successfully',
        data: organization,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Global organization creation failed', {
        userId: req.user.id,
        error: error.message,
      });
      throw error;
    }
  }

  @Get('global')
  @HttpCode(HttpStatus.OK)
  async getGlobalOrganizations(
    @Query() searchDto: SearchOrganizationsDto,
    @Req() req: any,
  ): Promise<PaginatedResponse<GlobalOrganizationResponseDto[]>> {
    try {
      const result = await this.organizationService.getGlobalOrganizations(
        searchDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Global organizations retrieved successfully',
        data: result.organizations,
        pagination: result.pagination,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve global organizations', {
        userId: req.user.id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== USER MANAGEMENT ====================

  @Post(':id/users/enroll')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(OrganizationValidationPipe)
  async enrollUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() enrollUserDto: EnrollUserDto,
    @Req() req: any,
  ): Promise<BaseResponse<EnrollmentResponseDto>> {
    try {
      this.securityLogger.log('User enrollment attempted', {
        userId: req.user.id,
        organizationId: id,
        targetRole: enrollUserDto.role,
      });

      const enrollment = await this.organizationService.enrollUser(
        id,
        enrollUserDto,
        req.user.id,
      );

      this.securityLogger.log('User enrolled successfully', {
        userId: req.user.id,
        organizationId: id,
        enrollmentId: enrollment.enrollment?.id,
      });

      return {
        success: true,
        message: 'User enrolled successfully',
        data: enrollment,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('User enrollment failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Post(':id/users/assign')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async assignUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignUserDto: AssignUserDto,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationUserResponseDto>> {
    try {
      this.securityLogger.log('User assignment attempted', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: assignUserDto.userId,
        role: assignUserDto.role,
      });

      const userAssignment = await this.organizationService.assignUser(
        id,
        assignUserDto,
        req.user.id,
      );

      this.securityLogger.log('User assigned successfully', {
        userId: req.user.id,
        organizationId: id,
        assignedUserId: assignUserDto.userId,
      });

      return {
        success: true,
        message: 'User assigned successfully',
        data: userAssignment,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('User assignment failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Get(':id/users')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard)
  async getOrganizationUsers(
    @Param('id', ParseIntPipe) id: number,
    @Query() searchDto: SearchUsersDto,
    @Req() req: any,
  ): Promise<PaginatedResponse<OrganizationUserResponseDto[]>> {
    try {
      const result = await this.organizationService.getOrganizationUsers(
        id,
        searchDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Organization users retrieved successfully',
        data: result.users,
        pagination: result.pagination,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve organization users', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Get(':id/users/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard)
  async getOrganizationUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationUserResponseDto>> {
    try {
      const user = await this.organizationService.getOrganizationUser(
        id,
        userId,
        req.user.id,
      );

      return {
        success: true,
        message: 'Organization user retrieved successfully',
        data: user,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve organization user', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        error: error.message,
      });
      throw error;
    }
  }

  @Put(':id/users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationUserResponseDto>> {
    try {
      this.securityLogger.log('User role update attempted', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        newRole: updateUserRoleDto.role,
      });

      const updatedUser = await this.organizationService.updateUserRole(
        id,
        userId,
        updateUserRoleDto,
        req.user.id,
      );

      this.securityLogger.log('User role updated successfully', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        newRole: updateUserRoleDto.role,
      });

      return {
        success: true,
        message: 'User role updated successfully',
        data: updatedUser,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('User role update failed', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        error: error.message,
      });
      throw error;
    }
  }

  @Put(':id/users/:userId/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async verifyUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() verifyUserDto: VerifyUserDto,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationUserResponseDto>> {
    try {
      this.securityLogger.log('User verification attempted', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        approved: verifyUserDto.approved,
      });

      const verifiedUser = await this.organizationService.verifyUser(
        id,
        userId,
        verifyUserDto,
        req.user.id,
      );

      this.securityLogger.log('User verification completed', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        approved: verifyUserDto.approved,
      });

      return {
        success: true,
        message: `User ${verifyUserDto.approved ? 'approved' : 'rejected'} successfully`,
        data: verifiedUser,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('User verification failed', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        error: error.message,
      });
      throw error;
    }
  }

  @Delete(':id/users/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  async removeUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() removeUserDto: RemoveUserDto,
    @Req() req: any,
  ): Promise<BaseResponse<void>> {
    try {
      this.securityLogger.log('User removal attempted', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        reason: removeUserDto.reason,
      });

      await this.organizationService.removeUser(
        id,
        userId,
        removeUserDto,
        req.user.id,
      );

      this.securityLogger.log('User removed successfully', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
      });

      return {
        success: true,
        message: 'User removed successfully',
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('User removal failed', {
        userId: req.user.id,
        organizationId: id,
        targetUserId: userId,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== BULK OPERATIONS ====================

  @Post(':id/users/bulk-assign')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async bulkAssignUsers(
    @Param('id', ParseIntPipe) id: number,
    @Body() bulkAssignDto: BulkAssignUsersDto,
    @Req() req: any,
  ): Promise<BaseResponse<BulkOperationResponseDto>> {
    try {
      this.securityLogger.log('Bulk user assignment attempted', {
        userId: req.user.id,
        organizationId: id,
        userCount: bulkAssignDto.users.length,
      });

      const result = await this.organizationService.bulkAssignUsers(
        id,
        bulkAssignDto,
        req.user.id,
      );

      this.securityLogger.log('Bulk user assignment completed', {
        userId: req.user.id,
        organizationId: id,
        processed: result.totalProcessed,
        successful: result.successCount,
        failed: result.failureCount,
      });

      return {
        success: true,
        message: 'Bulk user assignment completed',
        data: result,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Bulk user assignment failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Post(':id/users/bulk-operation')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async bulkUserOperation(
    @Param('id', ParseIntPipe) id: number,
    @Body() bulkOperationDto: BulkUserOperationDto,
    @Req() req: any,
  ): Promise<BaseResponse<BulkOperationResponseDto>> {
    try {
      this.securityLogger.log('Bulk user operation attempted', {
        userId: req.user.id,
        organizationId: id,
        userCount: bulkOperationDto.userIds.length,
        operation: bulkOperationDto.role ? 'role_update' : 'verification',
      });

      const result = await this.organizationService.bulkUserOperation(
        id,
        bulkOperationDto,
        req.user.id,
      );

      this.securityLogger.log('Bulk user operation completed', {
        userId: req.user.id,
        organizationId: id,
        processed: result.totalProcessed,
        successful: result.successCount,
        failed: result.failureCount,
      });

      return {
        success: true,
        message: 'Bulk user operation completed',
        data: result,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Bulk user operation failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== ORGANIZATION SETTINGS ====================

  @Get(':id/settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  async getOrganizationSettings(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationSettingsResponseDto>> {
    try {
      const settings = await this.organizationService.getOrganizationSettings(
        id,
        req.user.id,
      );

      return {
        success: true,
        message: 'Organization settings retrieved successfully',
        data: settings,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve organization settings', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Put(':id/settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async updateOrganizationSettings(
    @Param('id', ParseIntPipe) id: number,
    @Body() settingsDto: OrganizationSettingsDto,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationSettingsResponseDto>> {
    try {
      this.securityLogger.log('Organization settings update attempted', {
        userId: req.user.id,
        organizationId: id,
        changes: settingsDto,
      });

      const updatedSettings = await this.organizationService.updateOrganizationSettings(
        id,
        settingsDto,
        req.user.id,
      );

      this.securityLogger.log('Organization settings updated successfully', {
        userId: req.user.id,
        organizationId: id,
      });

      return {
        success: true,
        message: 'Organization settings updated successfully',
        data: updatedSettings,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Organization settings update failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Post(':id/settings/regenerate-key')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async regenerateEnrollmentKey(
    @Param('id', ParseIntPipe) id: number,
    @Body() regenerateKeyDto: RegenerateKeyDto,
    @Req() req: any,
  ): Promise<BaseResponse<{ enrollmentKey: string }>> {
    try {
      this.securityLogger.log('Enrollment key regeneration attempted', {
        userId: req.user.id,
        organizationId: id,
        reason: regenerateKeyDto.reason,
      });

      const newKey = await this.organizationService.regenerateEnrollmentKey(
        id,
        regenerateKeyDto,
        req.user.id,
      );

      this.securityLogger.log('Enrollment key regenerated successfully', {
        userId: req.user.id,
        organizationId: id,
      });

      return {
        success: true,
        message: 'Enrollment key regenerated successfully',
        data: { enrollmentKey: newKey },
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Enrollment key regeneration failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== STATISTICS AND ANALYTICS ====================

  @Get(':id/stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard)
  async getOrganizationStats(
    @Param('id', ParseIntPipe) id: number,
    @Query() filterDto: OrganizationStatsFilterDto,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationStatsResponseDto>> {
    try {
      const stats = await this.organizationService.getOrganizationStats(
        id,
        filterDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Organization statistics retrieved successfully',
        data: stats,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve organization statistics', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Get(':id/analytics')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  async getOrganizationAnalytics(
    @Param('id', ParseIntPipe) id: number,
    @Query() filterDto: OrganizationStatsFilterDto,
    @Req() req: any,
  ): Promise<BaseResponse<OrganizationAnalyticsResponseDto>> {
    try {
      const analytics = await this.organizationService.getOrganizationAnalytics(
        id,
        filterDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Organization analytics retrieved successfully',
        data: analytics,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve organization analytics', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Get(':id/activity')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard)
  async getOrganizationActivity(
    @Param('id', ParseIntPipe) id: number,
    @Query() filterDto: AuditLogFilterDto,
    @Req() req: any,
  ): Promise<PaginatedResponse<OrganizationActivityResponseDto[]>> {
    try {
      const result = await this.organizationService.getOrganizationActivity(
        id,
        filterDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Organization activity retrieved successfully',
        data: result.activities,
        pagination: result.pagination,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve organization activity', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== DATA EXPORT ====================

  @Post(':id/export')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async exportOrganizationData(
    @Param('id', ParseIntPipe) id: number,
    @Body() exportDto: ExportDataDto,
    @Req() req: any,
  ): Promise<BaseResponse<ExportResponseDto>> {
    try {
      this.securityLogger.log('Organization data export requested', {
        userId: req.user.id,
        organizationId: id,
        format: exportDto.format,
        fields: exportDto.fields,
      });

      const exportResult = await this.organizationService.exportOrganizationData(
        id,
        exportDto,
        req.user.id,
      );

      this.securityLogger.log('Organization data export completed', {
        userId: req.user.id,
        organizationId: id,
        fileName: exportResult.fileName,
        recordCount: exportResult.recordCount,
      });

      return {
        success: true,
        message: 'Organization data export completed',
        data: exportResult,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Organization data export failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  @Get(':id/export/:fileName')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  async downloadExportedData(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileName') fileName: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      this.securityLogger.log('Exported data download requested', {
        userId: req.user.id,
        organizationId: id,
        fileName,
      });

      const file = await this.organizationService.getExportedFile(
        id,
        fileName,
        req.user.id,
      );

      res.set({
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      return new StreamableFile(file.buffer);
    } catch (error) {
      this.securityLogger.error('Exported data download failed', {
        userId: req.user.id,
        organizationId: id,
        fileName,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== NOTIFICATIONS ====================

  @Post(':id/notifications')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  @UsePipes(OrganizationValidationPipe)
  async sendNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() notificationDto: NotificationDto,
    @Req() req: any,
  ): Promise<BaseResponse<{ sent: number; failed: number }>> {
    try {
      this.securityLogger.log('Notification send requested', {
        userId: req.user.id,
        organizationId: id,
        title: notificationDto.title,
        recipientCount: notificationDto.userIds?.length || 0,
        roles: notificationDto.roles,
      });

      const result = await this.organizationService.sendNotification(
        id,
        notificationDto,
        req.user.id,
      );

      this.securityLogger.log('Notification sent successfully', {
        userId: req.user.id,
        organizationId: id,
        sent: result.sent,
        failed: result.failed,
      });

      return {
        success: true,
        message: 'Notification sent successfully',
        data: result,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Notification send failed', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== AUDIT LOGS ====================

  @Get(':id/audit-logs')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  async getAuditLogs(
    @Param('id', ParseIntPipe) id: number,
    @Query() filterDto: AuditLogFilterDto,
    @Req() req: any,
  ): Promise<PaginatedResponse<AuditLogResponseDto[]>> {
    try {
      const result = await this.organizationService.getAuditLogs(
        id,
        filterDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Audit logs retrieved successfully',
        data: result.logs,
        pagination: result.pagination,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve audit logs', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== SECURITY ALERTS ====================

  @Get(':id/security-alerts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard, OrganizationRolesGuard)
  async getSecurityAlerts(
    @Param('id', ParseIntPipe) id: number,
    @Query() filterDto: AuditLogFilterDto,
    @Req() req: any,
  ): Promise<PaginatedResponse<SecurityAlertResponseDto[]>> {
    try {
      const result = await this.organizationService.getSecurityAlerts(
        id,
        filterDto,
        req.user.id,
      );

      return {
        success: true,
        message: 'Security alerts retrieved successfully',
        data: result.alerts,
        pagination: result.pagination,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve security alerts', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== ROLE PERMISSIONS ====================

  @Get(':id/roles/permissions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EnhancedOrganizationMemberGuard)
  async getRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<BaseResponse<RolePermissionResponseDto[]>> {
    try {
      const permissions = await this.organizationService.getRolePermissions(
        id,
        req.user.id,
      );

      return {
        success: true,
        message: 'Role permissions retrieved successfully',
        data: permissions,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve role permissions', {
        userId: req.user.id,
        organizationId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== HEALTH CHECK ====================

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async getSystemHealth(@Req() req: any): Promise<BaseResponse<SystemHealthResponseDto>> {
    try {
      const health = await this.organizationService.getSystemHealth();

      return {
        success: true,
        message: 'System health retrieved successfully',
        data: health,
        timestamp: new Date(),
        requestId: req.id,
      };
    } catch (error) {
      this.securityLogger.error('Failed to retrieve system health', {
        userId: req.user?.id,
        error: error.message,
      });
      throw error;
    }
  }
}
