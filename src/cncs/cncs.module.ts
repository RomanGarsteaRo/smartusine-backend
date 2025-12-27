import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CncEntity } from './entities/cnc.entity';
import { CncsController } from './cncs.contoller';
import { CncsService } from './cncs.service';

@Module({
    imports: [TypeOrmModule.forFeature([CncEntity])],
    controllers: [CncsController],
    providers: [CncsService],
    exports: [CncsService],
})
export class CncsModule {}