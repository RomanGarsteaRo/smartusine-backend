import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { CncsModule } from '../cncs/cncs.module';
import { SchedulingController } from './scheduling.controller';
import { SchedulingTaskSourceService } from './scheduling-task-source.service';
import { SchedulingLineSourceService } from './scheduling-line-source.service';

@Module({
    imports: [CncsModule, TasksModule],
    controllers: [SchedulingController],
    providers: [SchedulingTaskSourceService, SchedulingLineSourceService],
    exports: [SchedulingTaskSourceService, SchedulingLineSourceService],
})
export class SchedulingModule {}
