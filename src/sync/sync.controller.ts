import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('users')
  @UseGuards(AuthGuard('jwt'))
  async syncUsers() {
    return this.syncService.syncUsersFromMainLMS();
  }

  @Post('institutes')
  @UseGuards(AuthGuard('jwt'))
  async syncInstitutes() {
    return this.syncService.syncInstitutesFromMainLMS();
  }

  @Post('all')
  @UseGuards(AuthGuard('jwt'))
  async syncAll() {
    const [users, institutes] = await Promise.all([
      this.syncService.syncUsersFromMainLMS(),
      this.syncService.syncInstitutesFromMainLMS(),
    ]);

    return {
      users,
      institutes,
    };
  }
}
