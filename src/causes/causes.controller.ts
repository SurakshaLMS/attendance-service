import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CausesService } from './causes.service';
import {
  CreateCauseDto,
  UpdateCauseDto,
  EnrollInCauseDto,
  CreateCauseLectureDto,
  UpdateCauseLectureDto,
  CreateLectureDocumentDto,
  UpdateLectureDocumentDto,
  EnrollInCauseLectureDto,
  UpdateWatchTimeDto,
  VerifyCauseEnrollmentDto,
} from './dto/cause.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('causes')
export class CausesController {
  constructor(private readonly causesService: CausesService) {}

  // Public endpoints (no auth required)
  @Get('public/organization/:orgId')
  async getPublicCausesByOrganization(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('isGlobal') isGlobal: string,
  ) {
    const isGlobalOrg = isGlobal === 'true';
    return this.causesService.getCausesByOrganization(orgId, isGlobalOrg);
  }

  @Get('public/:id')
  async getPublicCauseById(@Param('id', ParseIntPipe) id: number) {
    return this.causesService.getCauseById(id);
  }

  // Protected endpoints (require authentication)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseGuards(RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN')
  async createCause(@Body() createCauseDto: CreateCauseDto, @Request() req) {
    return this.causesService.createCause(createCauseDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN')
  async updateCause(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCauseDto: UpdateCauseDto,
    @Request() req,
  ) {
    return this.causesService.updateCause(id, updateCauseDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN')
  async deleteCause(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.causesService.deleteCause(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getCauseById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.causesService.getCauseById(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('organization/:orgId')
  async getCausesByOrganization(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('isGlobal') isGlobal: string,
    @Request() req,
  ) {
    const isGlobalOrg = isGlobal === 'true';
    return this.causesService.getCausesByOrganization(orgId, isGlobalOrg, req.user.userId);
  }

  // Cause Enrollment
  @UseGuards(AuthGuard('jwt'))
  @Post('enroll')
  async enrollInCause(@Body() enrollInCauseDto: EnrollInCauseDto, @Request() req) {
    return this.causesService.enrollInCause(enrollInCauseDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify-enrollment')
  @UseGuards(RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN')
  async verifyCauseEnrollment(
    @Body() verifyDto: VerifyCauseEnrollmentDto,
    @Request() req,
  ) {
    return this.causesService.verifyCauseEnrollment(verifyDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/enrollments')
  @UseGuards(RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN', 'SECRETARY', 'MODERATOR')
  async getCauseEnrollments(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.causesService.getCauseEnrollments(id, req.user.userId);
  }

  // Cause Lectures
  @UseGuards(AuthGuard('jwt'))
  @Post('lectures')
  @UseGuards(RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN')
  async createCauseLecture(
    @Body() createLectureDto: CreateCauseLectureDto,
    @Request() req,
  ) {
    return this.causesService.createCauseLecture(createLectureDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('lectures/:id')
  @UseGuards(RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN')
  async updateCauseLecture(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLectureDto: UpdateCauseLectureDto,
    @Request() req,
  ) {
    return this.causesService.updateCauseLecture(id, updateLectureDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/lectures')
  async getCauseLectures(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.causesService.getCauseLectures(id, req.user.userId);
  }

  // Lecture Documents
  @UseGuards(AuthGuard('jwt'))
  @Post('lectures/documents')
  @UseGuards(RolesGuard)
  @Roles('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN', 'SECRETARY', 'MODERATOR')
  async addLectureDocument(
    @Body() createDocumentDto: CreateLectureDocumentDto,
    @Request() req,
  ) {
    return this.causesService.addLectureDocument(createDocumentDto, req.user.userId);
  }
}
