import { Controller, Post, Body, Put, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserAuthService } from './user-auth.service';

class LoginDto {
  email: string;
  password: string;
}

class CreateUserDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  userType?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'STAFF' | 'GUEST';
}

class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class SetPasswordDto {
  userId: number;
  password: string;
}

@Controller('auth')
export class UserAuthController {
  constructor(private userAuthService: UserAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.userAuthService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userAuthService.createUser(createUserDto);
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
