import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role in current organization context
    if (user.organizationType && user.organizationId) {
      if (user.organizationType === 'institute') {
        const orgUser = await this.prisma.instituteOrganizationUser.findUnique({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: user.organizationId,
            },
          },
        });

        if (!orgUser || !requiredRoles.includes(orgUser.role)) {
          throw new ForbiddenException('Insufficient permissions');
        }
      } else if (user.organizationType === 'global') {
        const orgUser = await this.prisma.globalOrganizationUser.findUnique({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: user.organizationId,
            },
          },
        });

        if (!orgUser || !requiredRoles.includes(orgUser.role)) {
          throw new ForbiddenException('Insufficient permissions');
        }
      }
    }

    return true;
  }
}
