import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityLoggerService } from '../services/security-logger.service';

@Injectable()
export class EnhancedOrganizationMemberGuard implements CanActivate {
  private readonly logger = new Logger(EnhancedOrganizationMemberGuard.name);

  constructor(
    private prisma: PrismaService,
    private securityLogger: SecurityLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
        include: {
          organization: {
            include: {
              institute: true,
            },
          },
        },
      });

      if (instituteOrgUser) {
        this.logger.log(`Access granted: User ${user.id} is active member of institute organization ${orgId}`);
        
        // Add organization context to request
        request.organizationContext = {
          type: 'institute',
          organization: instituteOrgUser.organization,
          userRole: instituteOrgUser.role,
          userId: user.id,
        };

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
        include: {
          organization: true,
        },
      });

      if (globalOrgUser) {
        this.logger.log(`Access granted: User ${user.id} is active member of global organization ${orgId}`);
        
        // Add organization context to request
        request.organizationContext = {
          type: 'global',
          organization: globalOrgUser.organization,
          userRole: globalOrgUser.role,
          userId: user.id,
        };

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
      
      this.logger.error(`Error checking organization membership: ${error.message}`);
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
      throw new ForbiddenException('Access denied: Unable to verify membership');
    }
  }
}
