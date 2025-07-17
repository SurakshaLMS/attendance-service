import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class UserAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    // Using configurable salt rounds from environment
    const saltRounds = parseInt(this.configService.get<string>('PASSWORD_SALT_ROUNDS', '12'));
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Additional encryption method using the environment encryption key
   * This can be used for additional security layers if needed
   */
  private getEncryptionSalt(): string {
    const encryptionKey = this.configService.get<string>('PASSWORD_ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('PASSWORD_ENCRYPTION_KEY not found in environment variables');
    }
    return encryptionKey.substring(0, 16); // Use first 16 chars as additional salt
  }

  async hashPasswordWithKey(password: string): Promise<string> {
    // Enhanced encryption with additional salt from encryption key
    const saltRounds = this.configService.get<number>('PASSWORD_SALT_ROUNDS') || 12;
    const additionalSalt = this.getEncryptionSalt();
    const passwordWithSalt = password + additionalSalt;
    return bcrypt.hash(passwordWithSalt, saltRounds);
  }

  async validatePasswordWithKey(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const additionalSalt = this.getEncryptionSalt();
    const passwordWithSalt = plainPassword + additionalSalt;
    return bcrypt.compare(passwordWithSalt, hashedPassword);
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        instituteOrgUsers: {
          include: {
            organization: {
              include: {
                institute: true,
              },
            },
          },
        },
        globalOrgUsers: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    if (!user.password) {
      throw new UnauthorizedException('User has no password set. Please contact administrator.');
    }

    // Validate password - try both methods for compatibility
    let isPasswordValid = false;
    
    // First try the standard validation method
    isPasswordValid = await this.validatePassword(password, user.password);
    
    // If that fails, try the enhanced validation method (for backward compatibility)
    if (!isPasswordValid) {
      try {
        isPasswordValid = await this.validatePasswordWithKey(password, user.password);
      } catch (error) {
        // Ignore errors from enhanced validation and proceed with standard result
      }
    }
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Get user's institutes for JWT payload
    const institutes = user.instituteOrgUsers
      .filter(orgUser => orgUser.isActive && orgUser.verificationStatus === 'APPROVED')
      .map(orgUser => orgUser.organization.institute.id);

    // Create JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      institutes: institutes,
      organizationType: 'central', // New type for central authentication
      // organizationId and role are undefined for central auth
    };

    // Get user's organizations for response
    const userOrganizations = {
      institute: user.instituteOrgUsers
        .filter(orgUser => orgUser.isActive && orgUser.verificationStatus === 'APPROVED')
        .map(orgUser => ({
          id: orgUser.organization.id,
          name: orgUser.organization.name,
          role: orgUser.role,
          institute: {
            id: orgUser.organization.institute.id,
            name: orgUser.organization.institute.name,
          },
        })),
      global: user.globalOrgUsers
        .filter(orgUser => orgUser.isActive && orgUser.verificationStatus === 'APPROVED')
        .map(orgUser => ({
          id: orgUser.organization.id,
          name: orgUser.organization.name,
          role: orgUser.role,
        })),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        profilePicture: user.profilePicture,
        organizations: userOrganizations,
      },
    };
  }

  async setUserPassword(userId: number, password: string) {
    const hashedPassword = await this.hashPassword(password);
    
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async createUser(userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    userType?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'STAFF' | 'GUEST';
    externalId?: string;
  }) {
    const hashedPassword = await this.hashPassword(userData.password);
    
    return this.prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        userType: userData.userType || 'STUDENT',
        externalId: userData.externalId || userData.email, // Fallback to email if no external ID
      },
    });
  }

  async updateUserPassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('User not found or no password set');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.validatePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and update new password
    const hashedNewPassword = await this.hashPassword(newPassword);
    
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }
}
