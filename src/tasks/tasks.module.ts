import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealtimeModule } from '../web-socket/realtime.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TaskEntity]),
        RealtimeModule
    ],
    providers: [TasksService],
    controllers: [TasksController],
    exports: [TasksService],
})
export class TasksModule {
}
