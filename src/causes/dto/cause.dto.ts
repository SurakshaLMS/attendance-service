import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, IsDateString, IsUrl, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export enum CauseVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export enum LectureType {
  LIVE = 'LIVE',
  RECORDED = 'RECORDED',
  HYBRID = 'HYBRID'
}

export enum LectureStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DocumentType {
  PDF = 'PDF',
  DOC = 'DOC',
  DOCX = 'DOCX',
  PPT = 'PPT',
  PPTX = 'PPTX',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  OTHER = 'OTHER'
}

// Cause DTOs
export class CreateCauseDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsOptional()
  @IsEnum(CauseVisibility)
  visibility?: CauseVisibility = CauseVisibility.PRIVATE;

  @IsOptional()
  @IsBoolean()
  requiresVerification?: boolean = false;

  @IsOptional()
  @IsString()
  enrollmentKey?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  instituteOrganizationId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  globalOrganizationId?: number;
}

export class UpdateCauseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsOptional()
  @IsEnum(CauseVisibility)
  visibility?: CauseVisibility;

  @IsOptional()
  @IsBoolean()
  requiresVerification?: boolean;

  @IsOptional()
  @IsString()
  enrollmentKey?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class EnrollInCauseDto {
  @IsInt()
  @IsPositive()
  causeId: number;

  @IsOptional()
  @IsString()
  enrollmentKey?: string;
}

// Cause Lecture DTOs
export class CreateCauseLectureDto {
  @IsInt()
  @IsPositive()
  causeId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(LectureType)
  type?: LectureType = LectureType.RECORDED;

  @IsOptional()
  @IsEnum(LectureStatus)
  status?: LectureStatus = LectureStatus.SCHEDULED;

  @IsOptional()
  @IsUrl()
  liveStreamUrl?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsUrl()
  recordingUrl?: string;

  @IsOptional()
  @IsDateString()
  recordingAvailableAfter?: string;

  @IsOptional()
  @IsEnum(CauseVisibility)
  visibility?: CauseVisibility = CauseVisibility.PRIVATE;

  @IsOptional()
  @IsBoolean()
  requiresEnrollment?: boolean = true;
}

export class UpdateCauseLectureDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(LectureType)
  type?: LectureType;

  @IsOptional()
  @IsEnum(LectureStatus)
  status?: LectureStatus;

  @IsOptional()
  @IsUrl()
  liveStreamUrl?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @IsOptional()
  @IsUrl()
  recordingUrl?: string;

  @IsOptional()
  @IsDateString()
  recordingAvailableAfter?: string;

  @IsOptional()
  @IsEnum(CauseVisibility)
  visibility?: CauseVisibility;

  @IsOptional()
  @IsBoolean()
  requiresEnrollment?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Lecture Document DTOs
export class CreateLectureDocumentDto {
  @IsInt()
  @IsPositive()
  causeLectureId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUrl()
  documentUrl: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  fileSize?: number;
}

export class UpdateLectureDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  documentUrl?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  fileSize?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Enrollment DTOs
export class EnrollInCauseLectureDto {
  @IsInt()
  @IsPositive()
  causeLectureId: number;
}

export class UpdateWatchTimeDto {
  @IsInt()
  @IsPositive()
  watchTimeMinutes: number;
}

export class VerifyCauseEnrollmentDto {
  @IsInt()
  @IsPositive()
  enrollmentId: number;

  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
