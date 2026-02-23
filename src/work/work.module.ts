
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { WorkUzineCalendarEntity } from './entities/week-template.entity';
import { WorkUzineCalendarController } from './week-template.controller';
import { WorkUzineCalendarService } from './week-template.service';




@Module({
    imports: [
        TypeOrmModule.forFeature([WorkUzineCalendarEntity]),
    ],
    controllers: [WorkUzineCalendarController],
    providers: [WorkUzineCalendarService],
    exports: [WorkUzineCalendarService],
})
export class WorkModule {}