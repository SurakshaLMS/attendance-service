import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  // Institute Organization Methods
  async createInstituteOrganization(
    instituteId: number,
    name: string,
    description?: string,
    logo?: string,
    requiresVerification: boolean = false,
  ) {
    const enrollmentKey = this.generateEnrollmentKey();

    return this.prisma.instituteOrganization.create({
      data: {
        instituteId,
        name,
        description,
        logo,
        enrollmentKey,
        requiresVerification,
      },
      include: {
        institute: true,
      },
    });
  }

  async enrollUserInInstituteOrganization(
    userId: number,
    enrollmentKey: string,
    password: string,
    role: 'PRESIDENT' | 'VICE_PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'MEMBER' | 'MODERATOR' = 'MEMBER',
  ) {
    const organization = await this.prisma.instituteOrganization.findUnique({
      where: { enrollmentKey },
    });

    if (!organization || !organization.isActive) {
      throw new Error('Invalid enrollment key or organization inactive');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationStatus = organization.requiresVerification
      ? 'PENDING'
      : 'APPROVED';

    return this.prisma.instituteOrganizationUser.create({
      data: {
        userId,
        organizationId: organization.id,
        role,
        hashedPassword,
        verificationStatus,
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
  }

  async verifyInstituteOrganizationUser(
    organizationUserId: number,
    verifierId: number,
    approved: boolean,
  ) {
    const status = approved ? 'APPROVED' : 'REJECTED';

    return this.prisma.instituteOrganizationUser.update({
      where: { id: organizationUserId },
      data: {
        verificationStatus: status,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
        organization: true,
        verifier: true,
      },
    });
  }

  async assignUserDirectlyToInstituteOrganization(
    userId: number,
    organizationId: number,
    role: 'PRESIDENT' | 'VICE_PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'MEMBER' | 'MODERATOR',
    assignedBy: number,
    password: string,
  ) {
    // Only presidents and vice presidents can assign users directly
    const assigner = await this.prisma.instituteOrganizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: assignedBy,
          organizationId,
        },
      },
    });

    if (!assigner || !['PRESIDENT', 'VICE_PRESIDENT'].includes(assigner.role)) {
      throw new Error('Only presidents or vice presidents can assign users');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.instituteOrganizationUser.create({
      data: {
        userId,
        organizationId,
        role,
        hashedPassword,
        verificationStatus: 'APPROVED',
        verifiedBy: assignedBy,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  // Global Organization Methods
  async createGlobalOrganization(
    name: string,
    description?: string,
    logo?: string,
    requiresVerification: boolean = false,
  ) {
    const enrollmentKey = this.generateEnrollmentKey();

    return this.prisma.globalOrganization.create({
      data: {
        name,
        description,
        logo,
        enrollmentKey,
        requiresVerification,
      },
    });
  }

  async enrollUserInGlobalOrganization(
    userId: number,
    enrollmentKey: string,
    password: string,
    role: 'ADMIN' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'MEMBER' | 'MODERATOR' = 'MEMBER',
  ) {
    const organization = await this.prisma.globalOrganization.findUnique({
      where: { enrollmentKey },
    });

    if (!organization || !organization.isActive) {
      throw new Error('Invalid enrollment key or organization inactive');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationStatus = organization.requiresVerification
      ? 'PENDING'
      : 'APPROVED';

    return this.prisma.globalOrganizationUser.create({
      data: {
        userId,
        organizationId: organization.id,
        role,
        hashedPassword,
        verificationStatus,
      },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async verifyGlobalOrganizationUser(
    organizationUserId: number,
    verifierId: number,
    approved: boolean,
  ) {
    const status = approved ? 'APPROVED' : 'REJECTED';

    return this.prisma.globalOrganizationUser.update({
      where: { id: organizationUserId },
      data: {
        verificationStatus: status,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
        organization: true,
        verifier: true,
      },
    });
  }

  // Lecture Methods
  async createLecture(
    title: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    level: 'GLOBAL' | 'INSTITUTE_ORGANIZATION',
    organizationId?: number,
    organizationType?: 'institute' | 'global',
  ) {
    const data: any = {
      title,
      description,
      content,
      visibility,
      level,
    };

    if (level === 'INSTITUTE_ORGANIZATION' && organizationType === 'institute') {
      data.instituteOrganizationId = organizationId;
    } else if (level === 'GLOBAL' && organizationType === 'global') {
      data.globalOrganizationId = organizationId;
    }

    return this.prisma.lecture.create({
      data,
      include: {
        instituteOrganization: {
          include: {
            institute: true,
          },
        },
        globalOrganization: true,
      },
    });
  }

  async getPublicLectures() {
    return this.prisma.lecture.findMany({
      where: {
        visibility: 'PUBLIC',
        isActive: true,
      },
      include: {
        instituteOrganization: {
          include: {
            institute: true,
          },
        },
        globalOrganization: true,
      },
    });
  }

  async getOrganizationLectures(
    organizationId: number,
    organizationType: 'institute' | 'global',
  ) {
    const where: any = {
      isActive: true,
    };

    if (organizationType === 'institute') {
      where.instituteOrganizationId = organizationId;
    } else {
      where.globalOrganizationId = organizationId;
    }

    return this.prisma.lecture.findMany({
      where,
      include: {
        instituteOrganization: {
          include: {
            institute: true,
          },
        },
        globalOrganization: true,
      },
    });
  }

  // Utility Methods
  private generateEnrollmentKey(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  async getUserOrganizations(userId: number) {
    const [instituteOrgs, globalOrgs] = await Promise.all([
      this.prisma.instituteOrganizationUser.findMany({
        where: { userId, isActive: true },
        include: {
          organization: {
            include: {
              institute: true,
            },
          },
        },
      }),
      this.prisma.globalOrganizationUser.findMany({
        where: { userId, isActive: true },
        include: {
          organization: true,
        },
      }),
    ]);

    return {
      instituteOrganizations: instituteOrgs,
      globalOrganizations: globalOrgs,
    };
  }
}
