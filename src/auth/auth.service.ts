import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginToOrganization(
    userId: number,
    organizationId: number,
    password: string,
  ) {
    // First check if this is an institute organization
    const instituteOrgUser = await this.prisma.instituteOrganizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      include: {
        user: true,
        organization: {
          include: {
            institute: true,
          },
        },
      },
    });

    if (instituteOrgUser) {
      return this.processInstituteLogin(instituteOrgUser, password);
    }

    // If not found in institute orgs, check global organizations
    const globalOrgUser = await this.prisma.globalOrganizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      include: {
        user: true,
        organization: true,
      },
    });

    if (globalOrgUser) {
      return this.processGlobalLogin(globalOrgUser, password);
    }

    throw new Error('User not found in any organization');
  }

  private async processInstituteLogin(orgUser: any, password: string) {
    if (!orgUser || !orgUser.isActive) {
      throw new Error('User not found in organization or inactive');
    }

    if (orgUser.verificationStatus !== 'APPROVED') {
      throw new Error('User not approved for organization access');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      orgUser.hashedPassword,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const payload: JwtPayload = {
      sub: orgUser.userId,
      email: orgUser.user.email,
      institutes: [orgUser.organization.institute.id],
      organizationType: 'institute',
      organizationId: orgUser.organizationId,
      role: orgUser.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: orgUser.user.id,
        email: orgUser.user.email,
        firstName: orgUser.user.firstName,
        lastName: orgUser.user.lastName,
        role: orgUser.role,
        organizationType: 'institute',
        organization: {
          id: orgUser.organization.id,
          name: orgUser.organization.name,
          institute: {
            id: orgUser.organization.institute.id,
            name: orgUser.organization.institute.name,
          },
        },
      },
    };
  }

  private async processGlobalLogin(orgUser: any, password: string) {
    if (!orgUser || !orgUser.isActive) {
      throw new Error('User not found in organization or inactive');
    }

    if (orgUser.verificationStatus !== 'APPROVED') {
      throw new Error('User not approved for organization access');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      orgUser.hashedPassword,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const payload: JwtPayload = {
      sub: orgUser.userId,
      email: orgUser.user.email,
      organizationType: 'global',
      organizationId: orgUser.organizationId,
      role: orgUser.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: orgUser.user.id,
        email: orgUser.user.email,
        firstName: orgUser.user.firstName,
        lastName: orgUser.user.lastName,
        role: orgUser.role,
        organizationType: 'global',
        organization: {
          id: orgUser.organization.id,
          name: orgUser.organization.name,
        },
      },
    };
  }

  async loginToInstituteOrganization(
    userId: number,
    organizationId: number,
    password: string,
  ) {
    // Use the unified login method
    return this.loginToOrganization(userId, organizationId, password);
  }

  async loginToGlobalOrganization(
    userId: number,
    organizationId: number,
    password: string,
  ) {
    // Use the unified login method
    return this.loginToOrganization(userId, organizationId, password);
  }

  async setOrganizationPassword(
    userId: number,
    organizationId: number,
    organizationType: 'institute' | 'global',
    password: string,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (organizationType === 'institute') {
      return this.prisma.instituteOrganizationUser.update({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
        data: {
          hashedPassword,
        },
      });
    } else {
      return this.prisma.globalOrganizationUser.update({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
        data: {
          hashedPassword,
        },
      });
    }
  }
}
