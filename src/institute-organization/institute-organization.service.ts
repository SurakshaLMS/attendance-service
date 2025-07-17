import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstituteOrganizationService {
  constructor(private prisma: PrismaService) {}

  async getOrganizationById(organizationId: number) {
    return this.prisma.instituteOrganization.findUnique({
      where: { id: organizationId },
      include: {
        institute: true,
        users: {
          include: {
            user: true,
          },
        },
        lectures: {
          where: { isActive: true },
        },
      },
    });
  }

  async getOrganizationMembers(organizationId: number) {
    return this.prisma.instituteOrganizationUser.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { enrolledAt: 'asc' },
      ],
    });
  }

  async getPendingVerifications(organizationId: number) {
    return this.prisma.instituteOrganizationUser.findMany({
      where: {
        organizationId,
        verificationStatus: 'PENDING',
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async updateUserRole(
    organizationId: number,
    userId: number,
    newRole: string,
    updatedBy: number,
  ) {
    // Check if the updater has permission to change roles
    const updater = await this.prisma.instituteOrganizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: updatedBy,
          organizationId,
        },
      },
    });

    if (!updater || !['PRESIDENT', 'VICE_PRESIDENT'].includes(updater.role)) {
      throw new Error('Only presidents or vice presidents can update user roles');
    }

    return this.prisma.instituteOrganizationUser.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: {
        role: newRole as any,
      },
      include: {
        user: true,
      },
    });
  }

  async removeUserFromOrganization(
    organizationId: number,
    userId: number,
    removedBy: number,
  ) {
    // Check if the remover has permission
    const remover = await this.prisma.instituteOrganizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: removedBy,
          organizationId,
        },
      },
    });

    if (!remover || !['PRESIDENT', 'VICE_PRESIDENT'].includes(remover.role)) {
      throw new Error('Only presidents or vice presidents can remove users');
    }

    return this.prisma.instituteOrganizationUser.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: {
        isActive: false,
      },
    });
  }

  async getOrganizationStats(organizationId: number) {
    const [totalMembers, pendingVerifications, totalLectures, activeLectures] = await Promise.all([
      this.prisma.instituteOrganizationUser.count({
        where: {
          organizationId,
          isActive: true,
          verificationStatus: 'APPROVED',
        },
      }),
      this.prisma.instituteOrganizationUser.count({
        where: {
          organizationId,
          verificationStatus: 'PENDING',
        },
      }),
      this.prisma.lecture.count({
        where: {
          instituteOrganizationId: organizationId,
        },
      }),
      this.prisma.lecture.count({
        where: {
          instituteOrganizationId: organizationId,
          isActive: true,
        },
      }),
    ]);

    const membersByRole = await this.prisma.instituteOrganizationUser.groupBy({
      by: ['role'],
      where: {
        organizationId,
        isActive: true,
        verificationStatus: 'APPROVED',
      },
      _count: {
        role: true,
      },
    });

    return {
      totalMembers,
      pendingVerifications,
      totalLectures,
      activeLectures,
      membersByRole: membersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {}),
    };
  }

  async updateOrganizationSettings(
    organizationId: number,
    settings: {
      name?: string;
      description?: string;
      logo?: string;
      requiresVerification?: boolean;
    },
    updatedBy: number,
  ) {
    // Check if the updater has permission
    const updater = await this.prisma.instituteOrganizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: updatedBy,
          organizationId,
        },
      },
    });

    if (!updater || !['PRESIDENT', 'VICE_PRESIDENT'].includes(updater.role)) {
      throw new Error('Only presidents or vice presidents can update organization settings');
    }

    return this.prisma.instituteOrganization.update({
      where: { id: organizationId },
      data: settings,
      include: {
        institute: true,
      },
    });
  }

  async generateNewEnrollmentKey(organizationId: number, generatedBy: number) {
    // Check if the generator has permission
    const generator = await this.prisma.instituteOrganizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: generatedBy,
          organizationId,
        },
      },
    });

    if (!generator || !['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY'].includes(generator.role)) {
      throw new Error('Only presidents, vice presidents, or secretaries can generate enrollment keys');
    }

    const newKey = this.generateEnrollmentKey();

    return this.prisma.instituteOrganization.update({
      where: { id: organizationId },
      data: {
        enrollmentKey: newKey,
      },
    });
  }

  private generateEnrollmentKey(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
