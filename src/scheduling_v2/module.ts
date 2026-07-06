import { TasksModule } from '../tasks/tasks.module';
import { CncsModule } from '../cncs/cncs.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingTaskSourceService } from '../scheduling/scheduling-task-source.service';
import { SchedulingLineSourceService } from '../scheduling/scheduling-line-source.service';
import { SchedulingV2Service } from './service';
import { SchedulingV2Controller } from './controller';
import { ApplicationConfigModule } from '../app-config/module';
import { RealtimeModule } from '../web-socket/realtime.module';
import { SchedulingTaskStateEntity } from './task-state.entity';
import { SchedulingTaskStateService } from './task-state.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([SchedulingTaskStateEntity]),
        TasksModule,
        CncsModule,
        ApplicationConfigModule,
        RealtimeModule,
    ],
    controllers: [SchedulingV2Controller],
    providers: [
        SchedulingV2Service,
        SchedulingTaskSourceService,
        SchedulingLineSourceService,
        SchedulingTaskStateService,
    ],
})
export class SchedulingV2Module {}
