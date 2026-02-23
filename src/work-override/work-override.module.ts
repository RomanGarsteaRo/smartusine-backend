import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkUzineOverrideEntity, WorkUzineOverrideTypeEntity } from './entities/work-override.entity';
import { WorkDayOverrideController } from './work-override.controller';
import { WorkDayOverrideService } from './work-override.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkUzineOverrideEntity, WorkUzineOverrideTypeEntity]),
    ],
    controllers: [WorkDayOverrideController],
    providers: [WorkDayOverrideService],
    exports: [WorkDayOverrideService],
})
export class WorkOverrideModule {}