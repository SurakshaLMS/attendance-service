import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  IsBoolean, 
  IsUrl, 
  Min, 
  Max, 
  Length,
  IsArray,
  ValidateNested,
  IsUUID,
  IsDateString,
  IsNotEmpty,
  Matches,
  IsJSON,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum OrganizationRole {
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export enum OrganizationType {
  INSTITUTE = 'INSTITUTE',
  GLOBAL = 'GLOBAL',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum OrganizationVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  RESTRICTED = 'RESTRICTED',
}

// Basic Organization DTOs
export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsBoolean()
  @IsOptional()
  requiresVerification?: boolean = true;

  @IsEnum(OrganizationVisibility)
  @IsOptional()
  visibility?: OrganizationVisibility = OrganizationVisibility.PUBLIC;

  @IsOptional()
  @IsJSON()
  settings?: string;
}

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @Length(3, 100)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsBoolean()
  @IsOptional()
  requiresVerification?: boolean;

  @IsEnum(OrganizationVisibility)
  @IsOptional()
  visibility?: OrganizationVisibility;

  @IsOptional()
  @IsJSON()
  settings?: string;
}

// Institute Organization DTOs
export class CreateInstituteOrganizationDto extends CreateOrganizationDto {
  @IsInt()
  @Min(1)
  instituteId: number;

  @IsString()
  @IsOptional()
  @Length(0, 50)
  category?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateInstituteOrganizationDto extends UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @Length(0, 50)
  category?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];
}

// Global Organization DTOs
export class CreateGlobalOrganizationDto extends CreateOrganizationDto {
  @IsString()
  @IsOptional()
  @Length(0, 50)
  category?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  allowedInstitutes?: number[];
}

export class UpdateGlobalOrganizationDto extends UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @Length(0, 50)
  category?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  allowedInstitutes?: number[];
}

// User Management DTOs
export class EnrollUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 50)
  enrollmentKey: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  notes?: string;
}

export class AssignUserDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  notes?: string;
}

export class UpdateUserRoleDto {
  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  notes?: string;
}

export class VerifyUserDto {
  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  notes?: string;
}

export class RemoveUserDto {
  @IsString()
  @IsOptional()
  @Length(0, 200)
  reason?: string;
}

// Bulk Operations DTOs
export class BulkUserOperationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsInt({ each: true })
  userIds: number[];

  @IsEnum(OrganizationRole)
  @IsOptional()
  role?: OrganizationRole;

  @IsBoolean()
  @IsOptional()
  approved?: boolean;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  notes?: string;
}

export class BulkAssignUsersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AssignUserDto)
  users: AssignUserDto[];
}

// Organization Settings DTOs
export class OrganizationSettingsDto {
  @IsBoolean()
  @IsOptional()
  allowPublicEnrollment?: boolean;

  @IsBoolean()
  @IsOptional()
  requireEmailVerification?: boolean;

  @IsBoolean()
  @IsOptional()
  autoApproveEnrollments?: boolean;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  maxMembers?: number;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  allowedDomains?: string[];

  @IsOptional()
  @IsJSON()
  customFields?: string;
}

export class RegenerateKeyDto {
  @IsString()
  @IsOptional()
  @Length(0, 200)
  reason?: string;
}

// Statistics and Analytics DTOs
export class OrganizationStatsFilterDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(OrganizationRole)
  @IsOptional()
  role?: OrganizationRole;

  @IsEnum(VerificationStatus)
  @IsOptional()
  status?: VerificationStatus;

  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;
}

export class ExportDataDto {
  @IsEnum(['csv', 'json', 'xlsx'])
  format: 'csv' | 'json' | 'xlsx';

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  fields?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

// Search and Filter DTOs
export class SearchOrganizationsDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  query?: string;

  @IsEnum(OrganizationType)
  @IsOptional()
  type?: OrganizationType;

  @IsEnum(OrganizationVisibility)
  @IsOptional()
  visibility?: OrganizationVisibility;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @IsString()
  @IsOptional()
  @IsEnum(['name', 'createdAt', 'updatedAt', 'memberCount'])
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class SearchUsersDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  query?: string;

  @IsEnum(OrganizationRole)
  @IsOptional()
  role?: OrganizationRole;

  @IsEnum(VerificationStatus)
  @IsOptional()
  status?: VerificationStatus;

  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @IsString()
  @IsOptional()
  @IsEnum(['name', 'email', 'joinedAt', 'lastActive'])
  sortBy?: string = 'joinedAt';

  @IsString()
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// Notification DTOs
export class NotificationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  message: string;

  @IsEnum(['info', 'warning', 'error', 'success'])
  type: 'info' | 'warning' | 'error' | 'success';

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  userIds?: number[];

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsEnum(OrganizationRole, { each: true })
  roles?: OrganizationRole[];

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  sendPush?: boolean;
}

// Audit and Logging DTOs
export class AuditLogFilterDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  action?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  userId?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;
}
