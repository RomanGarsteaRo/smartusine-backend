import { TasksModule } from '../tasks/tasks.module';
import { CncsModule } from '../cncs/cncs.module';
import { SchedulingController } from './scheduling.controller';
import { Module } from '@nestjs/common';

@Module({
    imports: [TasksModule, CncsModule],
    controllers: [SchedulingController],
})
export class SchedulingModule {}