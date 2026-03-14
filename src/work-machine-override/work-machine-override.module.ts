import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkMachineOverrideController } from './work-machine-override.controller';
import { WorkMachineOverrideService } from './work-machine-override.service';
import { WorkMachineOverrideEntity } from './entities/work-machine-override.entity';
import { WorkMachineOverrideTypeEntity } from './entities/work-machine-override-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkMachineOverrideEntity,
      WorkMachineOverrideTypeEntity,
    ]),
  ],
  controllers: [WorkMachineOverrideController],
  providers: [WorkMachineOverrideService],
  exports: [WorkMachineOverrideService],
})
export class WorkMachineOverrideModule {}
