import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';

export class CreateInstituteOrganizationDto {
  @IsNumber()
  instituteId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsBoolean()
  requiresVerification?: boolean = false;
}

export class CreateGlobalOrganizationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsBoolean()
  requiresVerification?: boolean = false;
}

export class EnrollUserDto {
  @IsString()
  enrollmentKey: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'MEMBER', 'MODERATOR'])
  role?: string = 'MEMBER';
}

export class EnrollGlobalUserDto {
  @IsString()
  enrollmentKey: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'MEMBER', 'MODERATOR'])
  role?: string = 'MEMBER';
}

export class LoginOrganizationDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  organizationId: number;

  @IsString()
  password: string;
}

export class VerifyUserDto {
  @IsBoolean()
  approved: boolean;
}

export class CreateLectureDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility: 'PUBLIC' | 'PRIVATE';

  @IsEnum(['GLOBAL', 'INSTITUTE_ORGANIZATION'])
  level: 'GLOBAL' | 'INSTITUTE_ORGANIZATION';

  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @IsOptional()
  @IsEnum(['institute', 'global'])
  organizationType?: 'institute' | 'global';
}

export class AssignUserDto {
  @IsNumber()
  userId: number;

  @IsEnum(['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'MEMBER', 'MODERATOR'])
  role: string;

  @IsString()
  password: string;
}
