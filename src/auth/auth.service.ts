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

  async loginToInstituteOrganization(
    userId: number,
    organizationId: number,
    password: string,
  ) {
    const orgUser = await this.prisma.instituteOrganizationUser.findUnique({
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
      sub: userId,
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

  async loginToGlobalOrganization(
    userId: number,
    organizationId: number,
    password: string,
  ) {
    const orgUser = await this.prisma.globalOrganizationUser.findUnique({
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
      sub: userId,
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
        organization: {
          id: orgUser.organization.id,
          name: orgUser.organization.name,
        },
      },
    };
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
