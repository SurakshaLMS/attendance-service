import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface MainLMSUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isActive: boolean;
}

export interface MainLMSInstitute {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  isActive: boolean;
}

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async syncUsersFromMainLMS() {
    try {
      const mainLMSUrl = this.configService.get<string>('MAIN_LMS_API_URL');
      const apiKey = this.configService.get<string>('MAIN_LMS_API_KEY');

      // This would make an actual API call to your main LMS
      // For now, this is a placeholder implementation
      const response = await fetch(`${mainLMSUrl}/api/users`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const users: MainLMSUser[] = await response.json();

      for (const user of users) {
        await this.prisma.user.upsert({
          where: { externalId: user.id },
          update: {
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            isActive: user.isActive,
            lastSyncedAt: new Date(),
          },
          create: {
            externalId: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            isActive: user.isActive,
            lastSyncedAt: new Date(),
          },
        });
      }

      console.log(`Synced ${users.length} users from main LMS`);
      return { success: true, count: users.length };
    } catch (error) {
      console.error('Error syncing users:', error);
      throw error;
    }
  }

  async syncInstitutesFromMainLMS() {
    try {
      const mainLMSUrl = this.configService.get<string>('MAIN_LMS_API_URL');
      const apiKey = this.configService.get<string>('MAIN_LMS_API_KEY');

      // This would make an actual API call to your main LMS
      // For now, this is a placeholder implementation
      const response = await fetch(`${mainLMSUrl}/api/institutes`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch institutes: ${response.statusText}`);
      }

      const institutes: MainLMSInstitute[] = await response.json();

      for (const institute of institutes) {
        await this.prisma.institute.upsert({
          where: { externalId: institute.id },
          update: {
            name: institute.name,
            code: institute.code,
            description: institute.description,
            logo: institute.logo,
            isActive: institute.isActive,
            lastSyncedAt: new Date(),
          },
          create: {
            externalId: institute.id,
            name: institute.name,
            code: institute.code,
            description: institute.description,
            logo: institute.logo,
            isActive: institute.isActive,
            lastSyncedAt: new Date(),
          },
        });
      }

      console.log(`Synced ${institutes.length} institutes from main LMS`);
      return { success: true, count: institutes.length };
    } catch (error) {
      console.error('Error syncing institutes:', error);
      throw error;
    }
  }

  async syncUserByExternalId(externalId: string) {
    try {
      const mainLMSUrl = this.configService.get<string>('MAIN_LMS_API_URL');
      const apiKey = this.configService.get<string>('MAIN_LMS_API_KEY');

      const response = await fetch(`${mainLMSUrl}/api/users/${externalId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const user: MainLMSUser = await response.json();

      return this.prisma.user.upsert({
        where: { externalId: user.id },
        update: {
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isActive: user.isActive,
          lastSyncedAt: new Date(),
        },
        create: {
          externalId: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isActive: user.isActive,
          lastSyncedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  }

  async syncInstituteByExternalId(externalId: string) {
    try {
      const mainLMSUrl = this.configService.get<string>('MAIN_LMS_API_URL');
      const apiKey = this.configService.get<string>('MAIN_LMS_API_KEY');

      const response = await fetch(`${mainLMSUrl}/api/institutes/${externalId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch institute: ${response.statusText}`);
      }

      const institute: MainLMSInstitute = await response.json();

      return this.prisma.institute.upsert({
        where: { externalId: institute.id },
        update: {
          name: institute.name,
          code: institute.code,
          description: institute.description,
          logo: institute.logo,
          isActive: institute.isActive,
          lastSyncedAt: new Date(),
        },
        create: {
          externalId: institute.id,
          name: institute.name,
          code: institute.code,
          description: institute.description,
          logo: institute.logo,
          isActive: institute.isActive,
          lastSyncedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error syncing institute:', error);
      throw error;
    }
  }

  // Get user from local database or sync from main LMS
  async getOrSyncUser(externalId: string) {
    let user = await this.prisma.user.findUnique({
      where: { externalId },
    });

    if (!user) {
      user = await this.syncUserByExternalId(externalId);
    }

    return user;
  }

  // Get institute from local database or sync from main LMS
  async getOrSyncInstitute(externalId: string) {
    let institute = await this.prisma.institute.findUnique({
      where: { externalId },
    });

    if (!institute) {
      institute = await this.syncInstituteByExternalId(externalId);
    }

    return institute;
  }
}
