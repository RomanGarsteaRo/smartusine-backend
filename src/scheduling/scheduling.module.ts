import { TasksModule } from '../tasks/tasks.module';
import { CncsModule } from '../cncs/cncs.module';
import { SchedulingController } from './scheduling.controller';
import { Module } from '@nestjs/common';
import { SchedulingTaskSourceService } from './scheduling-task-source.service';

@Module({
    imports: [TasksModule, CncsModule],
    controllers: [SchedulingController],
    providers: [SchedulingTaskSourceService],
})
export class SchedulingModule {}