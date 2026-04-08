import { Body, Controller, Get, Post } from '@nestjs/common';
import { SyncSchedulingDto } from './dto';
import { DevSyncService } from './service';

@Controller('dev/sync')
export class DevSyncController {
    constructor(private readonly service: DevSyncService) {}

    @Get('status')
    status() {
        return this.service.getStatus();
    }

    @Post('scheduling')
    syncScheduling(@Body() dto: SyncSchedulingDto) {
        return this.service.syncScheduling(dto);
    }
}
