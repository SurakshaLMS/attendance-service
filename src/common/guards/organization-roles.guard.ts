import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityLoggerService } from '../services/security-logger.service';

export enum OrganizationRole {
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export const ORGANIZATION_ROLES_KEY = 'organization_roles';
export const OrganizationRoles = (...roles: OrganizationRole[]) => SetMetadata(ORGANIZATION_ROLES_KEY, roles);

@Injectable()
export class OrganizationRolesGuard implements CanActivate {
  private readonly logger = new Logger(OrganizationRolesGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private securityLogger: SecurityLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(
      ORGANIZATION_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = request.params.orgId;

    if (!user) {
      this.logger.warn(`Access denied: No user in request`);
      this.securityLogger.logSecurityEvent({
        type: 'ACCESS_DENIED',
        userId: 'unknown',
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
        method: request.method,
        timestamp: new Date(),
        details: { reason: 'No user in request' },
      });
      throw new ForbiddenException('Access denied: Authentication required');
    }

    if (!orgId) {
      this.logger.warn(`Access denied: No organization ID provided`);
      throw new ForbiddenException('Access denied: Organization ID required');
    }

    try {
      // Check institute organization membership
      const instituteOrgUser = await this.prisma.instituteOrganizationUser.findFirst({
        where: {
          userId: user.id,
          organizationId: parseInt(orgId),
          isActive: true,
          verificationStatus: 'APPROVED',
        },
      });

      if (instituteOrgUser) {
        const hasRole = requiredRoles.includes(instituteOrgUser.role as OrganizationRole);
        
        if (!hasRole) {
          this.logger.warn(`Access denied: User ${user.id} has role ${instituteOrgUser.role} but needs ${requiredRoles.join(' or ')}`);
          this.securityLogger.logSecurityEvent({
            type: 'ACCESS_DENIED',
            userId: user.id.toString(),
            ip: request.ip,
            userAgent: request.get('User-Agent'),
            path: request.path,
            method: request.method,
            timestamp: new Date(),
            details: { 
              reason: 'Insufficient role permissions',
              userRole: instituteOrgUser.role,
              requiredRoles: requiredRoles,
              organizationId: orgId,
            },
          });
          throw new ForbiddenException(`Access denied: Required role(s): ${requiredRoles.join(', ')}`);
        }

        this.logger.log(`Access granted: User ${user.id} with role ${instituteOrgUser.role} in organization ${orgId}`);
        return true;
      }

      // Check global organization membership
      const globalOrgUser = await this.prisma.globalOrganizationUser.findFirst({
        where: {
          userId: user.id,
          organizationId: parseInt(orgId),
          isActive: true,
          verificationStatus: 'APPROVED',
        },
      });

      if (globalOrgUser) {
        const hasRole = requiredRoles.includes(globalOrgUser.role as OrganizationRole);
        
        if (!hasRole) {
          this.logger.warn(`Access denied: User ${user.id} has role ${globalOrgUser.role} but needs ${requiredRoles.join(' or ')}`);
          this.securityLogger.logSecurityEvent({
            type: 'ACCESS_DENIED',
            userId: user.id.toString(),
            ip: request.ip,
            userAgent: request.get('User-Agent'),
            path: request.path,
            method: request.method,
            timestamp: new Date(),
            details: { 
              reason: 'Insufficient role permissions',
              userRole: globalOrgUser.role,
              requiredRoles: requiredRoles,
              organizationId: orgId,
            },
          });
          throw new ForbiddenException(`Access denied: Required role(s): ${requiredRoles.join(', ')}`);
        }

        this.logger.log(`Access granted: User ${user.id} with role ${globalOrgUser.role} in global organization ${orgId}`);
        return true;
      }

      this.logger.warn(`Access denied: User ${user.id} not found in organization ${orgId}`);
      this.securityLogger.logSecurityEvent({
        type: 'ACCESS_DENIED',
        userId: user.id.toString(),
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
        method: request.method,
        timestamp: new Date(),
        details: { 
          reason: 'User not member of organization',
          organizationId: orgId,
        },
      });
      throw new ForbiddenException('Access denied: You are not a member of this organization');

    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      this.logger.error(`Error checking organization permissions: ${error.message}`);
      this.securityLogger.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: user.id?.toString() || 'unknown',
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
        method: request.method,
        timestamp: new Date(),
        details: { 
          error: error.message,
          organizationId: orgId,
        },
      });
      throw new ForbiddenException('Access denied: Unable to verify permissions');
    }
  }
}
