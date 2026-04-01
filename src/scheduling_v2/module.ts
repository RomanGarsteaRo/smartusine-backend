import { TasksModule } from '../tasks/tasks.module';
import { CncsModule } from '../cncs/cncs.module';
import { Module } from '@nestjs/common';
import { SchedulingTaskSourceService } from '../scheduling/scheduling-task-source.service';
import { SchedulingV2Service } from './service';
import { SchedulingV2Controller } from './controller';




@Module({
    imports: [TasksModule, CncsModule],
    controllers: [SchedulingV2Controller],
    providers: [
        SchedulingV2Service,
        SchedulingTaskSourceService
    ],
})
export class SchedulingV2Module {}
