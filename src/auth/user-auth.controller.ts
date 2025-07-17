import { Controller, Post, Body, Put, UseGuards, Request, HttpCode, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserAuthService } from './user-auth.service';

class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsEnum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'STAFF', 'GUEST'], { 
    message: 'User type must be one of: STUDENT, INSTRUCTOR, ADMIN, STAFF, GUEST' 
  })
  userType?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'STAFF' | 'GUEST';
}

class ChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}

class SetPasswordDto {
  @IsString({ message: 'User ID must be provided' })
  userId: number;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

@Controller('auth')
export class UserAuthController {
  private readonly logger = new Logger(UserAuthController.name);

  constructor(private userAuthService: UserAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      this.logger.log(`Login attempt for email: ${loginDto?.email}`);
      
      // Validate request body
      if (!loginDto || !loginDto.email || !loginDto.password) {
        this.logger.error('Missing email or password in login request');
        throw new BadRequestException('Email and password are required');
      }

      const result = await this.userAuthService.login(loginDto.email, loginDto.password);
      this.logger.log(`Login successful for user: ${loginDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Login failed for ${loginDto?.email}: ${error.message}`);
      throw error;
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.log(`Registration attempt for email: ${createUserDto?.email}`);
      
      // Validate required fields
      if (!createUserDto || !createUserDto.email || !createUserDto.password || !createUserDto.username) {
        this.logger.error('Missing required fields in registration request');
        throw new BadRequestException('Email, username, and password are required');
      }

      const result = await this.userAuthService.createUser(createUserDto);
      this.logger.log(`Registration successful for user: ${createUserDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Registration failed for ${createUserDto?.email}: ${error.message}`);
      throw error;
    }
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ) {
    return this.userAuthService.updateUserPassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('set-password')
  @UseGuards(AuthGuard('jwt'))
  async setPassword(@Body() setPasswordDto: SetPasswordDto) {
    // This endpoint can be used by admins to set passwords for users
    return this.userAuthService.setUserPassword(
      setPasswordDto.userId,
      setPasswordDto.password,
    );
  }
}
