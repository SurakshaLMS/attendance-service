import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GlobalOrganizationMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = parseInt(request.params.orgId);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!orgId) {
      throw new ForbiddenException('Organization ID not provided');
    }

    // Check if user is member of the global organization
    const orgUser = await this.prisma.globalOrganizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
        },
      },
    });

    if (!orgUser || !orgUser.isActive || orgUser.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException('User is not an active member of this organization');
    }

    // Add organization info to request for later use
    request.organizationUser = orgUser;
    return true;
  }
}
