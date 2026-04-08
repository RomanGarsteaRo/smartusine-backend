import { Module } from '@nestjs/common';
import { CncsModule } from '../cncs/cncs.module';
import { TasksModule } from '../tasks/tasks.module';
import { RealtimeModule } from '../web-socket/realtime.module';
import { DevSyncController } from './controller';
import { DevSyncService } from './service';

@Module({
    imports: [TasksModule, CncsModule, RealtimeModule],
    controllers: [DevSyncController],
    providers: [DevSyncService],
})
export class DevSyncModule {}
