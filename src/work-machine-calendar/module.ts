import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkMachineCalendarEntity } from './entity';
import { WorkMachineCalendarController } from './controller';
import { WorkMachineCalendarService } from './service';


@Module({
    imports: [  TypeOrmModule.forFeature([WorkMachineCalendarEntity]),  ],
    controllers:    [WorkMachineCalendarController],
    providers:      [WorkMachineCalendarService],
    exports:        [WorkMachineCalendarService],
})
export class WorkMachineCalendarModule {}