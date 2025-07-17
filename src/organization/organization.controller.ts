import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationService } from './organization.service';
import { AuthService } from '../auth/auth.service';
import { OrganizationMemberGuard } from '../auth/organization-member.guard';
import { GlobalOrganizationMemberGuard } from '../auth/global-organization-member.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import {
  CreateInstituteOrganizationDto,
  CreateGlobalOrganizationDto,
  EnrollUserDto,
  EnrollGlobalUserDto,
  LoginOrganizationDto,
  VerifyUserDto,
  CreateLectureDto,
  AssignUserDto,
} from './dto/organization.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
  ) {}

  // Institute Organization endpoints
  @Post('institute')
  @UseGuards(AuthGuard('jwt'))
  async createInstituteOrganization(
    @Body() createDto: CreateInstituteOrganizationDto,
    @Request() req: any,
  ) {
    return this.organizationService.createInstituteOrganization(
      createDto.instituteId,
      createDto.name,
      createDto.description,
      createDto.logo,
      createDto.requiresVerification,
    );
  }

  @Post('institute/enroll')
  @UseGuards(AuthGuard('jwt'))
  async enrollInInstituteOrganization(
    @Body() enrollDto: EnrollUserDto,
    @Request() req: any,
  ) {
    return this.organizationService.enrollUserInInstituteOrganization(
      req.user.id,
      enrollDto.enrollmentKey,
      enrollDto.password,
      enrollDto.role as any,
    );
  }

  @Post('institute/:orgId/assign')
  @UseGuards(AuthGuard('jwt'), OrganizationMemberGuard, RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT')
  async assignUserToInstituteOrganization(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() assignDto: AssignUserDto,
    @Request() req: any,
  ) {
    return this.organizationService.assignUserDirectlyToInstituteOrganization(
      assignDto.userId,
      orgId,
      assignDto.role as any,
      req.user.id,
      assignDto.password,
    );
  }

  @Post('institute/users/:userId/verify')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY')
  async verifyInstituteOrganizationUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() verifyDto: VerifyUserDto,
    @Request() req: any,
  ) {
    return this.organizationService.verifyInstituteOrganizationUser(
      userId,
      req.user.id,
      verifyDto.approved,
    );
  }

  @Post('login')
  async loginToOrganization(@Body() loginDto: LoginOrganizationDto) {
    return this.authService.loginToOrganization(
      loginDto.userId,
      loginDto.organizationId,
      loginDto.password,
    );
  }

  // Global Organization endpoints
  @Post('global')
  @UseGuards(AuthGuard('jwt'))
  async createGlobalOrganization(
    @Body() createDto: CreateGlobalOrganizationDto,
    @Request() req: any,
  ) {
    return this.organizationService.createGlobalOrganization(
      createDto.name,
      createDto.description,
      createDto.logo,
      createDto.requiresVerification,
    );
  }

  @Post('global/enroll')
  @UseGuards(AuthGuard('jwt'))
  async enrollInGlobalOrganization(
    @Body() enrollDto: EnrollGlobalUserDto,
    @Request() req: any,
  ) {
    return this.organizationService.enrollUserInGlobalOrganization(
      req.user.id,
      enrollDto.enrollmentKey,
      enrollDto.password,
      enrollDto.role as any,
    );
  }

  @Post('global/users/:userId/verify')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY')
  async verifyGlobalOrganizationUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() verifyDto: VerifyUserDto,
    @Request() req: any,
  ) {
    return this.organizationService.verifyGlobalOrganizationUser(
      userId,
      req.user.id,
      verifyDto.approved,
    );
  }

  // Lecture endpoints
  @Post('lectures')
  @UseGuards(AuthGuard('jwt'))
  async createLecture(
    @Body() createDto: CreateLectureDto,
    @Request() req: any,
  ) {
    return this.organizationService.createLecture(
      createDto.title,
      createDto.description || '',
      createDto.content || '',
      createDto.visibility,
      createDto.level,
      createDto.organizationId,
      createDto.organizationType,
    );
  }

  @Get('lectures/public')
  async getPublicLectures() {
    return this.organizationService.getPublicLectures();
  }

  @Get('institute/:orgId/lectures')
  @UseGuards(AuthGuard('jwt'), OrganizationMemberGuard)
  async getInstituteOrganizationLectures(
    @Param('orgId', ParseIntPipe) orgId: number,
  ) {
    return this.organizationService.getOrganizationLectures(orgId, 'institute');
  }

  @Get('global/:orgId/lectures')
  @UseGuards(AuthGuard('jwt'), GlobalOrganizationMemberGuard)
  async getGlobalOrganizationLectures(
    @Param('orgId', ParseIntPipe) orgId: number,
  ) {
    return this.organizationService.getOrganizationLectures(orgId, 'global');
  }

  // User organizations
  @Get('my-organizations')
  @UseGuards(AuthGuard('jwt'))
  async getMyOrganizations(@Request() req: any) {
    return this.organizationService.getUserOrganizations(req.user.id);
  }
}
