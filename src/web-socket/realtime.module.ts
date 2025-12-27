import { Module } from '@nestjs/common';
import { SchedulingGateway } from './sheduling.gateway';

@Module({
    providers: [SchedulingGateway],
    exports: [SchedulingGateway],
})
export class RealtimeModule {}